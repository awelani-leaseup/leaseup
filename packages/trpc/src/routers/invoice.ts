import { VGetAllInvoicesSchema, VCreateInvoiceSchema } from './invoice.types';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { nanoid } from 'nanoid';
import { TRPCError } from '@trpc/server';
import * as v from 'valibot';
import { createInvoiceTask } from '@leaseup/tasks/trigger';
import { Prisma, InvoiceStatus } from '@leaseup/prisma/client/index.js';

export const invoiceRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(VGetAllInvoicesSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, status, propertyId, search, sortBy, sortOrder } =
        input;
      const skip = (page - 1) * limit;

      // Build where clause for filtering invoices by landlord
      // Include invoices with leases belonging to landlord's properties
      // AND invoices without leases but belonging to landlord's tenants
      const whereClause: Prisma.InvoiceWhereInput = {
        OR: [
          // Invoices with leases
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
      };

      // Add status filter if provided
      if (status && status !== 'All Status') {
        whereClause.status = status.toUpperCase() as InvoiceStatus;
      }

      // Add property filter if provided
      if (propertyId && propertyId !== 'All Properties') {
        // If we already have search filters with AND structure
        if (whereClause.AND) {
          // Ensure AND is an array
          const andConditions = Array.isArray(whereClause.AND)
            ? whereClause.AND
            : [whereClause.AND];

          // Find and modify the landlord filter part
          const landlordFilterIndex = andConditions.findIndex(
            (condition: any) => condition.OR
          );
          if (landlordFilterIndex !== -1) {
            // Modify the lease part of the landlord filter to include property filter
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
              // Remove the non-lease part since property filter only applies to leases
              landlordCondition.OR = landlordFilter.filter(
                (condition: any) => condition.lease
              );
            }
          }
          whereClause.AND = andConditions;
        } else {
          // No search filters, modify the original OR structure
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
            // Remove the non-lease part since property filter only applies to leases
            whereClause.OR = whereClause.OR.filter(
              (condition: any) => condition.lease
            );
          }
        }
      }

      // Add search filter if provided (search in tenant name or invoice description)
      if (search) {
        // Need to combine the landlord filter with search using AND
        const landlordFilter = whereClause.OR;
        whereClause.AND = [
          // Landlord filter
          { OR: landlordFilter },
          // Search filter
          {
            OR: [
              {
                description: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              // Search in lease tenants
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
              // Search in direct tenant (for invoices without leases)
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
        // Remove the original OR since we moved it to AND
        delete whereClause.OR;
      }

      // Build orderBy clause for sorting
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
      (sum, invoice) => sum + invoice.dueAmount,
      0
    );
    const pendingPayment = invoices
      .filter((invoice) => invoice.status === 'PENDING')
      .reduce((sum, invoice) => sum + invoice.dueAmount, 0);
    const overdue = invoices
      .filter((invoice) => invoice.status === 'OVERDUE')
      .reduce((sum, invoice) => sum + invoice.dueAmount, 0);

    // Count invoices for this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.createdAt);
      return invoiceDate >= startOfMonth && invoiceDate <= endOfMonth;
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

        // Verify the tenant is associated with this lease
        const tenantLease = lease.tenantLease.find(
          (tl) => tl.tenantId === input.tenantId
        );
        if (!tenantLease) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Tenant is not associated with this lease',
          });
        }
      } else {
        if (!tenant) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'Tenant not found or you do not have permission to create invoices for this tenant',
          });
        }
      }

      const totalAmountDue = input.invoiceItems.reduce(
        (acc, item) => acc + item.amount,
        0
      );

      // Create the invoice
      const invoiceData: any = {
        id: nanoid(),
        notes: input.notes,
        lineItems: input.invoiceItems,
        dueAmount: totalAmountDue,
        dueDate: input.dueDate,
        paystackId: nanoid(), // Generate a temporary ID for manual invoices
        category: 'RENT', // Default to RENT category
        status: 'PENDING',
        createdAt: input.invoiceDate,
      };

      // Only include leaseId if it's provided
      if (input.leaseId) {
        invoiceData.leaseId = input.leaseId;
      }

      const landlordSplitCode = await ctx.db.user.findUnique({
        where: {
          id: ctx.auth?.session?.userId ?? '',
        },
        select: {
          paystackSplitGroupId: true,
        },
      });

      await createInvoiceTask.trigger({
        tenantId: input.tenantId,
        customer: tenant?.paystackCustomerId,
        amount: totalAmountDue,
        dueDate: input.dueDate,
        description: input.notes,
        lineItems: input.invoiceItems.map((item) => ({
          name: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount * 100,
        })),
        split_code: landlordSplitCode?.paystackSplitGroupId,
        leaseId: input.leaseId ?? '',
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
});
