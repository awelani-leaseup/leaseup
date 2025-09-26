import { CardTitle } from "@leaseup/ui/components/card";
import { Badge } from "@leaseup/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avatar";
import { Button } from "@leaseup/ui/components/button";
import { EmptyState } from "@leaseup/ui/components/state";
import {
  Home,
  Bath,
  Bed,
  RulerDimensionLine,
  Calendar,
  Eye,
  Edit,
  Plus,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { formatCurrency } from "@/app/(main)/invoices/_utils";
import { cn } from "@leaseup/ui/utils/cn";

interface PropertyUnitsProps {
  property: any;
}

export function PropertyUnits({ property }: PropertyUnitsProps) {
  const units = property.unit || [];

  if (units.length === 0) {
    return (
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center justify-between">
          <CardTitle>Units</CardTitle>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        </div>
        <div className="py-12">
          <EmptyState
            icon={<Home className="h-12 w-12" />}
            title="No units found"
            description="This property doesn't have any units yet."
            buttons={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add First Unit
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between">
        <CardTitle>Units</CardTitle>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Unit
        </Button>
      </div>
      <div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {units.map((unit: any) => {
            const currentLease =
              unit.lease && unit.lease.length > 0 ? unit.lease[0] : null;
            const tenant = currentLease?.tenantLease?.[0]?.tenant;
            const isOccupied = !!currentLease;

            return (
              <div
                key={unit.id}
                className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex flex-row items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Unit {unit.name}
                    </h3>
                    <Badge
                      size="sm"
                      variant="soft"
                      color={isOccupied ? "success" : "warning"}
                    >
                      <Circle
                        className={cn(
                          isOccupied
                            ? "fill-success text-success"
                            : "fill-warning text-warning",
                          "animate-pulse",
                        )}
                      />
                      {isOccupied ? "Occupied" : "Vacant"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outlined" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outlined" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Badge variant="outlined" size="sm">
                      <Bed className="mr-1 h-3 w-3" /> {unit.bedrooms}
                    </Badge>
                    <Badge variant="outlined" size="sm">
                      <Bath className="mr-1 h-3 w-3" /> {unit.bathrooms}
                    </Badge>
                    <Badge variant="outlined" size="sm">
                      <RulerDimensionLine className="mr-1 h-3 w-3" />{" "}
                      {unit.sqmt}m²
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Market Rent</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(unit.marketRent || 0)}/mo
                    </span>
                  </div>

                  {currentLease && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Current Rent
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(currentLease.rent || 0)}/mo
                      </span>
                    </div>
                  )}

                  {unit.deposit && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Deposit</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(unit.deposit)}
                      </span>
                    </div>
                  )}
                </div>

                {tenant && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                      Current Tenant
                    </h4>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={tenant.avatarUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {tenant.firstName?.[0]}
                          {tenant.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {tenant.firstName} {tenant.lastName}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {tenant.email}
                        </p>
                      </div>
                      <Link href={`/tenants/${tenant.id}`}>
                        <Button variant="outlined" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>

                    {currentLease && (
                      <div className="mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {currentLease.startDate &&
                              format(
                                new Date(currentLease.startDate),
                                "MMM dd, yyyy",
                              )}
                            {currentLease.endDate &&
                              ` - ${format(new Date(currentLease.endDate), "MMM dd, yyyy")}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!isOccupied && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="flex w-full gap-2">
                      <Link
                        href={`/leases/create?unitId=${unit.id}&propertyId=${property.id}`}
                        className="w-full"
                      >
                        <Button color="secondary" size="sm" className="w-full">
                          Create Lease
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last updated</span>
                    <span>
                      {format(
                        new Date(unit.updatedAt || unit.createdAt),
                        "MMM dd, yyyy",
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
