import { Card, CardContent, CardHeader } from "@leaseup/ui/components/card";
import { Skeleton } from "@leaseup/ui/components/skeleton";

export function TenantProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left Column */}
      <div className="space-y-8 lg:col-span-2">
        {/* Current Lease Information Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Property */}
              <div>
                <Skeleton className="mb-1 h-3 w-16" />
                <Skeleton className="h-4 w-48" />
              </div>
              {/* Monthly Rent */}
              <div>
                <Skeleton className="mb-1 h-3 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              {/* Lease Start */}
              <div>
                <Skeleton className="mb-1 h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
              {/* Lease End */}
              <div>
                <Skeleton className="mb-1 h-3 w-18" />
                <Skeleton className="h-4 w-28" />
              </div>
              {/* Security Deposit */}
              <div>
                <Skeleton className="mb-1 h-3 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              {/* Status */}
              <div>
                <Skeleton className="mb-1 h-3 w-12" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={`document-skeleton-${i}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
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
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-8">
        {/* Contact Information Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <Skeleton className="mb-1 h-3 w-12" />
                <Skeleton className="h-4 w-48" />
              </div>
              {/* Phone */}
              <div>
                <Skeleton className="mb-1 h-3 w-12" />
                <Skeleton className="h-4 w-32" />
              </div>
              {/* Emergency Contact */}
              <div>
                <Skeleton className="mb-1 h-3 w-28" />
                <Skeleton className="mb-1 h-4 w-36" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Date of Birth */}
              <div>
                <Skeleton className="mb-1 h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
              {/* Additional Emails */}
              <div>
                <Skeleton className="mb-1 h-3 w-28" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function TenantLeasesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-28" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={`lease-skeleton-${i}`}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="mb-2 flex items-start justify-between">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="mb-1 h-4 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TenantTransactionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 border-b pb-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-18" />
          </div>

          {/* Table Rows */}
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={`transaction-row-${i}`}
              className="grid grid-cols-6 gap-4 border-b border-gray-100 py-3 last:border-b-0"
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-12 rounded-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
