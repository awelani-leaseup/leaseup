"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { CardTitle } from "@leaseup/ui/components/card";
import { Badge } from "@leaseup/ui/components/badge";
import { Button } from "@leaseup/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avatar";
import {
  Home,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Bed,
  Bath,
  RulerDimensionLine,
  Circle,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@leaseup/ui/utils/cn";
import { formatCurrency } from "@/app/(main)/invoices/_utils";

export default function PropertyAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property } = api.portfolio.getById.useQuery(id);

  if (!property) {
    return null;
  }

  const totalUnits = property.unit.length;
  const occupiedUnits = property.unit.filter(
    (unit) => unit.lease && unit.lease.length > 0,
  ).length;
  const vacantUnits = totalUnits - occupiedUnits;
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  const totalMonthlyRent = property.unit.reduce(
    (sum, unit) =>
      sum + (unit.lease && unit.lease.length > 0 ? unit.marketRent : 0),
    0,
  );

  const potentialMonthlyRent = property.unit.reduce(
    (sum, unit) => sum + unit.marketRent,
    0,
  );

  const lostRevenue = potentialMonthlyRent - totalMonthlyRent;

  const stats = [
    {
      title: "Total Units",
      value: totalUnits,
      icon: Home,
      color: "info",
    },
    {
      title: "Occupied Units",
      value: occupiedUnits,
      icon: Users,
      color: "success",
    },
    {
      title: "Vacant Units",
      value: vacantUnits,
      icon: Home,
      color: "warning",
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate.toFixed(1)}%`,
      icon: BarChart3,
      color: (() => {
        if (occupancyRate >= 90) return "success";
        if (occupancyRate >= 70) return "warning";
        return "danger";
      })(),
    },
  ];

  const financialStats = [
    {
      title: "Monthly Rental Income",
      value: totalMonthlyRent,
      icon: DollarSign,
      color: "success",
      format: "currency",
    },
    {
      title: "Potential Monthly Income",
      value: potentialMonthlyRent,
      icon: TrendingUp,
      color: "info",
      format: "currency",
    },
    {
      title: "Lost Revenue (Vacancy)",
      value: lostRevenue,
      icon: TrendingDown,
      color: "danger",
      format: "currency",
    },
  ];

  return (
    <div className="space-y-6">
      <CardTitle>Property Overview</CardTitle>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
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
              case "danger":
                return {
                  textColor: "text-red-700",
                  valueColor: "text-red-800",
                  iconColor: "text-red-600",
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

          const colorClasses = getColorClasses(stat.color);

          return (
            <Badge
              key={stat.title + index}
              variant="soft"
              color={stat.color as "success" | "warning" | "danger" | "info"}
              className="h-auto rounded-md p-4 [&_svg]:size-6 [&_svg]:stroke-1"
            >
              <div className="flex w-full items-center justify-between">
                <div>
                  <p className={`mb-2 text-sm ${colorClasses.textColor}`}>
                    {stat.title}
                  </p>
                  <p className={`text-lg font-bold ${colorClasses.valueColor}`}>
                    {stat.value}
                  </p>
                </div>
                <Icon className={colorClasses.iconColor} />
              </div>
            </Badge>
          );
        })}
      </div>

      <CardTitle>Financial Overview</CardTitle>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {financialStats.map((stat, index) => {
          const Icon = stat.icon;
          const formatValue = (value: number, format: string) => {
            switch (format) {
              case "currency":
                return new Intl.NumberFormat("en-ZA", {
                  style: "currency",
                  currency: "ZAR",
                }).format(value);
              case "percentage":
                return `${value.toFixed(1)}%`;
              default:
                return value.toString();
            }
          };

          const getColorClasses = (color: string) => {
            switch (color) {
              case "success":
                return {
                  textColor: "text-green-700",
                  valueColor: "text-green-800",
                  iconColor: "text-green-600",
                };
              case "danger":
                return {
                  textColor: "text-red-700",
                  valueColor: "text-red-800",
                  iconColor: "text-red-600",
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

          const colorClasses = getColorClasses(stat.color);

          return (
            <Badge
              key={stat.title + index}
              variant="soft"
              color={stat.color as "success" | "warning" | "danger" | "info"}
              className="h-auto rounded-md p-4 [&_svg]:size-6 [&_svg]:stroke-1"
            >
              <div className="flex w-full items-center justify-between">
                <div>
                  <p className={`mb-2 text-sm ${colorClasses.textColor}`}>
                    {stat.title}
                  </p>
                  <p className={`text-lg font-bold ${colorClasses.valueColor}`}>
                    {formatValue(stat.value, stat.format)}
                  </p>
                </div>
                <Icon className={colorClasses.iconColor} />
              </div>
            </Badge>
          );
        })}
      </div>

      <CardTitle>Unit Breakdown</CardTitle>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {property.unit.map((unit) => {
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
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
