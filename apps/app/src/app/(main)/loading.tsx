import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@leaseup/ui/components/card";
import { Skeleton } from "@leaseup/ui/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto my-10 flex max-w-7xl flex-col">
      {/* Header Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-32" /> {/* Title */}
          <Skeleton className="h-4 w-48" /> {/* Description */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" /> {/* Add Tenant Button */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-96" /> {/* Search Input */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-32" /> {/* All properties filter */}
              <Skeleton className="h-10 w-28" /> {/* All Status filter */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenant Cards Grid Skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={`tenant-skeleton-${i}`}>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex cursor-pointer items-center gap-2">
                  <Skeleton className="size-10 rounded-full" /> {/* Avatar */}
                  <div className="flex flex-col">
                    <Skeleton className="h-4 w-32" /> {/* Name */}
                    <Skeleton className="mt-1 h-3 w-48" />{" "}
                    {/* Address/Prospect */}
                  </div>
                </div>
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex-1"></div>
                  <div className="shrink-0">
                    <Skeleton className="h-6 w-16 rounded-full" />{" "}
                    {/* Status Badge */}
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <div className="space-y-3">
                  {/* Description List Items */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-4" /> {/* Icon */}
                      <Skeleton className="h-3 w-12" /> {/* Label */}
                    </div>
                    <Skeleton className="h-3 w-20" /> {/* Value */}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-4" /> {/* Icon */}
                      <Skeleton className="h-3 w-20" /> {/* Label */}
                    </div>
                    <Skeleton className="h-3 w-16" /> {/* Value */}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-4" /> {/* Icon */}
                      <Skeleton className="h-3 w-16" /> {/* Label */}
                    </div>
                    <Skeleton className="h-3 w-24" /> {/* Value */}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" /> {/* Action Button */}
              <Skeleton className="ml-2 size-10" /> {/* Dropdown Actions */}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-10 flex items-center justify-center gap-2">
        <Skeleton className="h-10 w-20" /> {/* Previous Button */}
        <Skeleton className="h-10 w-16" /> {/* Next Button */}
      </div>
    </div>
  );
}
