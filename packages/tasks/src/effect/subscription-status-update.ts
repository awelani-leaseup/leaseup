import { Schema, Effect, Console } from 'effect';
import { DatabaseServiceLive, DatabaseServiceTag } from './services';
import { novu } from '@leaseup/novu/client.ts';

const SubscriptionStatusUpdatePayload = Schema.Struct({
  event: Schema.String,
  data: Schema.Struct({
    subscription_code: Schema.String,
    status: Schema.String,
    customer: Schema.Struct({
      email: Schema.String,
      first_name: Schema.String,
      last_name: Schema.String,
    }),
    plan: Schema.Struct({
      name: Schema.String,
      amount: Schema.Number,
      currency: Schema.String,
    }),
    next_payment_date: Schema.optional(Schema.String),
    most_recent_invoice: Schema.optional(
      Schema.Struct({
        status: Schema.String,
        description: Schema.optional(Schema.String),
      })
    ),
  }),
});

export type SubscriptionStatusUpdatePayload = Schema.Schema.Type<
  typeof SubscriptionStatusUpdatePayload
>;

const processSubscriptionStatusUpdateEffect = (
  payload: SubscriptionStatusUpdatePayload
) =>
  Effect.gen(function* () {
    const databaseService = yield* DatabaseServiceTag;

    yield* Console.log(`Processing ${payload.event} event`, {
      subscriptionCode: payload.data.subscription_code,
      status: payload.data.status,
      customerEmail: payload.data.customer.email,
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
          `Failed to find landlord: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        ),
    });

    if (!landlord) {
      yield* Console.warn('Landlord not found for subscription status update', {
        customerEmail: payload.data.customer.email,
        subscriptionCode: payload.data.subscription_code,
      });
      return;
    }

    yield* Effect.tryPromise({
      try: async () => {
        const { db } = await import('@leaseup/prisma/db.ts');
        await db.user.update({
          where: { id: landlord.id },
          data: {
            // paystackSubscriptionStatus: payload.data.status,
            // subscriptionUpdatedAt: new Date(),
            // nextPaymentDate: payload.data.next_payment_date
            //   ? new Date(payload.data.next_payment_date)
            //   : null,
          },
        });
      },
      catch: (error) =>
        new Error(
          `Failed to update subscription status: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        ),
    });

    const notificationPayload = {
      landlordName: landlord.name || 'Valued Customer',
      planName: payload.data.plan.name,
      subscriptionCode: payload.data.subscription_code,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    };

    switch (payload.data.status) {
      case 'attention':
        yield* Effect.tryPromise({
          try: () =>
            novu.trigger({
              to: {
                subscriberId: landlord.id,
                email: landlord.email,
              },
              workflowId: 'subscription-payment-failed',
              payload: {
                ...notificationPayload,
                failureReason:
                  payload.data.most_recent_invoice?.description ||
                  'Payment failed',
                updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/update-payment`,
              },
            }),
          catch: (error) =>
            new Error(`Failed to send payment failure notification: ${error}`),
        });
        break;

      case 'cancelled':
        yield* Effect.tryPromise({
          try: () =>
            novu.trigger({
              to: {
                subscriberId: landlord.id,
                email: landlord.email,
              },
              workflowId: 'subscription-cancelled',
              payload: notificationPayload,
            }),
          catch: (error) =>
            new Error(`Failed to send cancellation notification: ${error}`),
        });
        break;

      case 'non-renewing':
        yield* Effect.tryPromise({
          try: () =>
            novu.trigger({
              to: {
                subscriberId: landlord.id,
                email: landlord.email,
              },
              workflowId: 'subscription-not-renewing',
              payload: {
                ...notificationPayload,
                nextPaymentDate: payload.data.next_payment_date
                  ? new Date(
                      payload.data.next_payment_date
                    ).toLocaleDateString()
                  : 'N/A',
              },
            }),
          catch: (error) =>
            new Error(`Failed to send non-renewal notification: ${error}`),
        });
        break;
    }

    yield* Console.log('Subscription status updated successfully', {
      landlordId: landlord.id,
      subscriptionCode: payload.data.subscription_code,
      newStatus: payload.data.status,
    });

    return yield* Effect.ensuring(
      Effect.succeed({
        message: 'Subscription status updated successfully',
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
        yield* Console.error('Failed to process subscription status update:', {
          subscriptionCode: payload.data.subscription_code,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return yield* Effect.fail(error);
      })
    )
  );

export const runProcessSubscriptionStatusUpdateEffect = (
  payload: SubscriptionStatusUpdatePayload
) => Effect.runPromise(processSubscriptionStatusUpdateEffect(payload));
