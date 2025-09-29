import { schemaTask, logger, retry } from '@trigger.dev/sdk';
import { nanoid } from 'nanoid';
import { db } from '@leaseup/prisma/db.ts';
import { InvoiceCategory } from '@leaseup/prisma/client';
import * as v from 'valibot';
import { getMonth, getYear } from 'date-fns';
import {
  getInvoiceTestEmail,
  logTestEmailUsage,
  isDevelopment,
} from '../utils/resend-test-emails';

const PAYSTACK_BASE_URL = 'https://paystack.shop';

const CreateInvoiceTaskPayload = v.object({
  landlordId: v.string(),
  tenantId: v.optional(v.string()),
  customer: v.pipe(v.string(), v.nonEmpty('Customer is required')),
  amount: v.number(),
  dueDate: v.date(),
  description: v.optional(
    v.pipe(v.string(), v.nonEmpty('Description is required'))
  ),
  lineItems: v.any(),
  split_code: v.string(),
  leaseId: v.optional(v.string()),
  category: v.pipe(v.string(), v.nonEmpty('Category is required')),
  recurringBillableId: v.string(),
});

export type CreateInvoicePayload = v.InferInput<
  typeof CreateInvoiceTaskPayload
>;

const valibotParser = v.parser(CreateInvoiceTaskPayload);

const createPaystackInvoice = async (invoiceData: CreateInvoicePayload) => {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    throw new Error('PAYSTACK_SECRET_KEY environment variable is required');
  }

  const requestBody = {
    customer: invoiceData.customer,
    amount: Math.round(invoiceData.amount * 100),
    currency: 'ZAR',
    description: invoiceData.description,
    split_code: invoiceData.split_code || undefined,
  };

  logger.log(
    'Making Paystack API request with built-in retry logic for rate limiting',
    {
      leaseId: invoiceData.leaseId,
      amount: requestBody.amount,
      customer: requestBody.customer,
      retryConfig: {
        maxAttempts: 5,
        strategy: 'built-in retry with retry-after respect',
        respectsRetryAfter: true,
        respectsRateLimitHeaders: true,
      },
    }
  );

  const response = await retry.fetch('https://api.paystack.co/paymentrequest', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    timeoutInMs: 60000, // Increased to 60 seconds to accommodate longer waits
    retry: {
      byStatus: {
        '500-599': {
          strategy: 'backoff',
          maxAttempts: 3,
          factor: 2,
          minTimeoutInMs: 5000,
          maxTimeoutInMs: 30000,
          randomize: true,
        },
      },
      timeout: {
        maxAttempts: 5,
        factor: 2,
        minTimeoutInMs: 2000,
        maxTimeoutInMs: 30000,
        randomize: false,
      },
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorMsg = `Paystack API error: ${response.status} ${response.statusText} - ${errorText}`;

    const rateLimitInfo =
      response.status === 429
        ? {
            rateLimitLimit: response.headers.get('x-ratelimit-limit'),
            rateLimitRemaining: response.headers.get('x-ratelimit-remaining'),
            rateLimitReset: response.headers.get('x-ratelimit-reset'),
            retryAfter: response.headers.get('retry-after'),
          }
        : {};

    logger.error('Paystack API error', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      leaseId: invoiceData.leaseId,
      ...rateLimitInfo,
    });
    throw new Error(errorMsg);
  }

  const responseData = await response.json();
  logger.log('Successfully received Paystack response', {
    status: responseData.status,
    requestCode: responseData.data?.request_code,
    leaseId: invoiceData.leaseId,
  });

  return responseData;
};

