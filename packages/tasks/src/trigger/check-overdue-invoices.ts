import { schedules, logger } from '@trigger.dev/sdk';
import { db } from '@leaseup/prisma/db.ts';
import { Invoice, InvoiceStatus } from '@leaseup/prisma/client/index.js';
import { novu } from '@leaseup/novu/client.ts';

export const checkOverdueInvoicesTask = schedules.task({
  id: 'check-overdue-invoices',
  maxDuration: 300, // 5 minutes
  cron: {
    pattern: '0 8 * * *', // Daily at 8:00 AM
    timezone: 'Africa/Johannesburg', // Using South African timezone
  },
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    randomize: true,
  },
  run: async (payload) => {
    const startTime = Date.now();

    logger.log('Starting overdue invoices check', {
      scheduledTime: payload.timestamp,
      timezone: payload.timezone,
    });

    try {
      const currentDateUTC = new Date();
      currentDateUTC.setUTCHours(0, 0, 0, 0);

      logger.log('Checking for overdue invoices', {
        currentDateUTC: currentDateUTC.toISOString(),
        currentDateUTCString: currentDateUTC.toDateString(),
      });

      const overdueInvoices = await db.invoice.findMany({
        where: {
          status: InvoiceStatus.PENDING,
          dueDate: {
            lt: currentDateUTC,
          },
        },
        include: {
          landlord: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          lease: {
            include: {
              unit: {
                include: {
                  property: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      logger.log(`Found ${overdueInvoices.length} overdue invoices`, {
        count: overdueInvoices.length,
        comparisonDate: currentDateUTC.toISOString(),
        sampleOverdueInvoices: overdueInvoices.slice(0, 3).map((inv) => ({
          id: inv.id,
          dueDate: inv.dueDate?.toISOString(),
          description: inv.description.substring(0, 50),
        })),
      });

      if (overdueInvoices.length === 0) {
        const endTime = Date.now();
        return {
          message: 'No overdue invoices found',
          overdueInvoicesCount: 0,
          invoicesUpdated: 0,
          notificationsSent: 0,
          durationMs: endTime - startTime,
        };
      }

      const updateResult = await db.invoice.updateMany({
        where: {
          id: {
            in: overdueInvoices.map((invoice) => invoice.id),
          },
        },
        data: {
          status: InvoiceStatus.OVERDUE,
        },
      });

      logger.log(`Updated ${updateResult.count} invoices to OVERDUE status`);

      const invoicesByLandlord = overdueInvoices.reduce(
        (acc, invoice) => {
          const landlordId = invoice.landlordId;
          acc[landlordId] ??= {
            landlord: invoice.landlord,
            invoices: [],
          };
          acc[landlordId].invoices.push(invoice);
          return acc;
        },
        {} as Record<
          string,
          {
            landlord: { id: string; email: string; name: string | null };
            invoices: Invoice[];
          }
        >
      );

      let notificationsSent = 0;
      const notificationErrors: string[] = [];

      try {
        const events = Object.entries(invoicesByLandlord).map(
          ([landlordId, { landlord, invoices }]) => ({
            workflowId: 'landlord-overdue-invoices',
            to: landlord.id,
            payload: {
              landlordName: landlord.name || 'Landlord',
              overdueInvoicesCount: invoices.length,
              ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices`,
            },
            overrides: {},
          })
        );

        logger.log('Sending bulk notifications', {
          eventCount: events.length,
          landlords: events.map((event) => ({
            subscriberId: event.to,
            overdueCount: event.payload.overdueInvoicesCount,
          })),
        });

        const result = await novu.triggerBulk({
          events,
        });

        notificationsSent = events.length;

        logger.log('Bulk notifications sent successfully', {
          eventCount: events.length,
          result: result,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        Object.entries(invoicesByLandlord).forEach(
          ([landlordId, { landlord }]) => {
            notificationErrors.push(`Landlord ${landlordId}: ${errorMessage}`);
          }
        );

        logger.error('Failed to send bulk notifications', {
          error: errorMessage,
          landlordsAffected: Object.keys(invoicesByLandlord).length,
        });
      }

      const endTime = Date.now();
      const result = {
        message: 'Overdue invoices check completed',
        overdueInvoicesCount: overdueInvoices.length,
        invoicesUpdated: updateResult.count,
        landlordsNotified: Object.keys(invoicesByLandlord).length,
        notificationsSent,
        notificationErrors:
          notificationErrors.length > 0 ? notificationErrors : undefined,
        durationMs: endTime - startTime,
        processedAt: new Date().toISOString(),
      };

      logger.log('Overdue invoices check completed', result);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      logger.error('Error during overdue invoices check', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new Error(`Failed to check overdue invoices: ${errorMessage}`);
    }
  },
});
