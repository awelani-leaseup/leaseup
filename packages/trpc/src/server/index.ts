import { createCallerFactory, createTRPCRouter } from './trpc';
import { portfolioRouter } from '../routers';
import { tenantRouter } from '../routers/tenant';
import { leaseRouter } from '../routers/lease';

export const appRouter = createTRPCRouter({
  portfolio: portfolioRouter,
  tenant: tenantRouter,
  lease: leaseRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter) as any;
