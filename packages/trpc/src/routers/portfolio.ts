import * as v from 'valibot';

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '../server/trpc';
import { VCreatePropertySchema } from './portfolio.types';

export const portfolioRouter = createTRPCRouter({
  hello: publicProcedure
    .input(v.object({ text: v.string() }))
    .query(({ input, ctx }) => {
      const { userId, sessionId } = ctx.auth;
      return {
        greeting: `Hello ${input.text} 22 ${userId} ${sessionId}`,
      };
    }),

  createProperty: protectedProcedure
    .input(VCreatePropertySchema)
    .mutation(async ({ ctx, input }) => {
      const owner = await ctx.db.landlord.findUnique({
        where: {
          id: ctx.auth.userId ?? '',
        },
      });

      await ctx.db.$transaction(async (tx) => {
        let ownerId = owner?.id || '';
        if (!owner) {
          const newOwner = await tx.landlord.create({
            data: {
              id: ctx.auth.userId ?? '',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              phone: '+27712345678',
              addressLine1: input.addressLine1,
              addressLine2: input.addressLine2,
              city: input.city,
              state: input.state,
              zip: input.zip,
            },
          });
          ownerId = newOwner.id;
        }

        return tx.property.create({
          data: {
            ownerId: ownerId,
            name: input.name,
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2,
            city: input.city,
            state: input.state,
            zip: input.zip,
            countryCode: 'ZA',
            propertyType: input.propertyType,
            bedrooms: input.bedrooms,
            bathrooms: input.bathrooms,
            sqmt: input.sqmt,
            marketRent: input.marketRent,
            deposit: input.deposit,
            features: input.propertyFeatures,
            amenities: input.propertyAmenities,
            unit: {
              create:
                input.propertyUnits.map((unit) => ({
                  name: unit.unitNumber,
                  bedrooms: unit.bedrooms,
                  bathrooms: unit.bathrooms,
                  sqmt: unit.sqmt,
                  marketRent: unit.marketRent,
                })) ?? [],
            },
          },
        });
      });
      return {
        success: true,
        message: 'Property created successfully',
      };
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const properties = await ctx.db.property.findMany({
      include: {
        unit: {
          include: {
            lease: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return properties;
  }),
});
