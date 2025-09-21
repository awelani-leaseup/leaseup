import { logger, schedules } from '@trigger.dev/sdk';
import { db } from '@leaseup/prisma/db.ts';
import { addDays, isAfter, isBefore } from 'date-fns';
import { createInvoiceTask, type CreateInvoicePayload } from './invoice-send';
import { calculateNextInvoiceDate } from '../utils/calculate-next-invoice-date';
import {
  InvoiceCycle,
  InvoiceStatus,
  LeaseStatus,
  type RecurringBillable,
  type Prisma,
  SubscriptionPlanStatus,
} from '@leaseup/prisma/client/client.js';

const CONFIG = {
  CHECK_DAYS_AHEAD: 3, // Send invoices 7 days before due date (compromise for processing capacity)
  BATCH_SIZE: 5, // Smaller batch size to be more conservative with rate limits
  BATCH_DELAY_MS: 0, // No batch delay - let retry logic handle rate limits
  API_CALL_DELAY_MS: 0, // No delay between individual API calls
  FETCH_BATCH_SIZE: 100, // Number of billables to fetch per batch
} as const;

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';

const calculateInvoiceDates = () => {
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );
  const checkUntilDate = addDays(today, CONFIG.CHECK_DAYS_AHEAD);
  return { today, checkUntilDate };
};

const shouldCreateInvoice = (
  nextInvoiceDate: Date,
  today: Date,
  checkUntilDate: Date,
  leaseEndDate?: Date
): boolean => {
  if (leaseEndDate && isAfter(nextInvoiceDate, leaseEndDate)) {
    return false;
  }
  return (
    !isBefore(nextInvoiceDate, today) &&
    !isAfter(nextInvoiceDate, checkUntilDate)
  );
};

const createInvoicePayload = (
  billable: RecurringBillable & {
    tenant: {
      id: string;
      paystackCustomerId: string;
      landlordId: string;
    };
    lease?: {
      unit: {
        property: {
          landlordId: string;
        };
      };
    } | null;
  },
  nextInvoiceDate: Date
): CreateInvoicePayload & { recurringBillableId: string } => {
  const landlordId =
    billable.lease?.unit?.property?.landlordId ??
    billable.tenant?.landlordId ??
    '';

  if (!landlordId) {
    throw new Error(
      `No landlord ID found for billable ${billable.id}. Cannot create invoice without valid landlord.`
    );
  }

  return {
    landlordId,
    tenantId: billable.tenant?.id ?? undefined,
    customer: billable.tenant?.paystackCustomerId ?? '',
    amount: billable.amount,
    dueDate: nextInvoiceDate,
    description: billable.description,
    lineItems: [
      {
        name: 'Rent',
        amount: billable.amount,
      },
    ],
    split_code: '',
    leaseId: billable.leaseId ?? undefined,
    category: billable.category,
    recurringBillableId: billable.id,
  };
};

