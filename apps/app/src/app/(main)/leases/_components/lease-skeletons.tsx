import { Skeleton } from "@leaseup/ui/components/skeleton";

export function LeaseTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-7 gap-4 border-b pb-3">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={`header-col-${i}`} className="h-4 w-full" />
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: 5 }, (_, i) => (
        <div key={`table-row-${i}`} className="grid grid-cols-7 gap-4 py-3">
          {/* Tenant column with avatar */}
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>

          {/* Property & Unit */}
          <div className="space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>

          {/* Rent Amount */}
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Start Date */}
          <Skeleton className="h-4 w-24" />

          {/* End Date */}
          <Skeleton className="h-4 w-24" />

          {/* Status */}
          <Skeleton className="h-6 w-16 rounded-full" />

          {/* Actions */}
          <div className="flex justify-end">
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
}
