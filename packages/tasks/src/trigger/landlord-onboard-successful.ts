import { schemaTask, logger } from '@trigger.dev/sdk/v3';
import {
  createSubaccount,
  createTransactionSplit,
} from '@leaseup/paystack/transaction-splits';
import { db } from '@leaseup/prisma/db.ts';
import * as v from 'valibot';

// Payload schema for landlord onboarding completion
const LandlordOnboardSuccessfulPayload = v.object({
  userId: v.pipe(v.string(), v.nonEmpty('User ID is required')),
  businessName: v.optional(
    v.pipe(v.string(), v.nonEmpty('Business name is required'))
  ),
  settlementBank: v.optional(
    v.pipe(v.string(), v.nonEmpty('Settlement bank is required'))
  ),
  accountNumber: v.optional(
    v.pipe(v.string(), v.nonEmpty('Account number is required'))
  ),
  primaryContactEmail: v.optional(v.string()),
  primaryContactName: v.optional(v.string()),
  primaryContactPhone: v.optional(v.string()),
});

const valibotParser = v.parser(LandlordOnboardSuccessfulPayload);

/**
 * Task that handles landlord onboarding completion by:
 * 1. Creating a Paystack subaccount for the landlord
 * 2. Creating a transaction split group with the subaccount ID
 * 3. Updating the landlord's record with the generated IDs
 *
 * This enables the landlord to receive split payments automatically
 * when tenants pay rent (97.1% to landlord, 2.9% platform fee).
 *
 * Usage:
 * ```
 * await tasks.trigger('landlord-onboard-successful', {
 *   userId: 'landlord-user-id',
 *   businessName: 'Property Management Co',
 *   settlementBank: '044', // Bank code
 *   accountNumber: '1234567890',
 *   primaryContactEmail: 'landlord@example.com',
 *   primaryContactName: 'John Doe'
 * });
 * ```
 */
export const landlordOnboardSuccessfulTask: ReturnType<typeof schemaTask> =
  schemaTask({
    id: 'landlord-onboard-successful',
    maxDuration: 300, // 5 minutes
    retry: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30000,
      randomize: true,
    },
    schema: valibotParser,
    run: async (payload) => {
      logger.log('Processing landlord onboarding completion', {
        userId: payload.userId,
        businessName: payload.businessName,
      });

      try {
        // Get landlord details from database
        const landlord = await db.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            name: true,
            email: true,
            paystackSubAccountId: true,
            paystackSplitGroupId: true,
          },
        });

        if (!landlord) {
          throw new Error(`Landlord not found with ID: ${payload.userId}`);
        }

        // Check if subaccount and split group already exist to avoid duplicates
        if (landlord.paystackSubAccountId && landlord.paystackSplitGroupId) {
          logger.log('Landlord already has subaccount and split group', {
            userId: payload.userId,
            subaccountId: landlord.paystackSubAccountId,
            splitGroupId: landlord.paystackSplitGroupId,
          });
          return {
            message: 'Landlord already has subaccount and split group',
            subaccountId: landlord.paystackSubAccountId,
            splitGroupId: landlord.paystackSplitGroupId,
          };
        }

        let subaccountCode = landlord.paystackSubAccountId;

        // Step 1: Create Paystack subaccount if it doesn't exist
        if (!subaccountCode) {
          logger.log('Creating Paystack subaccount for landlord', {
            userId: payload.userId,
          });

          const subaccountResponse = await createSubaccount({
            businessName:
              payload.businessName || landlord.name || 'Landlord Business',
            settlementBank: payload.settlementBank || '044', // Default to Access Bank - should be configured
            accountNumber: payload.accountNumber || '0000000000', // This should come from onboarding data
            percentageCharge: 2.9, // 2.9% platform fee
            description: `Subaccount for ${landlord.name}`,
            primaryContactEmail: payload.primaryContactEmail || landlord.email,
            primaryContactName: payload.primaryContactName || landlord.name,
            primaryContactPhone: payload.primaryContactPhone,
          });

          if (
            !subaccountResponse.data?.status ||
            subaccountResponse.data.status !== true
          ) {
            throw new Error(
              `Failed to create subaccount: ${subaccountResponse.data?.message || 'Unknown error'}`
            );
          }

          subaccountCode = subaccountResponse.data.data?.subaccount_code;

          if (!subaccountCode) {
            throw new Error(
              'Subaccount creation succeeded but no subaccount code returned'
            );
          }

          logger.log('Successfully created subaccount', {
            userId: payload.userId,
            subaccountCode,
          });
        }

        let splitGroupCode = landlord.paystackSplitGroupId;

        // Step 2: Create split payment group using the subaccount ID
        if (!splitGroupCode) {
          logger.log('Creating transaction split group for landlord', {
            userId: payload.userId,
            subaccountCode,
          });

          const splitResponse = await createTransactionSplit({
            landlordSubaccountId: subaccountCode,
            name: `Split for ${landlord.name}`,
          });

          if (
            !splitResponse.data?.status ||
            splitResponse.data.status !== true
          ) {
            throw new Error(
              `Failed to create split group: ${splitResponse.data?.message || 'Unknown error'}`
            );
          }

          splitGroupCode = splitResponse.data.data?.split_code;

          if (!splitGroupCode) {
            throw new Error(
              'Split group creation succeeded but no split code returned'
            );
          }

          logger.log('Successfully created split group', {
            userId: payload.userId,
            splitGroupCode,
          });
        }

        // Step 3: Update landlord record with the generated subaccount and split group IDs
        await db.user.update({
          where: { id: payload.userId },
          data: {
            paystackSubAccountId: subaccountCode,
            paystackSplitGroupId: splitGroupCode,
          },
        });

        logger.log('Successfully completed landlord onboarding setup', {
          userId: payload.userId,
          subaccountCode,
          splitGroupCode,
        });

        return {
          message: 'Landlord onboarding completed successfully',
          subaccountId: subaccountCode,
          splitGroupId: splitGroupCode,
        };
      } catch (error) {
        logger.error('Failed to complete landlord onboarding', {
          userId: payload.userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      } finally {
        await db.$disconnect();
      }
    },
  });
