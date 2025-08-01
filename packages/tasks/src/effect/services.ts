import { Schema, Effect, Layer, Context } from 'effect';
import { paystack } from '@leaseup/payments/open-api/client';
import { db } from '@leaseup/prisma/db.ts';
import type { PaymentRequestCreate } from '@leaseup/payments/open-api/paystack';
import { Prisma } from '@leaseup/prisma/client/index.js';
import type {
  Invoice,
  Tenant,
  Transactions,
  InvoiceStatus,
} from '@leaseup/prisma/client/index.js';

export type RecurringBillable = Prisma.RecurringBillableGetPayload<{
  include: {
    tenant: true;
    lease: {
      include: {
        unit: {
          include: {
            property: true;
          };
        };
      };
    };
    invoice: {
      include: {
        landlord: {
          select: {
            paystackSplitGroupId: true;
            id: true;
          };
        };
      };
    };
  };
}>;

class PaystackApiError extends Schema.TaggedError<PaystackApiError>()(
  'PaystackApiError',
  {
    message: Schema.String,
  }
) {}

class DatabaseError extends Schema.TaggedError<DatabaseError>()(
  'DatabaseError',
  {
    message: Schema.String,
  }
) {}

export interface DatabaseService {
  readonly createInvoice: (
    data: Omit<Invoice, 'createdAt' | 'updatedAt'>
  ) => Effect.Effect<Omit<Invoice, 'createdAt' | 'updatedAt'>, DatabaseError>;
  readonly getTenantById: (
    tenantId: string
  ) => Effect.Effect<Tenant | null, DatabaseError, never>;
  readonly getRecurringBillables: Effect.Effect<
    RecurringBillable[],
    DatabaseError,
    never
  >;
  readonly findExistingInvoice: (
    billableId: string,
    dueDate: Date
  ) => Effect.Effect<Invoice | null, DatabaseError, never>;
  readonly findInvoiceByPaystackId: (paystackId: string) => Effect.Effect<
    {
      id: string;
      status: InvoiceStatus;
      dueAmount: number;
      description: string;
      leaseId: string | null;
      lease?: {
        unit?: {
          name?: string | null;
          property?: {
            name?: string | null;
          } | null;
        } | null;
        tenantLease: Array<{
          tenant?: {
            firstName: string;
            lastName: string;
          } | null;
        }>;
      } | null;
    } | null,
    DatabaseError,
    never
  >;
  readonly updateInvoiceStatus: (
    invoiceId: string,
    status: InvoiceStatus,
    updatedAt: Date
  ) => Effect.Effect<void, DatabaseError, never>;
  readonly createTransaction: (
    data: Omit<Transactions, 'updatedAt' | 'createdAt'> & {
      createdAt: Date;
      updatedAt: Date;
    }
  ) => Effect.Effect<
    Omit<Transactions, 'updatedAt' | 'createdAt'> & {
      createdAt: Date;
      updatedAt: Date;
    },
    DatabaseError,
    never
  >;
  readonly findTenant: (tenantId: string) => Effect.Effect<
    {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      paystackCustomerId: string | null;
    } | null,
    DatabaseError,
    never
  >;
  readonly updateTenantPaystackId: (
    tenantId: string,
    paystackCustomerId: string
  ) => Effect.Effect<void, DatabaseError, never>;
  readonly findLandlord: (userId: string) => Effect.Effect<
    {
      id: string;
      name: string | null;
      email: string;
      paystackSubAccountId: string | null;
      paystackSplitGroupId: string | null;
    } | null,
    DatabaseError,
    never
  >;
  readonly updateLandlordPaystackIds: (
    userId: string,
    subaccountId: string,
    splitGroupId: string
  ) => Effect.Effect<void, DatabaseError, never>;
  readonly disconnect: () => Effect.Effect<void, DatabaseError>;
}

