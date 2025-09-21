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
          paystackCustomerId: true,
          paystackSubscriptionId: true,
        },
      });

      if (!user || !user.paystackCustomerId) {
        return {
          hasSubscription: false,
          subscription: null,
          plan: null,
        };
      }

      try {
        // Fetch customer data from Paystack customer endpoint
        const { data: customerData, error: customerError } = await paystack.GET(
          '/customer/{code}',
          {
            params: {
              path: {
                code: user.paystackCustomerId,
              },
            },
          }
        );

        if (customerError || !customerData?.data) {
          console.error(
            'Error fetching customer from Paystack:',
            customerError
          );
          return {
            hasSubscription: false,
            subscription: null,
            plan: null,
          };
        }

        const customer = customerData.data as any;
        const subscriptions = customer.subscriptions || [];

        if (!subscriptions || subscriptions.length === 0) {
          return {
            hasSubscription: false,
            subscription: null,
            plan: null,
          };
        }

        let activeSubscription = subscriptions.find(
          (sub: any) => sub.status === 'active'
        );
        if (!activeSubscription && subscriptions.length > 0) {
          activeSubscription = subscriptions[0];
        }

        console.log('Active subscription:', activeSubscription);

        const planDetails = activeSubscription?.plan || null;

        return {
          hasSubscription: true,
          subscription: activeSubscription,
          plan: planDetails,
        };
      } catch (error) {
        console.error('Error fetching customer data from Paystack:', error);
        return {
          hasSubscription: false,
          subscription: null,
          plan: null,
        };
      }
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
  syncSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.auth?.user?.id;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    try {
      // Get the current user with their Paystack customer ID
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          paystackCustomerId: true,
          email: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (!user.paystackCustomerId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No Paystack customer ID found for this user',
        });
      }

      // Fetch customer data from Paystack to access subscriptions array
      const { data: customerData, error: customerError } = await paystack.GET(
        '/customer/{code}',
        {
          params: {
            path: {
              code: user.paystackCustomerId,
            },
          },
        }
      );

      console.log('Customer data:', customerData);

      if (customerError || !customerData?.data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch customer data from Paystack',
        });
      }

      const customer = customerData.data as any;
      const subscriptions = customer.subscriptions || [];

      if (!subscriptions || subscriptions.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No subscriptions found for this customer',
        });
      }

      const firstSubscription = subscriptions[0];

      await ctx.db.user.update({
        where: { id: userId },
        data: {
          paystackSubscriptionId: firstSubscription.subscription_code,
          paystackSubscriptionStatus:
            firstSubscription.status === 'active'
              ? SubscriptionPlanStatus.ACTIVE
              : SubscriptionPlanStatus.DISABLED,
          subscriptionPlanCode: firstSubscription.plan?.plan_code || null,
          subscriptionAmount: firstSubscription.amount
            ? Math.floor(firstSubscription.amount / 100)
            : null,
          subscriptionCurrency: firstSubscription.plan?.currency || null,
          subscriptionInterval: firstSubscription.plan?.interval || null,
          nextPaymentDate: firstSubscription.next_payment_date
            ? new Date(firstSubscription.next_payment_date)
            : null,
          subscriptionCreatedAt: firstSubscription.createdAt
            ? new Date(firstSubscription.createdAt)
            : null,
          subscriptionUpdatedAt: new Date(),
          lastPaymentFailure: null,
          paymentRetryCount: 0,
        },
      });

      console.log('Subscription synced successfully', {
        userId: user.id,
        email: user.email,
        subscriptionCode: firstSubscription.subscription_code,
        status: firstSubscription.status,
        planCode: firstSubscription.plan?.plan_code,
        amount: firstSubscription.amount,
        currency: firstSubscription.plan?.currency,
      });

      return {
        success: true,
        message: 'Subscription synced successfully',
        subscription: {
          id: firstSubscription.subscription_code,
          status: firstSubscription.status,
          planCode: firstSubscription.plan?.plan_code,
          amount: firstSubscription.amount,
          currency: firstSubscription.plan?.currency,
          interval: firstSubscription.plan?.interval,
          nextPaymentDate: firstSubscription.next_payment_date,
        },
      };
    } catch (error) {
      console.error('Error syncing subscription:', error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to sync subscription. Please try again.',
      });
    }
  }),
});
