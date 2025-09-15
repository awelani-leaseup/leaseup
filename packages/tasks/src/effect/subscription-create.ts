import { Schema, Effect, Console } from 'effect';
import { DatabaseServiceLive, DatabaseServiceTag } from './services';
import { novu } from '@leaseup/novu/client.ts';
import { SubscriptionPlanStatus } from '@leaseup/prisma/client/index.js';

const WELCOME_WORKFLOW_ID = 'landlord-welcome-copy';

// Schema for Paystack subscription.create webhook payload
const SubscriptionCreatePayload = Schema.Struct({
  event: Schema.String,
  data: Schema.Struct({
    domain: Schema.String,
    status: Schema.String,
    subscription_code: Schema.String.pipe(
      Schema.minLength(1, { message: () => 'Subscription code is required' })
    ),
    amount: Schema.Number,
    cron_expression: Schema.String,
    next_payment_date: Schema.String,
    open_invoice: Schema.Union(Schema.Any, Schema.Null),
    createdAt: Schema.String,
    plan: Schema.Struct({
      name: Schema.String,
      plan_code: Schema.String,
      description: Schema.Union(Schema.String, Schema.Null),
      amount: Schema.Number,
      interval: Schema.String,
      send_invoices: Schema.Boolean,
      send_sms: Schema.Boolean,
      currency: Schema.String,
    }),
    authorization: Schema.Struct({
      authorization_code: Schema.String,
      bin: Schema.String,
      last4: Schema.String,
      exp_month: Schema.String,
      exp_year: Schema.String,
      card_type: Schema.String,
      bank: Schema.String,
      country_code: Schema.String,
      brand: Schema.String,
      account_name: Schema.String,
    }),
    customer: Schema.Struct({
      first_name: Schema.String,
      last_name: Schema.String,
      email: Schema.String,
      customer_code: Schema.String,
      phone: Schema.String,
      metadata: Schema.Any,
      risk_action: Schema.String,
    }),
    created_at: Schema.String,
  }),
});

export type SubscriptionCreatePayload = Schema.Schema.Type<
  typeof SubscriptionCreatePayload
>;

const processSubscriptionCreateEffect = (payload: SubscriptionCreatePayload) =>
  Effect.gen(function* () {
    const databaseService = yield* DatabaseServiceTag;

    yield* Console.log(`Processing ${payload.event} event with Effect-TS`, {
      subscriptionCode: payload.data.subscription_code,
      customerEmail: payload.data.customer.email,
      planName: payload.data.plan.name,
      amount: payload.data.amount,
      currency: payload.data.plan.currency,
      status: payload.data.status,
    });

    // Find the user (landlord) by email from the customer data
    const landlord = yield* Effect.tryPromise({
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
      catch: (error) =>
        new Error(
          `Failed to find landlord by email: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        ),
    });

    if (!landlord) {
      yield* Console.warn('Landlord not found for subscription', {
        customerEmail: payload.data.customer.email,
        subscriptionCode: payload.data.subscription_code,
      });
      yield* Effect.fail(
        new Error(
          `Landlord not found for email: ${payload.data.customer.email}`
        )
      );
      return;
    }

    // Check if subscription is already recorded
    if (landlord.paystackSubscriptionId === payload.data.subscription_code) {
      yield* Console.log('Subscription already recorded for landlord', {
        landlordId: landlord.id,
        subscriptionCode: payload.data.subscription_code,
      });
      return {
        message: 'Subscription already recorded',
        landlordId: landlord.id,
        subscriptionCode: payload.data.subscription_code,
        status: 'already_exists',
      };
    }

    // Update the landlord's subscription information
    yield* Effect.tryPromise({
      try: async () => {
        const { db } = await import('@leaseup/prisma/db.ts');
        await db.user.update({
          where: { id: landlord.id },
          data: {
            paystackSubscriptionId: payload.data.subscription_code,
            paystackSubscriptionStatus:
              payload.data.status === 'active'
                ? SubscriptionPlanStatus.ACTIVE
                : SubscriptionPlanStatus.DISABLED,
            subscriptionPlanCode: payload.data.plan.plan_code,
            subscriptionAmount: payload.data.amount / 100,
            subscriptionCurrency: payload.data.plan.currency,
            subscriptionInterval: payload.data.plan.interval,
            nextPaymentDate: new Date(
              new Date(payload.data.next_payment_date).toUTCString()
            ),
            subscriptionCreatedAt: new Date(
              new Date(payload.data.createdAt).toUTCString()
            ),
            subscriptionUpdatedAt: new Date(new Date().toUTCString()),
            lastPaymentFailure: null, // Clear any previous failure
            paymentRetryCount: 0, // Reset retry count
          },
        });
      },
      catch: (error) =>
        new Error(
          `Failed to update landlord subscription: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        ),
    });

    yield* Console.log('Landlord subscription updated successfully', {
      landlordId: landlord.id,
      landlordEmail: landlord.email,
      subscriptionCode: payload.data.subscription_code,
      planName: payload.data.plan.name,
      amount: payload.data.amount,
      currency: payload.data.plan.currency,
      status: payload.data.status,
      nextPaymentDate: payload.data.next_payment_date,
    });

    try {
      yield* Effect.tryPromise({
        try: () =>
          novu.trigger({
            to: {
              subscriberId: landlord.id,
              email: landlord.email,
            },
            workflowId: WELCOME_WORKFLOW_ID,
            payload: {
              landlordName: landlord.name || 'Valued Customer',
              ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/properties/create`,
            },
          }),
        catch: (error) =>
          new Error(`Failed to send Novu welcome notification: ${error}`),
      });

      yield* Console.log('Welcome notification sent successfully', {
        landlordId: landlord.id,
        landlordEmail: landlord.email,
        subscriptionCode: payload.data.subscription_code,
      });
    } catch (error) {
      yield* Console.warn(
        'Failed to send welcome notification, but subscription was processed successfully',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          landlordId: landlord.id,
          subscriptionCode: payload.data.subscription_code,
        }
      );
    }

    return yield* Effect.ensuring(
      Effect.succeed({
        message: 'Subscription created successfully',
        landlordId: landlord.id,
        subscriptionCode: payload.data.subscription_code,
        planName: payload.data.plan.name,
        amount: payload.data.amount,
        currency: payload.data.plan.currency,
        status: payload.data.status,
        nextPaymentDate: payload.data.next_payment_date,
      }),
      databaseService
        .disconnect()
        .pipe(Effect.orElse(() => Effect.succeed(undefined)))
    );
  }).pipe(
    Effect.provide(DatabaseServiceLive),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Console.error('Failed to process subscription create event:', {
          subscriptionCode: payload.data.subscription_code,
          customerEmail: payload.data.customer.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return yield* Effect.fail(error);
      })
    )
  );

export const runProcessSubscriptionCreateEffect = (
  payload: SubscriptionCreatePayload
) => Effect.runPromise(processSubscriptionCreateEffect(payload));
