import { Effect, Console } from 'effect';
import {
  runCreateLeaseEffect,
  type CreateLeasePayload,
  type LeaseCreationError,
} from './create-lease';

/**
 * Example demonstrating how to use the create lease effect with proper error handling
 */
export const exampleUsage = () => {
  const payload: CreateLeasePayload = {
    leaseId: 'lease-123',
    customerCode: 'customer-456', // Optional
  };

  return Effect.gen(function* () {
    yield* Console.log('Starting lease creation process...');

    // Run the lease creation effect with comprehensive error handling
    const result = yield* runCreateLeaseEffect(payload).pipe(
      Effect.catchTags({
        // Handle specific business logic errors
        LeaseNotFoundError: (error) =>
          Effect.gen(function* () {
            yield* Console.error(`❌ Lease not found: ${error.leaseId}`);
            // You can implement retry logic, redirect to lease creation, etc.
            return yield* Effect.fail(error);
          }),

        LandlordOnboardingIncompleteError: (error) =>
          Effect.gen(function* () {
            yield* Console.error(
              `❌ Landlord onboarding incomplete: ${error.landlordId}`
            );
            yield* Console.log(`Missing: ${error.missingField}`);
            // You could redirect to onboarding completion flow
            return yield* Effect.fail(error);
          }),

        PaystackPlanCreationError: (error) =>
          Effect.gen(function* () {
            yield* Console.error(
              `❌ Failed to create Paystack plan for lease: ${error.leaseId}`
            );
            yield* Console.log(
              `Tenant: ${error.tenantName}, Amount: ${error.amount} ${error.currency}`
            );
            // You could implement retry logic or alternative payment methods
            return yield* Effect.fail(error);
          }),

        // Handle service-level errors
        DatabaseError: (error) =>
          Effect.gen(function* () {
            yield* Console.error(`❌ Database error: ${error.message}`);
            // You could implement retry logic or fallback to cached data
            return yield* Effect.fail(error);
          }),

        PaystackApiError: (error) =>
          Effect.gen(function* () {
            yield* Console.error(`❌ Paystack API error: ${error.message}`);
            // You could implement retry logic or switch to backup payment provider
            return yield* Effect.fail(error);
          }),
      }),
      // Catch any remaining errors
      Effect.catchAll((error: LeaseCreationError) =>
        Effect.gen(function* () {
          yield* Console.error(
            '❌ Unhandled error during lease creation:',
            error
          );
          return yield* Effect.fail(error);
        })
      )
    );

    yield* Console.log('✅ Lease creation completed successfully!');
    yield* Console.log(`Authorization URL: ${result.authorizationUrl}`);
    yield* Console.log(`Reference: ${result.reference}`);

    return result;
  });
};

/**
 * Example showing how to handle errors for different use cases
 */
export const exampleWithCustomHandling = (payload: CreateLeasePayload) => {
  return runCreateLeaseEffect(payload).pipe(
    Effect.matchEffect({
      onFailure: (error: LeaseCreationError) => {
        // Pattern match on error types for different business responses
        switch (error._tag) {
          case 'LeaseNotFoundError':
            return Effect.succeed({
              success: false,
              errorType: 'LEASE_NOT_FOUND' as const,
              message: `Lease ${error.leaseId} not found`,
              action: 'redirect_to_lease_creation' as const,
            });

          case 'LandlordOnboardingIncompleteError':
            return Effect.succeed({
              success: false,
              errorType: 'ONBOARDING_INCOMPLETE' as const,
              message: `Landlord ${error.landlordId} needs to complete ${error.missingField} setup`,
              action: 'redirect_to_onboarding' as const,
              missingField: error.missingField,
            });

          case 'PaystackPlanCreationError':
          case 'PaystackSubscriptionCreationError':
          case 'PaystackTransactionInitializationError':
            return Effect.succeed({
              success: false,
              errorType: 'PAYMENT_SETUP_FAILED' as const,
              message: 'Failed to set up payment processing',
              action: 'retry_payment_setup' as const,
            });

          case 'DatabaseError':
            return Effect.succeed({
              success: false,
              errorType: 'DATABASE_ERROR' as const,
              message: 'Database operation failed',
              action: 'retry_later' as const,
            });

          case 'PaystackApiError':
            return Effect.succeed({
              success: false,
              errorType: 'PAYMENT_API_ERROR' as const,
              message: 'Payment service unavailable',
              action: 'try_alternative_payment' as const,
            });

          default:
            return Effect.succeed({
              success: false,
              errorType: 'UNKNOWN_ERROR' as const,
              message: 'An unexpected error occurred',
              action: 'contact_support' as const,
            });
        }
      },
      onSuccess: (result) =>
        Effect.succeed({
          success: true,
          data: result,
        }),
    })
  );
};

/**
 * Example showing retry logic for transient errors
 */
export const exampleWithRetry = (payload: CreateLeasePayload) => {
  return runCreateLeaseEffect(payload).pipe(
    Effect.retry({
      times: 3,
      schedule: Effect.Schedule.exponential('1 second'),
    }),
    Effect.catchTags({
      // Don't retry business logic errors
      LeaseNotFoundError: (error) => Effect.fail(error),
      LandlordOnboardingIncompleteError: (error) => Effect.fail(error),
      NoTenantsFoundError: (error) => Effect.fail(error),

      // Retry transient errors
      DatabaseError: (error) =>
        Console.log(`Retrying after database error: ${error.message}`).pipe(
          Effect.andThen(() => Effect.fail(error))
        ),

      PaystackApiError: (error) =>
        Console.log(`Retrying after Paystack API error: ${error.message}`).pipe(
          Effect.andThen(() => Effect.fail(error))
        ),
    })
  );
};
