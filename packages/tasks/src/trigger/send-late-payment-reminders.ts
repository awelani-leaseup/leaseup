import { logger, schedules } from '@trigger.dev/sdk/v3';
import { db } from '@leaseup/prisma/db.ts';
import { addDays, startOfDay } from 'date-fns';

/**
 * Send SMS notification to tenant
 * This is a stub function that should be implemented with your SMS service provider
 */
async function sendSmsToTenant(
  phoneNumber: string,
  tenantName: string,
  invoiceDetails: {
    amount: number;
    dueDate: Date;
    propertyName: string;
    unitName: string;
  }
): Promise<boolean> {
  try {
    // TODO: Implement actual SMS sending logic here
    // This could use services like Twilio, AWS SNS, or any other SMS provider

    const message = `Dear ${tenantName}, your rent payment of R${invoiceDetails.amount.toFixed(2)} for ${invoiceDetails.unitName} at ${invoiceDetails.propertyName} was due on ${invoiceDetails.dueDate.toLocaleDateString()}. Please make payment as soon as possible to avoid additional charges.`;

    logger.log('SMS notification sent', {
      phoneNumber,
      tenantName,
      message,
      invoiceDetails,
    });

    // For now, return true to simulate successful SMS sending
    // In production, this should return the actual result from your SMS service
    return true;
  } catch (error) {
    logger.error('Failed to send SMS notification', {
      phoneNumber,
      tenantName,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

export const sendLatePaymentRemindersTask = schedules.task({
  id: 'send-late-payment-reminders',
  maxDuration: 300, // 5 minutes
  cron: {
    // Run at 9am every day Johannesburg time
    pattern: '0 7 * * *',
    timezone: 'Africa/Johannesburg',
  },
  run: async (payload: any, { ctx }: { ctx: any }) => {
    logger.log('Starting late payment reminders check', { payload, ctx });

    try {
      const today = startOfDay(new Date());
      const threeDaysAgo = addDays(today, -3);

      // Find all pending invoices that are overdue by more than 3 days
      const overdueInvoices = await db.invoice.findMany({
        where: {
          status: 'PENDING',
          createdAt: {
            lte: threeDaysAgo, // Invoice was created more than 3 days ago
          },
        },
        include: {
          lease: {
            include: {
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
          },
        },
      });

      logger.log(
        `Found ${overdueInvoices.length} invoices overdue by more than 3 days`
      );

      const notificationsSent: Array<{
        invoiceId: string;
        tenantId: string;
        tenantName: string;
        phoneNumber: string;
        amount: number;
        dueDate: Date;
        propertyName: string;
        unitName: string;
        smsSent: boolean;
      }> = [];

      // Send notifications for each overdue invoice
      for (const invoice of overdueInvoices) {
        const lease = invoice.lease;
        const tenants = lease.tenantLease;

        for (const tenantLease of tenants) {
          const tenant = tenantLease.tenant;
          const propertyName = lease.unit?.property?.name || 'Unknown Property';
          const unitName = lease.unit?.name || 'Unknown Unit';

          try {
            const smsSent = await sendSmsToTenant(
              tenant.phone,
              `${tenant.firstName} ${tenant.lastName}`,
              {
                amount: invoice.dueAmount,
                dueDate: invoice.createdAt,
                propertyName,
                unitName,
              }
            );

            notificationsSent.push({
              invoiceId: invoice.id,
              tenantId: tenant.id,
              tenantName: `${tenant.firstName} ${tenant.lastName}`,
              phoneNumber: tenant.phone,
              amount: invoice.dueAmount,
              dueDate: invoice.createdAt,
              propertyName,
              unitName,
              smsSent,
            });

            logger.log('Processed overdue invoice notification', {
              invoiceId: invoice.id,
              tenantId: tenant.id,
              tenantName: `${tenant.firstName} ${tenant.lastName}`,
              phoneNumber: tenant.phone,
              amount: invoice.dueAmount,
              smsSent,
            });
          } catch (error) {
            logger.error('Failed to process overdue invoice notification', {
              invoiceId: invoice.id,
              tenantId: tenant.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            });

            notificationsSent.push({
              invoiceId: invoice.id,
              tenantId: tenant.id,
              tenantName: `${tenant.firstName} ${tenant.lastName}`,
              phoneNumber: tenant.phone,
              amount: invoice.dueAmount,
              dueDate: invoice.createdAt,
              propertyName,
              unitName,
              smsSent: false,
            });
          }
        }
      }

      // Update invoice status to OVERDUE for invoices that are overdue
      const overdueInvoiceIds = overdueInvoices.map((invoice) => invoice.id);
      if (overdueInvoiceIds.length > 0) {
        await db.invoice.updateMany({
          where: {
            id: {
              in: overdueInvoiceIds,
            },
          },
          data: {
            status: 'OVERDUE',
          },
        });

        logger.log(
          `Updated ${overdueInvoiceIds.length} invoices to OVERDUE status`
        );
      }

      const successfulNotifications = notificationsSent.filter(
        (n) => n.smsSent
      ).length;
      const failedNotifications = notificationsSent.filter(
        (n) => !n.smsSent
      ).length;

      return {
        message: `Processed ${notificationsSent.length} overdue invoice notifications`,
        totalInvoicesChecked: overdueInvoices.length,
        totalNotificationsSent: notificationsSent.length,
        successfulNotifications,
        failedNotifications,
        notificationsSent,
      };
    } catch (error) {
      logger.error('Error processing late payment reminders', { error });
      throw error;
    } finally {
      await db.$disconnect();
    }
  },
});
