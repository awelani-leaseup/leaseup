# Create Lease Effect - Error Handling Guide

This document explains the custom Effect-TS error classes and error handling patterns used in the lease creation workflow.

## Custom Error Classes

The lease creation process uses specific typed errors that extend `Data.TaggedError` for better error handling and type safety:

### Business Logic Errors

#### `LeaseNotFoundError`

- **When**: The specified lease ID doesn't exist in the database
- **Properties**:
  - `leaseId: string` - The ID that wasn't found
  - `message?: string` - Custom error message
- **Typical Actions**: Redirect to lease creation, show lease selector

#### `LandlordNotFoundError`

- **When**: The lease exists but has no associated landlord information
- **Properties**:
  - `leaseId: string` - The lease ID with missing landlord
  - `message?: string` - Custom error message
- **Typical Actions**: Data integrity check, contact support

#### `NoTenantsFoundError`

- **When**: The lease exists but has no associated tenants
- **Properties**:
  - `leaseId: string` - The lease ID with missing tenants
  - `message?: string` - Custom error message
- **Typical Actions**: Add tenants to lease, data integrity check

#### `LandlordOnboardingIncompleteError`

- **When**: Landlord hasn't completed Paystack onboarding (missing subaccount or split group)
- **Properties**:
  - `landlordId: string` - The landlord needing onboarding
  - `missingField: 'subaccount' | 'splitGroup'` - What's missing
  - `message?: string` - Custom error message
- **Typical Actions**: Redirect to onboarding flow, show setup instructions

### Payment Integration Errors

#### `PaystackPlanCreationError`

- **When**: Failed to create a Paystack payment plan
- **Properties**:
  - `leaseId: string` - The lease being processed
  - `tenantName: string` - Name of the tenant
  - `amount: number` - Rent amount in cents
  - `currency: string` - Currency code
  - `message?: string` - Custom error message
- **Typical Actions**: Retry with different parameters, manual plan creation

#### `PaystackSubscriptionCreationError`

- **When**: Failed to create a Paystack subscription
- **Properties**:
  - `leaseId: string` - The lease being processed
  - `customerCode: string` - Customer identifier used
  - `planCode: string` - Plan that failed subscription
  - `message?: string` - Custom error message
- **Typical Actions**: Retry subscription creation, use alternative customer ID

#### `PaystackTransactionInitializationError`

- **When**: Failed to initialize a Paystack transaction
- **Properties**:
  - `leaseId: string` - The lease being processed
  - `tenantEmail: string` - Tenant's email
  - `amount: number` - Transaction amount
  - `subaccount: string` - Landlord's subaccount
  - `splitCode: string` - Split group code
  - `planCode: string` - Payment plan code
  - `message?: string` - Custom error message
- **Typical Actions**: Retry transaction, check account setup

### Service-Level Errors

#### `DatabaseError`

- **When**: Database operations fail
- **Properties**:
  - `message: string` - Database error description
- **Typical Actions**: Retry operation, check database connection

#### `PaystackApiError`

- **When**: Paystack API calls fail
- **Properties**:
  - `message: string` - API error description
- **Typical Actions**: Retry with backoff, check API status

## Error Handling Patterns

### 1. Specific Error Handling with `catchTags`

```typescript
import { Effect } from 'effect';
import { runCreateLeaseEffect, LeaseNotFoundError } from './create-lease';

const handleLeaseCreation = (payload: CreateLeasePayload) =>
  runCreateLeaseEffect(payload).pipe(
    Effect.catchTags({
      LeaseNotFoundError: (error) =>
        Effect.gen(function* () {
          yield* Console.log(
            `Lease ${error.leaseId} not found, redirecting to creation`
          );
          // Handle specific business logic
          return yield* redirectToLeaseCreation(error.leaseId);
        }),

      LandlordOnboardingIncompleteError: (error) =>
        redirectToOnboarding(error.landlordId, error.missingField),
    })
  );
```