export const createInvoiceTask: ReturnType<typeof schemaTask> = schemaTask({
  id: 'create-invoice',
  maxDuration: 300, // 5 minutes to allow for rate limit waits
  retry: {
    maxAttempts: 5, // Increased for rate limit handling
    factor: 2,
    minTimeoutInMs: 5000, // Start with 5 seconds
    maxTimeoutInMs: 60000, // Up to 1 minute between task retries
    randomize: true,
  },
  schema: valibotParser,
  handleError: async ({ error, payload }) => {
    logger.debug('Error in createInvoiceTask', { error, payload });
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 429
    ) {
      logger.log('Rate limit error', error);
      const headers = 'headers' in error ? error.headers : {};
      const retryAfter =
        headers && typeof headers === 'object' && 'retry-after' in headers
          ? headers['retry-after']
          : null;

      if (retryAfter) {
        const waitTimeMs = parseInt(String(retryAfter), 10) * 1000;
        const retryTime = new Date(Date.now() + waitTimeMs);

        logger.warn('Task-level rate limit handling - scheduling retry', {
          leaseId: payload.leaseId,
          retryAfterSeconds: retryAfter,
          retryAt: retryTime.toISOString(),
        });

        return {
          retryAt: retryTime,
        };
      }
    }

    return undefined;
  },
  run: async (payload) => {
    const invoiceData = payload;
    const startTime = Date.now();

    logger.log('Creating invoice with enhanced retry logic for rate limiting', {
      leaseId: invoiceData.leaseId,
      tenantId: invoiceData.tenantId,
      amount: invoiceData.amount,
    });

    try {
      const paystackResult = await createPaystackInvoice(invoiceData);

      logger.log('Successfully created invoice via Paystack', {
        paystackRequestCode: paystackResult?.data?.request_code,
        leaseId: invoiceData.leaseId,
      });

      const newInvoice = await db.invoice.create({
        data: {
          id: nanoid(),
          landlordId: invoiceData.landlordId,
          tenantId: invoiceData.tenantId ?? '',
          leaseId: invoiceData.leaseId ?? null,
          description: invoiceData.description ?? '',
          dueAmount: invoiceData.amount,
          dueDate: invoiceData.dueDate,
          category: invoiceData.category as InvoiceCategory,
          status: 'PENDING',
          lineItems: invoiceData.lineItems ?? [],
          paystackId: paystackResult?.data?.request_code ?? '',
          paymentRequestUrl: `${PAYSTACK_BASE_URL}/pay/${paystackResult?.data?.request_code}`,
          invoiceNumber: `${getYear(new Date())}-${getMonth(new Date())}-${paystackResult?.data?.invoice_number}`,
          recurringBillableId: invoiceData.recurringBillableId,
        },
      });

      const endTime = Date.now();
      const durationMs = endTime - startTime;

      if (isDevelopment && invoiceData.tenantId) {
        try {
          const tenant = await db.tenant.findUnique({
            where: { id: invoiceData.tenantId },
            select: { email: true },
          });

          if (tenant?.email) {
            const testEmail = getInvoiceTestEmail(
              tenant.email,
              newInvoice.id,
              'tenant',
              'DELIVERED'
            );

            logTestEmailUsage(
              tenant.email,
              testEmail,
              `Invoice ${newInvoice.id} tenant notification`
            );
          }
        } catch  {
          logger.warn('Could not fetch tenant email for test email logging', {
            tenantId: invoiceData.tenantId,
            invoiceId: newInvoice.id,
          });
        }
      }

      logger.log('Successfully created invoice', {
        invoiceId: newInvoice.id,
        leaseId: invoiceData.leaseId,
        tenantId: invoiceData.tenantId,
        amount: newInvoice.dueAmount,
        durationMs,
        paystackId: newInvoice.paystackId,
        testEmailsEnabled: isDevelopment,
      });

      return {
        id: newInvoice.id,
        leaseId: invoiceData.leaseId,
        tenantId: invoiceData.tenantId,
        amount: newInvoice.dueAmount,
        paystackId: newInvoice.paystackId,
        durationMs,
      };
    } catch (error) {
      const endTime = Date.now();
      const durationMs = endTime - startTime;

      logger.error('Failed to create invoice', {
        leaseId: invoiceData.leaseId,
        tenantId: invoiceData.tenantId,
        amount: invoiceData.amount,
        durationMs,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      await db.$disconnect();
    }
  },
});
