import { logger, schedules } from '@trigger.dev/sdk/v3';
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
} from '@leaseup/prisma/client/index.js';

const CONFIG = {
  CHECK_DAYS_AHEAD: 7, // Send invoices 7 days before due date (compromise for processing capacity)
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

// Core business logic for processing billables
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

    // Check if invoice already exists
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

// Process individual invoice with rate limiting
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

    // Add delay between individual API calls (except for the last invoice in the batch)
    if (invoiceIndex < batchLength - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, CONFIG.API_CALL_DELAY_MS)
      );
    }

    return true; // Success
  } catch (error) {
    logger.error('Failed to create invoice', {
      leaseId: invoicePayload.leaseId,
      tenantId: invoicePayload.tenantId,
      amount: invoicePayload.amount,
      error: error instanceof Error ? error.message : String(error),
    });

    return false; // Failure
  }
};

// Create invoices in batches with enhanced logging
const createInvoicesInBatches = async (
  invoices: Array<CreateInvoicePayload>
) => {
  // Split into batches
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

  // Process each batch sequentially
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    if (!batch) continue;

    logger.log(
      `Processing batch ${batchIndex + 1} of ${batches.length} (${batch.length} invoices)`
    );

    // Process invoices in the batch sequentially to avoid rate limits
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

    // Count successful invoices in this batch
    const batchSuccesses = batchResults.filter(Boolean).length;
    successfulInvoices += batchSuccesses;

    logger.log(
      `Batch ${batchIndex + 1} completed: ${batchSuccesses}/${batch.length} invoices successful`
    );

    // Add delay between batches if configured
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

// Fetch a single batch of billables and filter for valid invoices
const fetchBillablesForProcessing = async (): Promise<Array<any>> => {
  logger.log(`Fetching ${CONFIG.FETCH_BATCH_SIZE} billables for processing`);

  // Calculate date range for invoice checking
  const { today, checkUntilDate } = calculateInvoiceDates();

  // Get recurring billables and filter by startDate day in processBillable
  // For monthly cycles, we'll check if the day of the month from startDate falls within today to checkUntilDate
  const whereClause: Prisma.RecurringBillableFindManyArgs['where'] = {
    isActive: true,
    cycle: InvoiceCycle.MONTHLY,
    lease: {
      status: LeaseStatus.ACTIVE,
    },
    // Only include billables that started before or on today (can't bill for future start dates)
    startDate: {
      lte: today,
    },
    // Exclude billables that already have pending/overdue invoices
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

  // Only filter by subscription status in production environment
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
        select: {
          id: true,
          paystackCustomerId: true,
          landlordId: true,
        },
        include: {
          landlord: {
            select: {
              id: true,
              paystackSubscriptionStatus: true,
            },
          },
        },
      },
      lease: {
        include: {
          unit: {
            include: {
              property: {
                select: {
                  landlordId: true,
                },
              },
            },
          },
        },
      },
    },
    take: CONFIG.FETCH_BATCH_SIZE,
    orderBy: [
      { updatedAt: 'asc' }, // Process least recently updated first
      { createdAt: 'asc' }, // Then by creation date as secondary sort
    ],
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

  // Process billables to create invoice payloads (most should be valid since we pre-filtered)
  const invoiceResults = await Promise.all(
    recurringBillables.map(processBillable)
  );

  const validInvoices = invoiceResults.filter(
    (invoice): invoice is NonNullable<typeof invoice> => invoice !== null
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
      // Fetch a batch of billables and filter for valid invoices
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

      // Create invoices in batches
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

      logger.log('Completed invoice processing with retry logic', result);

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
