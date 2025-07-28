import { Effect, Layer, Schedule, Cron, DateTime, Context } from 'effect';
import { addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { calculateNextInvoiceDate } from '../utils/calculate-next-invoice-date';
import type { Invoice } from '@leaseup/prisma/client/index.js';
import { nanoid } from 'nanoid';

// Configuration as a service
interface InvoiceConfig {
  readonly checkDaysAhead: number;
  readonly batchSize: number;
  readonly batchDelayMs: number;
}

const InvoiceConfig = Context.GenericTag<InvoiceConfig>('InvoiceConfig');

const InvoiceConfigLive = Layer.succeed(InvoiceConfig, {
  checkDaysAhead: 50,
  batchSize: 10,
  batchDelayMs: 1000,
});

// Database service interface
interface DatabaseService {
  readonly getRecurringBillables: Effect.Effect<
    Array<any>,
    DatabaseError,
    never
  >;
  readonly findExistingInvoice: (
    billableId: string,
    dueDate: Date
  ) => Effect.Effect<any | null, DatabaseError, never>;
  readonly disconnect: Effect.Effect<void, never, never>;
}

const DatabaseService = Context.GenericTag<DatabaseService>('DatabaseService');

// Invoice creation service interface
interface InvoiceCreationService {
  readonly createInvoice: (
    invoiceData: any
  ) => Effect.Effect<void, InvoiceCreationError, never>;
}

const InvoiceCreationService = Context.GenericTag<InvoiceCreationService>(
  'InvoiceCreationService'
);

// Error types
export class DatabaseError {
  readonly _tag = 'DatabaseError';
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

export class InvoiceCreationError {
  readonly _tag = 'InvoiceCreationError';
  constructor(
    readonly message: string,
    readonly cause?: unknown
  ) {}
}

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

const createInvoiceData = (
  billable: any,
  nextInvoiceDate: Date
): Invoice & { tenantPaystackCustomerId: string } => ({
  id: nanoid(),
  leaseId: billable.leaseId ?? null,
  dueDate: nextInvoiceDate,
  dueAmount: billable.amount,
  category: billable.category,
  description: billable.description,
  tenantId: billable.tenant?.id ?? null,
  tenantPaystackCustomerId: billable.tenant?.paystackCustomerId ?? '',
  recurringBillableId: billable.id,
  status: 'PENDING' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  paystackId: '',
  lineItems: [],
});

// Core business logic
const processBillable = (billable: any) =>
  Effect.gen(function* () {
    const config = yield* InvoiceConfig;
    const db = yield* DatabaseService;
    const { today, checkUntilDate } = calculateInvoiceDates(config);

    const nextInvoiceDate = calculateNextInvoiceDate(
      billable.startDate,
      billable.cycle
    );

    if (!shouldCreateInvoice(nextInvoiceDate, today, checkUntilDate)) {
      return Effect.succeed(null);
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

    return createInvoiceData(billable, nextInvoiceDate);
  }).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError('Error processing billable', {
          billableId: billable.id,
          error: error.message,
        });
        return null;
      })
    )
  );

const processBillablesIntoInvoices = Effect.gen(function* () {
  const db = yield* DatabaseService;

  const billables = yield* db.getRecurringBillables;

  yield* Effect.logInfo(`Found ${billables.length} recurring billables`);

  const invoiceResults = yield* Effect.forEach(billables, processBillable, {
    concurrency: 'unbounded',
  });

  const invoicesToCreate = invoiceResults.filter(
    (invoice): invoice is NonNullable<typeof invoice> => invoice !== null
  );

  yield* Effect.logInfo(`Found ${invoicesToCreate.length} invoices to create`);

  return invoicesToCreate;
});

