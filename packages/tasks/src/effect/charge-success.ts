import { Schema, Effect, Console } from 'effect';
import { DatabaseServiceLive, DatabaseServiceTag } from './services';
import { SubscriptionPlanStatus } from '@leaseup/prisma/client/index.js';
import { paystack } from '@leaseup/payments/open-api/client';

const ChargeSuccessPayload = Schema.Struct({
  event: Schema.String,
  data: Schema.Struct({
    id: Schema.Number,
    domain: Schema.String,
    status: Schema.String,
    reference: Schema.String.pipe(
      Schema.minLength(1, { message: () => 'Reference is required' })
    ),
    amount: Schema.Number,
    message: Schema.Union(Schema.String, Schema.Null),
    gateway_response: Schema.String,
    paid_at: Schema.String,
    created_at: Schema.String,
    channel: Schema.String,
    currency: Schema.String,
    ip_address: Schema.String,
    metadata: Schema.Union(Schema.Any, Schema.Null),
    log: Schema.Union(Schema.Any, Schema.Null),
    fees: Schema.Union(Schema.Number, Schema.Null),
    fees_split: Schema.Union(Schema.Any, Schema.Null),
    authorization: Schema.Struct({
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
      account_name: Schema.Union(Schema.String, Schema.Null),
    }),
    customer: Schema.Struct({
      id: Schema.Number,
      first_name: Schema.Union(Schema.String, Schema.Null),
      last_name: Schema.Union(Schema.String, Schema.Null),
      email: Schema.String,
      customer_code: Schema.String,
      phone: Schema.Union(Schema.String, Schema.Null),
      metadata: Schema.Union(Schema.Any, Schema.Null),
      risk_action: Schema.String,
      international_format_phone: Schema.Union(Schema.String, Schema.Null),
    }),
    plan: Schema.Union(
      Schema.Struct({
        id: Schema.Number,
        name: Schema.String,
        plan_code: Schema.String,
        description: Schema.Union(Schema.String, Schema.Null),
        amount: Schema.Number,
        interval: Schema.String,
        send_invoices: Schema.Boolean,
        send_sms: Schema.Boolean,
        currency: Schema.String,
      }),
      Schema.Null
    ),
    subaccount: Schema.Union(Schema.Any, Schema.Null),
    split: Schema.Union(Schema.Any, Schema.Null),
    order_id: Schema.Union(Schema.String, Schema.Null),
    paidAt: Schema.String,
    pos_transaction_data: Schema.Union(Schema.Any, Schema.Null),
    source: Schema.Union(Schema.Any, Schema.Null),
    fees_breakdown: Schema.Union(Schema.Any, Schema.Null),
  }),
});

export type ChargeSuccessPayload = Schema.Schema.Type<
  typeof ChargeSuccessPayload
>;

const processChargeSuccessEffect = (payload: ChargeSuccessPayload) =>
  Effect.gen(function* () {
    const databaseService = yield* DatabaseServiceTag;

    yield* Console.log(`Processing ${payload.event} event with Effect-TS`, {
      reference: payload.data.reference,
      customerEmail: payload.data.customer.email,
      amount: payload.data.amount,
      currency: payload.data.currency,
      status: payload.data.status,
      planCode: payload.data.plan?.plan_code || null,
      channel: payload.data.channel,
    });

    // Check if this is a subscription renewal by verifying if a plan is associated
    if (!payload.data.plan) {
      yield* Console.log(
        'Charge success is not for a subscription, skipping processing',
        {
          reference: payload.data.reference,
          customerEmail: payload.data.customer.email,
        }
      );
      return {
        message: 'Charge success processed - not a subscription charge',
        reference: payload.data.reference,
        status: 'non_subscription_charge',
      };
    }

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
            paystackSubscriptionStatus: true,
            subscriptionPlanCode: true,
            subscriptionAmount: true,
            nextPaymentDate: true,
            paymentRetryCount: true,
            lastPaymentFailure: true,
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
      yield* Console.warn('Landlord not found for charge success', {
        customerEmail: payload.data.customer.email,
        reference: payload.data.reference,
      });
      yield* Effect.fail(
        new Error(
          `Landlord not found for email: ${payload.data.customer.email}`
        )
      );
      return;
    }

    if (landlord.subscriptionPlanCode !== payload.data.plan.plan_code) {
      yield* Console.warn('Plan code mismatch for charge success', {
        landlordId: landlord.id,
        expectedPlanCode: landlord.subscriptionPlanCode,
        receivedPlanCode: payload.data.plan.plan_code,
        reference: payload.data.reference,
      });
      return {
        message:
          'Plan code mismatch - charge may be for different subscription',
        landlordId: landlord.id,
        reference: payload.data.reference,
        status: 'plan_mismatch',
      };
    }

    const currentDate = new Date(payload.data.paid_at);
    const nextPaymentDate = new Date(currentDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    yield* Effect.tryPromise({
      try: async () => {
        const { db } = await import('@leaseup/prisma/db.ts');
        await db.user.update({
          where: { id: landlord.id },
          data: {
            paystackSubscriptionStatus: SubscriptionPlanStatus.ACTIVE,
            subscriptionAmount: payload.data.amount / 100,
            subscriptionCurrency: payload.data.currency,
            nextPaymentDate: nextPaymentDate,
            subscriptionUpdatedAt: new Date(payload.data.paid_at),
            lastPaymentFailure: null,
            paymentRetryCount: 0,
          },
        });
      },
      catch: (error) =>
        new Error(
          `Failed to update landlord subscription after charge success: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        ),
    });

    yield* Console.log(
      'Landlord subscription updated after successful charge',
      {
        landlordId: landlord.id,
        landlordEmail: landlord.email,
        reference: payload.data.reference,
        planCode: payload.data.plan.plan_code,
        amount: payload.data.amount,
        currency: payload.data.currency,
        paidAt: payload.data.paid_at,
        nextPaymentDate: nextPaymentDate.toISOString(),
      }
    );

    return yield* Effect.ensuring(
      Effect.succeed({
        message: 'Subscription renewal charge processed successfully',
        landlordId: landlord.id,
        reference: payload.data.reference,
        planCode: payload.data.plan.plan_code,
        amount: payload.data.amount,
        currency: payload.data.currency,
        paidAt: payload.data.paid_at,
        nextPaymentDate: nextPaymentDate.toISOString(),
        status: 'success',
      }),
      databaseService
        .disconnect()
        .pipe(Effect.orElse(() => Effect.succeed(undefined)))
    );
  }).pipe(
    Effect.provide(DatabaseServiceLive),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Console.error('Failed to process charge success event:', {
          reference: payload.data.reference,
          customerEmail: payload.data.customer.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return yield* Effect.fail(error);
      })
    )
  );

export const runProcessChargeSuccessEffect = (payload: ChargeSuccessPayload) =>
  Effect.runPromise(processChargeSuccessEffect(payload));
