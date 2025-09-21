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
import { Plus, View, Home, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@leaseup/ui/components/badge";
import { H4, H6 } from "@leaseup/ui/components/typography";
import { format } from "date-fns";

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
            <Button>
              <Plus />
              <Link href="/units/create">Add Unit</Link>
            </Button>
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => {
          const isOccupied = unit?.lease.length > 0;
          const tenant = unit.lease?.[0]?.tenantLease?.[0]?.tenant;

          const getColorClasses = (color: string) => {
            switch (color) {
              case "success":
                return {
                  textColor: "text-green-700",
                  valueColor: "text-green-800",
                  iconColor: "text-green-600",
                };
              case "warning":
                return {
                  textColor: "text-orange-700",
                  valueColor: "text-orange-800",
                  iconColor: "text-orange-600",
                };
              case "info":
              default:
                return {
                  textColor: "text-blue-700",
                  valueColor: "text-blue-800",
                  iconColor: "text-blue-600",
                };
            }
          };

          const color = isOccupied ? "success" : "warning";
          const colorClasses = getColorClasses(color);

          return (
            <Badge
              key={unit.id}
              variant="soft"
              color={color as "success" | "warning"}
              className="h-auto rounded-md p-6 [&_svg]:size-6 [&_svg]:stroke-1"
            >
              <div className="w-full space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <H4
                      className={`text-lg font-semibold ${colorClasses.valueColor}`}
                    >
                      Unit #{unit.name}
                    </H4>
                    <p className={`text-sm ${colorClasses.textColor}`}>
                      {unit.property?.propertyType === "MULTI_UNIT"
                        ? unit.property?.name
                        : `${unit.property?.addressLine1}, ${unit.property?.city}`}
                    </p>
                  </div>
                  <Home className={colorClasses.iconColor} />
                </div>

                {/* Status Badge */}
                <div className="flex gap-2">
                  <Badge
                    variant="soft"
                    size="sm"
                    color={isOccupied ? "success" : "warning"}
                  >
                    {isOccupied ? "Occupied" : "Vacant"}
                  </Badge>
                  {isOccupied && tenant && (
                    <Badge variant="outlined" size="sm">
                      <Users className="mr-1 size-3" />
                      {tenant.firstName} {tenant.lastName}
                    </Badge>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {isOccupied ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${colorClasses.textColor}`}>
                          Monthly Rent
                        </span>
                        <H6
                          className={`tabular-nums ${colorClasses.valueColor}`}
                        >
                          {new Intl.NumberFormat("en-ZA", {
                            style: "currency",
                            currency: "ZAR",
                          }).format(unit.lease[0]?.rent ?? 0)}
                          <span className="text-muted-foreground text-sm font-normal">
                            /mo
                          </span>
                        </H6>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${colorClasses.textColor}`}>
                          Lease Period
                        </span>
                        <span className={`text-sm ${colorClasses.valueColor}`}>
                          {unit.lease[0]?.startDate &&
                            format(unit.lease[0]?.startDate, "MMM yyyy")}{" "}
                          -{" "}
                          {unit.lease[0]?.endDate &&
                          unit.lease[0]?.leaseType === "MONTHLY"
                            ? format(unit.lease[0]?.endDate, "MMM yyyy")
                            : "Month to month"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${colorClasses.textColor}`}>
                          Target Rent
                        </span>
                        <H6
                          className={`tabular-nums ${colorClasses.valueColor}`}
                        >
                          {new Intl.NumberFormat("en-ZA", {
                            style: "currency",
                            currency: "ZAR",
                          }).format(unit.marketRent)}
                          <span className="text-muted-foreground text-sm font-normal">
                            /mo
                          </span>
                        </H6>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${colorClasses.textColor}`}>
                          Size
                        </span>
                        <span className={`text-sm ${colorClasses.valueColor}`}>
                          {unit.sqmt}m² • {unit.bedrooms} bed, {unit.bathrooms}{" "}
                          bath
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Button */}
                <Button className="mt-4 w-full" variant="soft" size="sm">
                  <View className="mr-2 size-4" />
                  View Details
                </Button>
              </div>
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
