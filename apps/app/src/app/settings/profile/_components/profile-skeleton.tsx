import { Skeleton } from "@leaseup/ui/components/skeleton";
import { Card, CardContent, CardHeader } from "@leaseup/ui/components/card";

export function ProfilePictureFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" /> {/* Title */}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Avatar skeleton */}
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            {/* Button skeleton */}
            <Skeleton className="h-9 w-32" />
            {/* Description text skeleton */}
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PersonalInfoFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" /> {/* Title */}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Full Name field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
            <Skeleton className="h-3 w-32" /> {/* Description */}
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
            <Skeleton className="h-3 w-36" /> {/* Description */}
          </div>

          {/* Phone field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-14" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
            <Skeleton className="h-3 w-40" /> {/* Description */}
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-6 flex justify-end">
          <Skeleton className="h-10 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

export function BusinessInfoFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-44" /> {/* Title */}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Business Name field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
            <Skeleton className="h-3 w-48" /> {/* Description */}
          </div>

          {/* Number of Properties field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>

          {/* Number of Units field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-6 flex justify-end">
          <Skeleton className="h-10 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AddressInfoFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" /> {/* Title */}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Address Line 1 field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
            <Skeleton className="h-3 w-52" /> {/* Description */}
          </div>

          {/* Address Line 2 field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
            <Skeleton className="h-3 w-56" /> {/* Description */}
          </div>

          {/* City field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>

          {/* State field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>

          {/* ZIP field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>

          {/* Country field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-6 flex justify-end">
          <Skeleton className="h-10 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}
