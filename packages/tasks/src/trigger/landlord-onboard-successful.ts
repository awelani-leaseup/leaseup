import { schemaTask, logger, type Task } from '@trigger.dev/sdk/v3';
import { paystack } from '@leaseup/payments/open-api/client';
import { TASK_EVENTS } from '../tasks';
import { db } from '@leaseup/prisma/db.ts';
import * as v from 'valibot';

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

export const landlordOnboardSuccessfulTask: Task<
  string,
  v.InferInput<typeof LandlordOnboardSuccessfulPayload>,
  { message: string }
> = schemaTask({
  id: TASK_EVENTS.ONBOARDING_SUCCESSFUL,
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

      if (!subaccountCode) {
        logger.log('Creating Paystack subaccount for landlord', {
          userId: payload.userId,
        });

        const { data, error } = await paystack.POST('/subaccount', {
          body: {
            business_name: payload.businessName!,
            settlement_bank: payload.settlementBank!,
            account_number: payload.accountNumber!,
            percentage_charge: 2.9,
            description: `Subaccount for ${landlord.name}`,
            primary_contact_email:
              payload.primaryContactEmail || landlord.email,
            primary_contact_name: payload.primaryContactName || landlord.name,
            primary_contact_phone: payload.primaryContactPhone,
          },
        });

        if (error) {
          throw new Error(
            `Failed to create subaccount: ${error.message || 'Unknown error'}: ${error.status}`
          );
        }

        subaccountCode = data?.data?.subaccount_code ?? '';

        if (!subaccountCode) {
          throw new Error('Failed to create subaccount');
        }

        logger.log('Successfully created subaccount', {
          userId: payload.userId,
          subaccountCode,
        });
      }

      let splitGroupCode = landlord.paystackSplitGroupId ?? null;

      if (!splitGroupCode) {
        logger.log('Creating transaction split group for landlord', {
          userId: payload.userId,
          subaccountCode,
        });

        const { data, error } = await paystack.POST('/split', {
          body: {
            name: `Split for ${landlord.name}`,
            type: 'percentage',
            subaccounts: [{ subaccount: subaccountCode, share: '97.1' }],
            currency: 'ZAR',
          },
        });

        if (error) {
          throw new Error(
            `Failed to create split group: ${error.message || 'Unknown error'}`
          );
        }

        splitGroupCode = data?.data?.split_code ?? null;

        if (!splitGroupCode) {
          throw new Error('Failed to create split group');
        }

        logger.log('Successfully created split group', {
          userId: payload.userId,
          splitGroupCode,
        });
      }

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
