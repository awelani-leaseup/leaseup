import { createCallerFactory, createTRPCRouter } from './trpc';
import { portfolioRouter } from '../routers';
import { tenantRouter } from '../routers/tenant';
import { leaseRouter } from '../routers/lease';
import { invoiceRouter } from '../routers/invoice';

export const appRouter = createTRPCRouter({
  portfolio: portfolioRouter,
  tenant: tenantRouter,
  lease: leaseRouter,
  invoice: invoiceRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter) as any;
