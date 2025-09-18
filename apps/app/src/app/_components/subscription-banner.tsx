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
    subscriptionStatus?.status !== "ATTENTION"
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

  const getButtonText = () => {
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

  return (
    <div
      className={`py-3 ${isAttentionStatus ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between pr-2 pl-2">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p
              className={`flex items-center gap-2 text-sm font-medium tracking-tight ${isAttentionStatus ? "text-red-800" : "text-amber-800"}`}
            >
              <AlertTriangle className="size-4 stroke-1" />
              {isAttentionStatus
                ? "Payment failed - please update your payment method"
                : "Your subscription has been cancelled and will not renew automatically"}
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
            className={`text-white ${
              isAttentionStatus
                ? "bg-red-600 hover:bg-red-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
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
                isAttentionStatus
                  ? "text-red-700 hover:bg-red-100 hover:text-red-800"
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
