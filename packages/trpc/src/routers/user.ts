import { SubscriptionPlanStatus } from '@leaseup/prisma/client/client.js';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { paystack } from '@leaseup/payments/open-api/client';
import { TRPCError } from '@trpc/server';

export const userRouter = createTRPCRouter({
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

      return (
        user.paystackSubscriptionStatus === SubscriptionPlanStatus.ACTIVE &&
        user.paystackSubscriptionId !== null
      );
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }),

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

  getPaystackSubscriptionDetails: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth?.user?.id;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    try {
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: {
          paystackSubscriptionId: true,
          subscriptionPlanCode: true,
        },
      });

      if (!user || !user.paystackSubscriptionId) {
        return {
          hasSubscription: false,
          subscription: null,
          plan: null,
        };
      }

      let subscriptionDetails = null;
      let planDetails = null;

      try {
        const { data: subscriptionData, error: subscriptionError } =
          await paystack.GET('/subscription/{code}', {
            params: {
              path: {
                code: user.paystackSubscriptionId,
              },
            },
          });

        if (!subscriptionError && subscriptionData?.data) {
          subscriptionDetails = subscriptionData.data;
        }
      } catch (error) {
        console.error('Error fetching subscription from Paystack:', error);
      }

      if (user.subscriptionPlanCode) {
        try {
          const { data: planData, error: planError } = await paystack.GET(
            '/plan/{code}',
            {
              params: {
                path: {
                  code: user.subscriptionPlanCode,
                },
              },
            }
          );

          if (!planError && planData?.data) {
            planDetails = planData.data;
          }
        } catch (error) {
          console.error('Error fetching plan from Paystack:', error);
        }
      }

      return {
        hasSubscription: true,
        subscription: subscriptionDetails,
        plan: planDetails,
      };
    } catch (error) {
      console.error('Error fetching Paystack subscription details:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch subscription details. Please try again.',
      });
    }
  }),

  generateSubscriptionManagementLink: protectedProcedure.mutation(
    async ({ ctx }) => {
      const userId = ctx.auth?.user?.id;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      try {
        const user = await ctx.db.user.findUnique({
          where: { id: userId },
          select: {
            paystackSubscriptionId: true,
          },
        });

        if (!user || !user.paystackSubscriptionId) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No active subscription found',
          });
        }

        const { data: managementLinkData, error: managementLinkError } =
          await paystack.GET('/subscription/{code}/manage/link', {
            params: {
              path: {
                code: user.paystackSubscriptionId,
              },
            },
          });

        if (managementLinkError || !managementLinkData?.data) {
          console.error(
            'Error generating subscription management link:',
            managementLinkError
          );
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate subscription management link',
          });
        }

        return {
          managementLink: managementLinkData.data.link,
        };
      } catch (error) {
        console.error('Error generating subscription management link:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate subscription management link',
        });
      }
    }
  ),
});
