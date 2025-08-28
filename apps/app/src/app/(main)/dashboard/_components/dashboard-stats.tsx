"use client";

import { api } from "@/trpc/react";
import { formatCurrencyToZAR } from "@/utils/currency";
import { Skeleton } from "@leaseup/ui/components/skeleton";
import {
  Banknote,
  BuildingIcon,
  TriangleAlertIcon,
  UsersIcon,
} from "lucide-react";
import { StatCard } from "./stat-card";

export function DashboardStats() {
  const { data, isLoading, error } = api.dashboard.getStats.useQuery();

  if (isLoading) {
    return (
      <div
        id="stats-overview"
        className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={`skeleton-stat-${i}`}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-8 w-12" />
            <Skeleton className="mt-2 h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">Failed to load dashboard stats</p>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div
      id="stats-overview"
      className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
    >
      <StatCard
        icon={BuildingIcon}
        iconColor="text-[#3498DB]"
        iconBgColor="bg-blue-100"
        title="Properties"
        value={stats?.properties || 0}
        description={
          stats?.properties === 0
            ? "Add your first property"
            : "Active properties"
        }
      />

      <StatCard
        icon={UsersIcon}
        iconColor="text-[#2ECC71]"
        iconBgColor="bg-green-100"
        title="Tenants"
        value={stats?.tenants || 0}
        description={stats?.tenants === 0 ? "No tenants yet" : "Total tenants"}
      />

      <StatCard
        icon={Banknote}
        iconColor="text-[#F39C12]"
        iconBgColor="bg-yellow-100"
        title="Revenue"
        value={formatCurrencyToZAR(stats?.revenue || 0)}
        description={
          stats?.revenue === 0 ? "Start collecting rent" : "Total collected"
        }
      />

      <StatCard
        icon={TriangleAlertIcon}
        iconColor="text-[#E74C3C]"
        iconBgColor="bg-red-100"
        title="Pending Issues"
        value={stats?.pendingIssues || 0}
        description={
          stats?.pendingIssues === 0 ? "No pending issues" : "Require attention"
        }
      />
    </div>
  );
}
