import { nanoid } from 'nanoid';

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '../server/trpc';
import {
  VCreatePropertySchema,
  VUpdatePropertySchema,
  VAddUnitsSchema,
} from './portfolio.types';
import * as v from 'valibot';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@leaseup/prisma/client/client.js';

const FEATURE_OPTIONS = [
  'Alarm System',
  'Air Conditioning',
  'WIFI Internet',
  'Cable TV',
  'Dishwasher',
  'Dryer',
  'Fridge',
  'Microwave',
  'Oven',
  'Stove',
  'Fireplace',
];

const AMENITIES = [
  'BBQ Grill',
  'Pool',
  'Fitness Center',
  'Pet Friendly',
  'Gym',
  'Laundry',
  'Parking',
  'Storage',
];

export const portfolioRouter = createTRPCRouter({
  createProperty: protectedProcedure
    .input(VCreatePropertySchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.$transaction(async (tx: Prisma.TransactionClient) => {
        return tx.property.create({
          data: {
            id: nanoid(),
            landlordId: ctx.auth?.session?.userId ?? '',
            name: input.name,
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2,
            city: input.city,
            state: input.state,
            zip: input.zip,
            countryCode: 'ZA',
            propertyType: input.propertyType,
            features: input.features,
            amenities: input.amenities,
            unit: {
              create:
                input.propertyUnits.map((unit) => ({
                  name: unit.unitNumber,
                  bedrooms: unit.bedrooms,
                  bathrooms: unit.bathrooms,
                  sqmt: unit.sqmt,
                  marketRent: unit.marketRent,
                  deposit: 0,
                })) ?? [],
            },
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
      });
      return {
        success: true,
        message: 'Property created successfully',
      };
    }),

  updateProperty: protectedProcedure
    .input(VUpdatePropertySchema)
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
        // Check if property exists and belongs to the current user
        const existingProperty = await ctx.db.property.findFirst({
          where: {
            id,
            landlordId,
          },
          include: {
            unit: true,
          },
        });

        if (!existingProperty) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message:
              'Property not found or you do not have permission to update it',
          });
        }

        await ctx.db.$transaction(async (tx: Prisma.TransactionClient) => {
          // Update property basic info
          await tx.property.update({
            where: { id },
            data: {
              name: updateData.name,
              addressLine1: updateData.addressLine1,
              addressLine2: updateData.addressLine2,
              city: updateData.city,
              state: updateData.state,
              zip: updateData.zip,
              propertyType: updateData.propertyType,
              features: updateData.features,
              amenities: updateData.amenities,
            },
          });

          // Handle units - delete existing ones first, then create new ones
          await tx.unit.deleteMany({
            where: { propertyId: id },
          });

          // Create new units
          if (updateData.propertyUnits.length > 0) {
            await tx.unit.createMany({
              data: updateData.propertyUnits.map((unit) => ({
                id: nanoid(),
                propertyId: id,
                name: unit.unitNumber,
                bedrooms: unit.bedrooms,
                bathrooms: unit.bathrooms,
                sqmt: unit.sqmt,
                marketRent: unit.marketRent,
                deposit: 0,
              })),
            });
          }

          // Handle files - delete existing ones first, then create new ones
          await tx.file.deleteMany({
            where: { propertyId: id },
          });

          // Create new files
          if (updateData.files.length > 0) {
            await tx.file.createMany({
              data: updateData.files.map((file) => ({
                id: nanoid(),
                name: file.name,
                url: file.url,
                type: file.type,
                size: file.size,
                ownerId: landlordId,
                propertyId: id,
              })),
            });
          }
        });

        return {
          success: true,
          message: 'Property updated successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update property',
        });
      }
    }),

  getAllProperties: protectedProcedure.query(async ({ ctx }) => {
    const properties = await ctx.db.property.findMany({
      include: {
        unit: {
          include: {
            lease: {
              include: {
                tenantLease: {
                  include: {
                    tenant: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        landlordId: ctx.auth?.session?.userId ?? '',
      },
    });
    return properties;
  }),

  getById: protectedProcedure
    .input(v.string())
    .query(async ({ ctx, input }) => {
      const property = await ctx.db.property.findFirst({
        where: {
          id: input,
          landlordId: ctx.auth?.session?.userId ?? '',
        },
        include: {
          unit: {
            include: {
              lease: {
                include: {
                  tenantLease: {
                    include: {
                      tenant: true,
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
          landlord: {
            select: {
              id: true,
              name: true,
              businessName: true,
              email: true,
              phone: true,
              addressLine1: true,
              addressLine2: true,
              city: true,
              state: true,
              zip: true,
              countryCode: true,
            },
          },
        },
      });

      if (!property) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'Property not found or you do not have permission to view it',
        });
      }

      return property;
    }),

  getAllUnits: protectedProcedure.query(async ({ ctx }) => {
    const units = await ctx.db.unit.findMany({
      include: {
        property: true,
        lease: {
          include: {
            tenantLease: {
              include: {
                tenant: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        property: {
          landlordId: ctx.auth?.session?.userId ?? '',
        },
      },
    });
    return units;
  }),
  getPropertyFeatures: publicProcedure.query(async ({ ctx }) => {
    return FEATURE_OPTIONS;
  }),
  getPropertyAmenities: publicProcedure.query(async ({ ctx }) => {
    return AMENITIES;
  }),

  addUnits: protectedProcedure
    .input(VAddUnitsSchema)
    .mutation(async ({ ctx, input }) => {
      const landlordId = ctx.auth?.session?.userId;

      if (!landlordId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Verify property belongs to landlord
      const property = await ctx.db.property.findFirst({
        where: {
          id: input.propertyId,
          landlordId: landlordId,
        },
      });

      if (!property) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Property not found or does not belong to you',
        });
      }

      try {
        // Create units
        await ctx.db.unit.createMany({
          data: input.units.map((unit) => ({
            id: nanoid(),
            propertyId: input.propertyId,
            name: unit.unitNumber,
            bedrooms: unit.bedrooms,
            bathrooms: unit.bathrooms,
            sqmt: unit.sqmt,
            marketRent: unit.marketRent,
            deposit: unit.deposit,
          })),
        });

        return {
          success: true,
          message: 'Units added successfully',
        };
      } catch (error) {
        console.error('Error adding units:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to add units',
        });
      }
    }),
});
