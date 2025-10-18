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
import { CreditCard, Loader2, LogOut } from "lucide-react";
import { authClient } from "@/utils/auth/client";
import { usePaystackPayment } from "react-paystack";
import { useRouter } from "next/navigation";

interface SubscriptionWrapperProps {
  children: React.ReactNode;
  customMessage?: string;
  customTitle?: string;
}

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

const PROFESSIONAL_PLAN_CODE = process.env.NEXT_PUBLIC_PAYSTACK_PLAN_CODE || "";

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

if (!PROFESSIONAL_PLAN_CODE) {
  throw new Error("PROFESSIONAL_PLAN_CODE is not set");
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
  const syncSubscriptionMutation = api.user.syncSubscription.useMutation();
  const processTrialTokenizationMutation =
    api.user.processTrialTokenization.useMutation();

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

  // Note: URL parameter handling removed since we're using inline checkout

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
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const isLoading = isOnboardingLoading || isSubscriptionLoading;

  // Configuration for trial tokenization (R1 payment)
  const trialConfig = {
    reference: Date.now().toString(),
    email: session?.user?.email || "",
    amount: 100, // R1 in cents (100 cents = R1)
    publicKey: PAYSTACK_PUBLIC_KEY,
    metadata: {
      custom_fields: [
        {
          display_name: "Transaction Type",
          variable_name: "transaction_type",
          value: "trial_tokenization",
        },
        {
          display_name: "Plan Code",
          variable_name: "plan_code",
          value: PROFESSIONAL_PLAN_CODE,
        },
      ],
    },
  };

  // Configuration for regular subscription payment
  const subscriptionConfig = {
    reference: Date.now().toString(),
    email: session?.user?.email || "",
    plan: PROFESSIONAL_PLAN_CODE,
    amount: 0, // Amount is handled by the plan
    publicKey: PAYSTACK_PUBLIC_KEY,
  };

  const initializeTrialPayment = usePaystackPayment(trialConfig);
  const initializeSubscriptionPayment = usePaystackPayment(subscriptionConfig);

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

  if (
    subscriptionStatus?.status === "ACTIVE" ||
    subscriptionStatus?.status === "NON_RENEWING" ||
    subscriptionStatus?.isTrialActive
  ) {
    return <>{children}</>;
  }

  const getSubscriptionMessage = () => {
    if (customMessage) return customMessage;

    if (subscriptionStatus?.isTrialExpired) {
      return "Your 30-day free trial has ended. Subscribe now to continue accessing all premium features and manage your properties effectively.";
    }

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

    return "Start your 30-day trial for just R1 (refunded immediately), then continue with full access for R799/month. Cancel anytime during your trial period.";
  };

  const getSubscriptionTitle = () => {
    if (customTitle) return customTitle;

    if (subscriptionStatus?.isTrialExpired) {
      return "Free Trial Ended";
    }

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
      return "Subscription Not Renewing";
    }

    return "Start Your Free Trial for Just R1";
  };

  const getActionButtonText = () => {
    if (subscriptionStatus?.isTrialExpired) {
      return "Subscribe Now";
    }

    if (subscriptionStatus?.status === "ATTENTION") {
      return "Update Payment Method";
    }

    if (subscriptionStatus?.status === "NON_RENEWING") {
      return "Renew Subscription";
    }

    return "Start Free Trial for R1";
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-center">
            {getSubscriptionTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-base">
            {getSubscriptionMessage()}
          </AlertDialogDescription>

          {/* Show trial pricing for new users */}
          {!subscriptionStatus?.hasSubscription &&
            !subscriptionStatus?.isTrialExpired && (
              <div className="mt-4 space-y-4">
                {/* Pricing Information */}
                <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-blue-50 p-4">
                  <div className="text-center">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <span className="text-3xl font-black text-green-600">
                        R1
                      </span>
                      <span className="text-lg text-gray-600">today</span>
                    </div>
                    <div className="mb-2 text-sm text-gray-600">
                      Then <span className="font-semibold">R799/month</span>{" "}
                      after your 30-day trial
                    </div>
                    <div className="mb-2 text-sm font-medium text-green-700">
                      R1 refunded immediately after verification
                    </div>
                    <div className="text-sm font-medium text-green-700">
                      Cancel anytime during trial
                    </div>
                  </div>
                </div>

                {/* Feature List */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h4 className="mb-3 text-center text-sm font-semibold text-gray-900">
                    What&apos;s included:
                  </h4>
                  <ul className="space-y-2">
                    {subscriptionPlan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-green-600">✅</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
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
                if (
                  !subscriptionStatus?.hasSubscription &&
                  !subscriptionStatus?.isTrialExpired
                ) {
                  setIsOpen(false);

                  initializeTrialPayment({
                    config: {
                      currency: "ZAR",
                      amount: 100,
                      email: session?.user?.email || "",
                      metadata: {
                        custom_fields: [
                          {
                            display_name: "Transaction Type",
                            variable_name: "transaction_type",
                            value: "trial_tokenization",
                          },
                          {
                            display_name: "Plan Code",
                            variable_name: "plan_code",
                            value: PROFESSIONAL_PLAN_CODE,
                          },
                        ],
                      },
                    },
                    onSuccess: async (reference) => {
                      console.log("Trial payment successful:", reference);
                      setIsOpen(false);

                      try {
                        // Process the trial tokenization with the payment reference
                        await processTrialTokenizationMutation.mutateAsync({
                          reference: reference.reference,
                        });

                        // Invalidate queries to refresh subscription status
                        utils.user.getSubscriptionStatus.invalidate();

                        setTimeout(() => {
                          router.push("/dashboard");
                          utils.onboarding.getOnboardingStatus.invalidate();
                        }, 200);
                      } catch (error) {
                        console.error(
                          "Failed to process trial tokenization:",
                          error,
                        );
                        setIsOpen(true);
                      }
                    },
                    onClose: () => {
                      console.log("Trial payment dialog closed");
                      setIsOpen(true);
                    },
                  });
                } else {
                  // Handle regular subscription payment for existing users or trial expired
                  initializeSubscriptionPayment({
                    onClose: () => {
                      setIsOpen(true);
                    },
                    onSuccess: async (reference) => {
                      console.log(
                        "Subscription payment successful:",
                        reference,
                      );
                      setIsOpen(false);

                      try {
                        const { success } =
                          await syncSubscriptionMutation.mutateAsync();
                        if (success) {
                          utils.user.getSubscriptionStatus.invalidate();
                        } else {
                          console.warn("Failed to sync subscription");
                        }
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
                    config: {
                      currency: "ZAR",
                      amount: 0,
                      email: session?.user?.email || "",
                      plan: PROFESSIONAL_PLAN_CODE,
                    },
                  });
                }
              }}
              className="w-full"
              disabled={
                processTrialTokenizationMutation.isPending ||
                syncSubscriptionMutation.isPending
              }
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
