"use client";

import React from "react";
import { api } from "@/trpc/react";
import { Button } from "@leaseup/ui/components/button";
import { AlertTriangle, CreditCard, X, Settings } from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { authClient } from "@/utils/auth/client";

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
const PROFESSIONAL_PLAN_CODE = "PLN_v931v6xx7712tkl";

interface SubscriptionBannerProps {
  onDismiss?: () => void;
}

export function SubscriptionBanner({ onDismiss }: SubscriptionBannerProps) {
  const { data: session } = authClient.useSession();
  const utils = api.useUtils();

  const { data: subscriptionStatus } = api.user.getSubscriptionStatus.useQuery(
    undefined,
    {
      enabled: !!session?.user?.id,
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  );

  const generateManagementLink =
    api.user.generateSubscriptionManagementLink.useMutation({
      onSuccess: (data) => {
        window.open(data.managementLink, "_blank");
      },
      onError: (error) => {
        console.error("Failed to generate management link:", error);
      },
    });

  const initializePayment = usePaystackPayment({
    publicKey: PAYSTACK_PUBLIC_KEY,
    email: session?.user?.email,
    plan: PROFESSIONAL_PLAN_CODE,
    amount: 0,
  });

  if (
    subscriptionStatus?.status !== "NON_RENEWING" &&
    subscriptionStatus?.status !== "ATTENTION" &&
    !subscriptionStatus?.isTrialActive &&
    !subscriptionStatus?.isTrialExpired
  ) {
    return null;
  }

  const handleRenewSubscription = () => {
    initializePayment({
      onSuccess: () => {
        try {
          utils.user.getSubscriptionStatus.setData(undefined, (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              status: "ACTIVE",
              isActive: true,
              lastPaymentFailure: null,
              paymentRetryCount: 0,
            };
          });
        } catch (error) {
          console.warn(
            "Failed to optimistically update subscription status:",
            error,
          );
        }

        setTimeout(() => {
          utils.user.getSubscriptionStatus.invalidate();
        }, 5000);
      },
    });
  };

  const handleUpdatePaymentMethod = () => {
    generateManagementLink.mutate();
  };

  const isAttentionStatus = subscriptionStatus?.status === "ATTENTION";
  const isTrialActive = subscriptionStatus?.isTrialActive;
  const isTrialExpired = subscriptionStatus?.isTrialExpired;
  const daysLeftInTrial = subscriptionStatus?.daysLeftInTrial || 0;

  const getButtonText = () => {
    if (isTrialExpired) {
      return "Subscribe Now";
    }
    if (isTrialActive && daysLeftInTrial <= 7) {
      return "Subscribe Now";
    }
    if (isAttentionStatus) {
      return generateManagementLink.isPending
        ? "Loading..."
        : "Update Payment Method";
    }
    return "Renew Subscription";
  };

  const getButtonIcon = () => {
    return isAttentionStatus ? (
      <Settings className="h-4 w-4" />
    ) : (
      <CreditCard className="h-4 w-4" />
    );
  };

  const getBannerMessage = () => {
    if (isTrialExpired) {
      return "Your free trial has ended. Subscribe now to continue accessing all features.";
    }
    if (isTrialActive) {
      if (daysLeftInTrial <= 3) {
        return `Your free trial ends in ${daysLeftInTrial} day${daysLeftInTrial !== 1 ? "s" : ""}. Subscribe now to avoid interruption.`;
      }
      if (daysLeftInTrial <= 7) {
        return `Your free trial ends in ${daysLeftInTrial} days. Subscribe now to continue accessing all features.`;
      }
      return `You have ${daysLeftInTrial} days left in your free trial.`;
    }
    if (isAttentionStatus) {
      return "Payment failed - please update your payment method";
    }
    return "Your subscription has been cancelled and will not renew automatically";
  };

  const getBannerColor = () => {
    if (isTrialExpired || (isTrialActive && daysLeftInTrial <= 3)) {
      return "border-red-200 bg-red-50";
    }
    if (isTrialActive && daysLeftInTrial <= 7) {
      return "border-amber-200 bg-amber-50";
    }
    if (isTrialActive) {
      return "border-blue-200 bg-blue-50";
    }
    if (isAttentionStatus) {
      return "border-red-200 bg-red-50";
    }
    return "border-amber-200 bg-amber-50";
  };

  const getTextColor = () => {
    if (isTrialExpired || (isTrialActive && daysLeftInTrial <= 3)) {
      return "text-red-800";
    }
    if (isTrialActive && daysLeftInTrial <= 7) {
      return "text-amber-800";
    }
    if (isTrialActive) {
      return "text-blue-800";
    }
    if (isAttentionStatus) {
      return "text-red-800";
    }
    return "text-amber-800";
  };

  const getButtonColor = () => {
    if (isTrialExpired || (isTrialActive && daysLeftInTrial <= 3)) {
      return "bg-red-600 hover:bg-red-700";
    }
    if (isTrialActive && daysLeftInTrial <= 7) {
      return "bg-amber-600 hover:bg-amber-700";
    }
    if (isTrialActive) {
      return "bg-blue-600 hover:bg-blue-700";
    }
    if (isAttentionStatus) {
      return "bg-red-600 hover:bg-red-700";
    }
    return "bg-amber-600 hover:bg-amber-700";
  };

  return (
    <div className={`py-3 ${getBannerColor()}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between pr-2 pl-2">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p
              className={`flex items-center gap-2 text-sm font-medium tracking-tight ${getTextColor()}`}
            >
              <AlertTriangle className="size-4 stroke-1" />
              {getBannerMessage()}
            </p>
            {isAttentionStatus && subscriptionStatus?.lastPaymentFailure && (
              <p className="mt-1 ml-6 text-xs text-red-700">
                {subscriptionStatus.lastPaymentFailure}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={
              isAttentionStatus
                ? handleUpdatePaymentMethod
                : handleRenewSubscription
            }
            className={`text-white ${getButtonColor()}`}
            disabled={isAttentionStatus && generateManagementLink.isPending}
          >
            {getButtonIcon()}
            {getButtonText()}
          </Button>

          {onDismiss && (
            <Button
              variant="text"
              size="sm"
              onClick={onDismiss}
              className={
                isTrialExpired ||
                (isTrialActive && daysLeftInTrial <= 3) ||
                isAttentionStatus
                  ? "text-red-700 hover:bg-red-100 hover:text-red-800"
                  : isTrialActive && daysLeftInTrial <= 7
                    ? "text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                    : isTrialActive
                      ? "text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                      : "text-amber-700 hover:bg-amber-100 hover:text-amber-800"
              }
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
