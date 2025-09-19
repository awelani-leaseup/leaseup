import { SubscriptionPlanStatus } from '@leaseup/prisma/client/client.js';
import { db } from '@leaseup/prisma/db.ts';

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

export async function getActiveSubscriptions(): Promise<SubscriptionInfo[]> {
  return db.user.findMany({
    where: {
      paystackSubscriptionStatus: SubscriptionPlanStatus.ACTIVE,
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

export async function getSubscriptionsNeedingAttention(): Promise<
  SubscriptionInfo[]
> {
  return db.user.findMany({
    where: {
      paystackSubscriptionStatus: SubscriptionPlanStatus.ATTENTION,
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

export async function getSubscriptionsExpiringSoon(
  days: number = 7
): Promise<SubscriptionInfo[]> {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return db.user.findMany({
    where: {
      paystackSubscriptionStatus: {
        in: [
          SubscriptionPlanStatus.ACTIVE,
          SubscriptionPlanStatus.NON_RENEWING,
        ],
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
        paystackSubscriptionStatus: SubscriptionPlanStatus.ACTIVE,
      },
    }),
    db.user.count({
      where: {
        paystackSubscriptionStatus: SubscriptionPlanStatus.ATTENTION,
      },
    }),
    db.user.count({
      where: {
        paystackSubscriptionStatus: SubscriptionPlanStatus.NON_RENEWING,
      },
    }),
    db.user.count({
      where: {
        paystackSubscriptionStatus: SubscriptionPlanStatus.CANCELLED,
      },
    }),
    db.user.count({
      where: {
        paystackSubscriptionStatus: SubscriptionPlanStatus.COMPLETED,
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

export async function updateSubscriptionStatus(
  userId: string,
  status: SubscriptionPlanStatus,
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

export async function clearSubscriptionData(
  userId: string,
  status: SubscriptionPlanStatus
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

export function getSubscriptionStatusInfo(
  status: SubscriptionPlanStatus | null
) {
  const statusMap = {
    [SubscriptionPlanStatus.ACTIVE]: {
      label: 'Active',
      color: 'green',
      description: 'Subscription is active and will be charged on schedule',
    },
    [SubscriptionPlanStatus.NON_RENEWING]: {
      label: 'Not Renewing',
      color: 'yellow',
      description: 'Active but will not renew automatically',
    },
    [SubscriptionPlanStatus.ATTENTION]: {
      label: 'Needs Attention',
      color: 'red',
      description: 'Payment issue - requires action',
    },
    [SubscriptionPlanStatus.COMPLETED]: {
      label: 'Completed',
      color: 'gray',
      description: 'Subscription has completed successfully',
    },
    [SubscriptionPlanStatus.CANCELLED]: {
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
