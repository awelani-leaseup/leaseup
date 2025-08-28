import { Effect } from 'effect';
import {
  runCreateLeaseEffect,
  type CreateLeasePayload,
  LeaseNotFoundError,
  LandlordOnboardingIncompleteError,
  PaystackPlanCreationError,
  DatabaseError,
} from './create-lease';

/**
 * Simple example: Most common pattern using try/catch
 */
export async function createLease(leaseId: string, customerCode?: string) {
  const payload: CreateLeasePayload = {
    leaseId,
    customerCode,
  };

  try {
    // This will throw the specific error if it fails
    const result = await Effect.runPromise(runCreateLeaseEffect(payload));

    console.log('✅ Lease creation successful!');
    console.log('Payment URL:', result.authorizationUrl);

    return {
      success: true,
      authorizationUrl: result.authorizationUrl,
      reference: result.reference,
      planCode: result.planCode,
    };
  } catch (error) {
    // Check for specific errors using instanceof
    if (error instanceof LeaseNotFoundError) {
      console.error('❌ Lease not found:', error.leaseId);
      return {
        success: false,
        error: 'LEASE_NOT_FOUND',
        message: `Lease ${error.leaseId} does not exist`,
        action: 'Please create the lease first',
      };
    }

    if (error instanceof LandlordOnboardingIncompleteError) {
      console.error('❌ Landlord onboarding incomplete');
      return {
        success: false,
        error: 'ONBOARDING_REQUIRED',
        message: `Landlord needs to complete ${error.missingField} setup`,
        action: 'Redirect to onboarding',
        landlordId: error.landlordId,
      };
    }

    if (error instanceof PaystackPlanCreationError) {
      console.error('❌ Payment plan creation failed');
      return {
        success: false,
        error: 'PAYMENT_SETUP_FAILED',
        message: 'Failed to set up payment plan',
        action: 'Try again or contact support',
      };
    }

    if (error instanceof DatabaseError) {
      console.error('❌ Database error');
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Database operation failed',
        action: 'Please try again later',
        retryable: true,
      };
    }

    // Unknown error
    console.error('❌ Unexpected error:', error);
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      action: 'Please contact support',
    };
  }
}

/**
 * Alternative: Using the _tag property instead of instanceof
 * This works even if the error object gets serialized/deserialized
 */
export async function createLeaseWithTagCheck(
  leaseId: string,
  customerCode?: string
) {
  const payload: CreateLeasePayload = {
    leaseId,
    customerCode,
  };

  try {
    const result = await Effect.runPromise(runCreateLeaseEffect(payload));
    return { success: true, data: result };
  } catch (error: any) {
    // Check the _tag property instead of using instanceof
    switch (error._tag) {
      case 'LeaseNotFoundError':
        return {
          success: false,
          error: 'LEASE_NOT_FOUND',
          leaseId: error.leaseId,
          message: error.message,
        };

      case 'LandlordOnboardingIncompleteError':
        return {
          success: false,
          error: 'ONBOARDING_REQUIRED',
          landlordId: error.landlordId,
          missingField: error.missingField,
          message: error.message,
        };

      case 'PaystackPlanCreationError':
        return {
          success: false,
          error: 'PAYMENT_SETUP_FAILED',
          leaseId: error.leaseId,
          tenantName: error.tenantName,
          message: error.message,
        };

      case 'DatabaseError':
        return {
          success: false,
          error: 'DATABASE_ERROR',
          message: error.message,
          retryable: true,
        };

      default:
        return {
          success: false,
          error: 'UNKNOWN_ERROR',
          message: error?.message || 'An unexpected error occurred',
        };
    }
  }
}

/**
 * Usage in a React component or API route
 */
export async function handleLeaseCreationInAPI(req: {
  leaseId: string;
  customerCode?: string;
}) {
  const result = await createLease(req.leaseId, req.customerCode);

  if (!result.success) {
    // Handle different error types for API response
    switch (result.error) {
      case 'LEASE_NOT_FOUND':
        return {
          status: 404,
          body: {
            error: 'LEASE_NOT_FOUND',
            message: result.message,
            action: result.action,
          },
        };

      case 'ONBOARDING_REQUIRED':
        return {
          status: 400,
          body: {
            error: 'ONBOARDING_REQUIRED',
            message: result.message,
            action: result.action,
            landlordId: result.landlordId,
          },
        };

      case 'PAYMENT_SETUP_FAILED':
        return {
          status: 500,
          body: {
            error: 'PAYMENT_SETUP_FAILED',
            message: result.message,
            action: result.action,
          },
        };

      case 'DATABASE_ERROR':
        return {
          status: 503,
          body: {
            error: 'SERVICE_UNAVAILABLE',
            message: 'Service temporarily unavailable',
            retryAfter: 30,
          },
        };

      default:
        return {
          status: 500,
          body: {
            error: 'INTERNAL_ERROR',
            message: 'An internal error occurred',
          },
        };
    }
  }

  // Success response
  return {
    status: 200,
    body: {
      success: true,
      authorizationUrl: result.authorizationUrl,
      reference: result.reference,
      planCode: result.planCode,
    },
  };
}
