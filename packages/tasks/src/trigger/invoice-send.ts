import { schemaTask, logger } from '@trigger.dev/sdk/v3';
import { createInvoice } from '@leaseup/paystack/invoice';
import { nanoid } from 'nanoid';
import { db } from '@leaseup/prisma/db.ts';
import * as v from 'valibot';

const CreateInvoiceTaskPayload = v.object({
  customer: v.pipe(v.string(), v.nonEmpty('Customer is required')),
  amount: v.number(),
  dueDate: v.date(),
  description: v.optional(
    v.pipe(v.string(), v.nonEmpty('Description is required'))
  ),
  lineItems: v.any(),
  split_code: v.pipe(v.string(), v.nonEmpty('Split code is required')),
  leaseId: v.optional(v.string()),
});

const valibotParser = v.parser(CreateInvoiceTaskPayload);

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
  schema: valibotParser,
  run: async (payload) => {
    const invoiceData = payload;
    logger.log('Creating invoice with built-in retry logic');

    try {
      const resp = await createInvoice({
        customer: invoiceData.customer,
        amount: Math.round(invoiceData.amount * 100), // convert to cents
        currency: 'ZAR',
        // @ts-ignore
        dueDate: invoiceData.dueDate,
        description: invoiceData.description,
        lineItems: invoiceData.lineItems,
        splitCode: invoiceData.split_code,
      });

      logger.log('Created invoice via Paystack', { resp });

      if (!resp.status || resp.status !== true) {
        throw new Error(
          `Paystack API error: ${resp.message || 'Unknown error'}`
        );
      }

      const newInvoice = await db.invoice.create({
        data: {
          id: nanoid(),
          leaseId: invoiceData.leaseId ?? null, // ensure this is string | null, not undefined
          description: invoiceData.description ?? '',
          dueAmount: invoiceData.amount,
          dueDate: invoiceData.dueDate,
          category: 'RENT',
          status: 'PENDING',
          paystackId: resp?.data?.request_code,
        },
      });

      logger.log('Successfully created invoice', {
        invoiceId: newInvoice.id,
        leaseId: invoiceData.leaseId,
        amount: newInvoice.dueAmount,
      });

      return {
        id: newInvoice.id,
        leaseId: invoiceData.leaseId,
        amount: newInvoice.dueAmount,
      };
    } catch (error) {
      logger.error('Failed to create invoice', {
        leaseId: invoiceData.leaseId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      await db.$disconnect();
    }
  },
});
