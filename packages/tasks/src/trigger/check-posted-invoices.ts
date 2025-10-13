import { schedules, logger, wait } from '@trigger.dev/sdk';
import { db } from '@leaseup/prisma/db.ts';
import {
  InvoiceStatus,
  LeaseStatus,
  SubscriptionPlanStatus,
} from '@leaseup/prisma/client';
import { resend } from '@leaseup/email/utils/resend';
import LandlordPostedInvoices from '@leaseup/email/templates/landlord-posted-invoices';
import {
  getLandlordTestEmail,
  isDevelopment,
} from '../utils/resend-test-emails';

export const checkPostedInvoicesTask = schedules.task({
  id: 'check-posted-invoices',
  maxDuration: 300, // 5 minutes
  cron: {
    pattern: '0 6 * * *', // Daily at 6:00 AM
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
    logger.log('Starting posted invoices check', {
      scheduledTime: payload.timestamp,
      timezone: payload.timezone,
    });

    logger.log('Payload', {
      key: process.env.POSTGRES_PRISMA_URL ?? 'No URL',
    });

    try {
      const currentDateUTC = new Date(payload.timestamp);
      currentDateUTC.setUTCHours(0, 0, 0, 0);

      const yesterdayStartUTC = new Date(currentDateUTC);
      yesterdayStartUTC.setUTCDate(yesterdayStartUTC.getUTCDate() - 1);

      const yesterdayEndUTC = new Date(currentDateUTC);
      yesterdayEndUTC.setUTCMilliseconds(-1); // End of yesterday

      logger.log('Checking for invoices posted yesterday', {
        yesterdayStartUTC: yesterdayStartUTC.toISOString(),
        yesterdayEndUTC: yesterdayEndUTC.toISOString(),
        currentDateUTC: currentDateUTC.toISOString(),
      });

      const totalPostedCount = await db.invoice.count({
        where: {
          createdAt: {
            gte: yesterdayStartUTC,
            lt: currentDateUTC,
          },
          status: {
            in: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE],
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
        createdAt: {
          gte: yesterdayStartUTC,
          lt: currentDateUTC,
        },
        status: {
          in: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE],
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

      const postedInvoices = await db.invoice.findMany({
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

      const filteredOutCount = totalPostedCount - postedInvoices.length;

      logger.log(
        `Found ${postedInvoices.length} posted invoices${isDevelopment ? ' (subscription check skipped in development)' : ' from landlords with active subscriptions'}`,
        {
          totalPostedInvoices: totalPostedCount,
          activeSubscriptionInvoices: postedInvoices.length,
          filteredOutDueToInactiveSubscription: isDevelopment
            ? 0
            : filteredOutCount,
          subscriptionCheckSkipped: isDevelopment,
          dateRange: {
            from: yesterdayStartUTC.toISOString(),
            to: yesterdayEndUTC.toISOString(),
          },
          samplePostedInvoices: postedInvoices.slice(0, 3).map((inv) => ({
            id: inv.id,
            createdAt: inv.createdAt.toISOString(),
            description: inv.description.substring(0, 50),
            status: inv.status,
            landlordSubscriptionStatus: inv.landlord.paystackSubscriptionStatus,
          })),
        }
      );

      if (postedInvoices.length === 0) {
        let message = 'No invoices were posted yesterday';
        if (totalPostedCount > 0) {
          message = isDevelopment
            ? 'No posted invoices found (subscription check skipped in development)'
            : 'No posted invoices found from landlords with active subscriptions';
        }

        return {
          message,
          totalPostedInvoices: totalPostedCount,
          postedInvoicesCount: 0,
          filteredOutDueToInactiveSubscription: isDevelopment
            ? 0
            : filteredOutCount,
          subscriptionCheckSkipped: isDevelopment,
          notificationsSent: 0,
        };
      }

      const invoicesByLandlord = postedInvoices.reduce(
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
            invoices: (typeof postedInvoices)[0][];
          }
        >
      );

      let notificationsSent = 0;
      const notificationErrors: string[] = [];

      const emailData = Object.entries(invoicesByLandlord).map(
        ([landlordId, { landlord, invoices }]) => {
          const emailAddress = landlord.email;

          return {
            landlordId,
            landlord,
            emailPayload: {
              from: 'Leaseup Dev <devdonotreply@leaseup.co.za>',
              to: emailAddress,
              subject: 'Invoices Sent',
              react: LandlordPostedInvoices({
                landlordName: landlord.name || 'Landlord',
                invoices: invoices.map((invoice) => ({
                  amount: `R ${invoice.dueAmount}`,
                  tenantName:
                    `${invoice.tenant?.firstName || ''} ${invoice.tenant?.lastName || ''}`.trim(),
                })),
                ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices`,
                datePosted: yesterdayStartUTC.toLocaleDateString(),
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
        message: 'Posted invoices check completed',
        totalPostedInvoices: totalPostedCount,
        postedInvoicesCount: postedInvoices.length,
        filteredOutDueToInactiveSubscription: isDevelopment
          ? 0
          : filteredOutCount,
        subscriptionCheckSkipped: isDevelopment,
        landlordsNotified: Object.keys(invoicesByLandlord).length,
        notificationsSent,
        testEmailsEnabled: isDevelopment,
        notificationErrors:
          notificationErrors.length > 0 ? notificationErrors : undefined,
      };

      logger.log('Posted invoices check completed', result);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      logger.error('Error during posted invoices check', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new Error(`Failed to check posted invoices: ${errorMessage}`);
    }
  },
});
