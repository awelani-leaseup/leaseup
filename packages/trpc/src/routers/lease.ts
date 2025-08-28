import { VCreateLeaseSchema, VGetAllLeasesSchema } from './lease.types';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { TRPCError } from '@trpc/server';
import { nanoid } from 'nanoid';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  InvoiceCycle,
  LeaseStatus,
  LeaseTermType,
} from '@leaseup/prisma/client/index.js';
import { createLeaseEffect } from '@leaseup/tasks/effect';
import { Effect } from 'effect';

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

    const thisMonthLeases = leases.filter((lease) => {
      const leaseDate = new Date(lease.createdAt);
      return isWithinInterval(leaseDate, {
        start: startOfMonth(now),
        end: endOfMonth(now),
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
      return await ctx.db.$transaction(async (tx) => {
        const lease = await tx.lease.create({
          data: {
            id: nanoid(),
            unitId: input.unitId,
            startDate: new Date(input.leaseStartDate).toISOString(),
            endDate: input.leaseEndDate
              ? new Date(input.leaseEndDate).toISOString()
              : null,
            deposit: input.deposit,
            rent: input.rent,
            status: LeaseStatus.ACTIVE,
            rentDueCurrency: 'ZAR',
            leaseType: LeaseTermType.MONTHLY,
            invoiceCycle: InvoiceCycle.MONTHLY,
            automaticInvoice: input.automaticInvoice,
            tenantLease: {
              create: {
                tenantId: input.tenantId,
              },
            },
          },
        });

        try {
          await Effect.runPromise(
            createLeaseEffect({
              leaseId: lease.id,
            })
          );
        } catch (effectError: any) {
          // Convert Effect errors to meaningful user-facing errors and throw to abort transaction
          if (
            effectError &&
            typeof effectError === 'object' &&
            '_tag' in effectError
          ) {
            switch (effectError._tag) {
              case 'LeaseNotFoundError':
                throw new TRPCError({
                  code: 'NOT_FOUND',
                  message: `Lease not found: ${effectError.message}`,
                });
              case 'LandlordNotFoundError':
                throw new TRPCError({
                  code: 'NOT_FOUND',
                  message: `Landlord not found: ${effectError.message}`,
                });
              case 'NoTenantsFoundError':
                throw new TRPCError({
                  code: 'NOT_FOUND',
                  message: `No tenants found: ${effectError.message}`,
                });
              case 'LandlordOnboardingIncompleteError':
                throw new TRPCError({
                  code: 'PRECONDITION_FAILED',
                  message: `Landlord onboarding incomplete: ${effectError.message}`,
                });
              case 'PaystackPlanCreationError':
                throw new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: `Failed to create payment plan: ${effectError.message}`,
                });
              case 'PaystackSubscriptionCreationError':
                throw new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: `Failed to create subscription: ${effectError.message}`,
                });
              case 'PaystackTransactionInitializationError':
                throw new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: `Failed to initialize payment: ${effectError.message}`,
                });
              case 'DatabaseError':
                throw new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: `Database error: ${effectError.message}`,
                });
              case 'PaystackApiError':
                throw new TRPCError({
                  code: 'BAD_REQUEST',
                  message: `Payment service error: ${effectError.message || 'Unknown payment error'}`,
                });
              default:
                throw new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: `Failed to set up lease: ${effectError.message || 'Unknown error occurred'}`,
                });
            }
          } else {
            // Handle unexpected error format
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Failed to set up lease: ${effectError?.message || 'Unknown error occurred'}`,
            });
          }
        }

        return lease;
      });
    }),
});
