import { Schema, Effect, Console } from 'effect';
import { DatabaseServiceLive, DatabaseServiceTag } from './services';
import { novu } from '@leaseup/novu/client.ts';

// Schema for subscription.expiring_cards webhook
const ExpiringCardsPayload = Schema.Struct({
  event: Schema.String,
  data: Schema.Array(
    Schema.Struct({
      expiry_date: Schema.String, // "12/2021"
      description: Schema.String, // "visa ending with 4081"
      brand: Schema.String,
      subscription: Schema.Struct({
        id: Schema.Number,
        subscription_code: Schema.String,
        amount: Schema.Number,
        next_payment_date: Schema.String,
        plan: Schema.Struct({
          interval: Schema.String,
          id: Schema.Number,
          name: Schema.String,
          plan_code: Schema.String,
        }),
      }),
      customer: Schema.Struct({
        id: Schema.Number,
        first_name: Schema.String,
        last_name: Schema.String,
        email: Schema.String,
        customer_code: Schema.String,
      }),
    })
  ),
});

export type ExpiringCardsPayload = Schema.Schema.Type<
  typeof ExpiringCardsPayload
>;

const processExpiringCardsEffect = (payload: ExpiringCardsPayload) =>
  Effect.gen(function* () {
    const databaseService = yield* DatabaseServiceTag;

    yield* Console.log(`Processing ${payload.event} event`, {
      expiringSubscriptions: payload.data.length,
    });

    // Process each expiring subscription
    for (const expiring of payload.data) {
      yield* Console.log('Processing expiring card', {
        customerEmail: expiring.customer.email,
        subscriptionCode: expiring.subscription.subscription_code,
        expiryDate: expiring.expiry_date,
        cardDescription: expiring.description,
      });

      // Find the landlord by email
      const landlord = yield* Effect.tryPromise({
        try: async () => {
          const { db } = await import('@leaseup/prisma/db.ts');
          return db.user.findUnique({
            where: { email: expiring.customer.email },
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
        yield* Console.warn('Landlord not found for expiring card', {
          customerEmail: expiring.customer.email,
          subscriptionCode: expiring.subscription.subscription_code,
        });
        continue;
      }

      // Send notification about expiring card
      try {
        yield* Effect.tryPromise({
          try: () =>
            novu.trigger({
              to: {
                subscriberId: landlord.id,
                email: landlord.email,
              },
              workflowId: 'subscription-card-expiring',
              payload: {
                landlordName: landlord.name || 'Valued Customer',
                planName: expiring.subscription.plan.name,
                cardDescription: expiring.description,
                expiryDate: expiring.expiry_date,
                nextPaymentDate: new Date(
                  expiring.subscription.next_payment_date
                ).toLocaleDateString(),
                planAmount: new Intl.NumberFormat('en-ZA', {
                  style: 'currency',
                  currency: 'ZAR', // You might want to detect currency from plan
                }).format(expiring.subscription.amount / 100),
                updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/update-payment`,
                subscriptionCode: expiring.subscription.subscription_code,
              },
            }),
          catch: (error) =>
            new Error(`Failed to send expiring card notification: ${error}`),
        });

        yield* Console.log('Expiring card notification sent', {
          landlordId: landlord.id,
          subscriptionCode: expiring.subscription.subscription_code,
        });
      } catch (error) {
        yield* Console.warn('Failed to send expiring card notification', {
          error: error instanceof Error ? error.message : 'Unknown error',
          landlordId: landlord.id,
          subscriptionCode: expiring.subscription.subscription_code,
        });
      }
    }

    return yield* Effect.ensuring(
      Effect.succeed({
        message: 'Expiring cards processed successfully',
        processedCount: payload.data.length,
      }),
      databaseService
        .disconnect()
        .pipe(Effect.orElse(() => Effect.succeed(undefined)))
    );
  }).pipe(
    Effect.provide(DatabaseServiceLive),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Console.error('Failed to process expiring cards:', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return yield* Effect.fail(error);
      })
    )
  );

export const runProcessExpiringCardsEffect = (payload: ExpiringCardsPayload) =>
  Effect.runPromise(processExpiringCardsEffect(payload));
