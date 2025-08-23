import { Card, CardContent, CardHeader } from "@leaseup/ui/components/card";
import { Skeleton } from "@leaseup/ui/components/skeleton";
import { Badge } from "@leaseup/ui/components/badge";

export function InvoiceStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Badge
          key={`stat-skeleton-${index}`}
          variant="soft"
          color="info"
          className="h-auto rounded-md p-4"
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex-1">
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        </Badge>
      ))}
    </div>
  );
}

export function InvoiceTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-7 gap-4 border-b pb-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Table Rows */}
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={`table-row-skeleton-${index}`}
          className="grid grid-cols-7 gap-4 py-3"
        >
          {/* Invoice Column */}
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/* Tenant Column */}
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>

          {/* Property Column */}
          <div className="space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>

          {/* Amount Column */}
          <Skeleton className="h-4 w-20" />

          {/* Due Date Column */}
          <Skeleton className="h-4 w-24" />

          {/* Status Column */}
          <Skeleton className="h-6 w-16 rounded-full" />

          {/* Actions Column */}
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between pt-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}

export function InvoiceFiltersSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search Skeleton */}
      <div className="relative mt-6 flex-1">
        <Skeleton className="h-10 max-w-md rounded-md" />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}

export function InvoicePageSkeleton() {
  return (
    <div className="mx-auto my-10 flex max-w-7xl flex-col space-y-8">
      {/* Page Header Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
            <div>
              <Skeleton className="mb-2 h-8 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="mt-4 flex gap-3 md:mt-0">
              <Skeleton className="h-10 w-32 rounded-md" />
              <Skeleton className="h-10 w-36 rounded-md" />
            </div>
          </div>
        </CardHeader>

        {/* Summary Cards Skeleton */}
        <CardContent>
          <InvoiceStatsSkeleton />
        </CardContent>
      </Card>

      {/* Main Content Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="mb-2 h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          {/* Filters Skeleton */}
          <InvoiceFiltersSkeleton />
        </CardHeader>

        <CardContent>
          <InvoiceTableSkeleton />
        </CardContent>
      </Card>
    </div>
  );
}
