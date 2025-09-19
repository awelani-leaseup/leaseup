import { Schema, Effect, Console } from 'effect';
import { DatabaseServiceLive, DatabaseServiceTag } from './services';
import { SubscriptionPlanStatus } from '@leaseup/prisma/client/client.js';

// Schema for subscription.disable webhook payload
const SubscriptionDisablePayload = Schema.Struct({
  event: Schema.String,
  data: Schema.Struct({
    domain: Schema.String,
    status: Schema.String, // "complete", "cancelled", etc.
    subscription_code: Schema.String.pipe(
      Schema.minLength(1, { message: () => 'Subscription code is required' })
    ),
    email_token: Schema.String,
    amount: Schema.Number,
    cron_expression: Schema.String,
    next_payment_date: Schema.String,
    open_invoice: Schema.NullOr(Schema.Unknown), // Can be null or contain invoice data
    plan: Schema.Struct({
      id: Schema.Number,
      name: Schema.String,
      plan_code: Schema.String,
      description: Schema.NullOr(Schema.String),
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
      phone: Schema.String, // Can be empty string
      metadata: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
      risk_action: Schema.String,
    }),
    created_at: Schema.String,
  }),
});

export type SubscriptionDisablePayload = Schema.Schema.Type<
  typeof SubscriptionDisablePayload
>;

const processSubscriptionDisableEffect = (
  payload: SubscriptionDisablePayload
) =>
  Effect.gen(function* () {
    const databaseService = yield* DatabaseServiceTag;

    yield* Console.log(`Processing ${payload.event} event with Effect-TS`, {
      subscriptionCode: payload.data.subscription_code,
      customerEmail: payload.data.customer.email,
      status: payload.data.status,
      planName: payload.data.plan.name,
    });

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
      yield* Console.warn('Landlord not found for subscription disable', {
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

    if (landlord.paystackSubscriptionId !== payload.data.subscription_code) {
      yield* Console.warn('Subscription code mismatch', {
        landlordId: landlord.id,
        storedSubscriptionCode: landlord.paystackSubscriptionId,
        webhookSubscriptionCode: payload.data.subscription_code,
      });
    }

    yield* Effect.tryPromise({
      try: async () => {
        const { db } = await import('@leaseup/prisma/db.ts');
        await db.user.update({
          where: { id: landlord.id },
          data: {
            paystackSubscriptionId: null,
            paystackSubscriptionStatus:
              payload.data.status === 'cancelled'
                ? SubscriptionPlanStatus.CANCELLED
                : SubscriptionPlanStatus.COMPLETED,
            subscriptionUpdatedAt: new Date(),
            nextPaymentDate: null,
            subscriptionPlanCode: null,
            subscriptionAmount: null,
            subscriptionCurrency: null,
            subscriptionInterval: null,
          },
        });
      },
      catch: (error) =>
        new Error(
          `Failed to update landlord subscription status: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        ),
    });

    yield* Console.log('Landlord subscription disabled successfully', {
      landlordId: landlord.id,
      landlordEmail: landlord.email,
      subscriptionCode: payload.data.subscription_code,
      newStatus: payload.data.status,
    });

    return yield* Effect.ensuring(
      Effect.succeed({
        message: 'Subscription disabled successfully',
        landlordId: landlord.id,
        subscriptionCode: payload.data.subscription_code,
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
        yield* Console.error('Failed to process subscription disable event:', {
          subscriptionCode: payload.data.subscription_code,
          customerEmail: payload.data.customer.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return yield* Effect.fail(error);
      })
    )
  );

export const runProcessSubscriptionDisableEffect = (
  payload: SubscriptionDisablePayload
) => Effect.runPromise(processSubscriptionDisableEffect(payload));