const processBillable = async (billable: any) => {
  try {
    const landlordId =
      billable.lease?.unit?.property?.landlordId ?? billable.tenant?.landlordId;
    if (!landlordId) {
      logger.error('Cannot process billable: No landlord ID found', {
        billableId: billable.id,
        tenantId: billable.tenant?.id,
        leaseId: billable.leaseId,
      });
      return null;
    }

    if (!billable.tenant?.id) {
      logger.error('Cannot process billable: No tenant ID found', {
        billableId: billable.id,
        leaseId: billable.leaseId,
      });
      return null;
    }

    if (!isDevelopment) {
      const landlordSubscriptionStatus =
        billable.tenant?.landlord?.paystackSubscriptionStatus;

      const isActive =
        landlordSubscriptionStatus === SubscriptionPlanStatus.ACTIVE ||
        landlordSubscriptionStatus === SubscriptionPlanStatus.NON_RENEWING;

      if (!isActive) {
        logger.log(
          'Skipping billable: Landlord does not have active subscription',
          {
            billableId: billable.id,
            landlordId,
            subscriptionStatus: landlordSubscriptionStatus,
            tenantId: billable.tenant?.id,
          }
        );
        return null;
      }
    }

    const { today, checkUntilDate } = calculateInvoiceDates();

    const nextInvoiceDate = calculateNextInvoiceDate(
      billable.startDate,
      billable.cycle
    );

    if (!shouldCreateInvoice(nextInvoiceDate, today, checkUntilDate)) {
      return null;
    }

    const existingInvoice = await db.invoice.findFirst({
      where: {
        recurringBillableId: billable.id,
        status: {
          in: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE],
        },
        dueDate: {
          equals: nextInvoiceDate,
        },
      },
    });

    if (existingInvoice) {
      logger.log('Invoice already exists for this cycle', {
        billableId: billable.id,
        dueDate: nextInvoiceDate,
        existingInvoiceId: existingInvoice.id,
      });
      return null;
    }

    return createInvoicePayload(billable, nextInvoiceDate);
  } catch (error) {
    logger.error('Error processing billable', {
      billableId: billable.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
};

const processInvoiceWithRateLimit = async (
  invoicePayload: CreateInvoicePayload,
  invoiceIndex: number,
  batchLength: number,
  batchNumber: number
) => {
  logger.log(
    `Processing invoice ${invoiceIndex + 1}/${batchLength} in batch ${batchNumber}`,
    {
      leaseId: invoicePayload.leaseId,
      tenantId: invoicePayload.tenantId,
      amount: invoicePayload.amount,
    }
  );

  try {
    const result = await createInvoiceTask.triggerAndWait(invoicePayload, {});

    logger.log(
      `Successfully created invoice ${invoiceIndex + 1}/${batchLength}`,
      {
        leaseId: invoicePayload.leaseId,
        tenantId: invoicePayload.tenantId,
        amount: invoicePayload.amount,
        invoiceId: result.id,
      }
    );

    if (invoiceIndex < batchLength - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, CONFIG.API_CALL_DELAY_MS)
      );
    }

    return true;
  } catch (error) {
    logger.error('Failed to create invoice', {
      leaseId: invoicePayload.leaseId,
      tenantId: invoicePayload.tenantId,
      amount: invoicePayload.amount,
      error: error instanceof Error ? error.message : String(error),
    });

    return false;
  }
};

const createInvoicesInBatches = async (
  invoices: Array<CreateInvoicePayload>
) => {
  const batches: Array<Array<CreateInvoicePayload>> = [];
  for (let i = 0; i < invoices.length; i += CONFIG.BATCH_SIZE) {
    batches.push(invoices.slice(i, i + CONFIG.BATCH_SIZE));
  }

  logger.log(
    `Processing ${batches.length} batches with retry logic for rate limiting`,
    {
      totalInvoices: invoices.length,
      batchSize: CONFIG.BATCH_SIZE,
      apiCallDelayMs: CONFIG.API_CALL_DELAY_MS,
    }
  );

  let successfulInvoices = 0;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    if (!batch) continue;

    logger.log(
      `Processing batch ${batchIndex + 1} of ${batches.length} (${batch.length} invoices)`
    );

    const batchResults: boolean[] = [];
    for (let invoiceIndex = 0; invoiceIndex < batch.length; invoiceIndex++) {
      const invoicePayload = batch[invoiceIndex];
      if (!invoicePayload) continue;

      const result = await processInvoiceWithRateLimit(
        invoicePayload,
        invoiceIndex,
        batch.length,
        batchIndex + 1
      );
      batchResults.push(result);
    }

    const batchSuccesses = batchResults.filter(Boolean).length;
    successfulInvoices += batchSuccesses;

    logger.log(
      `Batch ${batchIndex + 1} completed: ${batchSuccesses}/${batch.length} invoices successful`
    );

    if (CONFIG.BATCH_DELAY_MS > 0 && batchIndex < batches.length - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, CONFIG.BATCH_DELAY_MS)
      );
    }
  }

  logger.log(
    `Successfully processed ${successfulInvoices} out of ${invoices.length} invoices`
  );

  return successfulInvoices;
};