export interface PaystackService {
  readonly createPaymentRequest: (
    data: PaymentRequestCreate
  ) => Effect.Effect<{ data?: any }, PaystackApiError>;
  readonly createCustomer: (data: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    metadata: {
      tenant_id: string;
      source: string;
    };
  }) => Effect.Effect<
    { data?: { data?: { customer_code?: string } } },
    PaystackApiError
  >;
  readonly createSubaccount: (data: {
    business_name: string;
    settlement_bank: string;
    account_number: string;
    percentage_charge: number;
    description: string;
    primary_contact_email?: string;
    primary_contact_name?: string;
    primary_contact_phone?: string;
  }) => Effect.Effect<
    { data?: { data?: { subaccount_code?: string } } },
    PaystackApiError
  >;
  readonly createSplit: (data: {
    name: string;
    type: string;
    subaccounts: Array<{ subaccount: string; share: string }>;
    currency: string;
  }) => Effect.Effect<
    { data?: { data?: { split_code?: string } } },
    PaystackApiError
  >;
}

export const DatabaseServiceTag =
  Context.GenericTag<DatabaseService>('DatabaseService');
export const PaystackServiceTag =
  Context.GenericTag<PaystackService>('PaystackService');

export const DatabaseServiceLive = Layer.succeed(DatabaseServiceTag, {
  createInvoice: (data) =>
    Effect.tryPromise({
      try: () =>
        db.invoice.create({
          data: { ...data, lineItems: data.lineItems ?? undefined },
        }),
      catch: (error) =>
        new DatabaseError({
          message:
            error instanceof Error
              ? error.message
              : 'Database operation failed',
        }),
    }),
  getTenantById: (tenantId: string) =>
    Effect.tryPromise({
      try: async () => {
        return db.tenant.findUniqueOrThrow({
          where: { id: tenantId },
        });
      },
      catch: (error) =>
        new DatabaseError({
          message:
            error instanceof Error
              ? error.message
              : 'Database operation failed',
        }),
    }),
  getRecurringBillables: Effect.tryPromise({
    try: async () => {
      return db.recurringBillable.findMany({
        where: {
          isActive: true,
          cycle: 'MONTHLY',
        },
        include: {
          tenant: true,
          lease: {
            include: {
              unit: {
                include: {
                  property: true,
                },
              },
            },
          },
          invoice: {
            include: {
              landlord: {
                select: {
                  paystackSplitGroupId: true,
                  id: true,
                },
              },
            },
          },
        },
      });
    },
    catch: (error) =>
      new DatabaseError({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get recurring billables',
      }),
  }),
  findExistingInvoice: (billableId: string, dueDate: Date) =>
    Effect.tryPromise({
      try: async () => {
        return db.invoice.findFirst({
          where: {
            recurringBillableId: billableId,
            status: {
              in: ['PENDING', 'OVERDUE'],
            },
            dueDate: {
              equals: dueDate,
            },
          },
        });
      },
      catch: (error) =>
        new DatabaseError({
          message:
            error instanceof Error
              ? error.message
              : 'Failed to find existing invoice',
        }),
    }),
  findTenant: (tenantId: string) =>
    Effect.tryPromise({
      try: async () => {
        return db.tenant.findUnique({
          where: { id: tenantId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            paystackCustomerId: true,
          },
        });
      },
      catch: (error) =>
        new DatabaseError({
          message:
            error instanceof Error ? error.message : 'Failed to find tenant',
        }),
    }),
  findInvoiceByPaystackId: (paystackId: string) =>
    Effect.tryPromise({
      try: async () => {
        return db.invoice.findFirst({
          where: {
            paystackId: paystackId,
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
      },
      catch: (error) =>
        new DatabaseError({
          message:
            error instanceof Error
              ? error.message
              : 'Failed to find invoice by Paystack ID',
        }),
    }),
  updateInvoiceStatus: (
    invoiceId: string,
    status: InvoiceStatus,
    updatedAt: Date
  ) =>
    Effect.tryPromise({
      try: async () => {
        await db.invoice.update({
          where: {
            id: invoiceId,
          },
          data: {
            status: status,
            updatedAt: updatedAt,
          },
        });
      },
      catch: (error) =>
        new DatabaseError({
          message:
            error instanceof Error
              ? error.message
              : 'Failed to update invoice status',
        }),
    }),
  createTransaction: (data) =>
    Effect.tryPromise({
      try: async () => {
        return db.transactions.create({
          data: data,
        });
      },
      catch: (error) =>
        new DatabaseError({
          message:
            error instanceof Error
              ? error.message
              : 'Failed to create transaction',
        }),
    }),
  updateTenantPaystackId: (tenantId: string, paystackCustomerId: string) =>
    Effect.tryPromise({
      try: async () => {
        await db.tenant.update({
          where: { id: tenantId },
          data: {
            paystackCustomerId: paystackCustomerId,
          },
        });
      },
      catch: (error) =>
        new DatabaseError({
          message:
            error instanceof Error
              ? error.message
              : 'Failed to update tenant Paystack ID',
        }),
    }),
  findLandlord: (userId: string) =>
    Effect.tryPromise({
      try: async () => {
        return db.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            paystackSubAccountId: true,
            paystackSplitGroupId: true,
          },
        });
      },
      catch: (error) =>
        new DatabaseError({
          message:
            error instanceof Error ? error.message : 'Failed to find landlord',
        }),
    }),
  updateLandlordPaystackIds: (
    userId: string,
    subaccountId: string,
    splitGroupId: string
  ) =>
    Effect.tryPromise({
      try: async () => {
        await db.user.update({
          where: { id: userId },
          data: {
            paystackSubAccountId: subaccountId,
            paystackSplitGroupId: splitGroupId,
          },
        });
      },
      catch: (error) =>
        new DatabaseError({
          message:
            error instanceof Error
              ? error.message
              : 'Failed to update landlord Paystack IDs',
        }),
    }),
  disconnect: () =>
    Effect.tryPromise({
      try: () => db.$disconnect(),
      catch: (error) =>
        new DatabaseError({
          message:
            error instanceof Error
              ? error.message
              : 'Failed to disconnect from database',
        }),
    }),
} satisfies DatabaseService);

