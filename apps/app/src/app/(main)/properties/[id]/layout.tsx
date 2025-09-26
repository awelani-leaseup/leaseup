"use client";

import { useParams, usePathname } from "next/navigation";
import { Button } from "@leaseup/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Skeleton } from "@leaseup/ui/components/skeleton";
import {
  ArrowLeft,
  Edit,
  Building,
  Users,
  Home,
  FileText,
  BarChart3,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { EditPropertyDialog } from "../_components/edit-property-dialog";

const tabs = [
  { id: "overview", label: "Overview", icon: Building },
  { id: "tenants", label: "Tenants", icon: Users },
  { id: "units", label: "Units", icon: Home },
  { id: "leases", label: "Leases", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();

  const { data: property, isLoading } = api.portfolio.getById.useQuery(id);

  const getActiveTab = () => {
    if (pathname.endsWith(`/properties/${id}`)) return "overview";
    if (pathname.includes("/tenants")) return "tenants";
    if (pathname.includes("/units")) return "units";
    if (pathname.includes("/leases")) return "leases";
    if (pathname.includes("/analytics")) return "analytics";
    return "overview";
  };

  const activeTab = getActiveTab();

  if (isLoading) {
    return (
      <div className="mx-auto my-10 flex max-w-7xl flex-col space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-9" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-8 w-64" />
                <Skeleton className="mb-3 h-4 w-80" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
            <CardAction>
              <Skeleton className="h-9 w-32" />
            </CardAction>
          </CardHeader>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className="flex items-center gap-2 border-b-2 border-transparent px-1 py-4"
                >
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </nav>
          </div>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto my-10 flex max-w-7xl items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Property not found</p>
          <Link href="/properties">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECF0F1] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Card className="rounded-xl bg-white">
          <CardHeader>
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Link href="/properties">
                  <Button variant="outlined" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <CardTitle className="text-2xl font-bold text-[#2D3436]">
                    {property.name}
                  </CardTitle>
                  <CardDescription className="text-[#7F8C8D]">
                    {property.addressLine1}, {property.city}, {property.state}{" "}
                    {property.zip}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-3">
                {property && (
                  <EditPropertyDialog property={property}>
                    <Button
                      variant="outlined"
                      className="border-[#3498DB] text-[#3498DB]"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Property
                    </Button>
                  </EditPropertyDialog>
                )}
                <Button className="bg-[#3498DB] text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Unit
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="rounded-lg bg-[#ECF0F1] p-4">
                <h3 className="mb-1 text-sm text-[#7F8C8D]">Total Units</h3>
                <p className="text-2xl font-bold text-[#2D3436]">
                  {property.unit?.length || 0}
                </p>
              </div>
              <div className="rounded-lg bg-[#ECF0F1] p-4">
                <h3 className="mb-1 text-sm text-[#7F8C8D]">Occupied</h3>
                <p className="text-2xl font-bold text-[#2ECC71]">
                  {property.unit?.filter(
                    (unit: unknown) =>
                      (unit as any).lease && (unit as any).lease.length > 0,
                  ).length || 0}
                </p>
              </div>
              <div className="rounded-lg bg-[#ECF0F1] p-4">
                <h3 className="mb-1 text-sm text-[#7F8C8D]">Vacant</h3>
                <p className="text-2xl font-bold text-[#F39C12]">
                  {(property.unit?.length || 0) -
                    (property.unit?.filter(
                      (unit: unknown) =>
                        (unit as any).lease && (unit as any).lease.length > 0,
                    ).length || 0)}
                </p>
              </div>
              <div className="rounded-lg bg-[#ECF0F1] p-4">
                <h3 className="mb-1 text-sm text-[#7F8C8D]">Monthly Revenue</h3>
                <p className="text-2xl font-bold text-[#2D3436]">
                  {new Intl.NumberFormat("en-ZA", {
                    style: "currency",
                    currency: "ZAR",
                  }).format(
                    property.unit?.reduce((sum: number, unit: unknown) => {
                      const unitData = unit as any;
                      if (unitData.lease && unitData.lease.length > 0) {
                        return (
                          sum +
                          (unitData.lease[0].rent || unitData.marketRent || 0)
                        );
                      }
                      return sum;
                    }, 0) || 0,
                  )}
                </p>
              </div>
            </div>
          </CardHeader>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const href =
                  tab.id === "overview"
                    ? `/properties/${id}`
                    : `/properties/${id}/${tab.id}`;

                if (
                  property.propertyType === "SINGLE_UNIT" &&
                  tab.id === "units"
                ) {
                  return null;
                }

                return (
                  <Link
                    key={tab.id}
                    href={href}
                    className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
