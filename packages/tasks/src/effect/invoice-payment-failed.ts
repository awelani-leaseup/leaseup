import { Schema, Effect, Console } from 'effect';
import { DatabaseServiceLive, DatabaseServiceTag } from './services';
import { novu } from '@leaseup/novu/client.ts';
import { SubscriptionPlanStatus } from '@leaseup/prisma/client/client.js';
import { paystack } from '@leaseup/payments/open-api/client';

// Schema for invoice.payment_failed webhook payload
const InvoicePaymentFailedPayload = Schema.Struct({
  event: Schema.String,
  data: Schema.Struct({
    domain: Schema.String,
    invoice_code: Schema.String,
    amount: Schema.Number,
    period_start: Schema.String,
    period_end: Schema.String,
    status: Schema.String, // "pending", "failed", etc.
    paid: Schema.Boolean,
    paid_at: Schema.Union(Schema.String, Schema.Null),
    description: Schema.Union(Schema.String, Schema.Null), // Failure reason
    authorization: Schema.optional(
      Schema.Struct({
        authorization_code: Schema.String,
        bin: Schema.String,
        last4: Schema.String,
        exp_month: Schema.String,
        exp_year: Schema.String,
        channel: Schema.String,
        card_type: Schema.String,
        bank: Schema.String,
        country_code: Schema.String,
        brand: Schema.String,
        reusable: Schema.Boolean,
        signature: Schema.String,
        account_name: Schema.String,
      })
    ),
    subscription: Schema.Struct({
      status: Schema.String,
      subscription_code: Schema.String,
      email_token: Schema.String,
      amount: Schema.Number,
      cron_expression: Schema.String,
      next_payment_date: Schema.String,
      open_invoice: Schema.String,
    }),
    customer: Schema.Struct({
      id: Schema.Number,
      first_name: Schema.Union(Schema.String, Schema.Null),
      last_name: Schema.Union(Schema.String, Schema.Null),
      email: Schema.String,
      customer_code: Schema.String,
      phone: Schema.Union(Schema.String, Schema.Null),
      metadata: Schema.Union(Schema.Unknown, Schema.Null),
      risk_action: Schema.String,
    }),
    transaction: Schema.optional(
      Schema.Record({ key: Schema.String, value: Schema.Unknown })
    ),
    created_at: Schema.String,
  }),
});

export type InvoicePaymentFailedPayload = Schema.Schema.Type<
  typeof InvoicePaymentFailedPayload
>;

// Helper function to generate billing link for subscription management
const generateBillingLink = (subscriptionCode: string) =>
  Effect.tryPromise({
    try: async () => {
      const { data: managementLinkData, error: managementLinkError } =
        await paystack.GET('/subscription/{code}/manage/link', {
          params: {
            path: {
              code: subscriptionCode,
            },
          },
        });

      if (managementLinkError || !managementLinkData?.data) {
        throw new Error(
          `Failed to generate billing link: ${managementLinkError?.message || 'Unknown error'}`
        );
      }

      return managementLinkData.data.link;
    },
    catch: (error) =>
      new Error(
        `Error generating billing link: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      ),
  });

const processInvoicePaymentFailedEffect = (
  payload: InvoicePaymentFailedPayload
) =>
  Effect.gen(function* () {
    const databaseService = yield* DatabaseServiceTag;

    yield* Console.log(`Processing ${payload.event} event with Effect-TS`, {
      invoiceCode: payload.data.invoice_code,
      subscriptionCode: payload.data.subscription.subscription_code,
      customerId: payload.data.customer.id,
      customerEmail: payload.data.customer.email,
      amount: payload.data.amount,
      failureReason: payload.data.description,
      status: payload.data.status,
    });

    let landlord = null;

    if (payload.data.subscription.subscription_code) {
      landlord = yield* Effect.tryPromise({
        try: async () => {
          const { db } = await import('@leaseup/prisma/db.ts');
          return db.user.findFirst({
            where: {
              paystackSubscriptionId:
                payload.data.subscription.subscription_code,
            },
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

    if (!landlord && payload.data.customer.email) {
      landlord = yield* Effect.tryPromise({
        try: async () => {
          const { db } = await import('@leaseup/prisma/db.ts');
          return db.user.findUnique({
            where: { email: payload.data.customer.email },
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
        subscriptionCode: payload.data.subscription.subscription_code,
        customerId: payload.data.customer.id,
        customerEmail: payload.data.customer.email,
      });

      return {
        message: 'Landlord not found, but event logged',
        invoiceCode: payload.data.invoice_code,
        status: 'landlord_not_found',
      };
    }

    yield* Effect.tryPromise({
      try: async () => {
        const { db } = await import('@leaseup/prisma/db.ts');
        await db.user.update({
          where: { id: landlord.id },
          data: {
            paystackSubscriptionStatus: SubscriptionPlanStatus.ATTENTION,
            subscriptionUpdatedAt: new Date(new Date().toUTCString()),
            lastPaymentFailure: payload.data.description || 'Payment failed',
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
        status: payload.data.status,
      }
    );

    try {
      let billingLink = null;

      if (landlord.paystackSubscriptionId) {
        try {
          billingLink = yield* generateBillingLink(
            landlord.paystackSubscriptionId
          );
          yield* Console.log('Generated billing link successfully', {
            landlordId: landlord.id,
            subscriptionId: landlord.paystackSubscriptionId,
          });
        } catch (error) {
          yield* Console.warn(
            'Failed to generate billing link, continuing without it',
            {
              landlordId: landlord.id,
              subscriptionId: landlord.paystackSubscriptionId,
              error: error instanceof Error ? error.message : 'Unknown error',
            }
          );
        }
      }

      yield* Effect.tryPromise({
        try: () =>
          novu.trigger({
            to: {
              subscriberId: landlord.id,
              email: landlord.email,
            },
            workflowId: 'landlord-subscription-invoice-failed',
            payload: {
              landlordName: landlord.name || 'Valued Customer',
              planName: 'Professional',
              invoiceDate: new Date(
                payload.data.created_at
              ).toLocaleDateString(),
              billingLink: billingLink ?? '#',
              invoiceNumber: payload.data.invoice_code,
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
        status: payload.data.status,
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
            subscriptionCode: payload.data.subscription.subscription_code,
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
