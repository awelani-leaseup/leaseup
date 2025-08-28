import { Effect } from 'effect';
import {
  runCreateLeaseEffect,
  type CreateLeasePayload,
  type LeaseCreationError,
  LeaseNotFoundError,
  LandlordOnboardingIncompleteError,
  PaystackPlanCreationError,
  DatabaseError,
  PaystackApiError,
} from './create-lease';

/**
 * Example 1: Using Effect.match for synchronous error handling
 * This returns a regular JavaScript value, not an Effect
 */
export const handleLeaseCreationSync = async (payload: CreateLeasePayload) => {
  const result = await Effect.runPromise(
    runCreateLeaseEffect(payload).pipe(
      Effect.match({
        onFailure: (error: LeaseCreationError) => {
          // Check for specific error types using the _tag property
          switch (error._tag) {
            case 'LeaseNotFoundError':
              return {
                success: false,
                errorType: 'LEASE_NOT_FOUND' as const,
                message: `Lease ${error.leaseId} not found`,
                leaseId: error.leaseId,
              };

            case 'LandlordOnboardingIncompleteError':
              return {
                success: false,
                errorType: 'ONBOARDING_INCOMPLETE' as const,
                message: error.message,
                landlordId: error.landlordId,
                missingField: error.missingField,
              };

            case 'PaystackPlanCreationError':
              return {
                success: false,
                errorType: 'PAYMENT_PLAN_FAILED' as const,
                message: error.message,
                leaseId: error.leaseId,
                tenantName: error.tenantName,
                amount: error.amount,
              };

            case 'DatabaseError':
              return {
                success: false,
                errorType: 'DATABASE_ERROR' as const,
                message: 'Database operation failed',
                retryable: true,
              };

            case 'PaystackApiError':
              return {
                success: false,
                errorType: 'API_ERROR' as const,
                message: 'Payment service unavailable',
                retryable: true,
              };

            default:
              return {
                success: false,
                errorType: 'UNKNOWN_ERROR' as const,
                message: error.message || 'An unexpected error occurred',
              };
          }
        },
        onSuccess: (data) => ({
          success: true,
          data,
        }),
      })
    )
  );

  return result;
};

/**
 * Example 2: Using try/catch with Effect.runPromise
 * This throws the actual error objects that you can check with instanceof
 */
