"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avatar";
import { Badge } from "@leaseup/ui/components/badge";
import { Button } from "@leaseup/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Input } from "@leaseup/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@leaseup/ui/components/select";
import {
  Banknote,
  Calendar,
  CalendarCog,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Filter,
  Phone,
  Plus,
  Search,
  Signature,
  User,
} from "lucide-react";
import Link from "next/link";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@leaseup/ui/components/description-list";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@leaseup/ui/components/pagination";
import { EmptyState } from "@leaseup/ui/components/state";
import { api } from "@/trpc/react";
import { TenantDropdownActions } from "./_components/tenant-dropdown-actions";
import { useEffect, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { TenantsSkeleton } from "./_components/tenant-skeleton";

export default function Tenants() {
  const [
    { pageIndex, pageSize, globalFilter, propertyFilter, statusFilter },
    setQueryStates,
  ] = useQueryStates({
    pageIndex: parseAsInteger.withDefault(0),
    pageSize: parseAsInteger.withDefault(20),
    globalFilter: parseAsString.withDefault(""),
    propertyFilter: parseAsString.withDefault("all"),
    statusFilter: parseAsString.withDefault("all"),
  });

  const debouncedGlobalFilter = useDebounce(globalFilter, 500);

  useEffect(() => {
    setQueryStates((prev) => ({ ...prev, pageIndex: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedGlobalFilter]);

  const queryParams = useMemo(() => {
    const params: {
      page: number;
      limit: number;
      search?: string;
      propertyId?: string;
      status?: "active" | "inactive" | "no_lease" | "all";
    } = {
      page: pageIndex + 1,
      limit: pageSize,
    };

    if (debouncedGlobalFilter) {
      params.search = debouncedGlobalFilter;
    }

    if (propertyFilter && propertyFilter !== "all") {
      params.propertyId = propertyFilter;
    }

    if (statusFilter && statusFilter !== "all") {
      params.status = statusFilter as "active" | "inactive" | "no_lease";
    }

    return params;
  }, [
    pageIndex,
    pageSize,
    debouncedGlobalFilter,
    propertyFilter,
    statusFilter,
  ]);

  const { data: tenantsData, isLoading: tenantsLoading } =
    api.tenant.getAll.useQuery(queryParams);

  const { data: properties } = api.portfolio.getAllProperties.useQuery();

  const tenants = tenantsData?.tenants || [];
  const totalPages = tenantsData?.totalPages || 0;
  const currentPage = tenantsData?.currentPage || 1;

  return (
    <div className="mx-auto my-10 flex max-w-7xl flex-col">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Tenants</CardTitle>
          <CardDescription>Manage your tenants here.</CardDescription>
          <CardAction>
            <Link href="/tenants/create">
              <Button>
                <Plus />
                Add Tenant
              </Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Input
              icon={<Search />}
              placeholder="Search tenants by name, email, or phone"
              className="w-96"
              value={globalFilter}
              onChange={(e) =>
                setQueryStates((prev) => ({
                  ...prev,
                  globalFilter: e.target.value,
                }))
              }
            />

            <div className="flex items-center gap-2">
              <Select
                value={propertyFilter}
                onValueChange={(value) =>
                  setQueryStates((prev) => ({ ...prev, propertyFilter: value }))
                }
              >
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties?.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setQueryStates((prev) => ({ ...prev, statusFilter: value }))
                }
              >
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="no_lease">No Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-8 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
            {tenantsLoading && (
              <div className="col-span-full flex items-center justify-center py-12">
                <TenantsSkeleton />
              </div>
            )}

            {!tenantsLoading &&
              tenants.length > 0 &&
              tenants?.map((tenant) => (
                <Card key={tenant.id}>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/tenants/${tenant.id}`}
                        className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
                      >
                        <Avatar className="size-10 shadow-sm">
                          <AvatarImage src={tenant?.avatarUrl ?? undefined} />
                          <AvatarFallback className="size-10 shadow-sm">
                            {tenant?.firstName[0]}
                            {tenant?.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text flex items-center gap-2 text-sm leading-none font-semibold">
                            {tenant?.firstName} {tenant?.lastName}
                          </p>
                          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-none font-normal text-pretty">
                            {tenant?.tenantLease[0]?.lease
                              ? [
                                  tenant?.tenantLease[0]?.lease?.unit?.property
                                    ?.addressLine1,
                                  tenant?.tenantLease[0]?.lease?.unit?.property
                                    ?.city,
                                  tenant?.tenantLease[0]?.lease?.unit?.property
                                    ?.state,
                                  tenant?.tenantLease[0]?.lease?.unit?.property
                                    ?.zip,
                                ]
                                  .filter(Boolean)
                                  .join(", ")
                              : "Prospect"}
                          </p>
                        </div>
                      </Link>
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex-1"></div>
                        <div className="shrink-0">
                          {tenant?.tenantLease[0]?.lease ? (
                            <Badge
                              size="sm"
                              variant="solid"
                              className="capitalize"
                              color={
                                tenant?.tenantLease[0]?.lease?.status ===
                                "ACTIVE"
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {tenant?.tenantLease[0]?.lease?.status ===
                              "ACTIVE"
                                ? "Active"
                                : "Inactive"}
                            </Badge>
                          ) : (
                            <Badge
                              size="sm"
                              variant="solid"
                              color="primary"
                              className="bg-slate-700 text-white"
                            >
                              No lease
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
                      {tenant?.tenantLease[0]?.lease ? (
                        <div className="flex items-center gap-2">
                          <DescriptionList
                            orientation="horizontal"
                            className="w-full"
                          >
                            <DescriptionTerm className="flex items-center gap-2">
                              <DoorOpen className="text-muted-foreground size-4 stroke-1" />
                              Unit
                            </DescriptionTerm>
                            <DescriptionDetails className="md:text-right">
                              {tenant?.tenantLease[0]?.lease?.unit?.name}
                            </DescriptionDetails>
                            <DescriptionTerm className="flex items-center gap-2">
                              <Banknote className="text-muted-foreground size-4 stroke-1" />
                              Monthly Rent
                            </DescriptionTerm>
                            <DescriptionDetails className="md:text-right">
                              {new Intl.NumberFormat("en-ZA", {
                                style: "currency",
                                currency: "ZAR",
                              }).format(tenant?.tenantLease[0]?.lease?.rent)}
                            </DescriptionDetails>
                            <DescriptionTerm className="flex items-center gap-2">
                              <Calendar className="text-muted-foreground size-4 stroke-1" />
                              Lease End
                            </DescriptionTerm>
                            <DescriptionDetails className="md:text-right">
                              {tenant?.tenantLease[0]?.lease?.leaseType ===
                                "FIXED_TERM" &&
                              tenant?.tenantLease[0]?.lease?.endDate
                                ? new Date(
                                    tenant?.tenantLease[0]?.lease?.endDate,
                                  ).toLocaleDateString("en-ZA", {
                                    year: "numeric",
                                    month: "long",
                                  })
                                : "Month to Month"}
                            </DescriptionDetails>
                          </DescriptionList>
                        </div>
                      ) : (
                        <DescriptionList orientation="horizontal">
                          <DescriptionTerm className="flex items-center gap-2">
                            <Phone className="text-muted-foreground size-4 stroke-1" />
                            Phone Number
                          </DescriptionTerm>
                          <DescriptionDetails className="md:text-right">
                            {tenant?.phone}
                          </DescriptionDetails>
                          <DescriptionTerm className="flex items-center gap-2">
                            <Calendar className="text-muted-foreground size-4 stroke-1" />
                            Created At
                          </DescriptionTerm>
                          <DescriptionDetails className="md:text-right">
                            {tenant?.createdAt.toLocaleDateString("en-ZA", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </DescriptionDetails>
                          <DescriptionTerm className="flex items-center gap-2">
                            <CalendarCog className="text-muted-foreground size-4 stroke-1" />
                            Updated At
                          </DescriptionTerm>
                          <DescriptionDetails className="md:text-right">
                            {tenant?.updatedAt.toLocaleDateString("en-ZA", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </DescriptionDetails>
                        </DescriptionList>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {!tenant?.tenantLease[0]?.lease ? (
                      <Link
                        href={`/leases/create?tenantId=${tenant.id}`}
                        className="w-full"
                      >
                        <Button
                          color="secondary"
                          variant="soft"
                          className="w-full"
                        >
                          <Plus />
                          Add Lease
                        </Button>
                      </Link>
                    ) : (
                      <Link
                        href={`/tenants/${tenant.id}/leases`}
                        className="w-full"
                      >
                        <Button
                          variant="soft"
                          color="secondary"
                          className="w-full"
                        >
                          <Signature />
                          View Lease
                        </Button>
                      </Link>
                    )}
                    <TenantDropdownActions
                      tenantId={tenant.id}
                      lease={!!tenant?.tenantLease[0]?.lease}
                    />
                  </CardFooter>
                </Card>
              ))}
            {!tenantsLoading && tenants.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  title="No tenants"
                  description="Add your first tenant to get started."
                  buttons={
                    <Link href="/tenants/create">
                      <Button>
                        <Plus />
                        Add Tenant
                      </Button>
                    </Link>
                  }
                  icon={<User />}
                />
              </div>
            )}
          </div>
          {!tenantsLoading && totalPages > 1 && (
            <div className="mt-10 flex flex-col items-center justify-between">
              <Pagination>
                <PaginationContent className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PaginationItem>
                      <Button
                        variant="outlined"
                        color="secondary"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setQueryStates((prev) => ({
                            ...prev,
                            pageIndex: prev.pageIndex - 1,
                          }))
                        }
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <Button
                        variant="outlined"
                        color="secondary"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setQueryStates((prev) => ({
                            ...prev,
                            pageIndex: prev.pageIndex + 1,
                          }))
                        }
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </div>
                </PaginationContent>
              </Pagination>
              <div className="text-muted-foreground mt-4 text-sm">
                Page {currentPage} of {totalPages} (
                {tenantsData?.totalCount || 0} total tenants)
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
