import { SubscriptionPlanStatus } from '@leaseup/prisma/client/index.js';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';

export const userRouter = createTRPCRouter({
  /**
   * Get the current user with subscription information
   */
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth?.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          onboardingCompleted: true,
          paystackSubscriptionId: true,
          paystackSubscriptionStatus: true,
          subscriptionPlanCode: true,
          subscriptionAmount: true,
          subscriptionCurrency: true,
          subscriptionInterval: true,
          nextPaymentDate: true,
          subscriptionCreatedAt: true,
          subscriptionUpdatedAt: true,
          lastPaymentFailure: true,
          paymentRetryCount: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }),

  /**
   * Check if the current user has an active subscription
   */
  hasActiveSubscription: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth?.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: {
          paystackSubscriptionStatus: true,
          paystackSubscriptionId: true,
        },
      });

      if (!user) {
        return false;
      }

      // Consider subscription active if status is 'active' and has subscription ID
      return (
        user.paystackSubscriptionStatus === SubscriptionPlanStatus.ACTIVE &&
        user.paystackSubscriptionId !== null
      );
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }),

  /**
   * Get subscription status details for the current user
   */
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth?.user?.id;

    if (!userId) {
      return null;
    }

    try {
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: {
          paystackSubscriptionStatus: true,
          paystackSubscriptionId: true,
          subscriptionPlanCode: true,
          subscriptionAmount: true,
          subscriptionCurrency: true,
          subscriptionInterval: true,
          nextPaymentDate: true,
          lastPaymentFailure: true,
          paymentRetryCount: true,
        },
      });

      if (!user) {
        return null;
      }

      return {
        hasSubscription: user.paystackSubscriptionId !== null,
        status: user.paystackSubscriptionStatus,
        planCode: user.subscriptionPlanCode,
        amount: user.subscriptionAmount,
        currency: user.subscriptionCurrency,
        interval: user.subscriptionInterval,
        nextPaymentDate: user.nextPaymentDate,
        lastPaymentFailure: user.lastPaymentFailure,
        paymentRetryCount: user.paymentRetryCount,
        isActive:
          user.paystackSubscriptionStatus === SubscriptionPlanStatus.ACTIVE &&
          user.paystackSubscriptionId !== null,
      };
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return null;
    }
  }),
});
