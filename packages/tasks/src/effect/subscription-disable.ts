import { Schema, Effect, Console } from 'effect';
import { DatabaseServiceLive, DatabaseServiceTag } from './services';
import { novu } from '@leaseup/novu/client.ts';
import { SubscriptionPlanStatus } from '@leaseup/prisma/client/index.js';

// Schema for subscription.disable webhook payload
const SubscriptionDisablePayload = Schema.Struct({
  event: Schema.String,
  data: Schema.Struct({
    subscription_code: Schema.String.pipe(
      Schema.minLength(1, { message: () => 'Subscription code is required' })
    ),
    status: Schema.String, // Should be "cancelled" or "completed"
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
            // Clear subscription data since it's disabled
            paystackSubscriptionId: null,
            paystackSubscriptionStatus:
              payload.data.status === 'cancelled'
                ? SubscriptionPlanStatus.CANCELLED
                : SubscriptionPlanStatus.COMPLETED,
            subscriptionUpdatedAt: new Date(),
            nextPaymentDate: null,
            // Keep plan info for reference but clear active subscription
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

    // Send notification about subscription cancellation/completion
    const notificationWorkflow =
      payload.data.status === 'completed'
        ? 'subscription-completed'
        : 'subscription-cancelled';

    try {
      yield* Effect.tryPromise({
        try: () =>
          novu.trigger({
            to: {
              subscriberId: landlord.id,
              email: landlord.email,
            },
            workflowId: notificationWorkflow,
            payload: {
              landlordName: landlord.name || 'Valued Customer',
              planName: payload.data.plan.name,
              planAmount: new Intl.NumberFormat('en-ZA', {
                style: 'currency',
                currency: payload.data.plan.currency,
              }).format(payload.data.plan.amount / 100),
              subscriptionCode: payload.data.subscription_code,
              disabledDate: new Date().toLocaleDateString(),
              reactivateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/reactivate`,
              dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
            },
          }),
        catch: (error) =>
          new Error(
            `Failed to send subscription disable notification: ${error}`
          ),
      });

      yield* Console.log(
        'Subscription disable notification sent successfully',
        {
          landlordId: landlord.id,
          landlordEmail: landlord.email,
          subscriptionCode: payload.data.subscription_code,
          workflowId: notificationWorkflow,
        }
      );
    } catch (error) {
      yield* Console.warn(
        'Failed to send subscription disable notification, but status was updated successfully',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          landlordId: landlord.id,
          subscriptionCode: payload.data.subscription_code,
        }
      );
    }

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
