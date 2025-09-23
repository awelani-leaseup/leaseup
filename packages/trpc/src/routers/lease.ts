import {
  VCreateLeaseSchema,
  VGetAllLeasesSchema,
  VAddLeaseFilesSchema,
  VDeleteLeaseFileSchema,
  VUpdateLeaseSchema,
} from './lease.types';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { TRPCError } from '@trpc/server';
import * as v from 'valibot';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  InvoiceCategory,
  InvoiceCycle,
  type Lease,
  LeaseStatus,
  LeaseTermType,
  Prisma,
} from '@leaseup/prisma/client/client.js';
import { del } from '@vercel/blob';
import { nanoid } from 'nanoid';

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
      (lease: Lease) => lease.status === 'ACTIVE'
    ).length;
    const expiredLeases = leases.filter(
      (lease: Lease) => lease.status === 'EXPIRED'
    ).length;
    const totalRentValue = leases
      .filter((lease: Lease) => lease.status === 'ACTIVE')
      .reduce((sum: number, lease: Lease) => sum + lease.rent, 0);

    const now = new Date();
    const nowUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    const thisMonthLeases = leases.filter((lease: Lease) => {
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

        const result = await ctx.db.$transaction(
          async (tx: Prisma.TransactionClient) => {
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
          }
        );

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

  getById: protectedProcedure
    .input(v.string())
    .query(async ({ ctx, input }) => {
      const lease = await ctx.db.lease.findFirst({
        where: {
          id: input,
          unit: {
            property: {
              landlordId: ctx.auth?.session?.userId ?? '',
            },
          },
        },
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
                  files: true,
                },
              },
            },
          },
          File: true,
          invoice: {
            include: {
              transactions: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          transactions: {
            include: {
              invoice: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          maintenanceRequest: {
            orderBy: {
              createdAt: 'desc',
            },
          },
          recurringBillable: {
            where: {
              isActive: true,
            },
          },
        },
      });

      if (!lease) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lease not found or you do not have permission to view it',
        });
      }

      return lease;
    }),

  addLeaseFiles: protectedProcedure
    .input(VAddLeaseFilesSchema)
    .mutation(async ({ ctx, input }) => {
      const existingLease = await ctx.db.lease.findFirst({
        where: {
          id: input.leaseId,
          unit: {
            property: {
              landlordId: ctx.auth?.session?.userId ?? '',
            },
          },
        },
      });

      if (!existingLease) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lease not found or you do not have permission to add files',
        });
      }

      try {
        const createdFiles = await ctx.db.file.createMany({
          data: input.files.map((file) => ({
            id: nanoid(),
            name: file.name,
            url: file.url,
            type: file.type,
            size: file.size,
            ownerId: ctx.auth?.session?.userId ?? '',
            leaseId: input.leaseId,
          })),
        });

        return {
          success: true,
          filesCreated: createdFiles.count,
        };
      } catch (error) {
        console.error('Failed to add files to lease:', error);

        await del(input.files.map((file) => file.url)).catch(() => {});

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add files to lease',
        });
      }
    }),

  deleteLeaseFile: protectedProcedure
    .input(VDeleteLeaseFileSchema)
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.file.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.auth?.session?.userId ?? '',
          leaseId: { not: null },
        },
      });

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        });
      }

      await ctx.db.file.delete({
        where: {
          id: file.id,
          ownerId: ctx.auth?.session?.userId ?? '',
        },
      });

      await del(file.url);

      return {
        success: true,
      };
    }),

  updateLease: protectedProcedure
    .input(VUpdateLeaseSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const landlordId = ctx.auth?.session?.userId;

      if (!landlordId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      try {
        // Check if lease exists and belongs to the current user
        const existingLease = await ctx.db.lease.findFirst({
          where: {
            id,
            unit: {
              property: {
                landlordId: landlordId,
              },
            },
          },
          include: {
            unit: {
              include: {
                property: true,
              },
            },
            tenantLease: true,
          },
        });

        if (!existingLease) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message:
              'Lease not found or you do not have permission to update it',
          });
        }

        if (updateData.unitId || updateData.propertyId) {
          const unitId = updateData.unitId ?? existingLease.unitId;

          if (!unitId) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Unit ID is required',
            });
          }

          const unit = await ctx.db.unit.findFirst({
            where: {
              id: unitId,
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

          if (updateData.unitId && updateData.unitId !== existingLease.unitId) {
            const existingActiveLeaseOnUnit = await ctx.db.lease.findFirst({
              where: {
                unitId: updateData.unitId,
                status: 'ACTIVE',
                id: { not: id },
              },
            });

            if (existingActiveLeaseOnUnit) {
              throw new TRPCError({
                code: 'CONFLICT',
                message: 'Unit already has an active lease',
              });
            }
          }
        }

        if (updateData.tenantId) {
          const tenant = await ctx.db.tenant.findFirst({
            where: {
              id: updateData.tenantId,
              landlordId: landlordId,
            },
          });

          if (!tenant) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Tenant not found or does not belong to you',
            });
          }
        }

        const leaseUpdateData: any = {};

        if (updateData.leaseStartDate !== undefined) {
          leaseUpdateData.startDate = updateData.leaseStartDate;
        }
        if (updateData.leaseEndDate !== undefined) {
          leaseUpdateData.endDate = updateData.leaseEndDate;
        }
        if (updateData.rent !== undefined) {
          leaseUpdateData.rent = updateData.rent;
        }
        if (updateData.deposit !== undefined) {
          leaseUpdateData.deposit = updateData.deposit;
        }

        if (updateData.invoiceCycle !== undefined) {
          leaseUpdateData.invoiceCycle =
            updateData.invoiceCycle as InvoiceCycle;
        }
        if (updateData.leaseType !== undefined) {
          leaseUpdateData.leaseType = updateData.leaseType as LeaseTermType;
        }
        if (updateData.unitId !== undefined) {
          leaseUpdateData.unitId = updateData.unitId;
        }

        const updatedLease = await ctx.db.lease.update({
          where: { id },
          data: leaseUpdateData,
          include: {
            unit: {
              include: {
                property: {
                  include: {
                    landlord: true,
                  },
                },
              },
            },
            tenantLease: {
              include: {
                tenant: true,
              },
            },
            File: true,
          },
        });

        // If tenant is being updated, update the tenant lease relationship
        if (
          updateData.tenantId &&
          updateData.tenantId !== existingLease.tenantLease[0]?.tenantId
        ) {
          // Remove existing tenant lease relationships
          await ctx.db.tenantLease.deleteMany({
            where: {
              leaseId: id,
            },
          });

          // Create new tenant lease relationship
          await ctx.db.tenantLease.create({
            data: {
              leaseId: id,
              tenantId: updateData.tenantId,
            },
          });
        }

        return updatedLease;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('Failed to update lease:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update lease',
        });
      }
    }),
});
