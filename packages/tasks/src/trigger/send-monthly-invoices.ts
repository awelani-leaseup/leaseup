import { logger, schedules } from '@trigger.dev/sdk/v3';
import { db } from '@leaseup/prisma/db.ts';
import { addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import * as v from 'valibot';
import { createInvoiceTask } from './invoice-send';
import { calculateNextInvoiceDate } from '../utils/calculate-next-invoice-date';

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
      // Get all leases with automatic invoices enabled
      const leasesWithAutoInvoices = await db.lease.findMany({
        where: {
          automaticInvoice: true,
          status: 'ACTIVE',
        },
        include: {
          invoice: true,
          unit: {
            include: {
              property: true,
            },
          },
          tenantLease: {
            include: {
              tenant: true,
            },
          },
        },
      });

      logger.log(
        `Found ${leasesWithAutoInvoices.length} leases with automatic invoices enabled`
      );

      const today = startOfDay(new Date());
      const checkUntilDate = addDays(today, CONFIG.CHECK_DAYS_AHEAD);

      const invoicesToCreate: Array<{
        leaseId: string;
        nextInvoiceDate: Date;
        rent: number;
        currency: string;
        unitName: string;
        propertyName: string;
        tenants: Array<{
          id: string;
          name: string;
          email: string;
          paystackCustomerId?: string;
        }>;
      }> = [];

      const skippedInvoices: Array<{
        leaseId: string;
        reason: string;
        details?: any;
      }> = [];

      for (const lease of leasesWithAutoInvoices) {
        try {
          // Calculate next invoice due date based on lease start date and cycle
          const nextInvoiceDate = calculateNextInvoiceDate(
            lease.startDate,
            lease.invoiceCycle,
            lease.leaseType
          );

          // Check if the next invoice is due within the configured period
          if (
            !isBefore(nextInvoiceDate, today) &&
            !isAfter(nextInvoiceDate, checkUntilDate)
          ) {
            // Check if an invoice already exists for this cycle
            const existingInvoice = await db.invoice.findFirst({
              where: {
                leaseId: lease.id,
                status: {
                  in: ['PENDING', 'OVERDUE'],
                },
              },
            });

            if (!existingInvoice) {
              // Validate lease has required data
              if (!lease.unit) {
                skippedInvoices.push({
                  leaseId: lease.id,
                  reason: 'No unit associated with lease',
                });
                continue;
              }

              if (lease.tenantLease.length === 0) {
                skippedInvoices.push({
                  leaseId: lease.id,
                  reason: 'No tenants associated with lease',
                });
                continue;
              }

              invoicesToCreate.push({
                leaseId: lease.id,
                nextInvoiceDate,
                rent: lease.rent,
                currency: 'ZAR',
                unitName: lease.unit?.name || 'Unknown',
                propertyName: lease.unit?.property?.name || 'Unknown',
                tenants: lease.tenantLease.map((tl) => ({
                  id: tl.tenant.id,
                  name: `${tl.tenant.firstName} ${tl.tenant.lastName}`,
                  email: tl.tenant.email,
                  paystackCustomerId: tl.tenant.paystackCustomerId || undefined,
                })),
              });
            } else {
              logger.log('Invoice already exists for this cycle', {
                leaseId: lease.id,
                dueDate: nextInvoiceDate,
                existingInvoiceId: existingInvoice.id,
              });
            }
          }
        } catch (error) {
          logger.error('Error processing lease for invoice creation', {
            leaseId: lease.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          skippedInvoices.push({
            leaseId: lease.id,
            reason: 'Error processing lease',
            details: error instanceof Error ? error.message : 'Unknown error',
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
          return await createInvoiceTask.trigger({
            customer: invoiceData.tenants?.[0]?.paystackCustomerId ?? '',
            amount: invoiceData.rent,
            dueDate: invoiceData.nextInvoiceDate,
            description: `Rent for ${invoiceData.unitName} - ${invoiceData.propertyName}`,
            lineItems: [],
            split_code: '',
            leaseId: invoiceData.leaseId,
          });
        });

        await Promise.allSettled(batchPromises);

        // Add delay between batches to be respectful to the API
        if (i + CONFIG.BATCH_SIZE < invoicesToCreate.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return {
        message: `Triggered ${invoicesToCreate.length} invoice creation tasks`,
        totalLeasesChecked: leasesWithAutoInvoices.length,
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
