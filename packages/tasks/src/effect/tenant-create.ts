import { Schema, Effect, Layer, Console } from 'effect';
import { schemaTask } from '@trigger.dev/sdk/v3';
import { TASK_EVENTS } from '../tasks';
import {
  DatabaseServiceLive,
  DatabaseServiceTag,
  PaystackServiceLive,
  PaystackServiceTag,
} from './services';

const TenantCreateTaskPayload = Schema.Struct({
  tenantId: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'Tenant ID is required' })
  ),
});

export type TenantCreatePayload = Schema.Schema.Type<
  typeof TenantCreateTaskPayload
>;

const createTenantCustomerEffect = (payload: TenantCreatePayload) =>
  Effect.gen(function* () {
    const databaseService = yield* DatabaseServiceTag;
    const paystackService = yield* PaystackServiceTag;

    yield* Console.log(
      'Processing tenant Paystack customer creation with Effect-TS',
      {
        tenantId: payload.tenantId,
      }
    );

    const tenant = yield* databaseService.findTenant(payload.tenantId);

    if (!tenant) {
      yield* Effect.fail(
        new Error(`Tenant not found with ID: ${payload.tenantId}`)
      );
      return; // This line will never execute, but helps TypeScript
    }

    if (tenant.paystackCustomerId) {
      yield* Console.log('Tenant already has a Paystack customer ID', {
        tenantId: payload.tenantId,
        customerId: tenant.paystackCustomerId,
      });
      return {
        message: 'Tenant already has a Paystack customer ID',
        tenantId: payload.tenantId,
        customerId: tenant.paystackCustomerId,
      };
    }

    yield* Console.log('Creating Paystack customer for tenant', {
      tenantId: payload.tenantId,
      email: tenant.email,
    });

    const paystackResponse = yield* paystackService.createCustomer({
      email: tenant.email,
      first_name: tenant.firstName,
      last_name: tenant.lastName,
      phone: tenant.phone,
      metadata: {
        tenant_id: tenant.id,
        source: 'leaseup_tenant_creation',
      },
    });

    const customerCode = paystackResponse.data?.data?.customer_code;

    if (!customerCode) {
      yield* Effect.fail(
        new Error('Failed to get customer code from Paystack response')
      );
      return; // This line will never execute, but helps TypeScript
    }

    yield* Console.log('Successfully created Paystack customer', {
      tenantId: payload.tenantId,
      customerCode,
    });

    yield* databaseService.updateTenantPaystackId(
      payload.tenantId,
      customerCode
    );

    yield* Console.log(
      'Successfully updated tenant with Paystack customer ID',
      {
        tenantId: payload.tenantId,
        customerCode,
      }
    );

    return yield* Effect.ensuring(
      Effect.succeed({
        message: 'Tenant Paystack customer created successfully',
        tenantId: payload.tenantId,
        customerId: customerCode,
      }),
      databaseService
        .disconnect()
        .pipe(Effect.orElse(() => Effect.succeed(undefined)))
    );
  }).pipe(
    Effect.provide(Layer.mergeAll(DatabaseServiceLive, PaystackServiceLive)),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Console.error('Task execution error:', error);
        return yield* Effect.fail(error);
      })
    )
  );

export const runCreateTenantCustomerEffect = (payload: TenantCreatePayload) =>
  Effect.runPromise(createTenantCustomerEffect(payload));

export const tenantCreateTask: ReturnType<typeof schemaTask> = schemaTask({
  id: TASK_EVENTS.TENANT_CREATE,
  maxDuration: 300, // 5 minutes
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
    randomize: true,
  },
  schema: Schema.decodeUnknown(TenantCreateTaskPayload),
  run: async (payload) => {
    return await runCreateTenantCustomerEffect(payload);
  },
});