export const PaystackServiceLive = Layer.succeed(PaystackServiceTag, {
  createPaymentRequest: (requestData) =>
    Effect.tryPromise({
      try: async () => {
        console.log('Creating payment request with rate limiting awareness', {
          customer: requestData.customer,
          amount: requestData.amount,
          currency: requestData.currency,
        });

        const { data, error, response } = await paystack.POST(
          '/paymentrequest',
          {
            body: {
              ...requestData,
              split_code: requestData.split_code || undefined,
              // line_items: requestData.line_items || [],
            },
          }
        );

        // Enhanced error handling for rate limiting
        if (error) {
          const statusCode = response?.status;
          const errorMessage = error.message || 'Unknown Paystack error';

          if (statusCode === 429) {
            throw new Error(
              `Rate limit exceeded (429): ${errorMessage}. Please reduce request frequency.`
            );
          }

          if (statusCode >= 500) {
            throw new Error(
              `Paystack server error (${statusCode}): ${errorMessage}`
            );
          }

          throw new Error(
            `Paystack API error (${statusCode}): ${errorMessage}`
          );
        }

        console.log('Payment request created successfully', {
          request_code: data?.data?.request_code,
          status: response?.status,
        });

        return { data };
      },
      catch: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Paystack API error: ${error}`;
        console.error('PaystackService error:', errorMessage);

        return new PaystackApiError({
          message: errorMessage,
        });
      },
    }),
  createCustomer: (customerData) =>
    Effect.tryPromise({
      try: async () => {
        console.log('Creating Paystack customer', {
          email: customerData.email,
          first_name: customerData.first_name,
          last_name: customerData.last_name,
        });

        const { data, error, response } = await paystack.POST('/customer', {
          body: {
            email: customerData.email,
            first_name: customerData.first_name,
            last_name: customerData.last_name,
            phone: customerData.phone ?? undefined,
            // @ts-expect-error - Paystack expects an object for metadata, passing a string will throw an error.
            metadata: customerData.metadata,
          },
        });

        if (error) {
          const statusCode = response?.status;
          const errorMessage = error.message || 'Unknown Paystack error';

          if (statusCode === 429) {
            throw new Error(
              `Rate limit exceeded (429): ${errorMessage}. Please reduce request frequency.`
            );
          }

          if (statusCode >= 500) {
            throw new Error(
              `Paystack server error (${statusCode}): ${errorMessage}`
            );
          }

          throw new Error(
            `Paystack API error (${statusCode}): ${errorMessage}`
          );
        }

        console.log('Paystack customer created successfully', {
          customer_code: data?.data?.customer_code,
          status: response?.status,
        });

        return { data };
      },
      catch: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Paystack customer creation error: ${error}`;
        console.error('PaystackService createCustomer error:', errorMessage);

        return new PaystackApiError({
          message: errorMessage,
        });
      },
    }),
  createSubaccount: (subaccountData) =>
    Effect.tryPromise({
      try: async () => {
        console.log('Creating Paystack subaccount', {
          business_name: subaccountData.business_name,
          settlement_bank: subaccountData.settlement_bank,
          account_number: subaccountData.account_number,
        });

        const { data, error, response } = await paystack.POST('/subaccount', {
          body: {
            business_name: subaccountData.business_name,
            settlement_bank: subaccountData.settlement_bank,
            account_number: subaccountData.account_number,
            percentage_charge: subaccountData.percentage_charge,
            description: subaccountData.description,
            primary_contact_email: subaccountData.primary_contact_email,
            primary_contact_name: subaccountData.primary_contact_name,
            primary_contact_phone: subaccountData.primary_contact_phone,
          },
        });

        if (error) {
          const statusCode = response?.status;
          const errorMessage = error.message || 'Unknown Paystack error';

          if (statusCode === 429) {
            throw new Error(
              `Rate limit exceeded (429): ${errorMessage}. Please reduce request frequency.`
            );
          }

          if (statusCode >= 500) {
            throw new Error(
              `Paystack server error (${statusCode}): ${errorMessage}`
            );
          }

          throw new Error(
            `Paystack API error (${statusCode}): ${errorMessage}`
          );
        }

        console.log('Paystack subaccount created successfully', {
          subaccount_code: data?.data?.subaccount_code,
          status: response?.status,
        });

        return { data };
      },
      catch: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Paystack subaccount creation error: ${error}`;
        console.error('PaystackService createSubaccount error:', errorMessage);

        return new PaystackApiError({
          message: errorMessage,
        });
      },
    }),
  createSplit: (splitData) =>
    Effect.tryPromise({
      try: async () => {
        console.log('Creating Paystack split group', {
          name: splitData.name,
          type: splitData.type,
          currency: splitData.currency,
        });

        const { data, error, response } = await paystack.POST('/split', {
          body: {
            name: splitData.name,
            type: splitData.type,
            subaccounts: splitData.subaccounts,
            currency: splitData.currency,
          },
        });

        if (error) {
          const statusCode = response?.status;
          const errorMessage = error.message || 'Unknown Paystack error';

          if (statusCode === 429) {
            throw new Error(
              `Rate limit exceeded (429): ${errorMessage}. Please reduce request frequency.`
            );
          }

          if (statusCode >= 500) {
            throw new Error(
              `Paystack server error (${statusCode}): ${errorMessage}`
            );
          }

          throw new Error(
            `Paystack API error (${statusCode}): ${errorMessage}`
          );
        }

        console.log('Paystack split group created successfully', {
          split_code: data?.data?.split_code,
          status: response?.status,
        });

        return { data };
      },
      catch: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Paystack split creation error: ${error}`;
        console.error('PaystackService createSplit error:', errorMessage);

        return new PaystackApiError({
          message: errorMessage,
        });
      },
    }),
} satisfies PaystackService);
