import { Schema, Effect, Console } from 'effect';
import { InvoiceStatus } from '@leaseup/prisma/client/client.js';
import { nanoid } from 'nanoid';
import { DatabaseServiceLive, DatabaseServiceTag } from './services';
import { novu } from '@leaseup/novu/client.ts';

const PaymentRequestSuccessfulPayload = Schema.Struct({
  event: Schema.String,
  data: Schema.Struct({
    id: Schema.Number,
    domain: Schema.String,
    amount: Schema.Number,
    currency: Schema.String,
    due_date: Schema.Union(Schema.String, Schema.Null),
    has_invoice: Schema.Boolean,
    invoice_number: Schema.Union(Schema.String, Schema.Null),
    description: Schema.String,
    pdf_url: Schema.Union(Schema.String, Schema.Null),
    line_items: Schema.Array(Schema.Any),
    tax: Schema.Array(Schema.Any),
    request_code: Schema.String.pipe(
      Schema.minLength(1, { message: () => 'Request code is required' })
    ),
    status: Schema.String,
    paid: Schema.Boolean,
    paid_at: Schema.String,
    metadata: Schema.Any,
    notifications: Schema.Array(
      Schema.Struct({
        sent_at: Schema.String,
        channel: Schema.String,
      })
    ),
    offline_reference: Schema.String,
    customer: Schema.Number,
    created_at: Schema.String,
  }),
});

export type PaymentRequestSuccessfulPayload = Schema.Schema.Type<
  typeof PaymentRequestSuccessfulPayload
>;

const processPaymentRequestSuccessfulEffect = (
  payload: PaymentRequestSuccessfulPayload
) =>
  Effect.gen(function* () {
    const databaseService = yield* DatabaseServiceTag;

    yield* Console.log(`Processing ${payload.event} event with Effect-TS`, {
      requestCode: payload.data.request_code,
      amount: payload.data.amount,
      currency: payload.data.currency,
      paidAt: payload.data.paid_at,
    });

    const invoice = yield* databaseService.findInvoiceByPaystackId(
      payload.data.request_code
    );

    if (!invoice) {
      yield* Console.warn('Invoice not found for Paystack request code', {
        requestCode: payload.data.request_code,
      });
      yield* Effect.fail(
        new Error(
          `Invoice not found for Paystack request code: ${payload.data.request_code}`
        )
      );
      return;
    }

    if (invoice.status === InvoiceStatus.PAID) {
      yield* Console.log('Invoice is already marked as paid', {
        invoiceId: invoice.id,
        requestCode: payload.data.request_code,
      });
      return {
        message: 'Invoice already marked as paid',
        invoiceId: invoice.id,
        status: 'already_paid',
      };
    }

    const amountPaid = payload.data.amount;

    const invoiceStatus =
      amountPaid === invoice.dueAmount
        ? InvoiceStatus.PAID
        : InvoiceStatus.PARTIALLY_PAID;

    // Update invoice status
    yield* databaseService.updateInvoiceStatus(
      invoice.id,
      invoiceStatus,
      new Date(new Date(payload.data.paid_at).toISOString())
    );

    yield* Console.log(`Invoice status updated to ${invoiceStatus}`, {
      invoiceId: invoice.id,
      requestCode: payload.data.request_code,
      dueAmount: invoice.dueAmount,
      amountPaid,
    });

    const transaction = yield* databaseService.createTransaction({
      id: nanoid(),
      invoice: {
        connect: {
          id: invoice.id,
        },
      },
      description: `Payment received for ${invoice.description ?? ''}`,
      amountPaid: amountPaid / 100,
      referenceId: payload.data.offline_reference || payload.data.request_code,
      createdAt: new Date(new Date(payload.data.paid_at).toISOString()),
      updatedAt: new Date(),
    });

    yield* Console.log('Transaction record created', {
      transactionId: transaction.id,
      invoiceId: invoice.id,
      amountPaid: amountPaid / 100,
      referenceId: transaction.referenceId,
    });

    const tenantId = invoice.tenantId;
    const property = invoice.lease?.unit?.property;
    const landlordId = invoice.landlordId;

    const tenant = yield* databaseService.findTenant(tenantId);
    const landlord = yield* databaseService.findLandlord(landlordId);

    yield* Console.log('Payment processed successfully', {
      invoiceId: invoice.id,
      transactionId: transaction.id,
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown',
      landlordName: landlord ? landlord.name : 'Unknown',
      propertyName: property?.name || 'Unknown',
      unitName: invoice.lease?.unit?.name || 'Unknown',
      amountPaid: amountPaid / 100,
      currency: payload.data.currency,
      paidAt: new Date(new Date(payload.data.paid_at).toISOString()),
    });

    if (landlord) {
      try {
        yield* Effect.tryPromise({
          try: () =>
            novu.trigger({
              to: {
                subscriberId: landlord.id,
                email: landlord.email,
              },
              workflowId: 'acknowledge-payment',
              payload: {
                landlordName: landlord.name || 'Unknown',
                tenantName: tenant
                  ? `${tenant.firstName} ${tenant.lastName}`
                  : 'Unknown',
                propertyName: property?.name || 'Unknown',
                unitName: invoice.lease?.unit?.name || 'Unknown',
                amountPaid: new Intl.NumberFormat('en-ZA', {
                  style: 'currency',
                  currency: 'ZAR',
                }).format(amountPaid / 100), // Convert from kobo/cents to main currency
                transactionId: transaction.id,
                description: invoice.description,
                paidAt: new Date(
                  new Date(payload.data.paid_at).toISOString()
                ).toLocaleDateString(),
                viewTransactionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/transactions/${transaction.id}`,
              },
            }),
          catch: (error) =>
            new Error(`Failed to send Novu notification: ${error}`),
        });

        yield* Console.log('Novu payment acknowledgment notification sent', {
          landlordId: landlord.id,
          landlordEmail: landlord.email,
          transactionId: transaction.id,
        });
      } catch (error) {
        yield* Console.warn(
          'Failed to send Novu notification, but payment was processed successfully',
          {
            error: error instanceof Error ? error.message : 'Unknown error',
            landlordId: landlord.id,
            transactionId: transaction.id,
          }
        );
      }
    }

    return yield* Effect.ensuring(
      Effect.succeed({
        message: 'Payment processed successfully',
        invoiceId: invoice.id,
        transactionId: transaction.id,
        amountPaid: amountPaid / 100,
        currency: payload.data.currency,
        status: 'success',
      }),
      databaseService
        .disconnect()
        .pipe(Effect.orElse(() => Effect.succeed(undefined)))
    );
  }).pipe(
    Effect.provide(DatabaseServiceLive),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Console.error(
          'Failed to process payment request successful event:',
          {
            requestCode: payload.data.request_code,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        );
        return yield* Effect.fail(error);
      })
    )
  );

export const runProcessPaymentRequestSuccessfulEffect = (
  payload: PaymentRequestSuccessfulPayload
) => Effect.runPromise(processPaymentRequestSuccessfulEffect(payload));
