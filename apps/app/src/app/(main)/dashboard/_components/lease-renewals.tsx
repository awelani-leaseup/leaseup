"use client";

import { api } from "@/trpc/react";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@leaseup/ui/components/alert";
import { format } from "date-fns";
import { Skeleton } from "@leaseup/ui/components/skeleton";
import { EmptyState } from "@leaseup/ui/components/state";
import { FileText } from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@leaseup/ui/components/avataar";

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
          title="No Upcoming Renewals"
          description="Your upcoming lease renewals will appear here."
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
          return (
            <div key={lease.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="flex items-center gap-2 font-medium tracking-tight text-[#2D3436]">
                  <Avatar>
                    <AvatarImage src={tenant?.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      {tenant?.firstName?.[0]}
                      {tenant?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>
                      {tenant?.firstName} {tenant?.lastName}
                    </p>
                    <p className="text-sm tracking-tight text-[#7F8C8D]">
                      Expires{" "}
                      {lease.endDate
                        ? format(new Date(lease.endDate), "MMM d, yyyy")
                        : "TBD"}
                    </p>
                  </div>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
