import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { VGetAllTransactionsSchema } from './transaction.types';
import { Prisma } from '@leaseup/prisma/client/client.js';

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

      const whereConditions: Prisma.TransactionsWhereInput = {
        AND: [
          {
            invoice: {
              landlordId: ctx.auth?.session?.userId ?? '',
            },
          },
        ],
      };

      const andConditions =
        whereConditions.AND as Prisma.TransactionsWhereInput[];

      if (search) {
        andConditions.push({
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

      if (propertyId) {
        andConditions.push({
          lease: {
            unit: {
              propertyId: propertyId,
            },
          },
        });
      }

      if (tenantId) {
        andConditions.push({
          OR: [
            // Filter by tenant through lease relationship
            {
              lease: {
                tenantLease: {
                  some: {
                    tenantId: tenantId,
                  },
                },
              },
            },
            // Filter by tenant through invoice relationship
            {
              invoice: {
                tenantId: tenantId,
              },
            },
          ],
        });
      }

      if (amountMin !== undefined || amountMax !== undefined) {
        const amountFilter: Prisma.FloatFilter = {};
        if (amountMin !== undefined) {
          amountFilter.gte = amountMin;
        }
        if (amountMax !== undefined) {
          amountFilter.lte = amountMax;
        }
        andConditions.push({
          amountPaid: amountFilter,
        });
      }

      if (dateFrom || dateTo) {
        const dateFilter: Prisma.DateTimeFilter = {};
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
        andConditions.push({
          createdAt: dateFilter,
        });
      }

      let orderBy: Prisma.TransactionsOrderByWithRelationInput = {};

      if (sortBy === 'tenant') {
        orderBy = {
          lease: {
            tenantLease: {
              _count: sortOrder,
            },
          },
        };
      } else if (sortBy === 'property') {
        orderBy = {
          lease: {
            unit: {
              property: {
                name: sortOrder,
              },
            },
          },
        };
      } else {
        switch (sortBy) {
          case 'createdAt':
            orderBy = { createdAt: sortOrder };
            break;
          case 'updatedAt':
            orderBy = { updatedAt: sortOrder };
            break;
          case 'amountPaid':
            orderBy = { amountPaid: sortOrder };
            break;
          case 'description':
            orderBy = { description: sortOrder };
            break;
          case 'referenceId':
            orderBy = { referenceId: sortOrder };
            break;
          default:
            orderBy = { createdAt: sortOrder };
        }
      }

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
