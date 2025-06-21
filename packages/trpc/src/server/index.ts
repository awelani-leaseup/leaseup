import { createCallerFactory, createTRPCRouter } from './trpc';
import { portfolioRouter } from '../routers';

export const appRouter = createTRPCRouter({
  portfolio: portfolioRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
