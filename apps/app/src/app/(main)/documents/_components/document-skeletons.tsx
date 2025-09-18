import { Skeleton } from "@leaseup/ui/components/skeleton";
import { Card, CardContent, CardHeader } from "@leaseup/ui/components/card";

export function DocumentPageSkeleton() {
  return (
    <div className="mx-auto my-10 flex max-w-7xl flex-col">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
            <div>
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="mt-4 flex gap-3 md:mt-0">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="mt-2 h-4 w-48" />
              </div>
            </div>
            <DocumentTableSkeleton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DocumentStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-md border p-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-6 w-16" />
            </div>
            <Skeleton className="h-6 w-6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DocumentFiltersSkeleton() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
      <Skeleton className="h-10 max-w-md flex-1" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

export function DocumentTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="border-b p-4">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="border-b p-4 last:border-b-0">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
