"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@leaseup/ui/components/button";
import { Card, CardContent } from "@leaseup/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avataar";
import { Skeleton } from "@leaseup/ui/components/skeleton";
import { MessageSquare, FileText, User, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface TenantLayoutProps {
  children: React.ReactNode;
}

export default function TenantLayout({ children }: TenantLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const tenantId = params.id as string;

  const {
    data: tenant,
    isLoading,
    error,
  } = api.tenant.getTenantById.useQuery({
    id: tenantId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#ECF0F1] px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Tenant Header Skeleton */}
          <Card className="mb-8">
            <CardContent className="flex flex-col items-start justify-between md:flex-row md:items-center">
              <div className="mb-4 flex items-center md:mb-0">
                <Skeleton className="mr-4 h-16 w-16 rounded-full" />
                <div>
                  <Skeleton className="mb-2 h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-28" />
              </div>
            </CardContent>
          </Card>

          {/* Tabs Navigation Skeleton */}
          <Card className="mb-8">
            <CardContent>
              <nav className="flex space-x-8">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={`tab-skeleton-${i}`}
                    className="flex items-center px-1 pb-2"
                  >
                    <Skeleton className="mr-2 h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Page Content Skeleton */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-[#ECF0F1] px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-red-600">Error loading tenant details</p>
              <p className="text-gray-600">
                {error?.message || "Tenant not found"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentLease = tenant.tenantLease?.[0]?.lease;

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      href: `/tenants/${tenantId}/profile`,
    },
    {
      id: "leases",
      label: "Leases",
      icon: FileText,
      href: `/tenants/${tenantId}/leases`,
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: CreditCard,
      href: `/tenants/${tenantId}/transactions`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#ECF0F1] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Tenant Header */}
        <Card className="mb-8">
          <CardContent className="flex flex-col items-start justify-between md:flex-row md:items-center">
            <div className="mb-4 flex items-center md:mb-0">
              <Avatar className="mr-4 h-16 w-16">
                <AvatarImage
                  src={tenant.avatarUrl || ""}
                  alt={`${tenant.firstName} ${tenant.lastName}`}
                />
                <AvatarFallback className="text-xl">
                  {tenant.firstName?.[0]}
                  {tenant.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-[#2D3436]">
                  {tenant.firstName} {tenant.lastName}
                </h1>
                <p className="text-[#7F8C8D]">
                  Tenant since {format(new Date(tenant.createdAt), "MMMM yyyy")}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-[#3498DB] text-white hover:bg-[#2980B9]">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
              {currentLease && (
                <Button
                  variant="outlined"
                  className="border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Lease
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Card className="mb-8">
          <CardContent>
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`flex items-center px-1 pb-2 font-medium transition-colors ${
                      isActive
                        ? "border-b-2 border-[#3498DB] text-[#3498DB]"
                        : "text-[#7F8C8D] hover:text-[#3498DB]"
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
