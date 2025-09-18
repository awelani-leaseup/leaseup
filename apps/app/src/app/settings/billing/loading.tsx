import { Skeleton } from "@leaseup/ui/components/skeleton";
import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from "@leaseup/ui/components/description-list";

export default function BillingLoading() {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Current Subscription</h2>
      </div>

      <div className="grid gap-6 rounded-md border bg-gray-50 p-4 md:grid-cols-2">
        <div>
          <DescriptionList orientation="horizontal">
            <DescriptionTerm className="flex items-center gap-2">
              <Skeleton className="size-4 bg-gray-300" />
              Plan Name
            </DescriptionTerm>
            <DescriptionDetails>
              <Skeleton className="h-5 w-24 bg-gray-300" />
            </DescriptionDetails>

            <DescriptionTerm className="flex items-center gap-2">
              <Skeleton className="size-4 bg-gray-300" />
              Amount
            </DescriptionTerm>
            <DescriptionDetails>
              <Skeleton className="h-5 w-20 bg-gray-300" />
            </DescriptionDetails>

            <DescriptionTerm className="flex items-center gap-2">
              <Skeleton className="size-4 bg-gray-300" />
              Billing Interval
            </DescriptionTerm>
            <DescriptionDetails>
              <Skeleton className="h-5 w-16 bg-gray-300" />
            </DescriptionDetails>
          </DescriptionList>
        </div>

        <div>
          <DescriptionList orientation="horizontal">
            <DescriptionTerm className="flex items-center gap-2">
              <Skeleton className="size-4 bg-gray-300" />
              Subscription Status
            </DescriptionTerm>
            <DescriptionDetails>
              <Skeleton className="h-6 w-20 rounded-md bg-gray-300" />
            </DescriptionDetails>

            <DescriptionTerm className="flex items-center gap-2">
              <Skeleton className="size-4 bg-gray-300" />
              Next Payment Date
            </DescriptionTerm>
            <DescriptionDetails>
              <Skeleton className="h-5 w-32 bg-gray-300" />
            </DescriptionDetails>

            <DescriptionTerm className="flex items-center gap-2">
              <Skeleton className="size-4 bg-gray-300" />
              Created Date
            </DescriptionTerm>
            <DescriptionDetails>
              <Skeleton className="h-5 w-32 bg-gray-300" />
            </DescriptionDetails>
          </DescriptionList>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-4 flex w-fit flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="mt-4 h-10 w-32 rounded-md" />
        </div>
      </div>
    </>
  );
}
