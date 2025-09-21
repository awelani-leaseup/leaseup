"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Button } from "@leaseup/ui/components/button";
import { Badge } from "@leaseup/ui/components/badge";
import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from "@leaseup/ui/components/description-list";
import {
  Calendar,
  CheckCircle,
  X,
  Tag,
  Banknote,
  Clock,
  AlertTriangle,
  CircleCheck,
  CalendarSync,
  Circle,
  CreditCard,
} from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { authClient } from "@/utils/auth/client";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import { convertFromCents, formatCurrencyToZAR } from "@/utils/currency";
import BillingLoading from "./loading";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@leaseup/ui/components/alert";
import { useState } from "react";

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
const PROFESSIONAL_PLAN_CODE = "PLN_v931v6xx7712tkl";

export default function BillingPage() {
  const { data: session } = authClient.useSession();
  const utils = api.useUtils();
  const [isRenewed, setIsRenewed] = useState(false);
  const {
    data: subscriptionData,
    isLoading,
    error,
  } = api.user.getPaystackSubscriptionDetails.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  const syncSubscriptionMutation = api.user.syncSubscription.useMutation();

  const generateManagementLinkMutation =
    api.user.generateSubscriptionManagementLink.useMutation({
      onSuccess: (result) => {
        if (result.managementLink) {
          window.open(result.managementLink, "_blank", "noopener,noreferrer");
        }
      },
      onError: (error) => {
        console.error("Error generating management link:", error);
        toast.error("Error generating management link");
      },
    });

  const initializePayment = usePaystackPayment({
    publicKey: PAYSTACK_PUBLIC_KEY,
    email: session?.user?.email,
    plan: PROFESSIONAL_PLAN_CODE,
    amount: 0,
  });

  const handleManageBilling = () => {
    generateManagementLinkMutation.mutate();
  };

  const handleRenewSubscription = () => {
    initializePayment({
      onSuccess: async () => {
        await syncSubscriptionMutation.mutateAsync();
        utils.user.getPaystackSubscriptionDetails.invalidate();

        toast.success("Subscription renewed successfully!");
        setIsRenewed(true);
      },
      onClose: () => {
        console.log("Payment dialog closed");
      },
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status)
      return (
        <Badge variant="outlined" color="secondary">
          No Subscription
        </Badge>
      );

    const statusMap: Record<
      string,
      {
        variant: "solid" | "outlined" | "soft";
        color: "primary" | "success" | "danger" | "warning" | "secondary";
        label: string;
        icon?: React.ReactNode;
      }
    > = {
      active: {
        variant: "soft",
        color: "success",
        label: "Active",
        icon: <CircleCheck className="size-4 stroke-1" />,
      },
      "non-renewing": {
        variant: "outlined",
        color: "warning",
        label: "Non-renewing",
        icon: <Clock className="size-4 stroke-1" />,
      },
      cancelled: {
        variant: "solid",
        color: "danger",
        label: "Cancelled",
        icon: <X className="size-4 stroke-1" />,
      },
      completed: {
        variant: "outlined",
        color: "secondary",
        label: "Completed",
        icon: <CheckCircle className="size-4 stroke-1" />,
      },
      attention: {
        variant: "solid",
        color: "danger",
        label: "Needs Attention",
        icon: <AlertTriangle className="size-4 stroke-1" />,
      },
    };

    const statusInfo = statusMap[status.toLowerCase()] ?? {
      variant: "outlined",
      color: "secondary",
      label: status,
    };
    return (
      <Badge
        variant={statusInfo.variant}
        color={statusInfo.color}
        size="sm"
        className="rounded-md"
      >
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Subscription</CardTitle>
          <CardDescription>
            Manage your subscription plan and payment methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Current Subscription</h2>
            </div>

            {(() => {
              if (isLoading) {
                return <BillingLoading />;
              }

              if (error) {
                return (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-red-500">
                      Error loading subscription details
                    </div>
                  </div>
                );
              }

              if (!subscriptionData?.hasSubscription) {
                return (
                  <div className="rounded-lg border border-gray-200 p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-900">
                      No Active Subscription
                    </h3>
                    <p className="mt-2 text-gray-600">
                      You don&apos;t have an active subscription plan.
                    </p>
                    <Button className="mt-4">Subscribe to a Plan</Button>
                  </div>
                );
              }

              return (
                <div className="grid gap-6 rounded-md border bg-gray-50 p-4 md:grid-cols-2">
                  <div>
                    <DescriptionList orientation="horizontal">
                      <DescriptionTerm className="flex items-center gap-2">
                        <Tag className="size-4" />
                        Plan Name
                      </DescriptionTerm>
                      <DescriptionDetails>
                        {subscriptionData?.plan?.name ?? "N/A"}
                      </DescriptionDetails>

                      <DescriptionTerm className="flex items-center gap-2">
                        <Banknote className="size-4" />
                        Amount
                      </DescriptionTerm>
                      <DescriptionDetails>
                        {formatCurrencyToZAR(
                          convertFromCents(subscriptionData?.plan?.amount ?? 0),
                        )}
                      </DescriptionDetails>

                      <DescriptionTerm className="flex items-center gap-2">
                        <CalendarSync className="size-4" />
                        Billing Interval
                      </DescriptionTerm>
                      <DescriptionDetails>
                        {subscriptionData?.plan?.interval
                          ? (subscriptionData.plan.interval as string)
                              .charAt(0)
                              .toUpperCase() +
                            (subscriptionData.plan.interval as string).slice(
                              1,
                            ) +
                            "ly"
                          : "N/A"}
                      </DescriptionDetails>
                    </DescriptionList>
                  </div>

                  <div>
                    <DescriptionList orientation="horizontal">
                      <DescriptionTerm className="flex items-center gap-2">
                        <Circle className="size-4" />
                        Subscription Status
                      </DescriptionTerm>
                      <DescriptionDetails>
                        {getStatusBadge(subscriptionData?.subscription?.status)}
                      </DescriptionDetails>

                      <DescriptionTerm className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        Next Payment Date
                      </DescriptionTerm>
                      <DescriptionDetails>
                        {formatDate(
                          subscriptionData?.subscription?.next_payment_date ??
                            null,
                        )}
                      </DescriptionDetails>

                      <DescriptionTerm className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        Created Date
                      </DescriptionTerm>
                      <DescriptionDetails>
                        {formatDate(
                          subscriptionData?.subscription?.createdAt ?? null,
                        )}
                      </DescriptionDetails>
                    </DescriptionList>
                  </div>
                </div>
              );
            })()}

            <div className="mt-6">
              {subscriptionData?.subscription?.status === "non-renewing" ? (
                <div className="mb-4 flex w-fit flex-col gap-2">
                  <h2 className="text-lg font-semibold">
                    Renew Your Subscription
                  </h2>
                  <p className="text-sm text-gray-500">
                    Your subscription will not renew automatically and will be
                    disabled after your next payment date. Click below to renew
                    your plan.
                  </p>
                  <Button
                    onClick={handleRenewSubscription}
                    className="mt-4 w-fit"
                  >
                    <CreditCard className="size-4" />
                    Renew Subscription
                  </Button>
                </div>
              ) : (
                <div className="mb-4 flex w-fit flex-col gap-2">
                  <h2 className="text-lg font-semibold">
                    Manage Billing Information
                  </h2>
                  <p className="text-sm text-gray-500">
                    Manage your billing information.
                  </p>
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={handleManageBilling}
                    disabled={generateManagementLinkMutation.isPending}
                    className="mt-4 w-fit"
                  >
                    <CreditCard className="size-4" />
                    {generateManagementLinkMutation.isPending
                      ? "Generating Link..."
                      : "Manage Billing"}
                  </Button>
                </div>
              )}

              {isRenewed && (
                <Alert className="mt-4">
                  <AlertTitle>Subscription Renewed</AlertTitle>
                  <AlertDescription>
                    Your subscription has been renewed successfully, it might
                    take some time to reflect in your account.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
