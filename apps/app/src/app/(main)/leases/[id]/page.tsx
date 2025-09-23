"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { LeaseView } from "./_components/lease-view";
import { Card, CardContent } from "@leaseup/ui/components/card";
import { Skeleton } from "@leaseup/ui/components/skeleton";

function LeaseViewSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Skeleton */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <Skeleton className="mb-2 h-8 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 border-b border-gray-200 pb-6 md:grid-cols-3">
              <div>
                <Skeleton className="mb-2 h-4 w-16" />
                <div className="flex items-center">
                  <Skeleton className="mr-3 h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="mb-1 h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </div>
              <div>
                <Skeleton className="mb-2 h-4 w-16" />
                <Skeleton className="mb-1 h-4 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div>
                <Skeleton className="mb-2 h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column Skeleton */}
          <div className="space-y-8 lg:col-span-2">
            <Card>
              <div className="p-6">
                <Skeleton className="mb-4 h-6 w-32" />
                <div className="grid grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="mb-1 h-3 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <Skeleton className="mb-4 h-6 w-40" />
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="mb-2 h-4 w-48" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-8">
            <Card>
              <div className="p-6">
                <Skeleton className="mb-4 h-6 w-32" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div className="flex items-center">
                        <Skeleton className="mr-3 h-6 w-6" />
                        <div>
                          <Skeleton className="mb-1 h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: lease, isLoading, error } = api.lease.getById.useQuery(id);

  if (isLoading) {
    return <LeaseViewSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                  Error Loading Lease
                </h2>
                <p className="mb-4 text-gray-600">
                  {error.message ||
                    "Failed to load lease details. Please try again."}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Refresh Page
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                  Lease Not Found
                </h2>
                <p className="text-gray-600">
                  The lease you&apos;re looking for doesn&apos;t exist or you
                  don&apos;t have permission to view it.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <LeaseView lease={lease} />;
}
