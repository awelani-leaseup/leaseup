import { Schema, Effect, Console } from 'effect';
import { DatabaseServiceLive, DatabaseServiceTag } from './services';
import { novu } from '@leaseup/novu/client.ts';
import { SubscriptionPlanStatus } from '@leaseup/prisma/client/client.js';

// Schema for subscription.not_renewing webhook payload
const SubscriptionNotRenewingPayload = Schema.Struct({
  event: Schema.String,
  data: Schema.Struct({
    subscription_code: Schema.String.pipe(
      Schema.minLength(1, { message: () => 'Subscription code is required' })
    ),
    status: Schema.String, // Should be "non-renewing"
    next_payment_date: Schema.Union(Schema.String, Schema.Null),
    customer: Schema.Struct({
      first_name: Schema.String,
      last_name: Schema.String,
      email: Schema.String,
      customer_code: Schema.String,
    }),
    plan: Schema.Struct({
      name: Schema.String,
      plan_code: Schema.String,
      amount: Schema.Number,
      currency: Schema.String,
      interval: Schema.String,
    }),
    authorization: Schema.optional(
      Schema.Struct({
        authorization_code: Schema.String,
        last4: Schema.String,
        card_type: Schema.String,
        bank: Schema.String,
      })
    ),
    created_at: Schema.String,
  }),
});

export type SubscriptionNotRenewingPayload = Schema.Schema.Type<
  typeof SubscriptionNotRenewingPayload
>;

const processSubscriptionNotRenewingEffect = (
  payload: SubscriptionNotRenewingPayload
) =>
  Effect.gen(function* () {
    const databaseService = yield* DatabaseServiceTag;

    yield* Console.log(`Processing ${payload.event} event with Effect-TS`, {
      subscriptionCode: payload.data.subscription_code,
      customerEmail: payload.data.customer.email,
      status: payload.data.status,
      planName: payload.data.plan.name,
      nextPaymentDate: payload.data.next_payment_date,
    });

    // Find the landlord by email
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
      yield* Console.warn('Landlord not found for subscription not renewing', {
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

    // Verify this is the correct subscription
    if (landlord.paystackSubscriptionId !== payload.data.subscription_code) {
      yield* Console.warn('Subscription code mismatch', {
        landlordId: landlord.id,
        storedSubscriptionCode: landlord.paystackSubscriptionId,
        webhookSubscriptionCode: payload.data.subscription_code,
      });
    }

    // Update the landlord's subscription status
    yield* Effect.tryPromise({
      try: async () => {
        const { db } = await import('@leaseup/prisma/db.ts');
        await db.user.update({
          where: { id: landlord.id },
          data: {
            // Keep subscription ID but update status
            paystackSubscriptionId: payload.data.subscription_code,
            paystackSubscriptionStatus:
              payload.data.status === 'non-renewing'
                ? SubscriptionPlanStatus.NON_RENEWING
                : SubscriptionPlanStatus.DISABLED,
            subscriptionUpdatedAt: new Date(),
            nextPaymentDate: payload.data.next_payment_date
              ? new Date(payload.data.next_payment_date)
              : null,
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

    yield* Console.log('Landlord subscription marked as not renewing', {
      landlordId: landlord.id,
      landlordEmail: landlord.email,
      subscriptionCode: payload.data.subscription_code,
      nextPaymentDate: payload.data.next_payment_date,
    });

    // Send notification about subscription not renewing
    try {
      yield* Effect.tryPromise({
        try: () =>
          novu.trigger({
            to: {
              subscriberId: landlord.id,
              email: landlord.email,
            },
            workflowId: 'landlord-cancel-subscription',
            payload: {
              landlordName: landlord.name || 'Valued Customer',
              planName: payload.data.plan.name,
            },
          }),
        catch: (error) =>
          new Error(
            `Failed to send subscription not renewing notification: ${error}`
          ),
      });

      yield* Console.log(
        'Subscription not renewing notification sent successfully',
        {
          landlordId: landlord.id,
          landlordEmail: landlord.email,
          subscriptionCode: payload.data.subscription_code,
        }
      );
    } catch (error) {
      yield* Console.warn(
        'Failed to send subscription not renewing notification, but status was updated successfully',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          landlordId: landlord.id,
          subscriptionCode: payload.data.subscription_code,
        }
      );
    }

    return yield* Effect.ensuring(
      Effect.succeed({
        message: 'Subscription not renewing processed successfully',
        landlordId: landlord.id,
        subscriptionCode: payload.data.subscription_code,
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
        yield* Console.error(
          'Failed to process subscription not renewing event:',
          {
            subscriptionCode: payload.data.subscription_code,
            customerEmail: payload.data.customer.email,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        );
        return yield* Effect.fail(error);
      })
    )
  );

export const runProcessSubscriptionNotRenewingEffect = (
  payload: SubscriptionNotRenewingPayload
) => Effect.runPromise(processSubscriptionNotRenewingEffect(payload));
