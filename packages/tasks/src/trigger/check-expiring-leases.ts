import { schedules, logger, wait } from '@trigger.dev/sdk';
import { db } from '@leaseup/prisma/db.ts';
import { LeaseStatus, SubscriptionPlanStatus } from '@leaseup/prisma/client';
import { resend } from '@leaseup/email/utils/resend';
import { ExpiringLeases } from '@leaseup/email/templates/expiring-leases';
import {
  getLandlordTestEmail,
  isDevelopment,
} from '../utils/resend-test-emails';

export const checkExpiringLeasesTask = schedules.task({
  id: 'check-expiring-leases',
  maxDuration: 300, // 5 minutes
  cron: {
    pattern: '0 9 * * *', // Daily at 9:00 AM
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
    logger.log('Starting expiring leases check', {
      scheduledTime: payload.timestamp,
      timezone: payload.timezone,
    });

    try {
      const currentDateUTC = new Date(payload.timestamp);
      currentDateUTC.setUTCHours(0, 0, 0, 0);

      // Calculate exact dates for 30 and 60 days from now
      const thirtyDaysFromNow = new Date(currentDateUTC);
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      thirtyDaysFromNow.setUTCHours(0, 0, 0, 0);

      const thirtyDaysFromNowEnd = new Date(thirtyDaysFromNow);
      thirtyDaysFromNowEnd.setUTCHours(23, 59, 59, 999);

      const sixtyDaysFromNow = new Date(currentDateUTC);
      sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
      sixtyDaysFromNow.setUTCHours(0, 0, 0, 0);

      const sixtyDaysFromNowEnd = new Date(sixtyDaysFromNow);
      sixtyDaysFromNowEnd.setUTCHours(23, 59, 59, 999);

      logger.log('Checking for expiring leases', {
        currentDateUTC: currentDateUTC.toISOString(),
        thirtyDaysFromNow: thirtyDaysFromNow.toISOString(),
        thirtyDaysFromNowEnd: thirtyDaysFromNowEnd.toISOString(),
        sixtyDaysFromNow: sixtyDaysFromNow.toISOString(),
        sixtyDaysFromNowEnd: sixtyDaysFromNowEnd.toISOString(),
      });

      // Count total expiring leases (exactly 30 or 60 days from now)
      const totalExpiringCount = await db.lease.count({
        where: {
          status: LeaseStatus.ACTIVE,
          endDate: {
            not: null,
          },
          OR: [
            {
              endDate: {
                gte: thirtyDaysFromNow,
                lte: thirtyDaysFromNowEnd,
              },
            },
            {
              endDate: {
                gte: sixtyDaysFromNow,
                lte: sixtyDaysFromNowEnd,
              },
            },
          ],
        },
      });

      const whereClause: any = {
        status: LeaseStatus.ACTIVE,
        endDate: {
          not: null,
        },
        OR: [
          {
            endDate: {
              gte: thirtyDaysFromNow,
              lte: thirtyDaysFromNowEnd,
            },
          },
          {
            endDate: {
              gte: sixtyDaysFromNow,
              lte: sixtyDaysFromNowEnd,
            },
          },
        ],
      };

      // In production, only include landlords with active subscriptions
      if (!isDevelopment) {
        whereClause.unit = {
          property: {
            landlord: {
              paystackSubscriptionStatus: {
                in: [
                  SubscriptionPlanStatus.ACTIVE,
                  SubscriptionPlanStatus.NON_RENEWING,
                ],
              },
            },
          },
        };
      }

      const expiringLeases = await db.lease.findMany({
        where: whereClause,
        include: {
          unit: {
            include: {
              property: {
                include: {
                  landlord: {
                    select: {
                      id: true,
                      email: true,
                      name: true,
                      paystackSubscriptionStatus: true,
                    },
                  },
                },
              },
            },
          },
          tenantLease: {
            include: {
              tenant: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      const filteredOutCount = totalExpiringCount - expiringLeases.length;

      logger.log(
        `Found ${expiringLeases.length} expiring leases${isDevelopment ? ' (subscription check skipped in development)' : ' from landlords with active subscriptions'}`,
        {
          totalExpiringLeases: totalExpiringCount,
          activeSubscriptionLeases: expiringLeases.length,
          filteredOutDueToInactiveSubscription: isDevelopment
            ? 0
            : filteredOutCount,
          subscriptionCheckSkipped: isDevelopment,
          comparisonDate: currentDateUTC.toISOString(),
          sampleExpiringLeases: expiringLeases.slice(0, 3).map((lease) => ({
            id: lease.id,
            endDate: lease.endDate?.toISOString(),
            landlordSubscriptionStatus:
              lease.unit?.property?.landlord?.paystackSubscriptionStatus,
          })),
        }
      );

      if (expiringLeases.length === 0) {
        let message = 'No expiring leases found';
        if (totalExpiringCount > 0) {
          message = isDevelopment
            ? 'No expiring leases found (subscription check skipped in development)'
            : 'No expiring leases found from landlords with active subscriptions';
        }

        return {
          message,
          totalExpiringLeases: totalExpiringCount,
          expiringLeasesCount: 0,
          filteredOutDueToInactiveSubscription: isDevelopment
            ? 0
            : filteredOutCount,
          subscriptionCheckSkipped: isDevelopment,
          notificationsSent: 0,
        };
      }

      // Group leases by landlord
      const leasesByLandlord = expiringLeases.reduce(
        (acc, lease) => {
          const landlord = lease.unit?.property?.landlord;
          if (!landlord) return acc;

          const landlordId = landlord.id;
          acc[landlordId] ??= {
            landlord,
            leases: [],
          };

          // Get tenant names from the lease
          const tenantNames = lease.tenantLease
            .map((tl) => `${tl.tenant.firstName} ${tl.tenant.lastName}`.trim())
            .filter(Boolean);

          acc[landlordId].leases.push({
            id: lease.id,
            endDate: lease.endDate!,
            tenantNames:
              tenantNames.length > 0 ? tenantNames : ['Unknown Tenant'],
            unitName: lease.unit?.name || 'Unknown Unit',
            propertyName: lease.unit?.property?.name || 'Unknown Property',
          });

          return acc;
        },
        {} as Record<
          string,
          {
            landlord: { id: string; email: string; name: string | null };
            leases: {
              id: string;
              endDate: Date;
              tenantNames: string[];
              unitName: string;
              propertyName: string;
            }[];
          }
        >
      );

      let notificationsSent = 0;
      const notificationErrors: string[] = [];

      const emailData = Object.entries(leasesByLandlord).map(
        ([landlordId, { landlord, leases }]) => {
          const emailAddress = getLandlordTestEmail(
            landlord.email,
            landlordId,
            'DELIVERED'
          );

          // Format leases for the email template
          const formattedLeases = leases.map((lease) => ({
            tenantName: lease.tenantNames.join(', '),
            expiryDate: lease.endDate.toLocaleDateString('en-ZA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          }));

          return {
            landlordId,
            landlord,
            emailPayload: {
              from: 'Leaseup Dev <devdonotreply@leaseup.co.za>',
              to: emailAddress,
              subject: 'Lease Expiration Alert - Action Required',
              react: ExpiringLeases({
                landlordName: landlord.name || 'Landlord',
                leases: formattedLeases,
                ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/leases`,
                alertDate: currentDateUTC.toLocaleDateString('en-ZA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
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
        message: 'Expiring leases check completed',
        totalExpiringLeases: totalExpiringCount,
        expiringLeasesCount: expiringLeases.length,
        filteredOutDueToInactiveSubscription: isDevelopment
          ? 0
          : filteredOutCount,
        subscriptionCheckSkipped: isDevelopment,
        landlordsNotified: Object.keys(leasesByLandlord).length,
        notificationsSent,
        testEmailsEnabled: isDevelopment,
        notificationErrors:
          notificationErrors.length > 0 ? notificationErrors : undefined,
        processedAt: new Date().toISOString(),
      };

      logger.log('Expiring leases check completed', result);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      logger.error('Error during expiring leases check', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new Error(`Failed to check expiring leases: ${errorMessage}`);
    }
  },
});
