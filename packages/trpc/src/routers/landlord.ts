import { createTRPCRouter, protectedProcedure } from '../server/trpc';

export const landlordRouter = createTRPCRouter({
  getLandlord: protectedProcedure.query(async ({ ctx }) => {
    return ctx.auth?.session?.userId;
  }),
  handleNewUser: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.auth?.session?.userId;
  }),
  onboarding: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.auth?.session?.userId;
  }),
});
