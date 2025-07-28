import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { VGetAllTransactionsSchema } from './transaction.types';

export const transactionRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(VGetAllTransactionsSchema)
    .query(async ({ ctx, input }) => {
      const {
        page = 1,
        limit = 20,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        propertyId,
        tenantId,
        amountMin,
        amountMax,
        dateFrom,
        dateTo,
      } = input;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions: any = {
        lease: {
          tenantLease: {
            some: {
              tenant: {
                landlordId: ctx.auth?.session?.userId ?? '',
              },
            },
          },
        },
      };

      // Add search filter
      if (search) {
        whereConditions.OR = [
          { description: { contains: search, mode: 'insensitive' } },
          { referenceId: { contains: search, mode: 'insensitive' } },
          {
            invoice: {
              id: { contains: search, mode: 'insensitive' },
            },
          },
          {
            lease: {
              tenantLease: {
                some: {
                  tenant: {
                    OR: [
                      { firstName: { contains: search, mode: 'insensitive' } },
                      { lastName: { contains: search, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            },
          },
        ];
      }

      // Property filter
      if (propertyId) {
        whereConditions.lease = {
          ...whereConditions.lease,
          unit: {
            propertyId: propertyId,
          },
        };
      }

      // Tenant filter
      if (tenantId) {
        whereConditions.lease = {
          ...whereConditions.lease,
          tenantLease: {
            some: {
              tenantId: tenantId,
              tenant: {
                landlordId: ctx.auth?.session?.userId ?? '',
              },
            },
          },
        };
      }

      // Amount range filter
      if (amountMin !== undefined || amountMax !== undefined) {
        whereConditions.amountPaid = {};
        if (amountMin !== undefined) {
          whereConditions.amountPaid.gte = amountMin;
        }
        if (amountMax !== undefined) {
          whereConditions.amountPaid.lte = amountMax;
        }
      }

      // Date range filter
      if (dateFrom || dateTo) {
        whereConditions.createdAt = {};
        if (dateFrom) {
          whereConditions.createdAt.gte = new Date(dateFrom);
        }
        if (dateTo) {
          whereConditions.createdAt.lte = new Date(dateTo);
        }
      }

      // Build order by
      const orderBy: any = {};
      if (sortBy === 'tenant') {
        orderBy.lease = {
          tenantLease: {
            _count: sortOrder,
          },
        };
      } else if (sortBy === 'property') {
        orderBy.lease = {
          unit: {
            property: {
              name: sortOrder,
            },
          },
        };
      } else {
        orderBy[sortBy] = sortOrder;
      }

      // Get transactions with pagination
      const [transactions, totalCount] = await Promise.all([
        ctx.db.transactions.findMany({
          where: whereConditions,
          include: {
            invoice: true,
            lease: {
              include: {
                tenantLease: {
                  include: {
                    tenant: true,
                  },
                },
                unit: {
                  include: {
                    property: true,
                  },
                },
              },
            },
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        ctx.db.transactions.count({
          where: whereConditions,
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        transactions,
        totalCount,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    }),
});
