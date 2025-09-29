import {
  VGetAllInvoicesSchema,
  VCreateInvoiceSchema,
  VMarkInvoiceAsPaidSchema,
} from './invoice.types';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { TRPCError } from '@trpc/server';
import * as v from 'valibot';
import { runCreateInvoiceEffect } from '@leaseup/tasks/effect';
import { paystack } from '@leaseup/payments/open-api/client';
import {
  Prisma,
  InvoiceStatus,
  InvoiceCategory,
  type Invoice,
  type TenantLease,
} from '@leaseup/prisma/client/client.js';
import { UTCDate } from '@date-fns/utc';

export const invoiceRouter = createTRPCRouter({
  getInvoiceCategory: protectedProcedure.query(async ({ ctx }) => {
    return Object.values(InvoiceCategory);
  }),

  getAll: protectedProcedure
    .input(VGetAllInvoicesSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, status, propertyId, search, sortBy, sortOrder } =
        input;
      const skip = (page - 1) * limit;

      const whereClause: Prisma.InvoiceWhereInput = {
        OR: [
          {
            lease: {
              unit: {
                property: {
                  landlordId: ctx.auth?.session?.userId ?? '',
                },
              },
            },
          },
          {
            AND: [
              { leaseId: null },
              {
                tenant: {
                  landlordId: ctx.auth?.session?.userId ?? '',
                },
              },
            ],
          },
        ],
      };

      if (status && status !== 'All Status') {
        whereClause.status = status.toUpperCase() as InvoiceStatus;
      }

      if (propertyId && propertyId !== 'All Properties') {
        // If we already have search filters with AND structure
        if (whereClause.AND) {
          const andConditions = Array.isArray(whereClause.AND)
            ? whereClause.AND
            : [whereClause.AND];

          const landlordFilterIndex = andConditions.findIndex(
            (condition: any) => condition.OR
          );
          if (landlordFilterIndex !== -1) {
            const landlordCondition = andConditions[landlordFilterIndex] as any;
            const landlordFilter = landlordCondition.OR;
            if (Array.isArray(landlordFilter)) {
              const leaseFilterIndex = landlordFilter.findIndex(
                (condition: any) => condition.lease
              );
              if (
                leaseFilterIndex !== -1 &&
                landlordFilter[leaseFilterIndex]?.lease?.unit?.property
              ) {
                landlordFilter[leaseFilterIndex].lease.unit.property.id =
                  propertyId;
              }
              landlordCondition.OR = landlordFilter.filter(
                (condition: any) => condition.lease
              );
            }
          }
          whereClause.AND = andConditions;
        } else {
          if (whereClause.OR && Array.isArray(whereClause.OR)) {
            const leaseFilterIndex = whereClause.OR.findIndex(
              (condition: any) => condition.lease
            );
            if (leaseFilterIndex !== -1) {
              const leaseCondition = whereClause.OR[leaseFilterIndex] as any;
              if (leaseCondition?.lease?.unit?.property) {
                leaseCondition.lease.unit.property.id = propertyId;
              }
            }
            whereClause.OR = whereClause.OR.filter(
              (condition: any) => condition.lease
            );
          }
        }
      }

      if (search) {
        const landlordFilter = whereClause.OR;
        whereClause.AND = [
          { OR: landlordFilter },
          {
            OR: [
              {
                description: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                lease: {
                  tenantLease: {
                    some: {
                      tenant: {
                        OR: [
                          {
                            firstName: {
                              contains: search,
                              mode: 'insensitive',
                            },
                          },
                          {
                            lastName: {
                              contains: search,
                              mode: 'insensitive',
                            },
                          },
                          {
                            email: {
                              contains: search,
                              mode: 'insensitive',
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
              {
                tenant: {
                  OR: [
                    {
                      firstName: {
                        contains: search,
                        mode: 'insensitive',
                      },
                    },
                    {
                      lastName: {
                        contains: search,
                        mode: 'insensitive',
                      },
                    },
                    {
                      email: {
                        contains: search,
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              },
            ],
          },
        ];
        delete whereClause.OR;
      }

      const getOrderBy = () => {
        if (!sortBy || !sortOrder) {
          return { createdAt: 'desc' as const };
        }

        switch (sortBy) {
          case 'dueAmount':
            return { dueAmount: sortOrder };
          case 'dueDate':
            return { dueDate: sortOrder };
          case 'status':
            return { status: sortOrder };
          case 'tenant':
            return {
              lease: {
                tenantLease: {
                  _count: sortOrder,
                },
              },
            };
          case 'property':
            return {
              lease: {
                unit: {
                  property: {
                    name: sortOrder,
                  },
                },
              },
            };
          case 'createdAt':
          default:
            return { createdAt: sortOrder };
        }
      };

      const [invoices, countResult] = await Promise.all([
        ctx.db.invoice.findMany({
          where: whereClause,
          orderBy: getOrderBy(),
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
            tenant: true, // Include direct tenant for invoices without leases
            transactions: true,
          },
          skip,
          take: limit,
        }),
        ctx.db.invoice.count({
          where: whereClause,
          select: {
            _all: true,
          },
        }),
      ]);

      return {
        invoices,
        total: countResult._all,
        page,
        limit,
        totalPages: Math.ceil(countResult._all / limit),
      };
    }),

  getInvoiceStats: protectedProcedure.query(async ({ ctx }) => {
    const landlordId = ctx.auth?.session?.userId ?? '';

    // Get all invoices for the landlord to calculate stats
    const invoices = await ctx.db.invoice.findMany({
      where: {
        OR: [
          // Invoices with leases
          {
            lease: {
              unit: {
                property: {
                  landlordId,
                },
              },
            },
          },
          // Invoices without leases but with tenants belonging to landlord
          {
            AND: [
              { leaseId: null },
              {
                tenant: {
                  landlordId,
                },
              },
            ],
          },
        ],
      },
      include: {
        transactions: true,
      },
    });

    // Calculate totals
    const totalInvoiced = invoices.reduce(
      (sum: number, invoice: Invoice) => sum + invoice.dueAmount,
      0
    );
    const pendingPayment = invoices
      .filter((invoice: Invoice) => invoice.status === 'PENDING')
      .reduce((sum: number, invoice: Invoice) => sum + invoice.dueAmount, 0);
    const overdue = invoices
      .filter((invoice: Invoice) => invoice.status === 'OVERDUE')
      .reduce((sum: number, invoice: Invoice) => sum + invoice.dueAmount, 0);

    const nowUTC = new UTCDate();
    const startOfMonthUTC = new UTCDate(
      nowUTC.getUTCFullYear(),
      nowUTC.getUTCMonth(),
      1
    );
    const endOfMonthUTC = new UTCDate(
      nowUTC.getUTCFullYear(),
      nowUTC.getUTCMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const thisMonthInvoices = invoices.filter((invoice: Invoice) => {
      const invoiceDateUTC = new UTCDate(invoice.createdAt);
      return (
        invoiceDateUTC >= startOfMonthUTC && invoiceDateUTC <= endOfMonthUTC
      );
    }).length;

    return {
      totalInvoiced,
      pendingPayment,
      overdue,
      thisMonthInvoices,
    };
  }),

  createInvoice: protectedProcedure
    .input(VCreateInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      let lease = null;

      const tenant = await ctx.db.tenant.findFirst({
        where: {
          id: input.tenantId,
          landlordId: ctx.auth?.session?.userId ?? '',
        },
      });

      if (input.leaseId) {
        lease = await ctx.db.lease.findFirst({
          where: {
            id: input.leaseId,
            unit: {
              property: {
                landlordId: ctx.auth?.session?.userId ?? '',
              },
            },
          },
          include: {
            tenantLease: {
              include: {
                tenant: true,
              },
            },
          },
        });

        if (!lease) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'Lease not found or you do not have permission to create invoices for this lease',
          });
        }

        const tenantLease = lease.tenantLease.find(
          (tl: TenantLease) => tl.tenantId === input.tenantId
        );
        if (!tenantLease) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Tenant is not associated with this lease',
          });
        }
      } else if (tenant) {
        if (!tenant) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'Tenant not found or you do not have permission to create invoices for this tenant',
          });
        }
      }

      const totalAmountDue =
        input.invoiceItems.reduce((acc, item) => acc + item.amount, 0) * 100;

      const landlordSplitCode = await ctx.db.user.findUnique({
        where: {
          id: ctx.auth?.session?.userId ?? '',
        },
        select: {
          paystackSplitGroupId: true,
        },
      });

      await runCreateInvoiceEffect({
        landlordId: ctx.auth?.session?.userId ?? '',
        tenantId: input.tenantId,
        customer: tenant?.paystackCustomerId ?? '',
        amount: totalAmountDue,
        dueDate: input.dueDate,
        description: input.notes,
        lineItems: input.invoiceItems.map((item) => ({
          name: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount * 100,
        })),
        split_code: landlordSplitCode?.paystackSplitGroupId ?? '',
        leaseId: input.leaseId ?? '',
        category: input.category,
      });

      return {
        message: `Invoice created for ${input.tenantId}`,
      };
    }),

  getActiveLeases: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.lease.findMany({
      where: {
        status: 'ACTIVE',
        unit: {
          property: {
            landlordId: ctx.auth?.session?.userId ?? '',
          },
        },
      },
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
    });
  }),

  voidInvoice: protectedProcedure
    .input(v.object({ invoiceId: v.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findFirst({
        where: {
          id: input.invoiceId,
          landlordId: ctx.auth?.session?.userId ?? '',
        },
      });

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        });
      }

      await paystack.POST('/paymentrequest/archive/{id}', {
        params: {
          path: {
            id: invoice.paystackId,
          },
        },
      });

      return ctx.db.invoice.update({
        where: { id: input.invoiceId },
        data: {
          status: InvoiceStatus.CANCELLED,
        },
      });
    }),

  getAllTenants: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.tenant.findMany({
      where: {
        landlordId: ctx.auth?.session?.userId ?? '',
      },
    });
  }),

  getTenantLeases: protectedProcedure
    .input(v.object({ tenantId: v.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.lease.findMany({
        where: {
          tenantLease: {
            some: {
              tenantId: input.tenantId,
            },
          },
          unit: {
            property: {
              landlordId: ctx.auth?.session?.userId ?? '',
            },
          },
        },
        include: {
          unit: {
            include: {
              property: true,
            },
          },
        },
      });
    }),

  getById: protectedProcedure
    .input(v.string())
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findFirst({
        where: {
          id: input,
          OR: [
            // Invoices with leases belonging to landlord's properties
            {
              lease: {
                unit: {
                  property: {
                    landlordId: ctx.auth?.session?.userId ?? '',
                  },
                },
              },
            },
            // Invoices without leases but with tenants belonging to landlord
            {
              AND: [
                { leaseId: null },
                {
                  tenant: {
                    landlordId: ctx.auth?.session?.userId ?? '',
                  },
                },
              ],
            },
          ],
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
                          businessName: true,
                          email: true,
                          phone: true,
                          addressLine1: true,
                          addressLine2: true,
                          city: true,
                          state: true,
                          zip: true,
                          countryCode: true,
                          paystackSubAccountId: true,
                        },
                      },
                    },
                  },
                },
              },
              tenantLease: {
                include: {
                  tenant: {
                    include: {
                      landlord: {
                        select: {
                          id: true,
                          name: true,
                          businessName: true,
                          email: true,
                          phone: true,
                          addressLine1: true,
                          addressLine2: true,
                          city: true,
                          state: true,
                          zip: true,
                          countryCode: true,
                          paystackSubAccountId: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          tenant: {
            include: {
              landlord: {
                select: {
                  id: true,
                  name: true,
                  businessName: true,
                  email: true,
                  phone: true,
                  addressLine1: true,
                  addressLine2: true,
                  city: true,
                  state: true,
                  zip: true,
                  countryCode: true,
                  paystackSubAccountId: true,
                },
              },
            },
          }, // Include direct tenant for invoices without leases
          transactions: true,
        },
      });

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invoice not found or you do not have permission to view it',
        });
      }

      // Get landlord information and fetch bank details from Paystack
      const landlord =
        invoice.lease?.unit?.property?.landlord ||
        invoice.tenant?.landlord ||
        invoice.lease?.tenantLease?.[0]?.tenant?.landlord;

      let bankDetails = null;
      if (landlord?.paystackSubAccountId) {
        try {
          const { data, error } = await paystack.GET('/subaccount/{code}', {
            params: {
              path: {
                code: landlord.paystackSubAccountId,
              },
            },
          });

          if (!error && data?.data) {
            bankDetails = {
              bankName: data.data.settlement_bank,
              accountNumber: data.data.account_number,
              accountName: data.data.business_name,
            };
          }
        } catch (error) {
          console.error('Error fetching subaccount details:', error);
          // Don't throw error, just log it and continue without bank details
        }
      }

      return {
        ...invoice,
        landlordBankDetails: bankDetails,
      };
    }),

  markInvoiceAsPaid: protectedProcedure
    .input(VMarkInvoiceAsPaidSchema)
    .mutation(async ({ ctx, input }) => {
      const { invoiceId } = input;

      const invoice = await ctx.db.invoice.findFirst({
        where: {
          id: invoiceId,
          OR: [
            {
              lease: {
                unit: {
                  property: {
                    landlordId: ctx.auth?.session?.userId ?? '',
                  },
                },
              },
            },
            {
              AND: [
                { leaseId: null },
                {
                  tenant: {
                    landlordId: ctx.auth?.session?.userId ?? '',
                  },
                },
              ],
            },
          ],
        },
        include: {
          transactions: true,
        },
      });

      if (!invoice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'Invoice not found or you do not have permission to modify it',
        });
      }

      if (invoice.status === InvoiceStatus.CANCELLED) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot mark a cancelled invoice as paid',
        });
      }

      let newStatus: InvoiceStatus = InvoiceStatus.PAID;

      const result = await ctx.db.$transaction(async (tx) => {
        const transaction = await tx.transactions.create({
          data: {
            leaseId: invoice.leaseId,
            description: `Offline payment for invoice ${invoice.invoiceNumber || invoiceId}`,
            amountPaid: invoice.dueAmount,
            method: 'OFFLINE',
          },
        });

        const updatedInvoice = await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            status: newStatus,
            transactions: {
              connect: {
                id: transaction.id,
              },
            },
          },
          include: {
            transactions: true,
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
            tenant: true,
          },
        });

        return { transaction, invoice: updatedInvoice };
      });

      return {
        message: `Invoice marked as ${newStatus.toLowerCase()}. Transaction created successfully.`,
        transaction: result.transaction,
        invoice: result.invoice,
        newStatus,
      };
    }),
});
