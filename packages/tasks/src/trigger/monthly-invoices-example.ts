// import { Effect, Schedule } from 'effect';
// import {
//   runMonthlyInvoicesAsPromise,
//   runMonthlyInvoicesOnceComplete,
//   runMonthlyInvoicesCronComplete,
//   runWithCustomLogger,
// } from './send-monthly-invoices-effect.js';

// // Example 1: Run monthly invoices once as a Promise (for integration with existing systems)
// export async function runMonthlyInvoicesExample() {
//   try {
//     console.log('Starting monthly invoices processing...');
//     const result = await runMonthlyInvoicesAsPromise();
//     console.log('Monthly invoices completed:', result);
//     return result;
//   } catch (error) {
//     console.error('Monthly invoices failed:', error);
//     throw error;
//   }
// }

// // Example 2: Run with Effect runtime for better error handling
// export async function runMonthlyInvoicesWithEffect() {
//   const result = await Effect.runPromise(
//     runMonthlyInvoicesOnceComplete.pipe(
//       Effect.catchAllDefect((defect) =>
//         Effect.gen(function* () {
//           yield* Effect.logError('Unexpected defect occurred', { defect });
//           return Effect.fail(new Error('Unexpected error'));
//         })
//       ),
//       Effect.retry(
//         Schedule.exponential('1 second').pipe(
//           Schedule.compose(Schedule.recurs(3))
//         )
//       ),
//       Effect.timeout('5 minutes') // Timeout after 5 minutes
//     )
//   );

//   return result;
// }

// // Example 3: Run with custom logger integration
// export async function runWithExternalLogger() {
//   const customLogger = {
//     info: (message: string, data?: any) =>
//       console.log(`[INFO] ${message}`, data),
//     error: (message: string, data?: any) =>
//       console.error(`[ERROR] ${message}`, data),
//   };

//   const result = await Effect.runPromise(runWithCustomLogger(customLogger));

//   return result;
// }

// // Example 4: Start the cron job (for production use)
// export async function startMonthlyInvoicesCron() {
//   console.log('Starting monthly invoices cron job...');

//   // This will run indefinitely on the configured schedule
//   await Effect.runPromise(
//     runMonthlyInvoicesCronComplete.pipe(
//       Effect.catchAllDefect((defect) =>
//         Effect.gen(function* () {
//           yield* Effect.logError('Cron job defect', { defect });
//           // Continue running despite defects
//           return Effect.succeed(undefined);
//         })
//       )
//     )
//   );
// }

// // Example 5: Basic health check
// export async function healthCheckMonthlyInvoices() {
//   try {
//     const start = Date.now();

//     // Simple health check by attempting to load the module
//     // await import('./send-monthly-invoices-effect.js');

//     return {
//       status: 'healthy',
//       duration: Date.now() - start,
//       timestamp: new Date().toISOString(),
//     };
//   } catch (error) {
//     return {
//       status: 'unhealthy',
//       error: error instanceof Error ? error.message : 'Unknown error',
//       timestamp: new Date().toISOString(),
//     };
//   }
// }

// // Usage in production
// if (require.main === module) {
//   // Example of running once
//   runMonthlyInvoicesExample()
//     .then((result) => {
//       console.log('Successfully processed monthly invoices:', result);
//       process.exit(0);
//     })
//     .catch((error) => {
//       console.error('Failed to process monthly invoices:', error);
//       process.exit(1);
//     });
// }

// // Example configuration for different environments
// export const configs = {
//   development: {
//     checkDaysAhead: 7, // Check only 7 days ahead in dev
//     batchSize: 5, // Smaller batches
//     batchDelayMs: 2000, // Longer delays
//   },
//   production: {
//     checkDaysAhead: 50, // Default production settings
//     batchSize: 10,
//     batchDelayMs: 1000,
//   },
//   testing: {
//     checkDaysAhead: 1, // Minimal scope for tests
//     batchSize: 2,
//     batchDelayMs: 100, // Fast for tests
//   },
// };
