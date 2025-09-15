"use client";

import { api } from "@/trpc/react";
import { formatCurrencyToZAR } from "@/utils/currency";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@leaseup/ui/components/alert";
import { Skeleton } from "@leaseup/ui/components/skeleton";
import { EmptyState } from "@leaseup/ui/components/state";
import { format } from "date-fns";
import { DollarSign } from "lucide-react";

export function UpcomingPayments() {
  const { data, isLoading, error } = api.dashboard.getStats.useQuery();

  if (isLoading) {
    return (
      <div
        id="upcoming-payments"
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <h2 className="mb-6 text-base font-semibold text-[#2D3436]">
          Upcoming Payments
        </h2>
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
      </div>
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
      <div
        id="upcoming-payments"
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <h2 className="mb-6 text-base font-semibold text-[#2D3436]">
          Upcoming Payments
        </h2>
        <EmptyState
          title="No Upcoming Payments"
          description="Your upcoming payments will appear here."
          icon={<DollarSign />}
        />
      </div>
    );
  }

  return (
    <div
      id="upcoming-payments"
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <h2 className="mb-6 text-base font-semibold text-[#2D3436]">
        Upcoming Payments
      </h2>
      <div className="space-y-4">
        {upcomingPayments.map((invoice) => {
          const tenant =
            invoice.tenant || invoice.lease?.tenantLease?.[0]?.tenant;
          const property = invoice.lease?.unit?.property;

          return (
            <div key={invoice.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-[#2D3436]">
                  {tenant?.firstName} {tenant?.lastName}
                </p>
                <p className="text-sm text-[#7F8C8D]">
                  {property?.name || "Direct Invoice"} • Due{" "}
                  {invoice.dueDate
                    ? format(new Date(invoice.dueDate), "MMM d")
                    : "TBD"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#2D3436]">
                  {formatCurrencyToZAR(invoice.dueAmount)}
                </p>
                <p className="text-xs text-[#F39C12]">Pending</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
