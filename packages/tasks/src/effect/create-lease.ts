import { Schema, Effect, Console, Data } from 'effect';
import {
  DatabaseServiceLive,
  DatabaseServiceTag,
  PaystackServiceLive,
  PaystackServiceTag,
  DatabaseError,
  PaystackApiError,
} from './services';

const CreateLeasePayload = Schema.Struct({
  leaseId: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'Lease ID is required' })
  ),
  customerCode: Schema.optional(
    Schema.String.pipe(
      Schema.minLength(1, {
        message: () => 'Customer code is required if provided',
      })
    )
  ),
});

export type CreateLeasePayload = Schema.Schema.Type<typeof CreateLeasePayload>;

// ============================================================================
// Custom Error Classes for Lease Creation
// ============================================================================

export class LeaseNotFoundError extends Data.TaggedError('LeaseNotFoundError')<{
  readonly leaseId: string;
  readonly message?: string;
}> {
  constructor(leaseId: string, message?: string) {
    super({
      leaseId,
      message: message || `Lease not found with ID: ${leaseId}`,
    });
  }
}

export class LandlordNotFoundError extends Data.TaggedError(
  'LandlordNotFoundError'
)<{
  readonly leaseId: string;
  readonly message?: string;
}> {
  constructor(leaseId: string, message?: string) {
    super({
      leaseId,
      message:
        message || `Landlord information not found for lease: ${leaseId}`,
    });
  }
}

export class NoTenantsFoundError extends Data.TaggedError(
  'NoTenantsFoundError'
)<{
  readonly leaseId: string;
  readonly message?: string;
}> {
  constructor(leaseId: string, message?: string) {
    super({
      leaseId,
      message: message || `No tenants found for lease: ${leaseId}`,
    });
  }
}

export class LandlordOnboardingIncompleteError extends Data.TaggedError(
  'LandlordOnboardingIncompleteError'
)<{
  readonly landlordId: string;
  readonly missingField: 'subaccount' | 'splitGroup';
  readonly message?: string;
}> {
  constructor(
    landlordId: string,
    missingField: 'subaccount' | 'splitGroup',
    message?: string
  ) {
    const defaultMessage =
      missingField === 'subaccount'
        ? `Landlord ${landlordId} does not have a Paystack subaccount. Please complete onboarding first.`
        : `Landlord ${landlordId} does not have a Paystack split group. Please complete onboarding first.`;

    super({
      landlordId,
      missingField,
      message: message || defaultMessage,
    });
  }
}

export class PaystackPlanCreationError extends Data.TaggedError(
  'PaystackPlanCreationError'
)<{
  readonly leaseId: string;
  readonly tenantName: string;
  readonly amount: number;
  readonly currency: string;
  readonly message?: string;
}> {
  constructor(
    leaseId: string,
    tenantName: string,
    amount: number,
    currency: string,
    message?: string
  ) {
    super({
      leaseId,
      tenantName,
      amount,
      currency,
      message:
        message || 'Failed to create Paystack plan - no plan code returned',
    });
  }
}

export class PaystackSubscriptionCreationError extends Data.TaggedError(
  'PaystackSubscriptionCreationError'
)<{
  readonly leaseId: string;
  readonly customerCode: string;
  readonly planCode: string;
  readonly message?: string;
}> {
  constructor(
    leaseId: string,
    customerCode: string,
    planCode: string,
    message?: string
  ) {
    super({
      leaseId,
      customerCode,
      planCode,
      message:
        message ||
        'Failed to create Paystack subscription - no subscription code returned',
    });
  }
}

export class PaystackTransactionInitializationError extends Data.TaggedError(
  'PaystackTransactionInitializationError'
)<{
  readonly leaseId: string;
  readonly tenantEmail: string;
  readonly amount: number;
  readonly subaccount: string;
  readonly splitCode: string;
  readonly planCode: string;
  readonly message?: string;
}> {
  constructor(
    leaseId: string,
    tenantEmail: string,
    amount: number,
    subaccount: string,
    splitCode: string,
    planCode: string,
    message?: string
  ) {
    super({
      leaseId,
      tenantEmail,
      amount,
      subaccount,
      splitCode,
      planCode,
      message:
        message ||
        'Failed to initialize Paystack transaction - incomplete response',
    });
  }
}

// Union type for all possible lease creation errors
export type LeaseCreationError =
  | LeaseNotFoundError
  | LandlordNotFoundError
  | NoTenantsFoundError
  | LandlordOnboardingIncompleteError
  | PaystackPlanCreationError
  | PaystackSubscriptionCreationError
  | PaystackTransactionInitializationError
  | DatabaseError
  | PaystackApiError;

export const createLeaseEffect = (
  payload: CreateLeasePayload
): Effect.Effect<
  {
    message: string;
    planCode: string;
    subscriptionCode: string;
    authorizationUrl: string;
    reference: string;
    accessCode: string | undefined;
    leaseId: string;
    tenantEmail: string;
    rentAmount: number;
    currency: string;
  },
  LeaseCreationError
