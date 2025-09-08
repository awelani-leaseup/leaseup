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
  unitId: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'Unit ID is required' })
  ),
  tenantId: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'Tenant ID is required' })
  ),
  leaseStartDate: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'Lease start date is required' })
  ),
  leaseEndDate: Schema.optional(Schema.String),
  deposit: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(0, {
      message: () => 'Deposit must be non-negative',
    })
  ),
  rent: Schema.Number.pipe(
    Schema.greaterThan(0, { message: () => 'Rent must be greater than 0' })
  ),
  automaticInvoice: Schema.Boolean,
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

export class LeaseCreationError extends Data.TaggedError('LeaseCreationError')<{
  readonly unitId: string;
  readonly tenantId: string;
  readonly message?: string;
}> {
  constructor(unitId: string, tenantId: string, message?: string) {
    super({
      unitId,
      tenantId,
      message:
        message ||
        `Failed to create lease for unit ${unitId} and tenant ${tenantId}`,
    });
  }
}

export class LandlordNotFoundError extends Data.TaggedError(
  'LandlordNotFoundError'
)<{
  readonly unitId: string;
  readonly message?: string;
}> {
  constructor(unitId: string, message?: string) {
    super({
      unitId,
      message: message || `Landlord information not found for unit: ${unitId}`,
    });
  }
}

export class NoTenantsFoundError extends Data.TaggedError(
  'NoTenantsFoundError'
)<{
  readonly tenantId: string;
  readonly message?: string;
}> {
  constructor(tenantId: string, message?: string) {
    super({
      tenantId,
      message: message || `Tenant not found: ${tenantId}`,
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
export type LeaseCreationErrors =
  | LeaseCreationError
  | LandlordNotFoundError
  | NoTenantsFoundError
  | LandlordOnboardingIncompleteError
  | PaystackPlanCreationError
  | PaystackTransactionInitializationError
  | DatabaseError
  | PaystackApiError;

export const createLeaseEffect = (
  payload: CreateLeasePayload
): Effect.Effect<
  {
    message: string;
    planCode: string;
    authorizationUrl: string;
    reference: string;
    accessCode: string | undefined;
    leaseId: string;
    tenantEmail: string;
    rentAmount: number;
    currency: string;
    customerCode: string;
  },
  LeaseCreationErrors,
  never
> =>
  Effect.gen(function* () {
    const databaseService = yield* DatabaseServiceTag;
    const paystackService = yield* PaystackServiceTag;

    yield* Console.log('Processing lease creation with Paystack integration', {
      unitId: payload.unitId,
      tenantId: payload.tenantId,
      customerCode: payload.customerCode,
    });

    // Step 1: Create lease with all required data in a transaction
    const lease = yield* databaseService.createLeaseWithTransaction(
      payload.unitId,
      payload.tenantId,
      payload.leaseStartDate,
      payload.leaseEndDate || null,
      payload.deposit,
      payload.rent,
      payload.automaticInvoice
    );

    if (!lease.unit?.property?.landlord) {
      return yield* Effect.fail(new LandlordNotFoundError(payload.unitId));
    }

    if (lease.tenantLease.length === 0 || !lease.tenantLease[0]?.tenant) {
      return yield* Effect.fail(new NoTenantsFoundError(payload.tenantId));
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

    // Step 4: Initialize a transaction using the landlord subaccount and plan
    // Note: When a plan is included in the transaction initialization,
    // Paystack will automatically create a subscription after successful payment
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
      // split_code: landlord.paystackSplitGroupId,
      plan: planCode,
      metadata: JSON.stringify({
        lease_id: lease.id,
        tenant_id: tenant.id,
        landlord_id: landlord.id,
        plan_code: planCode,
        customer_code: finalCustomerCode,
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

    // Step 5: Save Paystack information to the lease in the database
    // Note: subscriptionCode will be null initially and will be populated after successful payment
    yield* Console.log('Saving Paystack information to lease', {
      leaseId: lease.id,
      planCode,
      authorizationUrl,
      reference,
    });

    yield* databaseService.updateLeasePaystackInfo(
      lease.id,
      planCode,
      null, // subscriptionCode will be created after successful payment
      authorizationUrl,
      reference
    );

    yield* Console.log('Successfully saved Paystack information to lease', {
      leaseId: lease.id,
    });

    // Ensure database cleanup
    yield* databaseService.disconnect();

    return {
      message:
        'Lease Paystack integration completed successfully. Customer can now complete payment to activate subscription.',
      planCode,
      authorizationUrl,
      reference,
      accessCode,
      leaseId: lease.id,
      tenantEmail: tenant.email,
      rentAmount: lease.rent,
      currency: lease.rentDueCurrency,
      customerCode: finalCustomerCode,
    };
  }).pipe(
    Effect.provide(DatabaseServiceLive),
    Effect.provide(PaystackServiceLive)
  );

export const runCreateLeaseEffect = (payload: CreateLeasePayload) =>
  Effect.runPromise(createLeaseEffect(payload));
