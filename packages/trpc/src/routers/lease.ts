import { VCreateLeaseSchema, VGetAllLeasesSchema } from './lease.types';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { nanoid } from 'nanoid';
import { startOfDay } from 'date-fns';

export const leaseRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(VGetAllLeasesSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, status, propertyId, sortBy, sortOrder } =
        input;
      const skip = (page - 1) * limit;

      // Build base where clause
      const whereClause: any = {
        unit: {
          property: {
            landlordId: ctx.auth?.session?.userId ?? '',
          },
        },
      };

      // Add search functionality
      if (search && search.trim()) {
        whereClause.OR = [
          // Search in tenant names and email
          {
            tenantLease: {
              some: {
                tenant: {
                  OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
          // Search in property name
          {
            unit: {
              property: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          },
          // Search in unit name
          {
            unit: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
        ];
      }

      // Add status filter
      if (status && status !== 'all') {
        whereClause.status = status;
      }

      // Add property filter
      if (propertyId && propertyId !== 'all') {
        whereClause.unit.property.id = propertyId;
      }

      // Build order by clause
      let orderBy: any = { createdAt: 'desc' }; // default sorting

      if (sortBy && sortOrder) {
        switch (sortBy) {
          case 'tenant':
            orderBy = {
              tenantLease: {
                _count: sortOrder,
              },
            };
            break;
          case 'property':
            orderBy = {
              unit: {
                property: {
                  name: sortOrder,
                },
              },
            };
            break;
          case 'rent':
            orderBy = { rent: sortOrder };
            break;
          case 'startDate':
            orderBy = { startDate: sortOrder };
            break;
          case 'endDate':
            orderBy = { endDate: sortOrder };
            break;
          case 'status':
            orderBy = { status: sortOrder };
            break;
          default:
            orderBy = { createdAt: 'desc' };
        }
      }

      const [leases, countResult] = await Promise.all([
        ctx.db.lease.findMany({
          where: whereClause,
          orderBy,
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
          skip,
          take: limit,
        }),
        // Using explicit count with select for better type safety and clarity
        ctx.db.lease.count({
          where: whereClause,
          select: {
            _all: true,
          },
        }),
      ]);

      return {
        leases,
        total: countResult._all,
        page,
        limit,
        totalPages: Math.ceil(countResult._all / limit),
      };
    }),
  getAllProperties: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.property.findMany({
      where: {
        landlordId: ctx.auth?.session?.userId ?? '',
      },
      select: {
        id: true,
        name: true,
        unit: true,
        propertyType: true,
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

  getLeaseStats: protectedProcedure.query(async ({ ctx }) => {
    const landlordId = ctx.auth?.session?.userId ?? '';

    // Get all leases for the landlord to calculate stats
    const leases = await ctx.db.lease.findMany({
      where: {
        unit: {
          property: {
            landlordId,
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

    // Calculate totals
    const totalLeases = leases.length;
    const activeLeases = leases.filter(
      (lease) => lease.status === 'ACTIVE'
    ).length;
    const expiredLeases = leases.filter(
      (lease) => lease.status === 'EXPIRED'
    ).length;
    const totalRentValue = leases
      .filter((lease) => lease.status === 'ACTIVE')
      .reduce((sum, lease) => sum + lease.rent, 0);

    // Count leases created this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthLeases = leases.filter((lease) => {
      const leaseDate = new Date(lease.createdAt);
      return leaseDate >= startOfMonth && leaseDate <= endOfMonth;
    }).length;

    return {
      totalLeases,
      activeLeases,
      expiredLeases,
      totalRentValue,
      thisMonthLeases,
    };
  }),
  createLease: protectedProcedure
    .input(VCreateLeaseSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (tx) => {
        const lease = await tx.lease.create({
          data: {
            id: nanoid(),
            unitId: input.unitId,
            // Ensure startDate and endDate are set in Africa/Johannesburg timezone
            startDate: startOfDay(
              new Date(input.leaseStartDate).toLocaleString('en-US', {
                timeZone: 'Africa/Johannesburg',
              })
            ),
            endDate: input.leaseEndDate
              ? startOfDay(
                  new Date(input.leaseEndDate).toLocaleString('en-US', {
                    timeZone: 'Africa/Johannesburg',
                  })
                )
              : null,
            deposit: input.deposit,
            rent: input.rent,
            status: 'ACTIVE',
            rentDueCurrency: 'ZAR',
            leaseType: 'MONTHLY',
            invoiceCycle: 'MONTHLY',
            automaticInvoice: input.automaticInvoice,
            tenantLease: {
              create: {
                tenantId: input.tenantId,
              },
            },
          },
        });

        if (!input.automaticInvoice) {
          return lease;
        }

        await tx.recurringBillable.create({
          data: {
            id: nanoid(),
            description: 'Rent',
            amount: input.rent,
            category: 'RENT',
            startDate: startOfDay(
              new Date(input.leaseStartDate).toLocaleString('en-US', {
                timeZone: 'Africa/Johannesburg',
              })
            ),
            nextInvoiceAt: startOfDay(
              new Date(input.leaseStartDate).toLocaleString('en-US', {
                timeZone: 'Africa/Johannesburg',
              })
            ),
            isActive: true,
            cycle: 'MONTHLY',
            tenantId: input.tenantId,
            leaseId: lease.id,
          },
        });

        return lease;
      });
    }),
});
