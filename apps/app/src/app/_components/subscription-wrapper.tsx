"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@leaseup/ui/components/alert-dialog";
import { Button } from "@leaseup/ui/components/button";
import { CircleCheck, CreditCard, Loader2, LogOut } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@leaseup/ui/components/card";
import { Separator } from "@leaseup/ui/components/separator";
import { formatCurrency } from "../(main)/invoices/_utils";
import { authClient } from "@/utils/auth/client";
import { usePaystackPayment } from "react-paystack";
import { useRouter } from "next/navigation";

interface SubscriptionWrapperProps {
  children: React.ReactNode;
  customMessage?: string;
  customTitle?: string;
}

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

const PROFESSIONAL_PLAN_CODE = "PLN_v931v6xx7712tkl";

const subscriptionPlan = {
  id: "professional",
  name: "Professional",
  price: 799,
  currency: "ZAR",
  interval: "month",
  description: "Complete property management solution",
  features: [
    "Unlimited Properties",
    "Advanced tenant management",
    "Automated Rent Collection",
    "Digital Lease Management",
    "Real-time Financial Dashboard",
    "Professional Invoicing",
    "Secure Document Storage",
  ],
};

if (!PAYSTACK_PUBLIC_KEY) {
  throw new Error("PAYSTACK_PUBLIC_KEY is not set");
}

export function SubscriptionWrapper({
  children,
  customMessage,
  customTitle,
}: SubscriptionWrapperProps) {
  const { data: session } = authClient.useSession();
  const utils = api.useUtils();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const newUserId = session?.user?.id || null;
    if (currentUserId !== newUserId) {
      if (currentUserId !== null) {
        utils.invalidate();
      }
      setCurrentUserId(newUserId);
      setIsOpen(true);
    }
  }, [session?.user?.id, currentUserId, utils]);

  const { data: onboardingStatus, isLoading: isOnboardingLoading } =
    api.onboarding.getOnboardingStatus.useQuery(undefined, {
      enabled: !!session?.user?.id,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    });

  const {
    data: subscriptionStatus,
    error,
    isLoading: isSubscriptionLoading,
  } = api.user.getSubscriptionStatus.useQuery(undefined, {
    enabled:
      !!session?.user?.id && onboardingStatus?.onboardingCompleted === true,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const isLoading = isOnboardingLoading || isSubscriptionLoading;

  const initializePayment = usePaystackPayment({
    publicKey: PAYSTACK_PUBLIC_KEY,
    email: session?.user?.email,
    plan: PROFESSIONAL_PLAN_CODE,
    amount: 0, // Plan amount will take precedence over amount
  });

  if (error) {
    console.warn("Failed to fetch subscription status:", error);
  }

  if (!session?.user?.id) {
    return <>{children}</>;
  }

  if (onboardingStatus && !onboardingStatus.onboardingCompleted) {
    return <>{children}</>;
  }

  if (isLoading && !subscriptionStatus) {
    return (
      <AlertDialog open>
        <AlertDialogContent className="flex items-center justify-center sm:max-w-fit">
          <Loader2 className="text-primary size-5 animate-spin" />
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (subscriptionStatus?.status === "ACTIVE") {
    return <>{children}</>;
  }

  const getSubscriptionMessage = () => {
    if (customMessage) return customMessage;

    if (subscriptionStatus?.status === "ATTENTION") {
      return "Your subscription needs attention due to a payment issue. Please update your payment method to continue using this feature.";
    }

    if (
      subscriptionStatus?.status === "CANCELLED" ||
      subscriptionStatus?.status === "COMPLETED"
    ) {
      return "Your subscription has ended. Subscribe to continue accessing premium features and manage your properties effectively.";
    }

    if (subscriptionStatus?.status === "NON_RENEWING") {
      return "Your subscription will not renew automatically. Renew now to continue accessing this feature without interruption.";
    }

    return (
      <Card className="border-primary relative cursor-pointer shadow-md transition-all hover:shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-base">{subscriptionPlan.name}</CardTitle>
          <CardDescription>{subscriptionPlan.description}</CardDescription>
          <div className="mt-4">
            <span className="text-lg font-black">
              {formatCurrency(subscriptionPlan.price)}
            </span>
            <span className="text-muted-foreground">
              /{subscriptionPlan.interval}
            </span>
          </div>
        </CardHeader>

        <Separator />

        <CardContent>
          <ul className="flex flex-col gap-y-6">
            {subscriptionPlan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <CircleCheck className="size-5 flex-shrink-0 stroke-1 text-gray-500" />
                <span className="text-sm tracking-tight">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  };

  const getSubscriptionTitle = () => {
    if (customTitle) return customTitle;

    if (subscriptionStatus?.status === "ATTENTION") {
      return "Payment Issue";
    }

    if (
      subscriptionStatus?.status === "CANCELLED" ||
      subscriptionStatus?.status === "COMPLETED"
    ) {
      return "Subscription Ended";
    }

    if (subscriptionStatus?.status === "NON_RENEWING") {
      return "Subscription Expiring";
    }

    return "Subscription Required";
  };

  const getActionButtonText = () => {
    if (subscriptionStatus?.status === "ATTENTION") {
      return "Update Payment Method";
    }

    if (subscriptionStatus?.status === "NON_RENEWING") {
      return "Renew Subscription";
    }

    return "Continue";
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-center">
            {getSubscriptionTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-base">
            {getSubscriptionMessage()}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {subscriptionStatus?.status === "ATTENTION" &&
          subscriptionStatus.lastPaymentFailure && (
            <div className="bg-destructive/10 rounded-lg p-3">
              <p className="text-destructive text-sm">
                <strong>Payment Error:</strong>{" "}
                {subscriptionStatus.lastPaymentFailure}
              </p>
            </div>
          )}

        <AlertDialogFooter className="mt-6 gap-2 sm:flex-col">
          <AlertDialogAction asChild>
            <Button
              onClick={() => {
                setIsOpen(false);
                initializePayment({
                  onClose: () => {
                    setIsOpen(true);
                  },
                  onSuccess: () => {
                    setIsOpen(false);
                    try {
                      utils.user.getSubscriptionStatus.setData(
                        undefined,
                        (oldData) => {
                          if (!oldData) return oldData;
                          return {
                            ...oldData,
                            status: "ACTIVE",
                            isActive: true,
                            lastPaymentFailure: null,
                            paymentRetryCount: 0,
                          };
                        },
                      );
                    } catch (error) {
                      console.warn(
                        "Failed to optimistically update subscription status:",
                        error,
                      );
                    }

                    setTimeout(() => {
                      router.push("/dashboard");
                      utils.onboarding.getOnboardingStatus.invalidate();
                    }, 200);
                  },
                });
              }}
              className="w-full"
            >
              <CreditCard />
              {getActionButtonText()}
            </Button>
          </AlertDialogAction>
          <Button variant="outlined" onClick={() => authClient.signOut()}>
            <LogOut />
            Logout
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
