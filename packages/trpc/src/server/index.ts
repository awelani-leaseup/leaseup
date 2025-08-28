import { createCallerFactory, createTRPCRouter } from './trpc';
import { portfolioRouter } from '../routers';
import { tenantRouter } from '../routers/tenant';
import { leaseRouter } from '../routers/lease';
import { invoiceRouter } from '../routers/invoice';
import { onboardingRouter } from '../routers/onboarding';
import { transactionRouter } from '../routers/transaction';
import { dashboardRouter } from '../routers/dashboard';

export const appRouter = createTRPCRouter({
  portfolio: portfolioRouter,
  tenant: tenantRouter,
  lease: leaseRouter,
  invoice: invoiceRouter,
  onboarding: onboardingRouter,
  transaction: transactionRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter) as any;
