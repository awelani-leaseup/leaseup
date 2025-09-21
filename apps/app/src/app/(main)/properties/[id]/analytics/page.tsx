"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Badge } from "@leaseup/ui/components/badge";
import { H4, H6 } from "@leaseup/ui/components/typography";
import {
  Home,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";

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

      <div className="space-y-4">
        {property.unit.map((unit) => {
          const isOccupied = unit.lease && unit.lease.length > 0;

          return (
            <div
              className="flex items-center justify-between border-b border-gray-200 pb-4"
              key={unit.id}
            >
              <div className="flex-1">
                <H4 className="text-base font-semibold">Unit #{unit.name}</H4>
                <p className="text-muted-foreground text-sm">
                  {unit.bedrooms} bed, {unit.bathrooms} bath • {unit.sqmt} sqm
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge
                    variant="soft"
                    size="sm"
                    color={isOccupied ? "success" : "warning"}
                  >
                    {isOccupied ? "Occupied" : "Vacant"}
                  </Badge>
                  {isOccupied && unit.lease?.[0]?.tenantLease?.[0]?.tenant && (
                    <Badge variant="outlined" size="sm">
                      {unit.lease[0].tenantLease[0].tenant.firstName}{" "}
                      {unit.lease[0].tenantLease[0].tenant.lastName}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <H6 className="text-primary tabular-nums">
                  {new Intl.NumberFormat("en-ZA", {
                    style: "currency",
                    currency: "ZAR",
                  }).format(unit.marketRent)}
                  <span className="text-muted-foreground text-sm font-normal">
                    /mo
                  </span>
                </H6>
                <p className="text-muted-foreground text-sm">
                  {isOccupied ? "Collecting" : "Potential"} Revenue
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
