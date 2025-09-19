import { Schema, Effect, Layer, Console } from 'effect';
import { schemaTask } from '@trigger.dev/sdk/v3';
import { nanoid } from 'nanoid';
import {
  InvoiceCategory,
  InvoiceStatus,
} from '@leaseup/prisma/client/client.js';
import type { Invoice } from '@leaseup/prisma/client/client.js';
import {
  DatabaseServiceLive,
  DatabaseServiceTag,
  PaystackServiceLive,
  PaystackServiceTag,
} from './services';
import { getMonth, getYear } from 'date-fns';

const PAYSTACK_BASE_URL = 'https://paystack.shop';

const CreateInvoiceTaskPayload = Schema.Struct({
  landlordId: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'Landlord ID is required' })
  ),
  tenantId: Schema.optional(Schema.String),
  customer: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'Customer is required' })
  ),
  amount: Schema.Number,
  dueDate: Schema.Date,
  description: Schema.optional(
    Schema.String.pipe(
      Schema.minLength(1, { message: () => 'Description is required' })
    )
  ),
  lineItems: Schema.Any,
  split_code: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'Split code is required' })
  ),
  leaseId: Schema.optional(Schema.String),
  category: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'Category is required' })
  ),
});

export type CreateInvoicePayload = Schema.Schema.Type<
  typeof CreateInvoiceTaskPayload
>;

const createInvoiceEffect = (payload: CreateInvoicePayload) =>
  Effect.gen(function* () {
    const databaseService = yield* DatabaseServiceTag;
    const paystackService = yield* PaystackServiceTag;

    yield* Console.log('Creating invoice', payload.tenantId);

    const landlord = yield* databaseService.findLandlord(payload.landlordId);

    const paystackResponse = yield* paystackService.createPaymentRequest({
      customer: payload.customer,
      amount: Math.round(payload.amount), // Amount  in cents
      currency: 'ZAR',
      description: `${landlord?.name} has sent you an invoice ${payload.description ? ` - ${payload.description}` : ''}`,
      line_items: payload.lineItems ?? [],
      split_code: payload.split_code ?? undefined,
    });

    yield* Console.log(
      'Created invoice via Paystack',
      paystackResponse.data?.data?.request_code
    );

    const invoice: Omit<Invoice, 'createdAt' | 'updatedAt' | 'leaseId'> = {
      id: nanoid(),
      landlordId: payload.landlordId,
      tenantId: payload.tenantId ?? '',
      description: `${payload.description ? `- ${payload.description}` : ''}`,
      dueAmount: payload.amount / 100, // Convert from cents
      dueDate: new Date(payload.dueDate.toISOString()),
      category: payload.category as InvoiceCategory,
      status: InvoiceStatus.PENDING,
      lineItems: payload.lineItems ?? [],
      paystackId: paystackResponse.data?.data?.request_code ?? '',
      recurringBillableId: null,
      paymentRequestUrl: `${PAYSTACK_BASE_URL}/pay/${paystackResponse.data?.data?.request_code}`,
      invoiceNumber: `${getYear(new Date())}-${getMonth(new Date())}-${paystackResponse.data?.data?.invoice_number}`,
    };

    if (!invoice.dueDate) {
      throw new Error('dueDate is required to create an invoice');
    }
    const newInvoice = yield* databaseService
      .createInvoice({
        ...invoice,
        dueDate: invoice.dueDate,
        leaseId: payload.leaseId === '' ? null : (payload.leaseId ?? null),
      })
      .pipe(Effect.retry({ times: 30 }));

    yield* Console.log('Successfully created invoice', {
      invoiceId: newInvoice.id,
      leaseId: payload.leaseId,
      amount: newInvoice.dueAmount,
    });

    // Ensure database cleanup
    return yield* Effect.ensuring(
      Effect.succeed({
        id: newInvoice.id,
        leaseId: payload.leaseId,
        amount: newInvoice.dueAmount,
      }),
      databaseService
        .disconnect()
        .pipe(Effect.orElse(() => Effect.succeed(undefined)))
    );
  }).pipe(
    Effect.provide(Layer.mergeAll(DatabaseServiceLive, PaystackServiceLive)),
    Effect.catchTags({
      PaystackApiError: (error) =>
        Effect.gen(function* () {
          yield* Console.error('Paystack API error:', error.message);
          return yield* Effect.fail(error);
        }),
      DatabaseError: (error) =>
        Effect.gen(function* () {
          yield* Console.error('Database error:', error.message);
          return yield* Effect.fail(error);
        }),
    })
  );

export const runCreateInvoiceEffect = (payload: CreateInvoicePayload) =>
  Effect.runPromise(createInvoiceEffect(payload));

export const createInvoiceTask: ReturnType<typeof schemaTask> = schemaTask({
  id: 'create-invoice',
  maxDuration: 60, // 1 minute
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    randomize: true,
  },
  schema: Schema.decodeUnknown(CreateInvoiceTaskPayload),
  run: async (payload) => {
    try {
      return await runCreateInvoiceEffect(payload);
    } catch (error) {
      // Convert Effect errors back to regular errors for trigger.dev
      throw error;
    }
  },
});