export const handleLeaseCreationWithTryCatch = async (
  payload: CreateLeasePayload
) => {
  try {
    const result = await Effect.runPromise(runCreateLeaseEffect(payload));
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Check for specific error types using instanceof
    if (error instanceof LeaseNotFoundError) {
      console.error(`Lease not found: ${error.leaseId}`);
      return {
        success: false,
        errorType: 'LEASE_NOT_FOUND' as const,
        leaseId: error.leaseId,
        message: error.message,
      };
    }

    if (error instanceof LandlordOnboardingIncompleteError) {
      console.error(
        `Landlord onboarding incomplete: ${error.landlordId}, missing: ${error.missingField}`
      );
      return {
        success: false,
        errorType: 'ONBOARDING_INCOMPLETE' as const,
        landlordId: error.landlordId,
        missingField: error.missingField,
        message: error.message,
      };
    }

    if (error instanceof PaystackPlanCreationError) {
      console.error(`Payment plan creation failed for lease: ${error.leaseId}`);
      return {
        success: false,
        errorType: 'PAYMENT_PLAN_FAILED' as const,
        leaseId: error.leaseId,
        tenantName: error.tenantName,
        amount: error.amount,
        currency: error.currency,
        message: error.message,
      };
    }

    if (error instanceof DatabaseError) {
      console.error(`Database error: ${error.message}`);
      return {
        success: false,
        errorType: 'DATABASE_ERROR' as const,
        message: error.message,
        retryable: true,
      };
    }

    if (error instanceof PaystackApiError) {
      console.error(`Paystack API error: ${error.message}`);
      return {
        success: false,
        errorType: 'API_ERROR' as const,
        message: error.message,
        retryable: true,
      };
    }

    // Fallback for unknown errors
    console.error('Unknown error:', error);
    return {
      success: false,
      errorType: 'UNKNOWN_ERROR' as const,
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
};

/**
 * Example 3: Using Effect.either for Option-like error handling
 * This gives you an Either<Error, Success> type
 */
export const handleLeaseCreationWithEither = async (
  payload: CreateLeasePayload
) => {
  const either = await Effect.runPromise(
    Effect.either(runCreateLeaseEffect(payload))
  );

  if (either._tag === 'Left') {
    const error = either.left;

    // Check error type using _tag property
    switch (error._tag) {
      case 'LeaseNotFoundError':
        console.error(`Lease not found: ${error.leaseId}`);
        return { error: 'LEASE_NOT_FOUND', details: error };

      case 'LandlordOnboardingIncompleteError':
        console.error(
          `Onboarding incomplete for landlord: ${error.landlordId}`
        );
        return { error: 'ONBOARDING_INCOMPLETE', details: error };

      case 'DatabaseError':
        console.error(`Database error: ${error.message}`);
        return { error: 'DATABASE_ERROR', details: error };

      default:
        console.error('Unhandled error:', error);
        return { error: 'UNKNOWN_ERROR', details: error };
    }
  } else {
    // Success case
    return { success: true, data: either.right };
  }
};

/**
 * Example 4: Helper function to check error types
 */
export const isSpecificError = {
  leaseNotFound: (error: unknown): error is LeaseNotFoundError =>
    error instanceof LeaseNotFoundError ||
    (typeof error === 'object' &&
      error !== null &&
      '_tag' in error &&
      error._tag === 'LeaseNotFoundError'),

  onboardingIncomplete: (
    error: unknown
  ): error is LandlordOnboardingIncompleteError =>
    error instanceof LandlordOnboardingIncompleteError ||
    (typeof error === 'object' &&
      error !== null &&
      '_tag' in error &&
      error._tag === 'LandlordOnboardingIncompleteError'),

  paymentPlanFailed: (error: unknown): error is PaystackPlanCreationError =>
    error instanceof PaystackPlanCreationError ||
    (typeof error === 'object' &&
      error !== null &&
      '_tag' in error &&
      error._tag === 'PaystackPlanCreationError'),

  databaseError: (error: unknown): error is DatabaseError =>
    error instanceof DatabaseError ||
    (typeof error === 'object' &&
      error !== null &&
      '_tag' in error &&
      error._tag === 'DatabaseError'),

  apiError: (error: unknown): error is PaystackApiError =>
    error instanceof PaystackApiError ||
    (typeof error === 'object' &&
      error !== null &&
      '_tag' in error &&
      error._tag === 'PaystackApiError'),
};

/**
 * Example 5: Using the helper functions
 */
export const handleLeaseCreationWithHelpers = async (
  payload: CreateLeasePayload
) => {
  try {
    const result = await Effect.runPromise(runCreateLeaseEffect(payload));
    return { success: true, data: result };
  } catch (error) {
    if (isSpecificError.leaseNotFound(error)) {
      // TypeScript now knows this is a LeaseNotFoundError
      return {
        success: false,
        errorType: 'LEASE_NOT_FOUND' as const,
        leaseId: error.leaseId,
        message: error.message,
      };
    }

    if (isSpecificError.onboardingIncomplete(error)) {
      // TypeScript now knows this is a LandlordOnboardingIncompleteError
      return {
        success: false,
        errorType: 'ONBOARDING_INCOMPLETE' as const,
        landlordId: error.landlordId,
        missingField: error.missingField,
        message: error.message,
      };
    }

    if (isSpecificError.databaseError(error)) {
      // TypeScript now knows this is a DatabaseError
      return {
        success: false,
        errorType: 'DATABASE_ERROR' as const,
        message: error.message,
        retryable: true,
      };
    }

    // Handle other errors...
    return {
      success: false,
      errorType: 'UNKNOWN_ERROR' as const,
      message: 'An unexpected error occurred',
    };
  }
};

/**
 * Example 6: Creating a type-safe error handler
 */
type ErrorHandler<T> = {
  [K in LeaseCreationError['_tag']]?: (
    error: Extract<LeaseCreationError, { _tag: K }>
  ) => T;
};

export const createErrorHandler = <T>(
  handlers: ErrorHandler<T>,
  defaultHandler: (error: LeaseCreationError) => T
) => {
  return (error: LeaseCreationError): T => {
    const handler = handlers[error._tag];
    if (handler) {
      return (handler as any)(error);
    }
    return defaultHandler(error);
  };
};

// Usage of the type-safe error handler
export const handleLeaseCreationTypeSafe = async (
  payload: CreateLeasePayload
) => {
  const errorHandler = createErrorHandler(
    {
      LeaseNotFoundError: (error) => ({
        type: 'BUSINESS_ERROR' as const,
        action: 'REDIRECT_TO_CREATION' as const,
        leaseId: error.leaseId,
      }),
      LandlordOnboardingIncompleteError: (error) => ({
        type: 'BUSINESS_ERROR' as const,
        action: 'REDIRECT_TO_ONBOARDING' as const,
        landlordId: error.landlordId,
        missingField: error.missingField,
      }),
      DatabaseError: (error) => ({
        type: 'TECHNICAL_ERROR' as const,
        action: 'RETRY' as const,
        message: error.message,
      }),
      PaystackApiError: (error) => ({
        type: 'TECHNICAL_ERROR' as const,
        action: 'RETRY' as const,
        message: error.message,
      }),
    },
    (error) => ({
      type: 'UNKNOWN_ERROR' as const,
      action: 'CONTACT_SUPPORT' as const,
      message: error.message || 'Unknown error occurred',
    })
  );

  const result = await Effect.runPromise(
    runCreateLeaseEffect(payload).pipe(
      Effect.match({
        onFailure: errorHandler,
        onSuccess: (data) => ({
          type: 'SUCCESS' as const,
          data,
        }),
      })
    )
  );

  return result;
};
