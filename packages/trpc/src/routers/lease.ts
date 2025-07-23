import { VCreateLeaseSchema, VGetAllLeasesSchema } from './lease.types';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { nanoid } from 'nanoid';
import { startOfDay } from 'date-fns';

export const leaseRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(VGetAllLeasesSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const whereClause = {
        unit: {
          property: {
            landlordId: ctx.auth?.session?.userId ?? '',
          },
        },
      };

      const [leases, countResult] = await Promise.all([
        ctx.db.lease.findMany({
          where: whereClause,
          orderBy: {
            createdAt: 'desc',
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
