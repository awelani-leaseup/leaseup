"use client";

import { api } from "@/trpc/react";
import { convertFromCents, formatCurrencyToZAR } from "@/utils/currency";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@leaseup/ui/components/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@leaseup/ui/components/card";
import { Skeleton } from "@leaseup/ui/components/skeleton";
import { EmptyState } from "@leaseup/ui/components/state";
import { format } from "date-fns";
import { DollarSign } from "lucide-react";

export function UpcomingPayments() {
  const { data, isLoading, error } = api.dashboard.getStats.useQuery();

  if (isLoading) {
    return (
      <Card id="upcoming-payments">
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-1 h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load upcoming payments. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const upcomingPayments = data?.upcomingPayments || [];

  if (upcomingPayments.length === 0) {
    return (
      <Card id="upcoming-payments">
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No Upcoming Payments"
            description="Your upcoming payments will appear here."
            icon={<DollarSign />}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="upcoming-payments">
      <CardHeader>
        <CardTitle>Upcoming Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingPayments.map((invoice) => {
            const tenant =
              invoice.tenant || invoice.lease?.tenantLease?.[0]?.tenant;

            return (
              <div
                key={invoice.id}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="font-medium text-[#2D3436]">
                    {tenant?.firstName} {tenant?.lastName}
                  </p>
                  <p className="text-sm text-[#7F8C8D]">
                    Due{" "}
                    {invoice.dueDate
                      ? format(new Date(invoice.dueDate), "MMM d")
                      : "TBD"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#2D3436]">
                    {formatCurrencyToZAR(invoice.dueAmount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
