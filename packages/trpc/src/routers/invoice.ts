import { VGetAllInvoicesSchema } from './invoice.types';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';

export const invoiceRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(VGetAllInvoicesSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, status, propertyId, search, sortBy, sortOrder } =
        input;
      const skip = (page - 1) * limit;

      // Build where clause for filtering invoices by landlord
      const whereClause: any = {
        lease: {
          unit: {
            property: {
              landlordId: ctx.auth?.session?.userId ?? '',
            },
          },
        },
      };

      // Add status filter if provided
      if (status && status !== 'All Status') {
        whereClause.status = status.toUpperCase();
      }

      // Add property filter if provided
      if (propertyId && propertyId !== 'All Properties') {
        whereClause.lease.unit.property.id = propertyId;
      }

      // Add search filter if provided (search in tenant name or invoice description)
      if (search) {
        whereClause.OR = [
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
        ];
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
        lease: {
          unit: {
            property: {
              landlordId,
            },
          },
        },
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
});
