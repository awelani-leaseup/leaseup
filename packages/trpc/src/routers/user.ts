import { SubscriptionPlanStatus } from '@leaseup/prisma/client/client.js';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { paystack } from '@leaseup/payments/open-api/client';
import { TRPCError } from '@trpc/server';
import * as v from 'valibot';

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
          trialStartDate: true,
          trialEndDate: true,
          trialTokenizationTransactionId: true,
        },
      });

      if (!user) {
        return null;
      }

      const now = new Date();
      const isTrialActive =
        user.paystackSubscriptionStatus ===
          SubscriptionPlanStatus.TRIAL_ACTIVE &&
        user.trialEndDate &&
        user.trialEndDate > now;
      const isTrialExpired =
        user.paystackSubscriptionStatus ===
          SubscriptionPlanStatus.TRIAL_EXPIRED ||
        (user.paystackSubscriptionStatus ===
          SubscriptionPlanStatus.TRIAL_ACTIVE &&
          user.trialEndDate &&
          user.trialEndDate <= now);

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
        trialStartDate: user.trialStartDate,
        trialEndDate: user.trialEndDate,
        isTrialActive,
        isTrialExpired,
        daysLeftInTrial: user.trialEndDate
          ? Math.max(
              0,
              Math.ceil(
                (user.trialEndDate.getTime() - now.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : 0,
        isActive:
          (user.paystackSubscriptionStatus === SubscriptionPlanStatus.ACTIVE &&
            user.paystackSubscriptionId !== null) ||
          isTrialActive,
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
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          paystackCustomerId: true,
          email: true,
          name: true,
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

      let subscriptionStatus: SubscriptionPlanStatus;
      if (firstSubscription.status === 'active') {
        subscriptionStatus = SubscriptionPlanStatus.ACTIVE;
      } else if (firstSubscription.status === 'attention') {
        subscriptionStatus = SubscriptionPlanStatus.ATTENTION;
      } else if (firstSubscription.status === 'non-renewing') {
        subscriptionStatus = SubscriptionPlanStatus.NON_RENEWING;
      } else if (firstSubscription.status === 'cancelled') {
        subscriptionStatus = SubscriptionPlanStatus.CANCELLED;
      } else if (firstSubscription.status === 'completed') {
        subscriptionStatus = SubscriptionPlanStatus.COMPLETED;
      } else {
        subscriptionStatus = SubscriptionPlanStatus.DISABLED;
      }

      const currentUser = await ctx.db.user.findUnique({
        where: { id: userId },
        select: {
          paystackSubscriptionStatus: true,
          trialEndDate: true,
        },
      });

      const now = new Date();
      const isCurrentlyInTrial =
        currentUser?.paystackSubscriptionStatus ===
          SubscriptionPlanStatus.TRIAL_ACTIVE &&
        currentUser?.trialEndDate &&
        currentUser.trialEndDate > now;

      if (isCurrentlyInTrial && firstSubscription.status !== 'active') {
        subscriptionStatus = SubscriptionPlanStatus.TRIAL_ACTIVE;
      }

      await ctx.db.user.update({
        where: { id: userId },
        data: {
          paystackSubscriptionId: firstSubscription.subscription_code,
          paystackSubscriptionStatus: subscriptionStatus,
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

  processTrialTokenization: protectedProcedure
    .input(
      v.object({
        reference: v.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.user?.id;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      try {
        // Verify the transaction
        const { data: transactionData, error: transactionError } =
          await paystack.GET('/transaction/verify/{reference}', {
            params: {
              path: {
                reference: input.reference,
              },
            },
          });

        if (transactionError || !transactionData?.data) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to verify tokenization transaction',
          });
        }

        const transaction = transactionData.data;

        if (transaction.status !== 'success') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Tokenization transaction was not successful',
          });
        }

        if (!transaction?.metadata) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No metadata received from transaction',
          });
        }

        // @ts-ignore - ignore type error
        const planCode = transaction?.metadata?.custom_fields?.find(
          (field: any) => field.variable_name === 'plan_code'
        )?.value;

        if (!planCode) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No plan code received from transaction',
          });
        }

        // @ts-ignore - ignore type error
        const authorizationCode = transaction.authorization?.authorization_code;

        if (!authorizationCode) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'No authorization code received from transaction',
          });
        }

        const { error: refundError } = await paystack.POST('/refund', {
          body: {
            transaction: input.reference,
            amount: 100, // R1 in kobo
          },
        });

        if (refundError) {
          console.warn('Failed to refund tokenization charge:', refundError);
          // Don't throw error here as the trial should still proceed
        }

        const subscriptionStartDate = new Date();
        subscriptionStartDate.setDate(subscriptionStartDate.getDate() + 30);

        const user = await ctx.db.user.findUnique({
          where: { id: userId },
          select: {
            paystackCustomerId: true,
            subscriptionPlanCode: true,
          },
        });

        if (!user?.paystackCustomerId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Missing customer or plan information',
          });
        }

        const { data: subscriptionData, error: subscriptionError } =
          await paystack.POST('/subscription', {
            body: {
              customer: user.paystackCustomerId,
              plan: planCode,
              authorization: authorizationCode,
              start_date: subscriptionStartDate.toISOString(),
            },
          });

        console.log('Subscription data:', subscriptionData);

        if (subscriptionError || !subscriptionData?.data) {
          console.warn(
            'Failed to create delayed subscription:',
            subscriptionError
          );
        }

        const trialStartDate = new Date();
        const trialEndDate = new Date();

        trialEndDate.setDate(trialEndDate.getDate() + 30);

        await ctx.db.user.update({
          where: { id: userId },
          data: {
            paystackSubscriptionStatus: SubscriptionPlanStatus.TRIAL_ACTIVE,
            trialStartDate,
            trialEndDate,
            trialTokenizationTransactionId: input.reference,
          },
        });

        return {
          success: true,
          message: 'Trial tokenization processed successfully',
          refundProcessed: !refundError,
          subscriptionScheduled: !subscriptionError,
        };
      } catch (error) {
        console.error('Error processing trial tokenization:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process trial tokenization. Please try again.',
        });
      }
    }),
});
