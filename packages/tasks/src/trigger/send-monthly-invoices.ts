import { logger, schedules } from '@trigger.dev/sdk/v3';
import { db } from '@leaseup/prisma/db.ts';
import { addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { createInvoiceTask } from './invoice-send';
import { calculateNextInvoiceDate } from '../utils/calculate-next-invoice-date';
import type { Invoice } from '@leaseup/prisma/client/index.js';
import { nanoid } from 'nanoid';

const CONFIG = {
  CHECK_DAYS_AHEAD: 50,
  BATCH_SIZE: 10, // Process invoices in batches to avoid overwhelming the API
} as const;

export const checkUpcomingInvoicesTask = schedules.task({
  id: 'check-upcoming-invoices',
  maxDuration: 300, // 5 minutes
  cron: {
    //5m every day Johannesburg time
    pattern: '0 5 * * *',
    timezone: 'Africa/Johannesburg',
  },
  run: async (payload: any, { ctx }: { ctx: any }) => {
    logger.log('Starting check for upcoming invoices', { payload, ctx });

    try {
      const recurringBillables = await db.recurringBillable.findMany({
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

      logger.log(`Found ${recurringBillables.length} recurring billables`);

      const today = startOfDay(new Date());
      const checkUntilDate = addDays(today, CONFIG.CHECK_DAYS_AHEAD);

      const invoicesToCreate: Array<
        Invoice & {
          tenantPaystackCustomerId: string;
        }
      > = [];
      const skippedInvoices: {
        billableId: string;
        description: string;
        error: string;
      }[] = [];

      for (const billable of recurringBillables) {
        try {
          // Calculate next invoice due date based on lease start date and cycle
          const nextInvoiceDate = calculateNextInvoiceDate(
            billable.startDate,
            billable.cycle
          );

          // Check if the next invoice is due within the configured period
          if (
            !isBefore(nextInvoiceDate, today) &&
            !isAfter(nextInvoiceDate, checkUntilDate)
          ) {
            // Check if an invoice already exists for this cycle
            const existingInvoice = await db.invoice.findFirst({
              where: {
                recurringBillableId: billable.id,
                status: {
                  in: ['PENDING', 'OVERDUE'],
                },
                dueDate: {
                  equals: nextInvoiceDate,
                },
              },
            });

            if (!existingInvoice) {
              invoicesToCreate.push({
                id: nanoid(),
                leaseId: billable.leaseId ?? null,
                dueDate: nextInvoiceDate,
                dueAmount: billable.amount,
                category: billable.category,
                description: billable.description,
                tenantId: billable.tenant?.id ?? null,
                tenantPaystackCustomerId:
                  billable.tenant?.paystackCustomerId ?? '',
                recurringBillableId: billable.id,
                status: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date(),
                paystackId: '',
                lineItems: [],
              });
            } else {
              logger.log('Invoice already exists for this cycle', {
                billableId: billable.id,
                dueDate: nextInvoiceDate,
                existingInvoiceId: existingInvoice.id,
              });
            }
          }
        } catch (error) {
          logger.error('Error processing lease for invoice creation', {
            billableId: billable.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          skippedInvoices.push({
            billableId: billable.id,
            description: 'Error processing billable',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      logger.log(
        `Found ${invoicesToCreate.length} invoices to create for the next ${CONFIG.CHECK_DAYS_AHEAD} days`
      );

      for (let i = 0; i < invoicesToCreate.length; i += CONFIG.BATCH_SIZE) {
        const batch = invoicesToCreate.slice(i, i + CONFIG.BATCH_SIZE);

        logger.log(
          `Processing batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1} of ${Math.ceil(invoicesToCreate.length / CONFIG.BATCH_SIZE)}`
        );

        const batchPromises = batch.map(async (invoiceData) => {
          return createInvoiceTask.trigger(
            {
              customer: invoiceData.tenantPaystackCustomerId,
              amount: invoiceData.dueAmount,
              dueDate: invoiceData.dueDate,
              description: invoiceData.description,
              lineItems: [],
              split_code: '',
              leaseId: invoiceData.leaseId,
            },
            {
              idempotencyKey: `create-invoice-${invoiceData.leaseId}-${invoiceData.dueDate}`,
            }
          );
        });

        await Promise.allSettled(batchPromises);

        // Add delay between batches to be respectful to the API
        if (i + CONFIG.BATCH_SIZE < invoicesToCreate.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return {
        message: `Triggered ${invoicesToCreate.length} invoice creation tasks`,
        totalLeasesChecked: recurringBillables.length,
        invoicesToCreate: invoicesToCreate.length,
        invoicesSkipped: skippedInvoices.length,
      };
    } catch (error) {
      logger.error('Error checking upcoming invoices', { error });
      throw error;
    } finally {
      await db.$disconnect();
    }
  },
});
