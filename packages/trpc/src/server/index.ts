import { createCallerFactory, createTRPCRouter } from './trpc';
import {
  portfolioRouter,
  tenantRouter,
  leaseRouter,
  invoiceRouter,
  onboardingRouter,
  transactionRouter,
  dashboardRouter,
  userRouter,
} from '../routers';

export const appRouter = createTRPCRouter({
  portfolio: portfolioRouter,
  tenant: tenantRouter,
  lease: leaseRouter,
  invoice: invoiceRouter,
  onboarding: onboardingRouter,
  transaction: transactionRouter,
  dashboard: dashboardRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter) as any;
