import {
  Effect,
  Layer,
  Schedule,
  Cron,
  DateTime,
  Context,
  TestClock,
  TestContext,
} from 'effect';
import { addDays, format, isAfter, isBefore, startOfDay } from 'date-fns';
import { calculateNextInvoiceDate } from '../utils/calculate-next-invoice-date';
import {
  runCreateInvoiceEffect,
  type CreateInvoicePayload,
} from './invoice-send';
import {
  DatabaseServiceTag,
  DatabaseServiceLive,
  PaystackServiceLive,
} from './services';
import type { RecurringBillable } from '@leaseup/prisma/client/index.js';
import { MockPaystackServiceFastLive } from './mock-paystack-service';

// Configuration as a service
interface InvoiceConfig {
  readonly checkDaysAhead: number;
  readonly batchSize: number;
  readonly batchDelayMs: number;
  readonly apiCallDelayMs: number; // Delay between individual API calls
}

const InvoiceConfig = Context.GenericTag<InvoiceConfig>('InvoiceConfig');

const InvoiceConfigLive = Layer.succeed(InvoiceConfig, {
  checkDaysAhead: 30,
  batchSize: 3, // Further reduced batch size to be more conservative
  batchDelayMs: 0, // No batch delay - let retry logic handle rate limits
  apiCallDelayMs: 3000, // 3-second delay between individual API calls within a batch
});

// Test configuration with no delays to avoid TestClock issues
const InvoiceConfigTestLive = Layer.succeed(InvoiceConfig, {
  checkDaysAhead: 30,
  batchSize: 5,
  batchDelayMs: 0, // No delay in test mode
  apiCallDelayMs: 0, // No delay in test mode
});

// Error types
export class InvoiceProcessingError {
  readonly _tag = 'InvoiceProcessingError';
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

// Pure business logic functions
const calculateInvoiceDates = (config: InvoiceConfig) => {
  const today = startOfDay(new Date());
  const checkUntilDate = addDays(today, config.checkDaysAhead);
  return { today, checkUntilDate };
};

const shouldCreateInvoice = (
  nextInvoiceDate: Date,
  today: Date,
  checkUntilDate: Date
): boolean => {
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
    };
    invoice: {
      landlord: {
        id: string;
      };
    }[];
  },
  nextInvoiceDate: Date
): CreateInvoicePayload => ({
  landlordId: billable.invoice[0]?.landlord?.id ?? '',
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
});

// Core business logic
const processBillable = (billable: any) =>
  Effect.gen(function* () {
    const config = yield* InvoiceConfig;
    const db = yield* DatabaseServiceTag;
    const { today, checkUntilDate } = calculateInvoiceDates(config);

    const nextInvoiceDate = calculateNextInvoiceDate(
      billable.startDate,
      billable.cycle
    );

    if (!shouldCreateInvoice(nextInvoiceDate, today, checkUntilDate)) {
      return null;
    }

    const existingInvoice = yield* db.findExistingInvoice(
      billable.id,
      nextInvoiceDate
    );

    if (existingInvoice) {
      yield* Effect.logInfo('Invoice already exists for this cycle', {
        billableId: billable.id,
        dueDate: nextInvoiceDate,
        existingInvoiceId: existingInvoice.id,
      });
      return null;
    }

    return createInvoicePayload(billable, nextInvoiceDate);
  }).pipe(
    Effect.catchAll((error: unknown) =>
      Effect.gen(function* () {
        yield* Effect.logError('Error processing billable', {
          billableId: billable.id,
          error: error instanceof Error ? error.message : String(error),
        });
        return null;
      })
    )
  );

const processBillablesIntoInvoices = Effect.gen(function* () {
  const db = yield* DatabaseServiceTag;

  const billables = yield* db.getRecurringBillables;

  yield* Effect.logInfo(`Found ${billables.length} recurring billables`);

  const invoiceResults = yield* Effect.forEach(billables, processBillable, {
    concurrency: 'unbounded',
  });

  const invoicesToCreate = invoiceResults.filter(
    (
      invoice: CreateInvoicePayload | null
    ): invoice is NonNullable<typeof invoice> => invoice !== null
  );

  yield* Effect.logInfo(`Found ${invoicesToCreate.length} invoices to create`);

  return invoicesToCreate;
});

