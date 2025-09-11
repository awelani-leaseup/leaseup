import { Schema, Effect, Console } from 'effect';
import { DatabaseServiceLive, DatabaseServiceTag } from './services';
import { novu } from '@leaseup/novu/client.ts';

// Schema for invoice.payment_failed webhook payload
const InvoicePaymentFailedPayload = Schema.Struct({
  event: Schema.String,
  data: Schema.Struct({
    subscription: Schema.Number, // Subscription ID
    integration: Schema.Number,
    domain: Schema.String,
    invoice_code: Schema.String,
    customer: Schema.Number, // Customer ID
    transaction: Schema.Union(Schema.Number, Schema.Null),
    amount: Schema.Number,
    period_start: Schema.String,
    period_end: Schema.String,
    status: Schema.String, // "failed"
    paid: Schema.Number,
    retries: Schema.Number,
    authorization: Schema.Union(Schema.Number, Schema.Null),
    paid_at: Schema.Union(Schema.String, Schema.Null),
    next_notification: Schema.Union(Schema.String, Schema.Null),
    notification_flag: Schema.Union(Schema.String, Schema.Null),
    description: Schema.String, // Failure reason like "Insufficient Funds"
    id: Schema.Number,
    created_at: Schema.String,
    updated_at: Schema.String,
    // Additional fields that might be present
    subscription_code: Schema.optional(Schema.String),
    customer_email: Schema.optional(Schema.String),
    customer_name: Schema.optional(Schema.String),
    plan_name: Schema.optional(Schema.String),
    plan_amount: Schema.optional(Schema.Number),
    currency: Schema.optional(Schema.String),
  }),
});

export type InvoicePaymentFailedPayload = Schema.Schema.Type<
  typeof InvoicePaymentFailedPayload
>;

const processInvoicePaymentFailedEffect = (
  payload: InvoicePaymentFailedPayload
) =>
  Effect.gen(function* () {
    const databaseService = yield* DatabaseServiceTag;

    yield* Console.log(`Processing ${payload.event} event with Effect-TS`, {
      invoiceCode: payload.data.invoice_code,
      subscriptionId: payload.data.subscription,
      customerId: payload.data.customer,
      amount: payload.data.amount,
      failureReason: payload.data.description,
      retries: payload.data.retries,
    });

    // Try to find the landlord by subscription or customer information
    let landlord = null;

    // First, try to find by subscription code if available
    if (payload.data.subscription_code) {
      landlord = yield* Effect.tryPromise({
        try: async () => {
          const { db } = await import('@leaseup/prisma/db.ts');
          return db.user.findFirst({
            where: { paystackSubscriptionId: payload.data.subscription_code },
            select: {
              id: true,
              name: true,
              email: true,
              paystackSubscriptionId: true,
            },
          });
        },
        catch: () => null, // Continue to next method if this fails
      });
    }

    // If not found by subscription code, try by customer email
    if (!landlord && payload.data.customer_email) {
      landlord = yield* Effect.tryPromise({
        try: async () => {
          const { db } = await import('@leaseup/prisma/db.ts');
          return db.user.findUnique({
            where: { email: payload.data.customer_email },
            select: {
              id: true,
              name: true,
              email: true,
              paystackSubscriptionId: true,
            },
          });
        },
        catch: () => null,
      });
    }

    if (!landlord) {
      yield* Console.warn('Landlord not found for invoice payment failed', {
        invoiceCode: payload.data.invoice_code,
        subscriptionId: payload.data.subscription,
        customerId: payload.data.customer,
        customerEmail: payload.data.customer_email,
      });

      // Don't fail the entire process, just log and continue
      return {
        message: 'Landlord not found, but event logged',
        invoiceCode: payload.data.invoice_code,
        status: 'landlord_not_found',
      };
    }

    // Update subscription status to "attention" if we have subscription tracking
    yield* Effect.tryPromise({
      try: async () => {
        const { db } = await import('@leaseup/prisma/db.ts');
        await db.user.update({
          where: { id: landlord.id },
          data: {
            paystackSubscriptionStatus: 'attention',
            subscriptionUpdatedAt: new Date(),
            lastPaymentFailure: payload.data.description,
            paymentRetryCount: payload.data.retries,
          },
        });
      },
      catch: (error) =>
        new Error(
          `Failed to update landlord payment failure status: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        ),
    });

    yield* Console.log(
      'Landlord subscription marked as attention due to payment failure',
      {
        landlordId: landlord.id,
        landlordEmail: landlord.email,
        invoiceCode: payload.data.invoice_code,
        failureReason: payload.data.description,
        retries: payload.data.retries,
      }
    );

    // Send notification about payment failure
    try {
      yield* Effect.tryPromise({
        try: () =>
          novu.trigger({
            to: {
              subscriberId: landlord.id,
              email: landlord.email,
            },
            workflowId: 'subscription-payment-failed',
            payload: {
              landlordName: landlord.name || 'Valued Customer',
              planName: payload.data.plan_name || 'Your subscription',
              planAmount: payload.data.plan_amount
                ? new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: payload.data.currency || 'ZAR',
                  }).format(payload.data.plan_amount / 100)
                : new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: payload.data.currency || 'ZAR',
                  }).format(payload.data.amount / 100),
              invoiceCode: payload.data.invoice_code,
              failureReason: payload.data.description,
              retryAttempt: payload.data.retries,
              nextRetryDate: payload.data.next_notification
                ? new Date(payload.data.next_notification).toLocaleDateString()
                : 'Soon',
              updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/update-payment`,
              dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
              subscriptionCode:
                payload.data.subscription_code ||
                landlord.paystackSubscriptionId,
            },
          }),
        catch: (error) =>
          new Error(`Failed to send payment failure notification: ${error}`),
      });

      yield* Console.log('Payment failure notification sent successfully', {
        landlordId: landlord.id,
        landlordEmail: landlord.email,
        invoiceCode: payload.data.invoice_code,
      });
    } catch (error) {
      yield* Console.warn(
        'Failed to send payment failure notification, but status was updated successfully',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          landlordId: landlord.id,
          invoiceCode: payload.data.invoice_code,
        }
      );
    }

    return yield* Effect.ensuring(
      Effect.succeed({
        message: 'Invoice payment failure processed successfully',
        landlordId: landlord.id,
        invoiceCode: payload.data.invoice_code,
        failureReason: payload.data.description,
        retries: payload.data.retries,
      }),
      databaseService
        .disconnect()
        .pipe(Effect.orElse(() => Effect.succeed(undefined)))
    );
  }).pipe(
    Effect.provide(DatabaseServiceLive),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Console.error(
          'Failed to process invoice payment failed event:',
          {
            invoiceCode: payload.data.invoice_code,
            subscriptionId: payload.data.subscription,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        );
        return yield* Effect.fail(error);
      })
    )
  );

export const runProcessInvoicePaymentFailedEffect = (
  payload: InvoicePaymentFailedPayload
) => Effect.runPromise(processInvoicePaymentFailedEffect(payload));
