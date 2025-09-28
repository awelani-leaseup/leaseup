import { nanoid } from 'nanoid';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import {
  VGetTenantByIdSchema,
  VRemoveTenantSchema,
  VTenantSchema,
  VGetTenantTransactionsSchema,
  VDeleteTenantFileSchema,
  VUpdateTenantSchema,
  VAddTenantFilesSchema,
  VGetAllTenantsSchema,
} from './tenant.types';
import { tasks } from '@trigger.dev/sdk/v3';
import { runCreateTenantCustomerEffect } from '@leaseup/tasks/effect';
import { del } from '@vercel/blob';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@leaseup/prisma/client/client.js';

const TENANT_RELATIONSHIPS = [
  'Spouse',
  'Child',
  'Parent',
  'Friend',
  'Guardian',
  'Grandparent',
  'Grandchild',
  'Sibling',
  'Other',
];

export const tenantRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(VGetAllTenantsSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, propertyId, status, sortBy, sortOrder } =
        input;
      const skip = (page - 1) * limit;

      const whereClause: Prisma.TenantWhereInput = {
        landlordId: ctx.auth?.session?.userId ?? '',
      };

      if (search && search.trim()) {
        whereClause.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (propertyId && propertyId !== 'all') {
        whereClause.tenantLease = {
          some: {
            lease: {
              unit: {
                propertyId: propertyId,
              },
            },
          },
        };
      }

      if (status && status !== 'all') {
        switch (status) {
          case 'active':
            whereClause.tenantLease = {
              some: {
                lease: {
                  status: 'ACTIVE',
                },
              },
            };
            break;
          case 'inactive':
            whereClause.tenantLease = {
              some: {
                lease: {
                  status: { not: 'ACTIVE' },
                },
              },
            };
            break;
          case 'no_lease':
            whereClause.tenantLease = {
              none: {},
            };
            break;
        }
      }

      let orderBy: Prisma.TenantOrderByWithRelationInput = {
        createdAt: 'desc',
      };
      if (sortBy && sortOrder) {
        switch (sortBy) {
          case 'firstName':
            orderBy = { firstName: sortOrder };
            break;
          case 'lastName':
            orderBy = { lastName: sortOrder };
            break;
          case 'email':
            orderBy = { email: sortOrder };
            break;
          case 'createdAt':
            orderBy = { createdAt: sortOrder };
            break;
          case 'updatedAt':
            orderBy = { updatedAt: sortOrder };
            break;
        }
      }

      const totalCount = await ctx.db.tenant.count({
        where: whereClause,
      });

      const tenants = await ctx.db.tenant.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: {
          tenantLease: {
            include: {
              lease: {
                include: {
                  unit: {
                    include: {
                      property: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return {
        tenants,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      };
    }),
  getTenantRelationShips: protectedProcedure.query(async ({ ctx }) => {
    return TENANT_RELATIONSHIPS;
  }),
  deleteTenantFile: protectedProcedure
    .input(VDeleteTenantFileSchema)
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.file.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.auth?.session?.userId ?? '',
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
  addTenantFiles: protectedProcedure
    .input(VAddTenantFilesSchema)
    .mutation(async ({ ctx, input }) => {
      const existingTenant = await ctx.db.tenant.findFirst({
        where: {
          id: input.tenantId,
          landlordId: ctx.auth?.session?.userId ?? '',
        },
      });

      if (!existingTenant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'Tenant not found or you do not have permission to add files',
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
            tenantId: input.tenantId,
          })),
        });

        return {
          success: true,
          filesCreated: createdFiles.count,
        };
      } catch (error) {
        console.error('Failed to add files to tenant:', error);

        await del(input.files.map((file) => file.url)).catch(() => {});

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add files to tenant',
        });
      }
    }),
  createTenant: protectedProcedure
    .input(VTenantSchema)
    .mutation(async ({ ctx, input }) => {
      const id = nanoid(18);

      try {
        const tenant = await ctx.db.tenant.create({
          data: {
            id: id,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.primaryEmail,
            phone: input.primaryPhoneNumber,
            landlordId: ctx.auth?.session?.userId ?? '',
            dateOfBirth: input.dateOfBirth,
            additionalEmails: input.additionalEmails,
            additionalPhones: input.additionalPhones,
            emergencyContacts: input.emergencyContacts,
            vehicles: input.vehicles,
            // @ts-ignore
            avatarUrl: input.avatarUrl,
            files: {
              create: input.files?.map((file) => ({
                id: nanoid(),
                name: file.name,
                url: file.url,
                type: file.type,
                size: file.size,
                ownerId: ctx.auth?.session?.userId ?? '',
              })),
            },
          },
        });

        await runCreateTenantCustomerEffect({
          tenantId: tenant.id,
        });

        return tenant;
      } catch {
        if (input.avatarUrl) {
          await del(input.avatarUrl);
        }

        if (input.files && input.files.length > 0) {
          await del(input.files.map((file) => file.url));
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create tenant',
        });
      }
    }),
  updateTenant: protectedProcedure
    .input(VUpdateTenantSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      try {
        // Check if tenant exists and belongs to the current user
        const existingTenant = await ctx.db.tenant.findFirst({
          where: {
            id,
            landlordId: ctx.auth?.session?.userId ?? '',
          },
        });

        if (!existingTenant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message:
              'Tenant not found or you do not have permission to update it',
          });
        }

        const tenant = await ctx.db.tenant.update({
          where: {
            id,
          },
          data: {
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            email: updateData.primaryEmail,
            phone: updateData.primaryPhoneNumber,
            dateOfBirth: updateData.dateOfBirth,
            additionalEmails: updateData.additionalEmails,
            additionalPhones: updateData.additionalPhones,
            emergencyContacts: updateData.emergencyContacts,
            vehicles: updateData.vehicles,
            // @ts-ignore
            avatarUrl: updateData.avatarUrl,
          },
        });

        return tenant;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        // Clean up uploaded avatar if update fails
        if (updateData.avatarUrl) {
          await del(updateData.avatarUrl).catch(() => {});
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update tenant',
        });
      }
    }),
  getTenantById: protectedProcedure
    .input(VGetTenantByIdSchema)
    .query(async ({ ctx, input }) => {
      const tenant = await ctx.db.tenant.findFirst({
        where: {
          id: input.id,
          landlordId: ctx.auth?.session?.userId ?? '',
        },
        include: {
          tenantLease: {
            include: {
              lease: {
                include: {
                  unit: {
                    include: {
                      property: true,
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
                },
              },
            },
          },
          files: true,
        },
      });
      return tenant;
    }),
  removeTenant: protectedProcedure
    .input(VRemoveTenantSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.tenant.delete({
        where: { id: input.id },
      });
    }),
  completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    await tasks.trigger('landlord-onboard-successful', {
      userId: ctx.auth?.session?.userId ?? '',
    });
  }),
  getTenantTransactions: protectedProcedure
    .input(VGetTenantTransactionsSchema)
    .query(async ({ ctx, input }) => {
      // Get all transactions for this tenant through their leases
      const transactions = await ctx.db.transactions.findMany({
        where: {
          invoice: {
            tenantId: input.id,
          },
        },
        include: {
          invoice: true,
          lease: {
            include: {
              unit: {
                include: {
                  property: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return transactions;
    }),
});
