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
import {
  LeaseStatus,
  LeaseTermType,
  InvoiceCycle,
} from '@leaseup/prisma/client/index.js';
import { nanoid } from 'nanoid';

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

export class PaystackApiError extends Schema.TaggedError<PaystackApiError>()(
  'PaystackApiError',
  {
    message: Schema.String,
  }
) {}

export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
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
    Prisma.InvoiceGetPayload<{
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  include: {
                    landlord: {
                      select: {
                        id: true;
                        name: true;
                        email: true;
                      };
                    };
                  };
                };
              };
            };
            tenantLease: {
              include: {
                tenant: true;
              };
            };
          };
        };
      };
    }> | null,
    DatabaseError,
    never
  >;
  readonly updateInvoiceStatus: (
    invoiceId: string,
    status: InvoiceStatus,
    updatedAt: Date
  ) => Effect.Effect<void, DatabaseError, never>;
  readonly createTransaction: (
    data: Prisma.TransactionsCreateInput & {
      createdAt: Date;
      updatedAt: Date;
    }
  ) => Effect.Effect<Transactions, DatabaseError, never>;
  readonly findTenant: (tenantId: string) => Effect.Effect<
    Prisma.TenantGetPayload<{
      select: {
        id: true;
        email: true;
        firstName: true;
        lastName: true;
        phone: true;
        paystackCustomerId: true;
      };
    }> | null,
    DatabaseError,
    never
  >;
  readonly updateTenantPaystackId: (
    tenantId: string,
    paystackCustomerId: string
  ) => Effect.Effect<void, DatabaseError, never>;
  readonly findLandlord: (userId: string) => Effect.Effect<
    Prisma.UserGetPayload<{
      select: {
        id: true;
        name: true;
        email: true;
        paystackSubAccountId: true;
        paystackSplitGroupId: true;
        paystackCustomerId: true;
      };
    }> | null,
    DatabaseError,
    never
  >;
  readonly updateLandlordPaystackIds: (
    userId: string,
    subaccountId: string,
    splitGroupId: string,
    customerId?: string
  ) => Effect.Effect<void, DatabaseError, never>;
  readonly checkUserSubscriptionHistory: (
    userId: string
  ) => Effect.Effect<boolean, DatabaseError, never>;
  readonly findLeaseWithLandlord: (leaseId: string) => Effect.Effect<
    Prisma.LeaseGetPayload<{
      select: {
        id: true;
        rent: true;
        rentDueCurrency: true;
        startDate: true;
        unit: {
          select: {
            property: {
              select: {
                landlordId: true;
                landlord: {
                  select: {
                    id: true;
                    name: true;
                    email: true;
                    paystackSubAccountId: true;
                    paystackSplitGroupId: true;
                  };
                };
              };
            };
          };
        };
        tenantLease: {
          select: {
            tenant: {
              select: {
                id: true;
                email: true;
                firstName: true;
                lastName: true;
                phone: true;
                paystackCustomerId: true;
              };
            };
          };
        };
      };
    }> | null,
    DatabaseError,
    never
  >;
  readonly updateLeasePaystackInfo: (
    leaseId: string,
    planCode: string,
    subscriptionCode: string | null,
    authorizationUrl: string,
    reference: string
  ) => Effect.Effect<void, DatabaseError, never>;
  readonly createLeaseWithTransaction: (
    unitId: string,
    tenantId: string,
    leaseStartDate: string,
    leaseEndDate: string | null,
    deposit: number,
    rent: number,
    automaticInvoice: boolean
  ) => Effect.Effect<
    {
      id: string;
      rent: number;
      rentDueCurrency: string;
      startDate: Date | null;
      unit: {
        property: {
          landlord: {
            id: string;
            name: string | null;
            email: string;
            paystackSubAccountId: string | null;
            paystackSplitGroupId: string | null;
          } | null;
        };
      } | null;
      tenantLease: Array<{
        tenant: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
          phone: string | null;
          paystackCustomerId: string | null;
        };
      }>;
    },
    DatabaseError,
    never
  >;
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
  readonly createPlan: (data: {
    name: string;
    amount: number;
    interval: string;
    description?: string;
    currency?: string;
    send_invoices?: boolean;
    send_sms?: boolean;
    invoice_limit?: number;
  }) => Effect.Effect<
    { data?: { data?: { plan_code?: string } } },
    PaystackApiError
  >;
  readonly createSubscription: (data: {
    customer: string;
    plan: string;
    authorization?: string;
    start_date?: string;
  }) => Effect.Effect<
    { data?: { data?: { subscription_code?: string; email_token?: string } } },
    PaystackApiError
  >;
  readonly initializeTransaction: (data: {
    email: string;
    amount: number;
    currency?: string;
    subaccount?: string;
    split_code?: string;
    plan?: string;
    metadata?: string;
  }) => Effect.Effect<
    {
      data?: {
        data?: {
          authorization_url?: string;
          access_code?: string;
          reference?: string;
        };
      };
    },
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
                    property: {
                      include: {
                        landlord: {
                          select: {
                            id: true,
                            name: true,
                            email: true,
                          },
                        },
                      },
                    },
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
            paystackCustomerId: true,
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
    splitGroupId: string,
    customerId?: string
  ) =>
    Effect.tryPromise({
      try: async () => {
        const updateData: any = {
          paystackSubAccountId: subaccountId,
          paystackSplitGroupId: splitGroupId,
        };

        if (customerId) {
          updateData.paystackCustomerId = customerId;
        }

        await db.user.update({
          where: { id: userId },
          data: updateData,
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
  checkUserSubscriptionHistory: (userId: string) =>
    Effect.tryPromise({
      try: async () => {
        const user = await db.user.findUnique({
          where: { id: userId },
          select: {
            subscriptionCreatedAt: true,
            paystackSubscriptionStatus: true,
            paystackSubscriptionId: true,
          },
        });

        if (!user) {
          return false;
        }

        // User has subscription history if they have:
        // 1. A subscription creation date, OR
        // 2. A current/previous subscription status (not null), OR
        // 3. A Paystack subscription ID
        return !!(
          user.subscriptionCreatedAt ||
          user.paystackSubscriptionStatus ||
          user.paystackSubscriptionId
        );
      },
      catch: (error) =>
        new DatabaseError({
          message:
            error instanceof Error
              ? error.message
              : 'Failed to check user subscription history',
        }),
    }),
  findLeaseWithLandlord: (leaseId: string) =>
    Effect.tryPromise({
      try: async () => {
        return db.lease.findUnique({
          where: { id: leaseId },
          select: {
            id: true,
            rent: true,
            rentDueCurrency: true,
            startDate: true,
            unit: {
              select: {
                property: {
                  select: {
                    landlordId: true,
                    landlord: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        paystackSubAccountId: true,
                        paystackSplitGroupId: true,
                      },
                    },
                  },
                },
              },
            },
            tenantLease: {
              select: {
                tenant: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    paystackCustomerId: true,
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
              : 'Failed to find lease with landlord',
        }),
    }),
  updateLeasePaystackInfo: (
    leaseId: string,
    planCode: string,
    subscriptionCode: string | null,
    authorizationUrl: string,
    reference: string
  ) =>
    Effect.tryPromise({
      try: async () => {
        await db.lease.update({
          where: { id: leaseId },
          data: {
            paystackPlanCode: planCode,
            paystackSubscriptionCode: subscriptionCode,
            paystackAuthorizationUrl: authorizationUrl,
            paystackReference: reference,
          },
        });
      },
      catch: (error) =>
        new DatabaseError({
          message:
            error instanceof Error
              ? error.message
              : 'Failed to update lease Paystack information',
        }),
    }),
  createLeaseWithTransaction: (
    unitId: string,
    tenantId: string,
    leaseStartDate: string,
    leaseEndDate: string | null,
    deposit: number,
    rent: number,
    automaticInvoice: boolean
  ) =>
    Effect.tryPromise({
      try: async () => {
        return await db.$transaction(async (tx) => {
          const lease = await tx.lease.create({
            data: {
              id: nanoid(),
              unitId,
              startDate: new Date(leaseStartDate).toISOString(),
              endDate: leaseEndDate
                ? new Date(leaseEndDate).toISOString()
                : null,
              deposit,
              rent,
              status: LeaseStatus.ACTIVE,
              rentDueCurrency: 'ZAR',
              leaseType: LeaseTermType.MONTHLY,
              invoiceCycle: InvoiceCycle.MONTHLY,
              automaticInvoice,
              tenantLease: {
                create: {
                  tenantId,
                },
              },
            },
            include: {
              unit: {
                include: {
                  property: {
                    include: {
                      landlord: {
                        select: {
                          id: true,
                          name: true,
                          email: true,
                          paystackSubAccountId: true,
                          paystackSplitGroupId: true,
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
                      email: true,
                      firstName: true,
                      lastName: true,
                      phone: true,
                      paystackCustomerId: true,
                    },
                  },
                },
              },
            },
          });
          return lease;
        });
      },
      catch: (error) =>
        new DatabaseError({
          message:
            error instanceof Error
              ? error.message
              : 'Failed to create lease with transaction',
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
            // @ts-ignore
            metadata: customerData?.metadata,
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
  createPlan: (planData) =>
    Effect.tryPromise({
      try: async () => {
        console.log('Creating Paystack plan', {
          name: planData.name,
          amount: planData.amount,
          interval: planData.interval,
        });

        const { data, error, response } = await paystack.POST('/plan', {
          body: {
            name: planData.name,
            amount: planData.amount, // Amount should be in cents for ZAR
            interval: planData.interval,
            description: planData.description,
            currency: planData.currency || 'ZAR',
            send_invoices: planData.send_invoices ?? true,
            send_sms: planData.send_sms ?? false,
            invoice_limit: planData.invoice_limit,
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

        console.log('Paystack plan created successfully', {
          plan_code: data?.data?.plan_code,
          status: response?.status,
        });

        return { data };
      },
      catch: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Paystack plan creation error: ${error}`;
        console.error('PaystackService createPlan error:', errorMessage);

        return new PaystackApiError({
          message: errorMessage,
        });
      },
    }),
  createSubscription: (subscriptionData) =>
    Effect.tryPromise({
      try: async () => {
        console.log('Creating Paystack subscription', {
          customer: subscriptionData.customer,
          plan: subscriptionData.plan,
        });

        const { data, error, response } = await paystack.POST('/subscription', {
          body: {
            customer: subscriptionData.customer,
            plan: subscriptionData.plan,
            authorization: subscriptionData.authorization,
            start_date: subscriptionData.start_date,
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

        console.log('Paystack subscription created successfully', {
          subscription_code: data?.data?.subscription_code,
          status: response?.status,
        });

        return { data };
      },
      catch: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Paystack subscription creation error: ${error}`;
        console.error(
          'PaystackService createSubscription error:',
          errorMessage
        );

        return new PaystackApiError({
          message: errorMessage,
        });
      },
    }),
  initializeTransaction: (transactionData) =>
    Effect.tryPromise({
      try: async () => {
        console.log('Initializing Paystack transaction', {
          email: transactionData.email,
          amount: transactionData.amount,
          currency: transactionData.currency,
        });

        const { data, error, response } = await paystack.POST(
          '/transaction/initialize',
          {
            body: {
              email: transactionData.email,
              amount: transactionData.amount, // Amount should be in cents for ZAR
              currency: transactionData.currency || 'ZAR',
              subaccount: transactionData.subaccount,
              split_code: transactionData.split_code,
              plan: transactionData.plan,
              metadata: transactionData.metadata,
            },
          }
        );

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

        console.log('Paystack transaction initialized successfully', {
          authorization_url: data?.data?.authorization_url,
          reference: data?.data?.reference,
          status: response?.status,
        });

        return { data };
      },
      catch: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Paystack transaction initialization error: ${error}`;
        console.error(
          'PaystackService initializeTransaction error:',
          errorMessage
        );

        return new PaystackApiError({
          message: errorMessage,
        });
      },
    }),
} satisfies PaystackService);
