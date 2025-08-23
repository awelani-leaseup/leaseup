import { Card, CardContent, CardHeader } from "@leaseup/ui/components/card";
import { Skeleton } from "@leaseup/ui/components/skeleton";
import { Badge } from "@leaseup/ui/components/badge";

export function TransactionStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
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

export function TransactionTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-7 gap-4 border-b pb-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Table Rows */}
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={`table-row-skeleton-${index}`}
          className="grid grid-cols-7 gap-4 py-3"
        >
          {/* Date Column */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Description Column */}
          <Skeleton className="h-4 w-32" />

          {/* Amount Column */}
          <Skeleton className="h-4 w-20" />

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

          {/* Invoice Column */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Reference Column */}
          <Skeleton className="h-4 w-24" />
        </div>
      ))}

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}

export function TransactionFiltersSkeleton() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search Skeleton */}
      <div className="relative flex-1">
        <Skeleton className="h-10 w-full max-w-md rounded-md" />
      </div>

      {/* Filter Dropdowns */}
      <Skeleton className="h-10 w-32 rounded-md" />
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}

export function TransactionPageSkeleton() {
  return (
    <div className="mx-auto my-10 flex max-w-7xl flex-col">
      {/* Single Card for Page Header and Main Content */}
      <Card>
        {/* Page Header Skeleton */}
        <CardHeader className="border-b border-gray-200">
          <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
            <div>
              <Skeleton className="mb-2 h-8 w-80" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>

          {/* Summary Stats Skeleton */}
          <div className="mt-6">
            <TransactionStatsSkeleton />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Skeleton className="mb-2 h-6 w-40" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>

            {/* Filters Skeleton */}
            <TransactionFiltersSkeleton />

            {/* Table Skeleton */}
            <TransactionTableSkeleton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