const createInvoicesInBatches = (invoices: Array<any>) =>
  Effect.gen(function* () {
    const config = yield* InvoiceConfig;
    const invoiceService = yield* InvoiceCreationService;

    // Split into batches
    const batches: Array<Array<any>> = [];
    for (let i = 0; i < invoices.length; i += config.batchSize) {
      batches.push(invoices.slice(i, i + config.batchSize));
    }

    yield* Effect.logInfo(`Processing ${batches.length} batches`);

    // Process each batch
    yield* Effect.forEach(
      batches,
      (batch, batchIndex) =>
        Effect.gen(function* () {
          yield* Effect.logInfo(
            `Processing batch ${batchIndex + 1} of ${batches.length}`
          );

          // Process all invoices in the batch concurrently
          yield* Effect.forEach(
            batch,
            (invoiceData) =>
              invoiceService
                .createInvoice({
                  customer: invoiceData.tenantPaystackCustomerId,
                  amount: invoiceData.dueAmount,
                  dueDate: invoiceData.dueDate,
                  description: invoiceData.description,
                  lineItems: [],
                  split_code: '',
                  leaseId: invoiceData.leaseId,
                })
                .pipe(
                  Effect.retry(
                    Schedule.exponential('100 millis').pipe(
                      Schedule.compose(Schedule.recurs(3))
                    )
                  ),
                  Effect.catchAll((error) =>
                    Effect.logError('Failed to create invoice after retries', {
                      invoiceId: invoiceData.id,
                      error: error.message,
                    })
                  )
                ),
            { concurrency: 5 }
          );

          // Add delay between batches (except for the last one)
          if (batchIndex < batches.length - 1) {
            yield* Effect.sleep(`${config.batchDelayMs} millis`);
          }
        }),
      { concurrency: 1 } // Process batches sequentially
    );

    return invoices.length;
  });

