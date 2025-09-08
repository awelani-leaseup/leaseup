import { VCreateLeaseSchema, VGetAllLeasesSchema } from './lease.types';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { TRPCError } from '@trpc/server';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  InvoiceCategory,
  InvoiceCycle,
  LeaseStatus,
  LeaseTermType,
} from '@leaseup/prisma/client/client.js';

export const leaseRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(VGetAllLeasesSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, status, propertyId, sortBy, sortOrder } =
        input;
      const skip = (page - 1) * limit;

      const whereClause: any = {
        unit: {
          property: {
            landlordId: ctx.auth?.session?.userId ?? '',
          },
        },
      };

      if (search && search.trim()) {
        whereClause.OR = [
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
          {
            unit: {
              property: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          },
          {
            unit: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
        ];
      }

      if (status && status !== 'all') {
        whereClause.status = status;
      }

      if (propertyId && propertyId !== 'all') {
        whereClause.unit.property.id = propertyId;
      }

      let orderBy: any = { createdAt: 'desc' };

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

    const now = new Date();
    const nowUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    const thisMonthLeases = leases.filter((lease) => {
      const leaseDate = new Date(lease.createdAt);
      const leaseDateUTC = new Date(
        Date.UTC(
          leaseDate.getUTCFullYear(),
          leaseDate.getUTCMonth(),
          leaseDate.getUTCDate()
        )
      );
      return isWithinInterval(leaseDateUTC, {
        start: startOfMonth(nowUTC),
        end: endOfMonth(nowUTC),
      });
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
      const landlordId = ctx.auth?.session?.userId;

      if (!landlordId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      try {
        const unit = await ctx.db.unit.findFirst({
          where: {
            id: input.unitId,
            property: {
              landlordId: landlordId,
            },
          },
          include: {
            property: true,
          },
        });

        if (!unit) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Unit not found or does not belong to you',
          });
        }

        const tenant = await ctx.db.tenant.findFirst({
          where: {
            id: input.tenantId,
            landlordId: landlordId,
          },
        });

        if (!tenant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tenant not found or does not belong to you',
          });
        }

        const existingLease = await ctx.db.lease.findFirst({
          where: {
            unitId: input.unitId,
            status: 'ACTIVE',
          },
        });

        if (existingLease) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Unit already has an active lease',
          });
        }

        const result = await ctx.db.$transaction(async (tx) => {
          const lease = await tx.lease.create({
            data: {
              unitId: input.unitId,
              startDate: input.leaseStartDate,
              endDate: input.leaseEndDate,
              rent: input.rent,
              deposit: input.deposit,
              status: LeaseStatus.ACTIVE,
              rentDueCurrency: 'ZAR',
              leaseType: input.leaseEndDate
                ? LeaseTermType.FIXED_TERM
                : LeaseTermType.MONTHLY,
              invoiceCycle: InvoiceCycle.MONTHLY,
              automaticInvoice: input.automaticInvoice,
              tenantLease: {
                create: {
                  tenantId: input.tenantId,
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

          let recurringBillable = null;
          let automaticInvoice = true;
          if (automaticInvoice) {
            // Ensure we work with UTC dates for invoice scheduling
            const startDateUTC = new Date(input.leaseStartDate);
            let nextInvoiceDate = new Date(
              Date.UTC(
                startDateUTC.getUTCFullYear(),
                startDateUTC.getUTCMonth(),
                startDateUTC.getUTCDate()
              )
            );
            if (input.invoiceCycle === InvoiceCycle.MONTHLY) {
              nextInvoiceDate = new Date(
                Date.UTC(
                  nextInvoiceDate.getUTCFullYear(),
                  nextInvoiceDate.getUTCMonth() + 1,
                  nextInvoiceDate.getUTCDate()
                )
              );
            }

            recurringBillable = await tx.recurringBillable.create({
              data: {
                startDate: new Date(
                  Date.UTC(
                    startDateUTC.getUTCFullYear(),
                    startDateUTC.getUTCMonth(),
                    startDateUTC.getUTCDate()
                  )
                ),
                endDate: input.leaseEndDate
                  ? new Date(
                      Date.UTC(
                        input.leaseEndDate.getUTCFullYear(),
                        input.leaseEndDate.getUTCMonth(),
                        input.leaseEndDate.getUTCDate()
                      )
                    )
                  : null,
                description: `Monthly rent for ${tenant.firstName} ${tenant.lastName} - Unit ${unit.name}`,
                amount: input.rent,
                category: InvoiceCategory.RENT,
                cycle: InvoiceCycle.MONTHLY,
                nextInvoiceAt: nextInvoiceDate,
                isActive: true,
                leaseId: lease.id,
                tenantId: input.tenantId,
                propertyId: unit.propertyId,
              },
            });
          }

          return { lease, recurringBillable };
        });

        return {
          success: true,
          message: 'Lease created successfully',
          lease: result.lease,
          recurringBillable: result.recurringBillable,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('Error creating lease:', error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create lease. Please try again.',
        });
      }
    }),
});