// Helper function to process individual invoice with rate limiting
const processInvoiceWithRateLimit = (
  invoicePayload: CreateInvoicePayload,
  invoiceIndex: number,
  batchLength: number,
  batchNumber: number,
  config: InvoiceConfig
) =>
  Effect.gen(function* () {
    const invoiceStartTime = Date.now();

    yield* Effect.logInfo(
      `Processing invoice ${invoiceIndex + 1}/${batchLength} in batch ${batchNumber}`
    );

    // Check if error is rate limit related
    const isRateLimitError = (error: unknown): boolean => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return (
        errorMessage.includes('429') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('Too Many Requests') ||
        errorMessage.includes('ECONNRESET') ||
        errorMessage.includes('timeout')
      );
    };

    // Create the invoice with enhanced retry logic for rate limiting
    const result = yield* Effect.tryPromise({
      try: () => runCreateInvoiceEffect(invoicePayload),
      catch: (error: unknown) =>
        error instanceof Error ? error : new Error(String(error)),
    }).pipe(
      Effect.retry(
        Schedule.exponential('3 seconds').pipe(
          Schedule.compose(Schedule.recurs(5)),
          Schedule.whileInput(isRateLimitError)
        )
      ),
      Effect.catchAll((error: unknown) =>
        Effect.gen(function* () {
          const invoiceEndTime = Date.now();
          const invoiceDurationMs = invoiceEndTime - invoiceStartTime;

          yield* Effect.logError('Failed to create invoice after retries', {
            leaseId: invoicePayload.leaseId,
            tenantId: invoicePayload.tenantId,
            amount: invoicePayload.amount,
            durationMs: invoiceDurationMs,
            error: error instanceof Error ? error.message : String(error),
          });
          return Effect.succeed(false); // Return false to indicate failure
        })
      ),
      Effect.map(() => {
        const invoiceEndTime = Date.now();
        const invoiceDurationMs = invoiceEndTime - invoiceStartTime;

        Effect.logInfo(
          `Successfully created invoice ${invoiceIndex + 1}/${batchLength} in ${invoiceDurationMs}ms`,
          {
            leaseId: invoicePayload.leaseId,
            tenantId: invoicePayload.tenantId,
            amount: invoicePayload.amount,
            durationMs: invoiceDurationMs,
          }
        ).pipe(Effect.runSync);

        return true; // Return true to indicate success
      })
    );

    // Add delay between individual API calls (except for the last invoice in the batch)
    if (invoiceIndex < batchLength - 1) {
      yield* Effect.sleep(`${config.apiCallDelayMs} millis`);
    }

    return result;
  });

const createInvoicesInBatches = (invoices: Array<CreateInvoicePayload>) =>
  Effect.gen(function* () {
    const config = yield* InvoiceConfig;
    const batchProcessingStartTime = Date.now();

    // Split into batches
    const batches: Array<Array<CreateInvoicePayload>> = [];
    for (let i = 0; i < invoices.length; i += config.batchSize) {
      batches.push(invoices.slice(i, i + config.batchSize));
    }

    yield* Effect.logInfo(
      `Processing ${batches.length} batches with retry logic for rate limiting`
    );

    let successfulInvoices = 0;
    const batchTimings: Array<{
      batchNumber: number;
      durationMs: number;
      invoiceCount: number;
    }> = [];

    // Process each batch sequentially
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      if (!batch) continue; // Skip undefined batches

      const batchStartTime = Date.now();

      yield* Effect.logInfo(
        `Processing batch ${batchIndex + 1} of ${batches.length} (${batch.length} invoices)`
      );

      // Process invoices in the batch sequentially to avoid rate limits
      const batchResults = yield* Effect.forEach(
        batch,
        (invoicePayload: CreateInvoicePayload, invoiceIndex: number) =>
          processInvoiceWithRateLimit(
            invoicePayload,
            invoiceIndex,
            batch.length,
            batchIndex + 1,
            config
          ),
        { concurrency: 1 } // Process invoices sequentially within each batch
      );

      const batchEndTime = Date.now();
      const batchDurationMs = batchEndTime - batchStartTime;

      // Count successful invoices in this batch
      const batchSuccesses = batchResults.filter(Boolean).length;
      successfulInvoices += batchSuccesses;

      batchTimings.push({
        batchNumber: batchIndex + 1,
        durationMs: batchDurationMs,
        invoiceCount: batch.length,
      });

      yield* Effect.logInfo(
        `Batch ${batchIndex + 1} completed: ${batchSuccesses}/${batch.length} invoices successful in ${(batchDurationMs / 1000).toFixed(2)}s`
      );
    }

    const batchProcessingEndTime = Date.now();
    const totalBatchProcessingTime =
      batchProcessingEndTime - batchProcessingStartTime;

    yield* Effect.logInfo(
      `Successfully processed ${successfulInvoices} out of ${invoices.length} invoices in ${(totalBatchProcessingTime / 1000).toFixed(2)}s`,
      { batchTimings }
    );
    return successfulInvoices;
  });