> =>
  Effect.gen(function* () {
    const databaseService = yield* DatabaseServiceTag;
    const paystackService = yield* PaystackServiceTag;

    yield* Console.log('Processing lease creation with Paystack integration', {
      leaseId: payload.leaseId,
      customerCode: payload.customerCode,
    });

    // Step 1: Fetch lease with landlord and tenant information
    const lease = yield* databaseService.findLeaseWithLandlord(payload.leaseId);

    if (!lease) {
      return yield* Effect.fail(new LeaseNotFoundError(payload.leaseId));
    }

    if (!lease.unit?.property?.landlord) {
      return yield* Effect.fail(new LandlordNotFoundError(payload.leaseId));
    }

    if (lease.tenantLease.length === 0 || !lease.tenantLease[0]?.tenant) {
      return yield* Effect.fail(new NoTenantsFoundError(payload.leaseId));
    }

    const landlord = lease.unit.property.landlord;
    const tenant = lease.tenantLease[0].tenant; // Get the first tenant
    const rentAmountInCents = Math.round(lease.rent * 100); // Convert to cents for ZAR

    yield* Console.log('Found lease details', {
      leaseId: lease.id,
      rent: lease.rent,
      rentAmountInCents,
      currency: lease.rentDueCurrency,
      landlordId: landlord.id,
      tenantId: tenant.id,
      landlordSubaccount: landlord.paystackSubAccountId,
      landlordSplitGroup: landlord.paystackSplitGroupId,
    });

    // Validate landlord has required Paystack setup
    if (!landlord.paystackSubAccountId) {
      return yield* Effect.fail(
        new LandlordOnboardingIncompleteError(landlord.id, 'subaccount')
      );
    }

    if (!landlord.paystackSplitGroupId) {
      return yield* Effect.fail(
        new LandlordOnboardingIncompleteError(landlord.id, 'splitGroup')
      );
    }

    // Step 2: Create a new Paystack plan for the lease with the rent amount
    yield* Console.log('Creating Paystack plan for lease', {
      planName: `Rent Plan - Lease ${lease.id}`,
      amount: rentAmountInCents,
      currency: lease.rentDueCurrency,
    });

    const planResponse = yield* paystackService.createPlan({
      name: `Rent Plan - ${tenant.firstName} ${tenant.lastName} - Lease ${lease.id}`,
      amount: rentAmountInCents,
      interval: 'monthly',
      description: `Monthly rent plan for ${tenant.firstName} ${tenant.lastName} - Lease ${lease.id}`,
      currency: 'ZAR',
      send_invoices: true,
      send_sms: true,
    });

    const planCode = planResponse.data?.data?.plan_code;

    if (!planCode) {
      return yield* Effect.fail(
        new PaystackPlanCreationError(
          lease.id,
          `${tenant.firstName} ${tenant.lastName}`,
          rentAmountInCents,
          lease.rentDueCurrency
        )
      );
    }

    yield* Console.log('Successfully created Paystack plan', {
      planCode,
      leaseId: lease.id,
    });

    // Step 3: Determine customer code for subscription
    let finalCustomerCode = payload.customerCode;

    // If no customer code provided, check if tenant has existing Paystack customer
    if (!finalCustomerCode && tenant.paystackCustomerId) {
      finalCustomerCode = tenant.paystackCustomerId;
      yield* Console.log('Using existing tenant Paystack customer ID', {
        customerId: finalCustomerCode,
        tenantId: tenant.id,
      });
    }

    // If still no customer code, we'll use tenant email (Paystack accepts email as customer identifier)
    if (!finalCustomerCode) {
      finalCustomerCode = tenant.email;
      yield* Console.log('Using tenant email as customer identifier', {
        email: finalCustomerCode,
        tenantId: tenant.id,
      });
    }

    // Step 4: Create customer subscription using the plan
    yield* Console.log('Creating Paystack subscription', {
      customer: finalCustomerCode,
      plan: planCode,
    });

    const subscriptionResponse = yield* paystackService.createSubscription({
      customer: finalCustomerCode,
      plan: planCode,
      start_date: lease?.startDate?.toISOString(),
    });

    const subscriptionCode = subscriptionResponse.data?.data?.subscription_code;
    if (!subscriptionCode) {
      return yield* Effect.fail(
        new PaystackSubscriptionCreationError(
          lease.id,
          finalCustomerCode,
          planCode
        )
      );
    }

    yield* Console.log('Successfully created Paystack subscription', {
      subscriptionCode,
      leaseId: lease.id,
    });

    // Step 5: Initialize a transaction using the landlord subaccount and plan
    yield* Console.log('Initializing Paystack transaction', {
      email: tenant.email,
      amount: rentAmountInCents,
      subaccount: landlord.paystackSubAccountId,
      splitCode: landlord.paystackSplitGroupId,
      plan: planCode,
    });

    const transactionResponse = yield* paystackService.initializeTransaction({
      email: tenant.email,
      amount: rentAmountInCents,
      currency: lease.rentDueCurrency,
      subaccount: landlord.paystackSubAccountId,
      split_code: landlord.paystackSplitGroupId,
      plan: planCode,
      metadata: JSON.stringify({
        lease_id: lease.id,
        tenant_id: tenant.id,
        landlord_id: landlord.id,
        plan_code: planCode,
        subscription_code: subscriptionCode,
      }),
    });

    const authorizationUrl = transactionResponse.data?.data?.authorization_url;
    const reference = transactionResponse.data?.data?.reference;
    const accessCode = transactionResponse.data?.data?.access_code;

    if (!authorizationUrl || !reference) {
      return yield* Effect.fail(
        new PaystackTransactionInitializationError(
          lease.id,
          tenant.email,
          rentAmountInCents,
          landlord.paystackSubAccountId,
          landlord.paystackSplitGroupId,
          planCode
        )
      );
    }

    yield* Console.log('Successfully initialized Paystack transaction', {
      authorizationUrl,
      reference,
      accessCode,
      leaseId: lease.id,
    });

    // Step 6: Save Paystack information to the lease in the database
    yield* Console.log('Saving Paystack information to lease', {
      leaseId: lease.id,
      planCode,
      subscriptionCode,
      authorizationUrl,
      reference,
    });

    yield* databaseService.updateLeasePaystackInfo(
      lease.id,
      planCode,
      subscriptionCode,
      authorizationUrl,
      reference
    );

    yield* Console.log('Successfully saved Paystack information to lease', {
      leaseId: lease.id,
    });

    // Ensure database cleanup
    yield* databaseService.disconnect();

    return {
      message: 'Lease Paystack integration completed successfully',
      planCode,
      subscriptionCode,
      authorizationUrl,
      reference,
      accessCode,
      leaseId: lease.id,
      tenantEmail: tenant.email,
      rentAmount: lease.rent,
      currency: lease.rentDueCurrency,
    };
  }).pipe(
    Effect.provide(DatabaseServiceLive),
    Effect.provide(PaystackServiceLive),
    Effect.catchTags({
      LeaseNotFoundError: (error) =>
        Effect.gen(function* () {
          yield* Console.error('Lease not found during Paystack setup', {
            leaseId: error.leaseId,
            message: error.message,
          });
          return yield* Effect.fail(error);
        }),
      LandlordNotFoundError: (error) =>
        Effect.gen(function* () {
          yield* Console.error('Landlord information missing', {
            leaseId: error.leaseId,
            message: error.message,
          });
          return yield* Effect.fail(error);
        }),
      NoTenantsFoundError: (error) =>
        Effect.gen(function* () {
          yield* Console.error('No tenants found for lease', {
            leaseId: error.leaseId,
            message: error.message,
          });
          return yield* Effect.fail(error);
        }),
      LandlordOnboardingIncompleteError: (error) =>
        Effect.gen(function* () {
          yield* Console.error('Landlord onboarding incomplete', {
            landlordId: error.landlordId,
            missingField: error.missingField,
            message: error.message,
          });
          return yield* Effect.fail(error);
        }),
      PaystackPlanCreationError: (error) =>
        Effect.gen(function* () {
          yield* Console.error('Failed to create Paystack plan', {
            leaseId: error.leaseId,
            tenantName: error.tenantName,
            amount: error.amount,
            currency: error.currency,
            message: error.message,
          });
          return yield* Effect.fail(error);
        }),
      PaystackSubscriptionCreationError: (error) =>
        Effect.gen(function* () {
          yield* Console.error('Failed to create Paystack subscription', {
            leaseId: error.leaseId,
            customerCode: error.customerCode,
            planCode: error.planCode,
            message: error.message,
          });
          return yield* Effect.fail(error);
        }),
      PaystackTransactionInitializationError: (error) =>
        Effect.gen(function* () {
          yield* Console.error('Failed to initialize Paystack transaction', {
            leaseId: error.leaseId,
            tenantEmail: error.tenantEmail,
            amount: error.amount,
            subaccount: error.subaccount,
            splitCode: error.splitCode,
            planCode: error.planCode,
            message: error.message,
          });
          return yield* Effect.fail(error);
        }),
      DatabaseError: (error) =>
        Effect.gen(function* () {
          yield* Console.error('Database error during lease Paystack setup', {
            leaseId: payload.leaseId,
            message: error.message,
          });
          return yield* Effect.fail(error);
        }),
      PaystackApiError: (error) =>
        Effect.gen(function* () {
          yield* Console.error('Paystack API error during lease setup', {
            leaseId: payload.leaseId,
            message: error.message,
          });
          return yield* Effect.fail(error);
        }),
    }),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Console.error('Unexpected error during lease Paystack setup', {
          leaseId: payload.leaseId,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: typeof error,
        });
        return yield* Effect.fail(error);
      })
    )
  );

export const runCreateLeaseEffect = (payload: CreateLeasePayload) =>
  Effect.runPromise(createLeaseEffect(payload));
