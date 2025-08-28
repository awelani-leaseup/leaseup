"use client";

import { api } from "@/trpc/react";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@leaseup/ui/components/alert";
import { format, differenceInDays } from "date-fns";
import { Skeleton } from "@leaseup/ui/components/skeleton";
import { EmptyState } from "@leaseup/ui/components/state";
import { FileText } from "lucide-react";

const getDaysColor = (days: number) => {
  if (days <= 7) return "text-red-600";
  if (days <= 30) return "text-yellow-600";
  return "text-gray-600";
};

export function LeaseRenewals() {
  const { data, isLoading, error } = api.dashboard.getStats.useQuery();

  if (isLoading) {
    return (
      <div
        id="lease-renewals"
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <h2 className="mb-6 text-base font-semibold text-[#2D3436]">
          Upcoming Lease Renewals
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
          Failed to load lease renewals. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const upcomingRenewals = data?.upcomingRenewals || [];

  if (upcomingRenewals.length === 0) {
    return (
      <div
        id="lease-renewals"
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <h2 className="mb-6 text-base font-semibold text-[#2D3436]">
          Upcoming Lease Renewals
        </h2>
        <EmptyState
          title="No Upcoming Lease Renewals"
          description="Your upcoming lease renewals will appear here once you start managing properties and tenants."
          icon={<FileText />}
        />
      </div>
    );
  }

  return (
    <div
      id="lease-renewals"
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <h2 className="mb-6 text-base font-semibold text-[#2D3436]">
        Upcoming Lease Renewals
      </h2>
      <div className="space-y-4">
        {upcomingRenewals.map((lease) => {
          const tenant = lease.tenantLease?.[0]?.tenant;
          const property = lease.unit?.property;
          const daysUntilExpiry = lease.endDate
            ? differenceInDays(new Date(lease.endDate), new Date())
            : 0;

          return (
            <div key={lease.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-[#2D3436]">
                  {tenant?.firstName} {tenant?.lastName}
                </p>
                <p className="text-sm text-[#7F8C8D]">
                  {property?.name} • Unit {lease.unit?.name}
                </p>
                <p className="text-xs text-[#7F8C8D]">
                  Expires{" "}
                  {lease.endDate
                    ? format(new Date(lease.endDate), "MMM d, yyyy")
                    : "TBD"}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-medium ${getDaysColor(
                    daysUntilExpiry,
                  )}`}
                >
                  {daysUntilExpiry} days
                </p>
                <p className="text-xs text-[#7F8C8D]">remaining</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
