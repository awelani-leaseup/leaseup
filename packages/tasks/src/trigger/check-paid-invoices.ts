import { schedules, logger } from '@trigger.dev/sdk';
import { db } from '@leaseup/prisma/db.ts';
import { InvoiceStatus, SubscriptionPlanStatus } from '@leaseup/prisma/client';
import { resend } from '@leaseup/email/utils/resend';
import LandlordInvoicePaid from '@leaseup/email/templates/landlord-invoice-paid';
import {
  getInvoiceTestEmail,
  logTestEmailUsage,
  isDevelopment,
} from '../utils/resend-test-emails';

export const checkPaidInvoicesTask = schedules.task({
  id: 'check-paid-invoices',
  maxDuration: 300,
  cron: {
    pattern: '0 8 * * *',
    timezone: 'Africa/Johannesburg',
  },
  run: async (payload) => {
    logger.log('Starting daily paid invoices check', {
      timestamp: payload.timestamp,
      timezone: payload.timezone,
    });

    try {
      const yesterday = new Date(payload.timestamp);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setUTCHours(0, 0, 0, 0);

      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setUTCHours(23, 59, 59, 999);

      logger.log('Checking for invoices paid yesterday', {
        startDate: yesterday.toISOString(),
        endDate: endOfYesterday.toISOString(),
      });

      const whereClause: any = {
        status: InvoiceStatus.PAID,
        updatedAt: {
          gte: yesterday,
          lte: endOfYesterday,
        },
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

      const paidInvoices = await db.invoice.findMany({
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
          transactions: {
            where: {
              createdAt: {
                gte: yesterday,
                lte: endOfYesterday,
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
        orderBy: [{ landlordId: 'asc' }, { updatedAt: 'desc' }],
      });

      logger.log(`Found ${paidInvoices.length} paid invoices to process`);

      if (paidInvoices.length === 0) {
        return {
          message: 'No paid invoices found for yesterday',
          emailsSent: 0,
          landlordCount: 0,
        };
      }

      const invoicesByLandlord = new Map<string, typeof paidInvoices>();

      for (const invoice of paidInvoices) {
        const landlordId = invoice.landlordId;
        if (!invoicesByLandlord.has(landlordId)) {
          invoicesByLandlord.set(landlordId, []);
        }
        invoicesByLandlord.get(landlordId)!.push(invoice);
      }

      logger.log(`Grouped invoices for ${invoicesByLandlord.size} landlords`);

      let emailsSent = 0;
      let emailsFailed = 0;

      for (const [landlordId, landlordInvoices] of invoicesByLandlord) {
        try {
          const landlord = landlordInvoices[0]?.landlord;

          if (!landlord) {
            logger.warn('No landlord found for invoices', { landlordId });
            emailsFailed++;
            continue;
          }

          const paidInvoicesData = landlordInvoices.map((invoice) => ({
            tenantName: `${invoice.tenant.firstName} ${invoice.tenant.lastName}`,
            amount: new Intl.NumberFormat('en-ZA', {
              style: 'currency',
              currency: 'ZAR',
            }).format(invoice.dueAmount),
            datePaid: (
              invoice.transactions[0]?.createdAt ?? invoice.updatedAt
            ).toLocaleDateString('en-ZA'),
          }));

          const totalAmount = landlordInvoices.reduce(
            (sum, invoice) => sum + invoice.dueAmount,
            0
          );
          const formattedTotalAmount = new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
          }).format(totalAmount);

          const reportDate = yesterday.toLocaleDateString('en-ZA');
          const ctaUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invoices?status=PAID`;

          const recipientEmail = landlord.email;

          await resend.emails.send({
            from: 'LeaseUp <notifications@leaseup.co.za>',
            to: [recipientEmail],
            subject: `Daily Payment Report - ${reportDate}`,
            react: LandlordInvoicePaid({
              landlordName: landlord.name || 'Landlord',
              paidInvoices: paidInvoicesData,
              ctaUrl,
              reportDate,
              totalAmount: formattedTotalAmount,
            }),
          });

          if (isDevelopment) {
            logTestEmailUsage(
              landlord.email,
              recipientEmail,
              `Daily paid invoices report for landlord ${landlord.id}`
            );
          }

          emailsSent++;

          logger.log('Sent paid invoices email', {
            landlordId: landlord.id,
            landlordEmail: isDevelopment ? recipientEmail : landlord.email,
            invoiceCount: landlordInvoices.length,
            totalAmount: formattedTotalAmount,
          });
        } catch (error) {
          emailsFailed++;
          logger.error('Failed to send paid invoices email', {
            landlordId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      const result = {
        message: `Processed paid invoices for ${invoicesByLandlord.size} landlords`,
        date: yesterday.toLocaleDateString('en-ZA'),
        totalInvoices: paidInvoices.length,
        landlordCount: invoicesByLandlord.size,
        emailsSent,
        emailsFailed,
        successRate:
          invoicesByLandlord.size > 0
            ? ((emailsSent / invoicesByLandlord.size) * 100).toFixed(2) + '%'
            : '0%',
      };

      logger.log('Completed daily paid invoices check', result);

      return result;
    } catch (error) {
      logger.error('Fatal error in paid invoices check', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      await db.$disconnect();
      logger.log('Database connection closed');
    }
  },
});
