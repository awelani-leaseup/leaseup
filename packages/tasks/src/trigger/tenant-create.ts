import { schemaTask, logger, type Task } from '@trigger.dev/sdk/v3';
import { paystack } from '@leaseup/paystack/open-api/client';
import { TASK_EVENTS } from '../tasks';
import { db } from '@leaseup/prisma/db.ts';
import * as v from 'valibot';

const TenantCreatePayload = v.object({
  tenantId: v.pipe(v.string(), v.nonEmpty('Tenant ID is required')),
});

const valibotParser = v.parser(TenantCreatePayload);

export const tenantCreateTask: Task<
  string,
  v.InferInput<typeof TenantCreatePayload>,
  {
    message: string;
    tenantId: string;
    customerId: string;
  }
> = schemaTask({
  id: TASK_EVENTS.TENANT_CREATE,
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
    logger.log('Processing tenant Paystack customer creation', {
      tenantId: payload.tenantId,
    });

    try {
      // Fetch the tenant from the database
      const tenant = await db.tenant.findUnique({
        where: { id: payload.tenantId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          paystackCustomerId: true,
        },
      });

      if (!tenant) {
        throw new Error(`Tenant not found with ID: ${payload.tenantId}`);
      }

      // Check if tenant already has a Paystack customer ID
      if (tenant.paystackCustomerId) {
        logger.log('Tenant already has a Paystack customer ID', {
          tenantId: payload.tenantId,
          customerId: tenant.paystackCustomerId,
        });
        return {
          message: 'Tenant already has a Paystack customer ID',
          tenantId: payload.tenantId,
          customerId: tenant.paystackCustomerId,
        };
      }

      logger.log('Creating Paystack customer for tenant', {
        tenantId: payload.tenantId,
        email: tenant.email,
      });

      // Create Paystack customer
      const { data, error } = await paystack.POST('/customer', {
        body: {
          email: tenant.email,
          first_name: tenant.firstName,
          last_name: tenant.lastName,
          phone: tenant.phone,
          // @ts-expect-error - Paystack expects an object for metadata, passing a string will throw an error.
          metadata: {
            tenant_id: tenant.id,
            source: 'leaseup_tenant_creation',
          },
        },
      });

      if (error) {
        throw new Error(
          `Failed to create Paystack customer: ${error.message || 'Unknown error'}`
        );
      }

      const customerCode = data?.data?.customer_code;

      if (!customerCode) {
        throw new Error('Failed to get customer code from Paystack response');
      }

      logger.log('Successfully created Paystack customer', {
        tenantId: payload.tenantId,
        customerCode,
      });

      await db.tenant.update({
        where: { id: payload.tenantId },
        data: {
          paystackCustomerId: customerCode,
        },
      });

      logger.log('Successfully updated tenant with Paystack customer ID', {
        tenantId: payload.tenantId,
        customerCode,
      });

      return {
        message: 'Tenant Paystack customer created successfully',
        tenantId: payload.tenantId,
        customerId: customerCode,
      };
    } catch (error) {
      logger.error('Failed to create Paystack customer for tenant', {
        tenantId: payload.tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      await db.$disconnect();
    }
  },
});
