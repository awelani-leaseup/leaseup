import { nanoid } from 'nanoid';

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '../server/trpc';
import { VCreatePropertySchema } from './portfolio.types';

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
      await ctx.db.$transaction(async (tx) => {
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
});