// Main task effect
const checkUpcomingInvoicesEffect = Effect.gen(function* () {
  const startTime = Date.now();

  yield* Effect.logInfo(
    'Starting check for upcoming invoices with retry logic'
  );

  const invoicesToCreate = yield* processBillablesIntoInvoices;

  const invoiceCreationStartTime = Date.now();
  const invoicesCreated = yield* createInvoicesInBatches(invoicesToCreate);
  const invoiceCreationEndTime = Date.now();

  const endTime = Date.now();
  const totalDurationMs = endTime - startTime;
  const invoiceCreationDurationMs =
    invoiceCreationEndTime - invoiceCreationStartTime;

  const result = {
    message: `Successfully created ${invoicesCreated} out of ${invoicesToCreate.length} invoices with retry logic`,
    invoicesToCreate: invoicesToCreate.length,
    invoicesCreated: invoicesCreated,
    successRate:
      invoicesToCreate.length > 0
        ? ((invoicesCreated / invoicesToCreate.length) * 100).toFixed(2) + '%'
        : '0%',
    timing: {
      totalDurationMs,
      totalDurationSeconds: (totalDurationMs / 1000).toFixed(2),
      invoiceCreationDurationMs,
      invoiceCreationDurationSeconds: (
        invoiceCreationDurationMs / 1000
      ).toFixed(2),
      averageTimePerInvoiceMs:
        invoicesCreated > 0
          ? Math.round(invoiceCreationDurationMs / invoicesCreated)
          : 0,
    },
  };

  yield* Effect.logInfo(
    'Completed invoice processing with retry logic',
    result
  );

  return result;
}).pipe(
  Effect.ensuring(
    Effect.gen(function* () {
      const db = yield* DatabaseServiceTag;
      yield* db
        .disconnect()
        .pipe(Effect.catchAll(() => Effect.succeed(void 0)));
      yield* Effect.logInfo('Database connection closed');
    })
  ),
  Effect.catchAll((error: unknown) =>
    Effect.gen(function* () {
      yield* Effect.logError('Fatal error in invoice processing', {
        error: error instanceof Error ? error.message : String(error),
      });
      return Effect.fail(
        new InvoiceProcessingError('Invoice processing failed', error)
      );
    })
  )
);

// Cron schedule setup
const cronSchedule = Cron.make({
  seconds: [0],
  minutes: [5], // 5 minutes past the hour
  hours: [0], // Midnight
  days: [], // Every day
  months: [], // Every month
  weekdays: [], // Every weekday
  tz: DateTime.zoneUnsafeMakeNamed('Africa/Johannesburg'),
});

// Task runner with cron
export const runMonthlyInvoicesCron = Effect.gen(function* () {
  yield* Effect.logInfo('Starting monthly invoices cron job');

  // Run the effect on the cron schedule
  yield* Effect.repeat(
    checkUpcomingInvoicesEffect,
    Schedule.cron(cronSchedule)
  );
}).pipe(
  Effect.provide(InvoiceConfigLive),
  Effect.provide(DatabaseServiceLive),
  Effect.provide(PaystackServiceLive)
);

// For one-time execution (useful for testing)
export const runMonthlyInvoicesOnce = checkUpcomingInvoicesEffect.pipe(
  Effect.provide(InvoiceConfigLive),
  Effect.provide(DatabaseServiceLive),
  Effect.provide(PaystackServiceLive)
);

// Utility to run the effect as a Promise (for integration with existing systems)
export const runMonthlyInvoicesAsPromise = () =>
  Effect.runPromise(runMonthlyInvoicesOnce);

