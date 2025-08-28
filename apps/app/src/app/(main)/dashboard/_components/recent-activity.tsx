"use client";

import { api } from "@/trpc/react";
import { formatCurrencyToZAR } from "@/utils/currency";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { EmptyState } from "@leaseup/ui/components/state";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@leaseup/ui/components/alert";
import { Button } from "@leaseup/ui/components/button";

export function RecentActivity() {
  const { data, isLoading, error } = api.dashboard.getStats.useQuery();

  if (isLoading) {
    return (
      <div
        id="recent-activity"
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#2D3436]">
            Recent Activity
          </h2>
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={`skeleton-${i}`} className="flex items-center space-x-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                <div className="mt-1 h-3 w-1/2 animate-pulse rounded bg-gray-200"></div>
              </div>
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load recent activity. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const recentActivity = data?.recentActivity || [];

  if (recentActivity.length === 0) {
    return (
      <div
        id="recent-activity"
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#2D3436]">
            Recent Activity
          </h2>
        </div>
        <EmptyState
          title="No Recent Activity"
          description="Your recent activities will appear here once you start managing properties and tenants."
          icon={<Clock />}
        />
      </div>
    );
  }

  return (
    <div
      id="recent-activity"
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#2D3436]">
          Recent Activity
        </h2>
        <Button variant="outlined">View All</Button>
      </div>
      <div className="space-y-4">
        {recentActivity.map((transaction) => {
          const tenant =
            transaction.invoice?.tenant ||
            transaction.lease?.tenantLease?.[0]?.tenant;
          const property = transaction.lease?.unit?.property;

          return (
            <div key={transaction.id} className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <i className="fa-solid fa-dollar-sign text-sm text-[#2ECC71]"></i>
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#2D3436]">
                  Payment received from {tenant?.firstName} {tenant?.lastName}
                </p>
                <p className="text-sm text-[#7F8C8D]">
                  {property?.name} •{" "}
                  {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#2ECC71]">
                  {formatCurrencyToZAR(transaction.amountPaid)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
