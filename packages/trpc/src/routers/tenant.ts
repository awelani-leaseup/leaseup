import { nanoid } from 'nanoid';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { VRemoveTenantSchema, VTenantSchema } from './tenant.types';

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
        landlordId: ctx.auth.userId ?? '',
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

    console.log(tenants);
    return tenants;
  }),
  getTenantRelationShips: protectedProcedure.query(async ({ ctx }) => {
    return TENANT_RELATIONSHIPS;
  }),
  createTenant: protectedProcedure
    .input(VTenantSchema)
    .mutation(async ({ ctx, input }) => {
      const id = nanoid(18);
      const tenant = await ctx.db.tenant.create({
        data: {
          id: id,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.primaryEmail,
          phone: input.primaryPhoneNumber,
          landlordId: ctx.auth.userId ?? '',
          dateOfBirth: input.dateOfBirth,
          additionalEmails: input.additionalEmails,
          additionalPhones: input.additionalPhones,
          emergencyContacts: input.emergencyContacts,
          vehicles: input.vehicles,
          // @ts-ignore
          avatarUrl: input.avatarUrl,
          files: {
            create: input.files?.map((file) => ({
              name: file.name,
              url: file.url,
              type: file.type,
              size: file.size,
              ownerId: ctx.auth.userId ?? '',
            })),
          },
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
});
