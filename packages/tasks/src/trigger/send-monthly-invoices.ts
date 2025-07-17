import { logger, schedules, task } from '@trigger.dev/sdk/v3';
import { db } from '@leaseup/prisma/db.ts';
import { createInvoice, createCustomer } from '@leaseup/paystack/invoice';
import { addDays, addMonths, isAfter, isBefore, startOfDay } from 'date-fns';
import { nanoid } from 'nanoid';

// Configuration constants
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

      // Process invoices in batches to avoid overwhelming the API
      for (let i = 0; i < invoicesToCreate.length; i += CONFIG.BATCH_SIZE) {
        const batch = invoicesToCreate.slice(i, i + CONFIG.BATCH_SIZE);

        logger.log(
          `Processing batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1} of ${Math.ceil(invoicesToCreate.length / CONFIG.BATCH_SIZE)}`
        );

        // Trigger individual invoice creation tasks for each invoice in the batch
        const batchPromises = batch.map(async (invoiceData) => {
          return await createInvoiceTask.trigger({
            invoiceData,
          });
        });

        const batchResults = await Promise.allSettled(batchPromises);

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

// Separate task for creating individual invoices with built-in retry logic
export const createInvoiceTask = task({
  id: 'create-invoice',
  maxDuration: 60, // 1 minute
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    randomize: true,
  },
  run: async (payload: { invoiceData: any }, { ctx }: { ctx: any }) => {
    const { invoiceData } = payload;

    logger.log('Creating invoice with built-in retry logic', {
      leaseId: invoiceData.leaseId,
      ctx,
    });

    try {
      // Use the first tenant's Paystack customer ID, or create one if it doesn't exist
      const primaryTenant = invoiceData.tenants[0];
      if (!primaryTenant) {
        logger.warn('No tenants found for lease', {
          leaseId: invoiceData.leaseId,
        });
        throw new Error('No tenants found for lease');
      }

      let customerId = primaryTenant.paystackCustomerId;

      if (!customerId) {
        logger.warn('No Paystack customer ID found for tenant', {
          tenantId: primaryTenant.id,
          tenantName: primaryTenant.name,
        });

        const customer = await createCustomer({
          email: primaryTenant.email,
          firstName: primaryTenant.firstName,
          lastName: primaryTenant.lastName,
        });

        customerId = 'CUS_8jb0ozhu6wpknbk';
      }

      const resp: any = await createInvoice({
        customer: customerId,
        amount: Math.round(invoiceData.rent * 100), // convert to cents
        currency: 'ZAR',
        dueDate: invoiceData.nextInvoiceDate,
        description: `Rent for ${invoiceData.unitName} - ${invoiceData.propertyName}`,
      });

      logger.log('Created invoice via Paystack', { resp });

      // Check if Paystack request was successful
      if (!resp.status || resp.status !== 'success') {
        throw new Error(
          `Paystack API error: ${resp.message || 'Unknown error'}`
        );
      }

      const newInvoice = await db.invoice.create({
        data: {
          id: nanoid(),
          leaseId: invoiceData.leaseId,
          description: `Rent for ${invoiceData.unitName} - ${invoiceData.propertyName}`,
          dueAmount: invoiceData.rent,
          dueDate: invoiceData.nextInvoiceDate,
          category: 'RENT',
          status: 'PENDING',
          paystackId: resp?.data?.request_code,
        },
      });

      logger.log('Successfully created invoice', {
        invoiceId: newInvoice.id,
        leaseId: invoiceData.leaseId,
        amount: newInvoice.dueAmount,
        currency: invoiceData.currency,
        unit: invoiceData.unitName,
        property: invoiceData.propertyName,
        tenants: invoiceData.tenants,
      });

      return {
        id: newInvoice.id,
        leaseId: invoiceData.leaseId,
        amount: newInvoice.dueAmount,
        currency: invoiceData.currency,
      };
    } catch (error) {
      logger.error('Failed to create invoice', {
        leaseId: invoiceData.leaseId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error; // Re-throw to trigger retry
    } finally {
      await db.$disconnect();
    }
  },
});

/**
 * Calculate the next invoice due date based on lease start date and cycle
 */
function calculateNextInvoiceDate(
  startDate: Date,
  invoiceCycle: string,
  leaseType: string
): Date {
  const now = startOfDay(new Date());
  const start = startOfDay(new Date(startDate));

  // For monthly cycles
  if (invoiceCycle === 'MONTHLY') {
    let nextDate = new Date(start);

    // Keep adding months until we find a date that's in the future
    while (isBefore(nextDate, now) || nextDate.getTime() === now.getTime()) {
      nextDate = addMonths(nextDate, 1);
    }

    return nextDate;
  }

  // For other cycles, you can add more logic here
  // For now, return the start date if it's in the future, otherwise return today
  return isAfter(start, now) ? start : now;
}
