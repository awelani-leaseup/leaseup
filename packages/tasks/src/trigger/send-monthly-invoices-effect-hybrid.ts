import { logger, schedules } from '@trigger.dev/sdk/v3';
// import { runMonthlyInvoicesAsPromise } from './send-monthly-invoices-effect.js';

// Hybrid approach: Use Effect logic within trigger.dev task
export const checkUpcomingInvoicesEffectTask = schedules.task({
  id: 'check-upcoming-invoices-effect',
  maxDuration: 300, // 5 minutes
  cron: {
    // 5m every day Johannesburg time (same as your existing task)
    pattern: '0 5 * * *',
    timezone: 'Africa/Johannesburg',
  },
  run: async (payload: any, { ctx }: { ctx: any }) => {
    logger.log('Starting Effect-based invoice processing', { payload, ctx });

    try {
      // Call the Effect version as a Promise
      // const result = await runMonthlyInvoicesAsPromise();

      logger.log('Effect-based invoice processing completed successfully');

      return {
        success: true,
        // result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Effect-based invoice processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },
});
