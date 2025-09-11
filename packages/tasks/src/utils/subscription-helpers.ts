import { db } from '@leaseup/prisma/db.ts';

export type SubscriptionStatus =
  | 'active' // Currently active, will be charged on next payment date
  | 'non-renewing' // Active but won't be charged on next payment date
  | 'attention' // Active but payment issue (expired card, insufficient funds)
  | 'completed' // Complete, no longer charged
  | 'cancelled'; // Cancelled, no longer charged

export interface SubscriptionInfo {
  id: string;
  email: string;
  name: string | null;
  paystackSubscriptionId: string | null;
  paystackSubscriptionStatus: string | null;
  subscriptionPlanCode: string | null;
  subscriptionAmount: number | null;
  subscriptionCurrency: string | null;
  subscriptionInterval: string | null;
  nextPaymentDate: Date | null;
  subscriptionCreatedAt: Date | null;
  subscriptionUpdatedAt: Date | null;
  lastPaymentFailure: string | null;
  paymentRetryCount: number | null;
}

/**
 * Get all users with active subscriptions
 */
export async function getActiveSubscriptions(): Promise<SubscriptionInfo[]> {
  return db.user.findMany({
    where: {
      paystackSubscriptionStatus: 'active',
      paystackSubscriptionId: {
        not: null,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
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
}

/**
 * Get all users with subscriptions that need attention (payment issues)
 */
export async function getSubscriptionsNeedingAttention(): Promise<
  SubscriptionInfo[]
> {
  return db.user.findMany({
    where: {
      paystackSubscriptionStatus: 'attention',
      paystackSubscriptionId: {
        not: null,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
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
    orderBy: {
      paymentRetryCount: 'desc', // Most retries first
    },
  });
}

/**
 * Get subscriptions expiring soon (next payment date within specified days)
 */
export async function getSubscriptionsExpiringSoon(
  days: number = 7
): Promise<SubscriptionInfo[]> {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return db.user.findMany({
    where: {
      paystackSubscriptionStatus: {
        in: ['active', 'non-renewing'],
      },
      nextPaymentDate: {
        lte: futureDate,
        gte: new Date(),
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
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
    orderBy: {
      nextPaymentDate: 'asc',
    },
  });
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats() {
  const [
    totalSubscriptions,
    activeSubscriptions,
    attentionSubscriptions,
    nonRenewingSubscriptions,
    cancelledSubscriptions,
    completedSubscriptions,
  ] = await Promise.all([
    db.user.count({
      where: {
        paystackSubscriptionId: { not: null },
      },
    }),
    db.user.count({
      where: {
        paystackSubscriptionStatus: 'active',
      },
    }),
    db.user.count({
      where: {
        paystackSubscriptionStatus: 'attention',
      },
    }),
    db.user.count({
      where: {
        paystackSubscriptionStatus: 'non-renewing',
      },
    }),
    db.user.count({
      where: {
        paystackSubscriptionStatus: 'cancelled',
      },
    }),
    db.user.count({
      where: {
        paystackSubscriptionStatus: 'completed',
      },
    }),
  ]);

  return {
    total: totalSubscriptions,
    active: activeSubscriptions,
    attention: attentionSubscriptions,
    nonRenewing: nonRenewingSubscriptions,
    cancelled: cancelledSubscriptions,
    completed: completedSubscriptions,
  };
}

/**
 * Update subscription status for a user
 */
export async function updateSubscriptionStatus(
  userId: string,
  status: SubscriptionStatus,
  additionalData?: {
    nextPaymentDate?: Date | null;
    lastPaymentFailure?: string | null;
    paymentRetryCount?: number;
  }
) {
  return db.user.update({
    where: { id: userId },
    data: {
      paystackSubscriptionStatus: status,
      subscriptionUpdatedAt: new Date(),
      ...additionalData,
    },
  });
}

/**
 * Clear subscription data for a user (when subscription is cancelled/completed)
 */
export async function clearSubscriptionData(
  userId: string,
  status: 'cancelled' | 'completed'
) {
  return db.user.update({
    where: { id: userId },
    data: {
      paystackSubscriptionId: null,
      paystackSubscriptionStatus: status,
      subscriptionPlanCode: null,
      subscriptionAmount: null,
      subscriptionCurrency: null,
      subscriptionInterval: null,
      nextPaymentDate: null,
      subscriptionUpdatedAt: new Date(),
      lastPaymentFailure: null,
      paymentRetryCount: 0,
    },
  });
}

/**
 * Format subscription amount for display
 */
export function formatSubscriptionAmount(
  amount: number | null,
  currency: string | null = 'ZAR'
): string {
  if (!amount) return 'N/A';

  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency || 'ZAR',
  }).format(amount / 100); // Convert from kobo/cents
}

/**
 * Get subscription status display info
 */
export function getSubscriptionStatusInfo(status: string | null) {
  const statusMap = {
    active: {
      label: 'Active',
      color: 'green',
      description: 'Subscription is active and will be charged on schedule',
    },
    'non-renewing': {
      label: 'Not Renewing',
      color: 'yellow',
      description: 'Active but will not renew automatically',
    },
    attention: {
      label: 'Needs Attention',
      color: 'red',
      description: 'Payment issue - requires action',
    },
    completed: {
      label: 'Completed',
      color: 'gray',
      description: 'Subscription has completed successfully',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'gray',
      description: 'Subscription has been cancelled',
    },
  };

  return (
    statusMap[status as keyof typeof statusMap] || {
      label: 'Unknown',
      color: 'gray',
      description: 'Unknown subscription status',
    }
  );
}