### 2. Pattern Matching with `matchEffect`

```typescript
const handleWithPattern = (payload: CreateLeasePayload) =>
  runCreateLeaseEffect(payload).pipe(
    Effect.matchEffect({
      onFailure: (error) => {
        switch (error._tag) {
          case 'LeaseNotFoundError':
            return Effect.succeed({
              action: 'create_lease',
              leaseId: error.leaseId,
            });

          case 'LandlordOnboardingIncompleteError':
            return Effect.succeed({
              action: 'complete_onboarding',
              landlordId: error.landlordId,
              step: error.missingField,
            });

          default:
            return Effect.succeed({
              action: 'show_error',
              message: error.message,
            });
        }
      },
      onSuccess: (result) =>
        Effect.succeed({ action: 'success', data: result }),
    })
  );
```

### 3. Retry Logic for Transient Errors

```typescript
const createLeaseWithRetry = (payload: CreateLeasePayload) =>
  runCreateLeaseEffect(payload).pipe(
    Effect.retry({
      times: 3,
      schedule: Effect.Schedule.exponential('1 second'),
    }),
    Effect.catchTags({
      // Don't retry business logic errors
      LeaseNotFoundError: Effect.fail,
      LandlordOnboardingIncompleteError: Effect.fail,

      // Log and fail for retryable errors (will be caught by retry)
      DatabaseError: (error) =>
        Console.log(`Database error, will retry: ${error.message}`).pipe(
          Effect.andThen(() => Effect.fail(error))
        ),
    })
  );
```

### 4. Comprehensive Error Mapping

```typescript
type UIErrorResponse = {
  type: 'BUSINESS_ERROR' | 'TECHNICAL_ERROR' | 'RETRY_ERROR';
  message: string;
  action?: string;
  retryable: boolean;
};

const mapToUIError = (error: LeaseCreationError): UIErrorResponse => {
  switch (error._tag) {
    case 'LeaseNotFoundError':
      return {
        type: 'BUSINESS_ERROR',
        message: `Lease ${error.leaseId} not found`,
        action: 'create_lease',
        retryable: false,
      };

    case 'DatabaseError':
      return {
        type: 'TECHNICAL_ERROR',
        message: 'Database connection issue',
        retryable: true,
      };

    case 'PaystackApiError':
      return {
        type: 'RETRY_ERROR',
        message: 'Payment service temporarily unavailable',
        retryable: true,
      };

    default:
      return {
        type: 'TECHNICAL_ERROR',
        message: 'An unexpected error occurred',
        retryable: false,
      };
  }
};
```

## Best Practices

1. **Use specific error types** instead of generic `Error` objects
2. **Include relevant context** in error properties for debugging
3. **Handle retryable vs non-retryable errors** differently
4. **Log appropriate details** for monitoring and debugging
5. **Provide clear user actions** for each error type
6. **Use Effect's error handling combinators** (`catchTags`, `matchEffect`, etc.)
7. **Separate business logic errors from technical errors**

## Testing Error Scenarios

```typescript
import { Effect } from 'effect';
import { LeaseNotFoundError } from './create-lease';

// Test specific error scenarios
const testErrorHandling = Effect.gen(function* () {
  // Simulate lease not found
  const leaseNotFoundError = new LeaseNotFoundError('invalid-lease-id');

  // Test error handling logic
  const result = yield* Effect.fail(leaseNotFoundError).pipe(
    Effect.catchTag('LeaseNotFoundError', (error) =>
      Effect.succeed(`Handled: ${error.message}`)
    )
  );

  console.log(result); // "Handled: Lease not found with ID: invalid-lease-id"
});
```

This error handling approach provides:

- **Type safety** - All errors are typed and can be handled specifically
- **Rich context** - Errors contain relevant data for debugging and user feedback
- **Composability** - Errors can be combined with Effect's error handling operators
- **Maintainability** - Clear separation between different types of failures