const fetchBillablesForProcessing = async (): Promise<Array<any>> => {
  logger.log(`Fetching ${CONFIG.FETCH_BATCH_SIZE} billables for processing`);

  const { today, checkUntilDate } = calculateInvoiceDates();

  const whereClause: Prisma.RecurringBillableFindManyArgs['where'] = {
    isActive: true,
    cycle: InvoiceCycle.MONTHLY,
    lease: {
      status: LeaseStatus.ACTIVE,
    },
    startDate: {
      lte: today,
    },
    NOT: {
      invoice: {
        some: {
          status: {
            in: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE],
          },
          dueDate: {
            gte: today,
            lte: checkUntilDate,
          },
        },
      },
    },
  };

  if (!isDevelopment) {
    whereClause.tenant = {
      landlord: {
        paystackSubscriptionStatus: SubscriptionPlanStatus.ACTIVE,
      },
    };
  }

  const recurringBillables = await db.recurringBillable.findMany({
    where: whereClause,
    include: {
      tenant: {
        include: {
          landlord: true,
        },
      },
      lease: {
        include: {
          unit: {
            include: {
              property: true,
            },
          },
        },
      },
    },
    take: CONFIG.FETCH_BATCH_SIZE,
    orderBy: [{ updatedAt: 'asc' }, { createdAt: 'asc' }],
  });

  logger.log(
    `Fetched ${recurringBillables.length} billables from database (pre-filtered to exclude existing invoices${!isDevelopment ? ' and include only active landlord subscriptions' : ' - subscription filtering disabled in development'})`
  );

  if (recurringBillables.length === 0) {
    logger.log(
      `No billables found to process - all may already have pending invoices${!isDevelopment ? ' or landlords may not have active subscriptions' : ''}`
    );
    return [];
  }

  const invoiceResults = await Promise.all(
    recurringBillables.map(processBillable)
  );

  const validInvoices = invoiceResults.filter(
    (invoice: any): invoice is NonNullable<typeof invoice> => invoice !== null
  );

  logger.log(`Processing results`, {
    totalBillablesFetched: recurringBillables.length,
    validInvoicesFound: validInvoices.length,
    filteredOut: recurringBillables.length - validInvoices.length,
    note: `Most filtering already done at database level${!isDevelopment ? ' (including subscription status)' : ' (subscription filtering disabled in dev)'}`,
  });

  return validInvoices;
};

export const checkUpcomingInvoicesTask = schedules.task({
  id: 'send-monthly-invoices',
  maxDuration: 18000, // 5 hours to allow for enhanced processing
  cron: {
    // Every 30 minutes, every day Johannesburg time
    pattern: '*/30 * * * *',
    timezone: 'Africa/Johannesburg',
  },
  run: async (payload: any, { ctx }: { ctx: any }) => {
    logger.log('Starting check for upcoming invoices with retry logic', {
      payload,
      ctx,
      config: CONFIG,
      environment: process.env.NODE_ENV || 'unknown',
      subscriptionFilteringEnabled: !isDevelopment,
    });

    try {
      const invoicesToCreate = await fetchBillablesForProcessing();

      logger.log(
        `Found ${invoicesToCreate.length} invoices to create after duplicate filtering`
      );

      if (invoicesToCreate.length === 0) {
        return {
          message: `No invoices to create from batch of ${CONFIG.FETCH_BATCH_SIZE} billables`,
          invoicesToCreate: 0,
          invoicesCreated: 0,
          successRate: '100%',
        };
      }

      const invoicesCreated = await createInvoicesInBatches(invoicesToCreate);

      const result = {
        message: `Successfully created ${invoicesCreated} out of ${invoicesToCreate.length} invoices from batch of ${CONFIG.FETCH_BATCH_SIZE} billables`,
        batchSize: CONFIG.FETCH_BATCH_SIZE,
        invoicesToCreate: invoicesToCreate.length,
        invoicesCreated: invoicesCreated,
        successRate:
          invoicesToCreate.length > 0
            ? ((invoicesCreated / invoicesToCreate.length) * 100).toFixed(2) +
              '%'
            : '0%',
      };

      logger.log('Completed invoice processing with retry logic.', result);

      return result;
    } catch (error) {
      logger.error('Fatal error in invoice processing', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      await db.$disconnect();
      logger.log('Database connection closed');
    }
  },
});
