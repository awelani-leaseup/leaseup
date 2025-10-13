import { schedules, logger, wait } from '@trigger.dev/sdk';
import { db } from '@leaseup/prisma/db.ts';
import {
  InvoiceStatus,
  LeaseStatus,
  SubscriptionPlanStatus,
} from '@leaseup/prisma/client';
import { resend } from '@leaseup/email/utils/resend';
import TenantOverdueInvoices from '@leaseup/email/templates/tenant-overdue-invoices';
import {
  getLandlordTestEmail,
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
    logger.log('Starting overdue invoices check', {
      scheduledTime: payload.timestamp,
      timezone: payload.timezone,
    });

    try {
      const currentDateUTC = new Date(payload.timestamp);
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
          OR: [
            { leaseId: null },
            {
              lease: {
                status: LeaseStatus.ACTIVE,
              },
            },
          ],
        },
      });

      const whereClause: any = {
        status: InvoiceStatus.PENDING,
        dueDate: {
          lt: currentDateUTC,
        },
        OR: [
          { leaseId: null },
          {
            lease: {
              status: LeaseStatus.ACTIVE,
            },
          },
        ],
      };

      if (!isDevelopment) {
        whereClause.landlord = {
          paystackSubscriptionStatus: {
            in: [
              SubscriptionPlanStatus.ACTIVE,
              SubscriptionPlanStatus.NON_RENEWING,
            ],
          },
        };
      }

      const overdueInvoices = await db.invoice.findMany({
        where: whereClause,
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
        `Found ${overdueInvoices.length} overdue invoices${isDevelopment ? ' (subscription check skipped in development)' : ' from landlords with active subscriptions'}`,
        {
          totalOverdueInvoices: totalOverdueCount,
          activeSubscriptionInvoices: overdueInvoices.length,
          filteredOutDueToInactiveSubscription: isDevelopment
            ? 0
            : filteredOutCount,
          subscriptionCheckSkipped: isDevelopment,
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
        let message = 'No overdue invoices found';
        if (totalOverdueCount > 0) {
          message = isDevelopment
            ? 'No overdue invoices found (subscription check skipped in development)'
            : 'No overdue invoices found from landlords with active subscriptions';
        }

        return {
          message,
          totalOverdueInvoices: totalOverdueCount,
          overdueInvoicesCount: 0,
          filteredOutDueToInactiveSubscription: isDevelopment
            ? 0
            : filteredOutCount,
          subscriptionCheckSkipped: isDevelopment,
          invoicesUpdated: 0,
          notificationsSent: 0,
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
            invoices: (typeof overdueInvoices)[0][];
          }
        >
      );

      let notificationsSent = 0;
      const notificationErrors: string[] = [];

      const emailData = Object.entries(invoicesByLandlord).map(
        ([landlordId, { landlord, invoices }]) => {
          const emailAddress = landlord.email;

          // Calculate days overdue for each invoice
          const invoicesWithDaysOverdue = invoices.map((invoice) => {
            const daysOverdue = invoice.dueDate
              ? Math.floor(
                  (currentDateUTC.getTime() - invoice.dueDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : 0;

            return {
              amount: `R ${invoice.dueAmount}`,
              tenantName:
                `${invoice.tenant?.firstName || ''} ${invoice.tenant?.lastName || ''}`.trim(),
              daysOverdue: `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`,
            };
          });

          return {
            landlordId,
            landlord,
            emailPayload: {
              from: 'Leaseup Dev <devdonotreply@leaseup.co.za>',
              to: emailAddress,
              subject: 'Overdue Invoices Alert',
              react: TenantOverdueInvoices({
                landlordName: landlord.name || 'Landlord',
                invoices: invoicesWithDaysOverdue,
                ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices`,
                overdueDate: currentDateUTC.toLocaleDateString(),
              }),
            },
          };
        }
      );

      const BATCH_SIZE = 100;
      const batches = [];
      for (let i = 0; i < emailData.length; i += BATCH_SIZE) {
        batches.push(emailData.slice(i, i + BATCH_SIZE));
      }

      logger.log(
        `Sending ${emailData.length} emails in ${batches.length} batches of up to ${BATCH_SIZE} emails each`
      );

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];

        if (!batch) {
          logger.error(`Batch ${batchIndex + 1} is undefined, skipping`);
          continue;
        }

        try {
          const resendResults = await resend.batch.send(
            batch.map(({ emailPayload }) => emailPayload)
          );

          notificationsSent += batch.length;

          logger.log(
            `Batch ${batchIndex + 1}/${batches.length} sent successfully`,
            {
              batchSize: batch.length,
              totalSentSoFar: notificationsSent,
              result: resendResults,
            }
          );

          if (batchIndex < batches.length - 1) {
            logger.log(`Waiting 5 seconds before sending next batch...`);
            await wait.for({ seconds: 5 });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

          batch.forEach(({ landlordId }) => {
            notificationErrors.push(`Landlord ${landlordId}: ${errorMessage}`);
          });

          logger.error(
            `Failed to send batch ${batchIndex + 1}/${batches.length}`,
            {
              error: errorMessage,
              batchSize: batch.length,
              landlordsAffected: batch.map(({ landlordId }) => landlordId),
            }
          );
        }
      }

      if (notificationsSent > 0) {
        logger.log('All email batches processed', {
          totalEmailsSent: notificationsSent,
          totalBatches: batches.length,
          totalErrors: notificationErrors.length,
        });
      }

      const result = {
        message: 'Overdue invoices check completed',
        totalOverdueInvoices: totalOverdueCount,
        overdueInvoicesCount: overdueInvoices.length,
        filteredOutDueToInactiveSubscription: isDevelopment
          ? 0
          : filteredOutCount,
        subscriptionCheckSkipped: isDevelopment,
        invoicesUpdated: updateResult.count,
        landlordsNotified: Object.keys(invoicesByLandlord).length,
        notificationsSent,
        testEmailsEnabled: isDevelopment,
        notificationErrors:
          notificationErrors.length > 0 ? notificationErrors : undefined,
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
