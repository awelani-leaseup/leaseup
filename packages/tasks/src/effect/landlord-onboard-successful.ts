import { Schema, Effect, Console } from 'effect';
import {
  DatabaseServiceLive,
  DatabaseServiceTag,
  PaystackServiceLive,
  PaystackServiceTag,
} from './services';

const LandlordOnboardSuccessfulPayload = Schema.Struct({
  userId: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'User ID is required' })
  ),
  businessName: Schema.optional(
    Schema.String.pipe(
      Schema.minLength(1, { message: () => 'Business name is required' })
    )
  ),
  settlementBank: Schema.optional(
    Schema.String.pipe(
      Schema.minLength(1, { message: () => 'Settlement bank is required' })
    )
  ),
  accountNumber: Schema.optional(
    Schema.String.pipe(
      Schema.minLength(1, { message: () => 'Account number is required' })
    )
  ),
  primaryContactEmail: Schema.String,
  primaryContactName: Schema.optional(Schema.String),
  primaryContactPhone: Schema.String,
});

export type LandlordOnboardSuccessfulPayload = Schema.Schema.Type<
  typeof LandlordOnboardSuccessfulPayload
>;

const landlordOnboardSuccessfulEffect = (
  payload: LandlordOnboardSuccessfulPayload
) =>
  Effect.gen(function* () {
    const databaseService = yield* DatabaseServiceTag;
    const paystackService = yield* PaystackServiceTag;

    yield* Console.log(
      'Processing landlord onboarding completion with Effect-TS',
      {
        userId: payload.userId,
        businessName: payload.businessName,
      }
    );

    const landlord = yield* databaseService.findLandlord(payload.userId);

    if (!landlord) {
      yield* Effect.fail(
        new Error(`Landlord not found with ID: ${payload.userId}`)
      );
      return;
    }

    if (
      landlord.paystackSubAccountId &&
      landlord.paystackSplitGroupId &&
      landlord.paystackCustomerId
    ) {
      yield* Console.log(
        'Landlord already has customer, subaccount and split group',
        {
          userId: payload.userId,
          customerId: landlord.paystackCustomerId,
          subaccountId: landlord.paystackSubAccountId,
          splitGroupId: landlord.paystackSplitGroupId,
        }
      );
      return {
        message: 'Landlord already has customer, subaccount and split group',
        customerId: landlord.paystackCustomerId,
        subaccountId: landlord.paystackSubAccountId,
        splitGroupId: landlord.paystackSplitGroupId,
      };
    }

    // Step 1: Create Paystack customer if not exists
    let customerCode = landlord.paystackCustomerId;

    if (!customerCode) {
      yield* Console.log('Creating Paystack customer for landlord', {
        userId: payload.userId,
        email: landlord.email,
        name: landlord.name,
      });

      const customerResponse = yield* paystackService.createCustomer({
        email: landlord.email,
        first_name: landlord.name?.split(' ')[0] || 'Landlord',
        last_name: landlord.name?.split(' ').slice(1).join(' ') || '',
        phone: payload.primaryContactPhone || null,
        metadata: {
          tenant_id: payload.userId,
          source: 'landlord_onboarding',
        },
      });

      customerCode = customerResponse.data?.data?.customer_code ?? '';

      if (!customerCode) {
        yield* Effect.fail(new Error('Failed to create Paystack customer'));
        return;
      }

      yield* Console.log('Successfully created Paystack customer', {
        userId: payload.userId,
        customerCode,
      });
    }

    // Step 2: Create Paystack subaccount if not exists
    let subaccountCode = landlord.paystackSubAccountId;

    if (!subaccountCode) {
      yield* Console.log('Creating Paystack subaccount for landlord', {
        userId: payload.userId,
      });

      const subaccountResponse = yield* paystackService.createSubaccount({
        business_name: payload.businessName!,
        settlement_bank: payload.settlementBank!,
        account_number: payload.accountNumber!,
        percentage_charge: 2.9,
        description: `Subaccount for ${landlord.name} | ${payload.userId}`,
        primary_contact_email: payload.primaryContactEmail || landlord.email,
        primary_contact_name:
          payload.primaryContactName || landlord.name || undefined,
        primary_contact_phone: payload.primaryContactPhone ?? undefined,
      });

      subaccountCode = subaccountResponse.data?.data?.subaccount_code ?? '';

      if (!subaccountCode) {
        yield* Effect.fail(new Error('Failed to create subaccount'));
        return;
      }

      yield* Console.log('Successfully created subaccount', {
        userId: payload.userId,
        subaccountCode,
      });
    }

    let splitGroupCode = landlord.paystackSplitGroupId ?? null;

    if (!splitGroupCode) {
      yield* Console.log('Creating transaction split group for landlord', {
        userId: payload.userId,
        subaccountCode,
      });

      const splitResponse = yield* paystackService.createSplit({
        name: `Split for ${landlord.name}`,
        type: 'percentage',
        subaccounts: [{ subaccount: subaccountCode, share: '97.1' }],
        currency: 'ZAR',
      });

      splitGroupCode = splitResponse.data?.data?.split_code ?? null;

      if (!splitGroupCode) {
        yield* Effect.fail(new Error('Failed to create split group'));
        return; // This line will never execute, but helps TypeScript
      }

      yield* Console.log('Successfully created split group', {
        userId: payload.userId,
        splitGroupCode,
      });
    }

    // Update landlord with Paystack IDs
    yield* databaseService.updateLandlordPaystackIds(
      payload.userId,
      subaccountCode,
      splitGroupCode,
      customerCode
    );

    yield* Console.log('Successfully completed landlord onboarding setup', {
      userId: payload.userId,
      customerCode,
      subaccountCode,
      splitGroupCode,
    });

    // Ensure database cleanup
    yield* databaseService.disconnect();

    return {
      message: 'Landlord onboarding completed successfully',
      customerId: customerCode,
      subaccountId: subaccountCode,
      splitGroupId: splitGroupCode,
    };
  }).pipe(
    Effect.provide(DatabaseServiceLive),
    Effect.provide(PaystackServiceLive),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Console.error('Failed to complete landlord onboarding', {
          userId: payload.userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return yield* Effect.fail(error);
      })
    )
  );

export const runLandlordOnboardSuccessfulEffect = (
  payload: LandlordOnboardSuccessfulPayload
) => Effect.runPromise(landlordOnboardSuccessfulEffect(payload));
