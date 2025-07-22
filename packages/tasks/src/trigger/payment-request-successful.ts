import { logger, task } from '@trigger.dev/sdk/v3';
import { db } from '@leaseup/prisma/db.ts';
import { InvoiceStatus } from '@leaseup/prisma/client/client.js';
import { nanoid } from 'nanoid';

type PaymentRequestSuccessfulPayload = {
  event: string;
  data: {
    id: number;
    domain: string;
    amount: number;
    currency: string;
    due_date: string | null;
    has_invoice: boolean;
    invoice_number: string | null;
    description: string;
    pdf_url: string | null;
    line_items: any[];
    tax: any[];
    request_code: string;
    status: string;
    paid: boolean;
    paid_at: string;
    metadata: any;
    notifications: Array<{
      sent_at: string;
      channel: string;
    }>;
    offline_reference: string;
    customer: number;
    created_at: string;
  };
};

export const paymentRequestSuccessfulTask = task({
  id: 'payment-request-successful',
  maxDuration: 60 * 5, // 5 minutes
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000 * 60,
    maxTimeoutInMs: 1000 * 60 * 5,
    randomize: true,
  },
  run: async (
    payload: PaymentRequestSuccessfulPayload,
    { ctx }: { ctx: any }
  ) => {
    logger.log(`Processing ${payload.event} event`, {
      requestCode: payload.data.request_code,
      amount: payload.data.amount,
      currency: payload.data.currency,
      paidAt: payload.data.paid_at,
      ctx,
    });

    try {
      const invoice = await db.invoice.findFirst({
        where: {
          paystackId: payload.data.request_code,
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

      if (!invoice) {
        logger.warn('Invoice not found for Paystack request code', {
          requestCode: payload.data.request_code,
        });
        throw new Error(
          `Invoice not found for Paystack request code: ${payload.data.request_code}`
        );
      }

      if (invoice.status === InvoiceStatus.PAID) {
        logger.log('Invoice is already marked as paid', {
          invoiceId: invoice.id,
          requestCode: payload.data.request_code,
        });
        return {
          message: 'Invoice already marked as paid',
          invoiceId: invoice.id,
          status: 'already_paid',
        };
      }

      // Convert Paystack amount from kobo to the main currency unit
      // Paystack amounts are in kobo (smallest currency unit)
      const amountPaid = payload.data.amount / 100;

      const invoiceStatus =
        amountPaid === invoice.dueAmount
          ? InvoiceStatus.PAID
          : InvoiceStatus.PARTIALLY_PAID;

      await db.invoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          status: invoiceStatus,
          updatedAt: new Date(payload.data.paid_at),
        },
      });

      logger.log(`Invoice status updated to ${invoiceStatus}`, {
        invoiceId: invoice.id,
        requestCode: payload.data.request_code,
        dueAmount: invoice.dueAmount,
        amountPaid,
      });

      const transaction = await db.transactions.create({
        data: {
          id: nanoid(),
          leaseId: invoice.leaseId,
          invoiceId: invoice.id,
          description: `Payment received for ${invoice.description}`,
          amountPaid: amountPaid,
          referenceId:
            payload.data.offline_reference || payload.data.request_code,
          createdAt: new Date(payload.data.paid_at),
          updatedAt: new Date(),
        },
      });

      logger.log('Transaction record created', {
        transactionId: transaction.id,
        invoiceId: invoice.id,
        amountPaid,
        referenceId: transaction.referenceId,
      });

      // Get tenant information for logging
      const tenant = invoice.lease?.tenantLease[0]?.tenant;
      const property = invoice.lease?.unit?.property;

      logger.log('Payment processed successfully', {
        invoiceId: invoice.id,
        transactionId: transaction.id,
        tenantName: tenant
          ? `${tenant.firstName} ${tenant.lastName}`
          : 'Unknown',
        propertyName: property?.name || 'Unknown',
        unitName: invoice.lease?.unit?.name || 'Unknown',
        amountPaid,
        currency: payload.data.currency,
        paidAt: payload.data.paid_at,
      });

      return {
        message: 'Payment processed successfully',
        invoiceId: invoice.id,
        transactionId: transaction.id,
        amountPaid,
        currency: payload.data.currency,
        status: 'success',
      };
    } catch (error) {
      logger.error('Failed to process payment request successful event', {
        requestCode: payload.data.request_code,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error; // Re-throw to trigger retry
    } finally {
      await db.$disconnect();
    }
  },
});
