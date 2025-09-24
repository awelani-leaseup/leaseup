"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Badge } from "@leaseup/ui/components/badge";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import { EmptyState } from "@leaseup/ui/components/state";
import { Skeleton } from "@leaseup/ui/components/skeleton";
import Link from "next/link";

export default function TenantLeasesPage() {
  const params = useParams();
  const tenantId = params.id as string;

  const {
    data: tenant,
    isLoading,
    error,
  } = api.tenant.getTenantById.useQuery({
    id: tenantId,
  });

  if (isLoading) {
    return <TenantLeasesSkeleton />;
  }

  if (error || !tenant) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading tenant leases</p>
          <p className="text-gray-600">
            {error?.message || "Tenant not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lease History</CardTitle>
      </CardHeader>
      <CardContent>
        {tenant.tenantLease && tenant.tenantLease.length > 0 ? (
          <div className="space-y-4">
            {tenant.tenantLease.map((tenantLease) => {
              const lease = tenantLease.lease;
              const property = lease.unit?.property;
              return (
                <Link
                  href={`/leases/${lease.id}`}
                  key={lease.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-medium text-[#2D3436]">
                      {property?.name}, Unit #{lease.unit?.name ?? "N/A"}
                    </h3>
                    <Badge
                      className={`${lease.status === "ACTIVE" ? "bg-[#2ECC71]" : "bg-gray-500"} text-white`}
                    >
                      {lease.status}
                    </Badge>
                  </div>
                  <p className="mb-1 text-sm text-[#7F8C8D]">
                    {format(new Date(lease.startDate), "MMMM d, yyyy")} -{" "}
                    {lease.endDate
                      ? format(new Date(lease.endDate), "MMMM d, yyyy")
                      : "Ongoing"}
                  </p>
                  <p className="text-sm text-[#2D3436]">
                    Monthly Rent: {lease.rentDueCurrency}{" "}
                    {lease.rent?.toLocaleString()}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No lease history found."
            icon={<FileText className="h-4 w-4" />}
          />
        )}
      </CardContent>
    </Card>
  );
}

function TenantLeasesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lease History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={`lease-skeleton-${i}`}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="mb-2 flex items-start justify-between">
                <Skeleton className="h-5 w-48" /> {/* Property name and unit */}
                <Skeleton className="h-6 w-16 rounded-full" />{" "}
                {/* Status badge */}
              </div>
              <Skeleton className="mb-1 h-4 w-64" /> {/* Date range */}
              <Skeleton className="h-4 w-40" /> {/* Monthly rent */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