// Example usage with custom logger
export const runWithCustomLogger = (logger: any) =>
  runMonthlyInvoicesOnce.pipe(
    Effect.tapErrorCause((cause: unknown) =>
      Effect.sync(() => logger.error('Monthly invoices failed', cause))
    ),
    Effect.tap((result) =>
      Effect.sync(() => logger.info('Monthly invoices completed', result))
    )
  );

// Standalone cron runner (replaces trigger.dev task)
export const startMonthlyInvoicesCronRunner = Effect.gen(function* () {
  yield* Effect.logInfo('Starting Effect-based monthly invoices cron runner');

  // This will run the task on the cron schedule indefinitely
  yield* Effect.repeat(
    checkUpcomingInvoicesEffect,
    Schedule.cron(cronSchedule)
  );
}).pipe(
  Effect.provide(InvoiceConfigLive),
  Effect.provide(DatabaseServiceLive),
  Effect.provide(PaystackServiceLive),
  Effect.catchAll((error: unknown) =>
    Effect.gen(function* () {
      yield* Effect.logError('Fatal error in cron runner', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Re-throw to restart the cron if needed
      return Effect.fail(error);
    })
  )
);

// Runner for standalone Node.js process
export const runStandaloneCron = () => {
  console.log('Starting Effect-based cron runner...');

  return Effect.runPromise(
    startMonthlyInvoicesCronRunner.pipe(
      Effect.retry(
        Schedule.exponential('1 second').pipe(
          Schedule.compose(Schedule.recurs(5))
        )
      )
    )
  ).catch((error: unknown) => {
    console.error(
      'Cron runner failed:',
      error instanceof Error ? error.message : String(error)
    );
    if (typeof process !== 'undefined') process.exit(1);
  });
};

export const runStandaloneTestCron = () => {
  console.log(
    'Starting Effect-based TEST cron runner (advancing TestClock by 1 month every iteration)...'
  );

  // Simple TestClock implementation with no delays to avoid timing issues
  const testRunner = Effect.gen(function* () {
    console.log('Starting TestClock Effect test...');

    for (let i = 0; i < 5; i++) {
      // Get current TestClock time
      const currentTime = yield* TestClock.currentTimeMillis;
      const currentDate = new Date(currentTime);

      yield* Effect.logInfo(
        `🕐 Running invoice check for: ${format(currentDate, 'dd-MMM-yyyy HH:mm:ss')}`
      );

      // Run invoice processing with test configuration (no delays)
      try {
        yield* Effect.logInfo('Processing invoices...');
        const invoicesToCreate = yield* processBillablesIntoInvoices;
        const invoicesCreated =
          yield* createInvoicesInBatches(invoicesToCreate);

        yield* Effect.logInfo(
          `✅ Created ${invoicesCreated} invoices out of ${invoicesToCreate.length} for ${format(currentDate, 'dd-MMM-yyyy')}`
        );
      } catch (error) {
        yield* Effect.logInfo(`⚠️ Invoice processing failed: ${error}`);
      }

      // Advance TestClock by 30 days to simulate next month
      yield* TestClock.adjust('30 days');

      const newTime = yield* TestClock.currentTimeMillis;
      const newDate = new Date(newTime);
      yield* Effect.logInfo(
        `⏰ Advanced TestClock to: ${format(newDate, 'dd-MMM-yyyy HH:mm:ss')}`
      );

      // Small real-time delay to make output readable
      yield* Effect.async<void>(
        (resume: (effect: Effect.Effect<void, never, never>) => void) => {
          setTimeout(() => {
            console.log(`Completed iteration ${i + 1} of 5`);
            resume(Effect.succeed(undefined));
          }, 1000);
        }
      );
    }

    yield* Effect.logInfo(
      'TestClock test completed successfully - processed 5 monthly cycles'
    );
    return 'testclock-completed';
  }).pipe(
    // Use test configuration with no delays to avoid TestClock timing issues
    Effect.provide(InvoiceConfigTestLive),
    Effect.provide(DatabaseServiceLive),
    Effect.provide(MockPaystackServiceFastLive),
    Effect.provide(TestContext.TestContext),
    Effect.catchAll((error: unknown) => {
      console.error('TestClock runner error:', error);
      return Effect.succeed('testclock-failed');
    })
  );

  return Effect.runPromise(testRunner).catch((error: unknown) => {
    console.error(
      'TestClock runner failed:',
      error instanceof Error ? error.message : String(error)
    );
    return 'promise-failed';
  });
};
