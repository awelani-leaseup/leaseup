import { Badge } from "@leaseup/ui/components/badge";
import { Button } from "@leaseup/ui/components/button";
import { FileText, Download, Plus } from "lucide-react";
import { format } from "date-fns";
import { formatBytes } from "@/hooks/use-file-upload";
import { EmptyState } from "@leaseup/ui/components/state";
import { api } from "@/trpc/react";

interface PropertyOverviewProps {
  id: string;
}

export function PropertyOverview({ id }: PropertyOverviewProps) {
  const { data: property } = api.portfolio.getById.useQuery(id);

  if (!property) {
    return null; // Loading and error states are handled by layout
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  // Calculate actual monthly rental income from active leases
  const currentRent =
    property.unit?.reduce((sum: number, unit) => {
      if (unit.lease && unit.lease.length > 0) {
        const activeLease =
          unit.lease.find((lease) => lease.status === "ACTIVE") ||
          unit.lease[0];
        return sum + (activeLease?.rent || unit.marketRent || 0);
      }
      return sum;
    }, 0) || 0;

  // Calculate total revenue from property transactions
  const totalRevenue =
    property.unit?.reduce((sum: number, unit) => {
      if (unit.lease && unit.lease.length > 0) {
        return (
          sum +
          unit.lease.reduce((leaseSum: number, lease) => {
            return (
              leaseSum +
              (lease.transactions?.reduce((transSum: number, transaction) => {
                return transSum + (transaction.amountPaid || 0);
              }, 0) || 0)
            );
          }, 0)
        );
      }
      return sum;
    }, 0) || 0;

  // Calculate potential annual income
  const potentialAnnualIncome = currentRent * 12;

  const propertyDocuments = property.files || [];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left Column */}
      <div className="space-y-8 lg:col-span-2">
        {/* Property Documents */}
        <section className="rounded-xl bg-white p-6">
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#2D3436]">
                Property Documents
              </h2>
              {propertyDocuments.length > 0 && (
                <Badge variant="outlined">
                  {propertyDocuments.length} documents
                </Badge>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {propertyDocuments.length > 0 ? (
                <div className="space-y-4">
                  <h6 className="text-sm font-medium text-gray-700">
                    Existing Documents
                  </h6>
                  <div className="space-y-2">
                    {propertyDocuments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2"
                      >
                        <div className="flex items-center">
                          <FileText className="mr-3 size-4 stroke-1" />
                          <div>
                            <p className="text-sm font-medium tracking-tight text-[#2D3436]">
                              {file.name}
                            </p>
                            <p className="text-muted-foreground text-sm tracking-tight">
                              Uploaded{" "}
                              {format(new Date(file.createdAt), "MMM d, yyyy")}{" "}
                              •{" "}
                              {file.size
                                ? formatBytes(file.size)
                                : "Unknown size"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="icon"
                            color="info"
                            onClick={() => {
                              window.open(file.url, "_blank");
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No documents"
                  icon={<FileText className="h-12 w-12" />}
                  description="No property documents have been uploaded yet."
                  buttons={
                    <Button>
                      <Plus className="h-4 w-4" />
                      Add Document
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Right Column */}
      <div className="space-y-8">
        {/* Property Details */}
        <section className="rounded-xl bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#2D3436]">
            Property Details
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="mb-1 text-sm text-[#7F8C8D]">Property Type</h3>
              <p className="font-medium text-[#2D3436]">
                {property.propertyType === "SINGLE_UNIT"
                  ? "Single Unit"
                  : "Apartment Building"}
              </p>
            </div>
            <div>
              <h3 className="mb-1 text-sm text-[#7F8C8D]">Year Built</h3>
              <p className="font-medium text-[#2D3436]">
                {(property as any).yearBuilt ||
                  format(new Date(property.createdAt), "yyyy")}
              </p>
            </div>
            <div>
              <h3 className="mb-1 text-sm text-[#7F8C8D]">Square Footage</h3>
              <p className="font-medium text-[#2D3436]">
                {(property as any).totalSqft || "N/A"} sq ft
              </p>
            </div>
            <div>
              <h3 className="mb-1 text-sm text-[#7F8C8D]">Parking Spaces</h3>
              <p className="font-medium text-[#2D3436]">
                {(property as any).parkingSpaces || "N/A"} spaces
              </p>
            </div>
            <div>
              <h3 className="mb-1 text-sm text-[#7F8C8D]">Amenities</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {(property as any).amenities &&
                (property as any).amenities.length > 0 ? (
                  (property as any).amenities.map((amenity: string) => (
                    <span
                      key={amenity}
                      className="rounded bg-[#ECF0F1] px-2 py-1 text-xs text-[#2D3436]"
                    >
                      {amenity}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#7F8C8D]">
                    No amenities listed
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Financial Summary */}
        <section className="rounded-xl bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#2D3436]">
            Financial Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#7F8C8D]">Monthly Rent Income</span>
              <span className="font-medium text-[#2D3436]">
                {formatCurrency(currentRent)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7F8C8D]">Potential Annual Income</span>
              <span className="font-medium text-[#2D3436]">
                {formatCurrency(potentialAnnualIncome)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7F8C8D]">Total Revenue (All Time)</span>
              <span className="font-medium text-[#2D3436]">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
