import { schedules, logger } from '@trigger.dev/sdk';
import { db } from '@leaseup/prisma/db.ts';
import {
  Invoice,
  InvoiceStatus,
  SubscriptionPlanStatus,
} from '@leaseup/prisma/client';
import { novu } from '@leaseup/novu/client.ts';
import {
  getLandlordTestEmail,
  logTestEmailUsage,
  isDevelopment,
} from '../utils/resend-test-emails';

export const checkOverdueInvoicesTask = schedules.task({
  id: 'check-overdue-invoices',
  maxDuration: 300, // 5 minutes
  cron: {
    pattern: '0 8 * * *',
    timezone: 'Africa/Johannesburg',
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

    logger.log('Payload', {
      key: process.env.POSTGRES_PRISMA_URL ?? 'No URL',
    });

    try {
      const currentDateUTC = new Date();
      currentDateUTC.setUTCHours(0, 0, 0, 0);

      logger.log('Checking for overdue invoices', {
        currentDateUTC: currentDateUTC.toISOString(),
        currentDateUTCString: currentDateUTC.toDateString(),
      });

      const totalOverdueCount = await db.invoice.count({
        where: {
          status: InvoiceStatus.PENDING,
          dueDate: {
            lt: currentDateUTC,
          },
        },
      });

      const overdueInvoices = await db.invoice.findMany({
        where: {
          status: InvoiceStatus.PENDING,
          dueDate: {
            lt: currentDateUTC,
          },
          landlord: {
            paystackSubscriptionStatus: {
              in: [
                SubscriptionPlanStatus.ACTIVE,
                SubscriptionPlanStatus.NON_RENEWING,
              ],
            },
          },
        },
        include: {
          landlord: {
            select: {
              id: true,
              email: true,
              name: true,
              paystackSubscriptionStatus: true,
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

      const filteredOutCount = totalOverdueCount - overdueInvoices.length;

      logger.log(
        `Found ${overdueInvoices.length} overdue invoices from landlords with active subscriptions`,
        {
          totalOverdueInvoices: totalOverdueCount,
          activeSubscriptionInvoices: overdueInvoices.length,
          filteredOutDueToInactiveSubscription: filteredOutCount,
          comparisonDate: currentDateUTC.toISOString(),
          sampleOverdueInvoices: overdueInvoices.slice(0, 3).map((inv) => ({
            id: inv.id,
            dueDate: inv.dueDate?.toISOString(),
            description: inv.description.substring(0, 50),
            landlordSubscriptionStatus: inv.landlord.paystackSubscriptionStatus,
          })),
        }
      );

      if (overdueInvoices.length === 0) {
        const endTime = Date.now();
        return {
          message:
            totalOverdueCount > 0
              ? 'No overdue invoices found from landlords with active subscriptions'
              : 'No overdue invoices found',
          totalOverdueInvoices: totalOverdueCount,
          overdueInvoicesCount: 0,
          filteredOutDueToInactiveSubscription: filteredOutCount,
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
            invoices: Omit<Invoice, 'offlineReference'>[];
          }
        >
      );

      let notificationsSent = 0;
      const notificationErrors: string[] = [];

      try {
        const events = Object.entries(invoicesByLandlord).map(
          ([landlordId, { landlord, invoices }]) => {
            // Use Resend test email in development
            const emailAddress = getLandlordTestEmail(
              landlord.email,
              landlordId,
              'DELIVERED'
            );

            // Log test email usage in development
            if (isDevelopment) {
              logTestEmailUsage(
                landlord.email,
                emailAddress,
                `Overdue invoices notification for landlord ${landlordId}`
              );
            }

            return {
              workflowId: 'landlord-overdue-invoices',
              to: {
                subscriberId: landlord.id,
                email: emailAddress, // Use test email in dev, real email in prod
              },
              payload: {
                landlordName: landlord.name || 'Landlord',
                overdueInvoicesCount: invoices.length,
                ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices`,
              },
              overrides: {},
            };
          }
        );

        logger.log('Sending bulk notifications', {
          eventCount: events.length,
          testEmailsEnabled: isDevelopment,
          landlords: events.map((event) => ({
            subscriberId:
              typeof event.to === 'object' ? event.to.subscriberId : event.to,
            email:
              typeof event.to === 'object' ? event.to.email : 'legacy format',
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
        totalOverdueInvoices: totalOverdueCount,
        overdueInvoicesCount: overdueInvoices.length,
        filteredOutDueToInactiveSubscription: filteredOutCount,
        invoicesUpdated: updateResult.count,
        landlordsNotified: Object.keys(invoicesByLandlord).length,
        notificationsSent,
        testEmailsEnabled: isDevelopment,
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
