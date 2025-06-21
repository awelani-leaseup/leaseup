import * as v from 'valibot';

import { createTRPCRouter, publicProcedure } from '../server/trpc';

export const portfolioRouter = createTRPCRouter({
  hello: publicProcedure
    .input(v.object({ text: v.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text} 22`,
      };
    }),

  create: publicProcedure
    .input(v.object({ name: v.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.property.create({
        data: {
          name: input.name,
          owner: {
            create: {
              name: input.name,
            },
          },
          addressLine1: input.name,
          city: input.name,
          state: input.name,
          zip: input.name,
        },
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const properties = await ctx.db.property.findMany();
    return properties;
  }),
});
