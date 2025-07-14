import { logger, schedules } from '@trigger.dev/sdk/v3';
import { db } from '@leaseup/prisma/db.ts';
import { createInvoice } from '@leaseup/paystack/invoice';
import { addDays, addMonths, isAfter, isBefore, startOfDay } from 'date-fns';
import { nanoid } from 'nanoid';

export const checkUpcomingInvoicesTask = schedules.task({
  id: 'check-upcoming-invoices',
  maxDuration: 300, // 5 minutes
  cron: {
    //7am every day Johannesburg time
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
      const fiveDaysFromNow = addDays(today, 50);

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
        }>;
      }> = [];

      const createdInvoices: Array<{
        id: string;
        leaseId: string;
        amount: number;
        currency: string;
      }> = [];

      for (const lease of leasesWithAutoInvoices) {
        // Calculate next invoice due date based on lease start date and cycle
        const nextInvoiceDate = calculateNextInvoiceDate(
          lease.startDate,
          lease.invoiceCycle,
          lease.leaseType
        );

        // Check if the next invoice is due within the next 50 days
        if (
          !isBefore(nextInvoiceDate, today) &&
          !isAfter(nextInvoiceDate, fiveDaysFromNow)
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
      }

      const days = 50;

      logger.log(
        `Found ${invoicesToCreate.length} invoices to create for the next ${days} days`
      );

      // Create invoices for each lease that needs one
      for (const invoiceData of invoicesToCreate) {
        try {
          const resp: any = await createInvoice({
            customer: 'CUS_8jb0ozhu6wpknbk',
            amount: Math.round(invoiceData.rent * 100), // convert to cents
            currency: 'ZAR',
            dueDate: invoiceData.nextInvoiceDate,
            description: `Rent for ${invoiceData.unitName} - ${invoiceData.propertyName}`,
          });

          logger.log('Created invoice', { resp });

          const newInvoice = await db.invoice.create({
            data: {
              id: nanoid(),
              leaseId: invoiceData.leaseId,
              description: `Rent for ${invoiceData.unitName} - ${invoiceData.propertyName}`,
              dueAmount: invoiceData.rent,
              category: 'RENT',
              status: 'PENDING',
              paystackId: resp?.data?.request_code,
            },
          });

          createdInvoices.push({
            id: newInvoice.id,
            leaseId: invoiceData.leaseId,
            amount: newInvoice.dueAmount,
            currency: invoiceData.currency,
          });

          logger.log('Created new invoice', {
            invoiceId: newInvoice.id,
            leaseId: invoiceData.leaseId,
            amount: newInvoice.dueAmount,
            currency: invoiceData.currency,
            unit: invoiceData.unitName,
            property: invoiceData.propertyName,
            tenants: invoiceData.tenants,
          });
        } catch (error) {
          logger.error('Failed to create invoice', {
            leaseId: invoiceData.leaseId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return {
        message: `Created ${createdInvoices.length} new invoices out of ${invoicesToCreate.length} that needed creation`,
        createdInvoices,
        totalLeasesChecked: leasesWithAutoInvoices.length,
        invoicesToCreate: invoicesToCreate.length,
        invoicesCreated: createdInvoices.length,
      };
    } catch (error) {
      logger.error('Error checking upcoming invoices', { error });
      throw error;
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
