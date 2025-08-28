import { nanoid } from 'nanoid';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import {
  VGetTenantByIdSchema,
  VRemoveTenantSchema,
  VTenantSchema,
  VGetTenantTransactionsSchema,
  VDeleteTenantFileSchema,
} from './tenant.types';
import { tasks } from '@trigger.dev/sdk/v3';
import { runCreateTenantCustomerEffect } from '@leaseup/tasks/effect';
import { del } from '@vercel/blob';
import { TRPCError } from '@trpc/server';

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
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const tenants = await ctx.db.tenant.findMany({
      where: {
        landlordId: ctx.auth?.session?.userId ?? '',
      },
      orderBy: {
        createdAt: 'desc',
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
              },
            },
          },
        },
      },
    });

    return tenants;
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
