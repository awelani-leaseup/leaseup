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

      // Build where conditions with landlord filter
      const landlordFilter = {
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

      // Build base where conditions
      const whereConditions: any = {
        AND: [landlordFilter],
      };

      // Add search filter
      if (search) {
        whereConditions.AND.push({
          OR: [
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
                        {
                          firstName: { contains: search, mode: 'insensitive' },
                        },
                        { lastName: { contains: search, mode: 'insensitive' } },
                      ],
                    },
                  },
                },
              },
            },
          ],
        });
      }

      // Property filter
      if (propertyId) {
        whereConditions.AND.push({
          lease: {
            unit: {
              propertyId: propertyId,
            },
          },
        });
      }

      // Tenant filter
      if (tenantId) {
        whereConditions.AND.push({
          lease: {
            tenantLease: {
              some: {
                tenantId: tenantId,
              },
            },
          },
        });
      }

      // Amount range filter
      if (amountMin !== undefined || amountMax !== undefined) {
        const amountFilter: any = {};
        if (amountMin !== undefined) {
          amountFilter.gte = amountMin;
        }
        if (amountMax !== undefined) {
          amountFilter.lte = amountMax;
        }
        whereConditions.AND.push({
          amountPaid: amountFilter,
        });
      }

      // Date range filter (using UTC)
      if (dateFrom || dateTo) {
        const dateFilter: any = {};
        if (dateFrom) {
          const fromDateUTC = new Date(dateFrom);
          dateFilter.gte = new Date(
            Date.UTC(
              fromDateUTC.getUTCFullYear(),
              fromDateUTC.getUTCMonth(),
              fromDateUTC.getUTCDate()
            )
          );
        }
        if (dateTo) {
          const toDateUTC = new Date(dateTo);
          dateFilter.lte = new Date(
            Date.UTC(
              toDateUTC.getUTCFullYear(),
              toDateUTC.getUTCMonth(),
              toDateUTC.getUTCDate(),
              23,
              59,
              59,
              999
            )
          );
        }
        whereConditions.AND.push({
          createdAt: dateFilter,
        });
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