// Main task effect
const checkUpcomingInvoicesEffect = Effect.gen(function* () {
  yield* Effect.logInfo('Starting check for upcoming invoices');

  const invoicesToCreate = yield* processBillablesIntoInvoices;
  const invoicesCreated = yield* createInvoicesInBatches(invoicesToCreate);

  const result = {
    message: `Created ${invoicesCreated} invoices directly`,
    invoicesToCreate: invoicesToCreate.length,
  };

  yield* Effect.logInfo('Completed invoice processing', result);

  return result;
}).pipe(
  Effect.ensuring(
    Effect.gen(function* () {
      const db = yield* DatabaseService;
      yield* db.disconnect;
      yield* Effect.logInfo('Database connection closed');
    })
  ),
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError('Fatal error in invoice processing', {
        error: error.message,
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
  Effect.provide(InvoiceConfigLive)
  // Add database and invoice service layers when implementing
  // Effect.provide(DatabaseServiceLive),
  // Effect.provide(InvoiceCreationServiceLive),
);

// For one-time execution (useful for testing)
export const runMonthlyInvoicesOnce = checkUpcomingInvoicesEffect.pipe(
  Effect.provide(InvoiceConfigLive)
  // Add database and invoice service layers when implementing
  // Effect.provide(DatabaseServiceLive),
  // Effect.provide(InvoiceCreationServiceLive),
);

// Service implementations with actual database and direct invoice creation
export const DatabaseServiceLive = Layer.effect(
  DatabaseService,
  Effect.gen(function* () {
    const { db } = yield* Effect.tryPromise({
      try: () => import('@leaseup/prisma/db.ts'),
      catch: (error) => new DatabaseError('Failed to import database', error),
    });

    return {
      getRecurringBillables: Effect.tryPromise({
        try: async () => {
          return db.recurringBillable.findMany({
            where: {
              isActive: true,
              cycle: 'MONTHLY',
            },
            include: {
              tenant: true,
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
          });
        },
        catch: (error) =>
          new DatabaseError('Failed to get recurring billables', error),
      }),

      findExistingInvoice: (billableId: string, dueDate: Date) =>
        Effect.tryPromise({
          try: async () => {
            return db.invoice.findFirst({
              where: {
                recurringBillableId: billableId,
                status: {
                  in: ['PENDING', 'OVERDUE'],
                },
                dueDate: {
                  equals: dueDate,
                },
              },
            });
          },
          catch: (error) =>
            new DatabaseError('Failed to find existing invoice', error),
        }),

      disconnect: Effect.tryPromise({
        try: async () => {
          await db.$disconnect();
        },
        catch: () => void 0, // Ignore disconnect errors
      }).pipe(Effect.orElse(() => Effect.succeed(void 0))),
    };
  })
);

export const InvoiceCreationServiceLive = Layer.effect(
  InvoiceCreationService,
  Effect.gen(function* () {
    const { paystack } = yield* Effect.tryPromise({
      try: () => import('@leaseup/paystack/open-api/client'),
      catch: (error) =>
        new InvoiceCreationError('Failed to import paystack client', error),
    });

    const { db } = yield* Effect.tryPromise({
      try: () => import('@leaseup/prisma/db.ts'),
      catch: (error) =>
        new InvoiceCreationError('Failed to import database', error),
    });

    return {
      createInvoice: (invoiceData: any) =>
        Effect.gen(function* () {
          yield* Effect.logInfo('Creating invoice directly', {
            leaseId: invoiceData.leaseId,
            amount: invoiceData.amount,
          });

          // Create payment request via Paystack
          const paystackResult = yield* Effect.tryPromise({
            try: async () => {
              return paystack.POST('/paymentrequest', {
                body: {
                  customer: invoiceData.customer,
                  amount: Math.round(invoiceData.amount * 100), // convert to cents
                  currency: 'ZAR',
                  description: invoiceData.description,
                  lineItems: invoiceData.lineItems ?? [],
                  split_code: invoiceData.split_code ?? null,
                },
              });
            },
            catch: (error) =>
              new InvoiceCreationError('Paystack API error', error),
          });

          if (paystackResult.error) {
            yield* Effect.fail(
              new InvoiceCreationError(
                `Paystack API error: ${paystackResult.error.message || 'Unknown error'}`
              )
            );
          }

          yield* Effect.logInfo('Created payment request via Paystack', {
            data: paystackResult.data,
          });

          // Create invoice record in database
          const newInvoice = yield* Effect.tryPromise({
            try: async () => {
              return db.invoice.create({
                data: {
                  id: nanoid(),
                  tenantId: invoiceData.tenantId ?? '',
                  leaseId: invoiceData.leaseId ?? null,
                  description: invoiceData.description ?? '',
                  dueAmount: invoiceData.amount,
                  dueDate: invoiceData.dueDate,
                  category: 'RENT',
                  status: 'PENDING',
                  lineItems: invoiceData.lineItems ?? [],
                  paystackId: paystackResult.data?.data?.request_code ?? '',
                },
              });
            },
            catch: (error) =>
              new InvoiceCreationError(
                'Database error creating invoice',
                error
              ),
          });

          yield* Effect.logInfo('Successfully created invoice', {
            invoiceId: newInvoice.id,
            leaseId: invoiceData.leaseId,
            amount: newInvoice.dueAmount,
          });

          return {
            id: newInvoice.id,
            leaseId: invoiceData.leaseId,
            amount: newInvoice.dueAmount,
          };
        }).pipe(
          Effect.ensuring(
            Effect.tryPromise({
              try: async () => {
                await db.$disconnect();
              },
              catch: () => void 0,
            }).pipe(Effect.orElse(() => Effect.succeed(void 0)))
          )
        ),
    };
  })
);

// Complete effect with all services
export const runMonthlyInvoicesCronComplete = runMonthlyInvoicesCron.pipe(
  Effect.provide(DatabaseServiceLive),
  Effect.provide(InvoiceCreationServiceLive)
);

export const runMonthlyInvoicesOnceComplete = runMonthlyInvoicesOnce.pipe(
  Effect.provide(DatabaseServiceLive),
  Effect.provide(InvoiceCreationServiceLive)
);

// Utility to run the effect as a Promise (for integration with existing systems)
export const runMonthlyInvoicesAsPromise = () =>
  Effect.runPromise(runMonthlyInvoicesOnceComplete);

// Example usage with custom logger
export const runWithCustomLogger = (logger: any) =>
  runMonthlyInvoicesOnceComplete.pipe(
    Effect.tapErrorCause((cause) =>
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
  Effect.provide(InvoiceCreationServiceLive),
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError('Fatal error in cron runner', {
        error: error.message,
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
  ).catch((error) => {
    console.error('Cron runner failed:', error);
    process.exit(1);
  });
};
