import { api } from "@/trpc/server";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Button } from "@leaseup/ui/components/button";
import { Badge } from "@leaseup/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avataar";
import {
  Plus,
  Bath,
  Bed,
  RulerDimensionLine,
  Calendar,
  Eye,
  Edit,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { formatCurrency } from "@/app/(main)/invoices/_utils";
import { cn } from "@leaseup/ui/utils/cn";
import { AddUnitDialog } from "./_components/add-unit-dialog";

export default async function Units() {
  return (
    <div className="mx-auto my-10 max-w-7xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Units</CardTitle>
            <CardDescription>Manage your units.</CardDescription>
          </div>
          <CardAction>
            <AddUnitDialog>
              <Button>
                <Plus />
                Add Unit
              </Button>
            </AddUnitDialog>
          </CardAction>
        </CardHeader>
        <CardContent>
          <UnitCard />
        </CardContent>
      </Card>
    </div>
  );
}

const UnitCard = async () => {
  const units = await api.portfolio.getAllUnits();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => {
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

              {/* Property Info */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {unit.property?.propertyType === "MULTI_UNIT"
                    ? unit.property?.name
                    : `${unit.property?.addressLine1}, ${unit.property?.city}`}
                </p>
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
                    <RulerDimensionLine className="mr-1 h-3 w-3" /> {unit.sqmt}
                    m²
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
                    <span className="text-sm text-gray-600">Current Rent</span>
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

              {/* Current Tenant */}
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

              {/* Vacant Unit Actions */}
              {!isOccupied && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex gap-2">
                    <Button variant="outlined" size="sm" className="flex-1">
                      Find Tenant
                    </Button>
                    <Button variant="outlined" size="sm" className="flex-1">
                      Create Lease
                    </Button>
                  </div>
                </div>
              )}

              {/* Unit Status Indicator */}
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
  );
};
