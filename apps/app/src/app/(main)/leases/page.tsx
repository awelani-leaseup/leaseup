"use client";

import { useState, useMemo } from "react";
import { Button } from "@leaseup/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Badge } from "@leaseup/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avataar";
import { Input } from "@leaseup/ui/components/input";
import { Plus, ArrowUpDown, ArrowUp, ArrowDown, Search, X } from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { LeaseDropdownActions } from "./_components/lease-dropdown-actions";
import { LeaseTableSkeleton } from "./_components/lease-skeletons";
import { format } from "date-fns";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type Column,
  type Row,
} from "@tanstack/react-table";
import { DataTable } from "@leaseup/ui/components/data-table/data-table";
import { DataTableFilter } from "@leaseup/ui/components/data-table/data-table-filter";
import { DataTablePagination } from "@leaseup/ui/components/data-table/data-table-pagination";
import { formatCurrencyToZAR } from "@/utils/currency";

// Lease type definition that matches the actual API response
type Lease = {
  id: string;
  rent: number;
  startDate: Date;
  endDate: Date | null;
  status: string;
  invoiceCycle: string;
  tenantLease: Array<{
    tenant: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl?: string | null;
    };
  }>;
  unit: {
    id: string;
    name: string;
    property: {
      id: string;
      name: string;
    } | null;
  } | null;
};

type TransformedLeasesResponse = {
  leases: Lease[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
};

const columnHelper = createColumnHelper<Lease>();

export default function Leases() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const queryParams = useMemo(() => {
    const params: any = {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    };

    if (globalFilter) {
      params.search = globalFilter;
    }

    if (sorting.length > 0) {
      const sort = sorting[0];
      if (sort) {
        params.sortBy = sort.id;
        params.sortOrder = sort.desc ? "desc" : "asc";
      }
    }

    columnFilters.forEach((filter) => {
      if (filter.id === "status" && filter.value && filter.value !== "all") {
        params.status = filter.value;
      }
      if (filter.id === "property" && filter.value && filter.value !== "all") {
        params.propertyId = filter.value;
      }
    });

    return params;
  }, [pagination, globalFilter, sorting, columnFilters]);

  const { data: rawLeasesData, isLoading: leasesLoading } =
    api.lease.getAll.useQuery(queryParams);

  const leasesData: TransformedLeasesResponse | undefined = useMemo(() => {
    if (!rawLeasesData) return undefined;

    return {
      leases: rawLeasesData.leases,
      totalCount: rawLeasesData.total,
      currentPage: rawLeasesData.page,
      totalPages: rawLeasesData.totalPages,
    };
  }, [rawLeasesData]);

  const { data: properties } = api.portfolio.getAllProperties.useQuery();

  const columns = useMemo<ColumnDef<Lease, any>[]>(
    () => [
      columnHelper.display({
        id: "tenant",
        header: ({ column }: { column: Column<Lease, unknown> }) => {
          const sortDirection = column.getIsSorted();
          let sortIcon;
          if (sortDirection === "asc") {
            sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;
          } else if (sortDirection === "desc") {
            sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
          } else {
            sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;
          }

          return (
            <Button
              variant="text"
              onClick={() => column.toggleSorting(sortDirection === "asc")}
              className="h-auto p-0 font-semibold"
            >
              Tenant
              {sortIcon}
            </Button>
          );
        },
        cell: ({ row }: { row: Row<Lease> }) => {
          const tenant = row.original.tenantLease[0]?.tenant;
          return (
            <Link href={`/tenants/${tenant?.id}`} className="group">
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarImage src={tenant?.avatarUrl ?? undefined} />
                  <AvatarFallback className="size-8">
                    {tenant?.firstName?.[0]}
                    {tenant?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-[#2D3436] group-hover:underline">
                    {tenant?.firstName} {tenant?.lastName}
                  </p>
                  <p className="text-sm text-[#7F8C8D]">{tenant?.email}</p>
                </div>
              </div>
            </Link>
          );
        },
      }),
      columnHelper.display({
        id: "property",
        header: ({ column }: { column: Column<Lease, unknown> }) => {
          const sortDirection = column.getIsSorted();
          let sortIcon;
          if (sortDirection === "asc") {
            sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;
          } else if (sortDirection === "desc") {
            sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
          } else {
            sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;
          }

          return (
            <Button
              variant="text"
              onClick={() => column.toggleSorting(sortDirection === "asc")}
              className="h-auto p-0 font-semibold"
            >
              Property & Unit
              {sortIcon}
            </Button>
          );
        },
        cell: ({ row }: { row: Row<Lease> }) => {
          const property = row.original.unit?.property;
          const unit = row.original.unit;

          return (
            <div>
              <p className="font-medium text-[#2D3436]">{property?.name}</p>
              <p className="text-sm text-[#7F8C8D]">Unit {unit?.name}</p>
            </div>
          );
        },
      }),
      columnHelper.accessor("rent", {
        header: ({ column }: { column: Column<Lease, unknown> }) => {
          const sortDirection = column.getIsSorted();
          let sortIcon;
          if (sortDirection === "asc") {
            sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;
          } else if (sortDirection === "desc") {
            sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
          } else {
            sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;
          }

          return (
            <Button
              variant="text"
              onClick={() => column.toggleSorting(sortDirection === "asc")}
              className="h-auto p-0 font-semibold"
            >
              Rent Amount
              {sortIcon}
            </Button>
          );
        },
        cell: ({ getValue, row }) => {
          const rent = getValue();
          const invoiceCycle = row.original.invoiceCycle;
          return (
            <div>
              <p className="font-semibold text-[#2D3436]">
                {formatCurrencyToZAR(rent)}
              </p>
              <p className="text-sm text-[#7F8C8D]">
                /{invoiceCycle?.toLowerCase()}
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor("startDate", {
        header: ({ column }: { column: Column<Lease, unknown> }) => {
          const sortDirection = column.getIsSorted();
          let sortIcon;
          if (sortDirection === "asc") {
            sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;
          } else if (sortDirection === "desc") {
            sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
          } else {
            sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;
          }

          return (
            <Button
              variant="text"
              onClick={() => column.toggleSorting(sortDirection === "asc")}
              className="h-auto p-0 font-semibold"
            >
              Start Date
              {sortIcon}
            </Button>
          );
        },
        cell: ({ getValue }) => {
          const startDate = getValue();
          return (
            <span className="text-[#2D3436]">
              {format(new Date(startDate), "MMM dd, yyyy")}
            </span>
          );
        },
      }),
      columnHelper.accessor("endDate", {
        header: ({ column }: { column: Column<Lease, unknown> }) => {
          const sortDirection = column.getIsSorted();
          let sortIcon;
          if (sortDirection === "asc") {
            sortIcon = <ArrowUp className="ml-2 h-4 w-4" />;
          } else if (sortDirection === "desc") {
            sortIcon = <ArrowDown className="ml-2 h-4 w-4" />;
          } else {
            sortIcon = <ArrowUpDown className="ml-2 h-4 w-4" />;
          }

          return (
            <Button
              variant="text"
              onClick={() => column.toggleSorting(sortDirection === "asc")}
              className="h-auto p-0 font-semibold"
            >
              End Date
              {sortIcon}
            </Button>
          );
        },
        cell: ({ getValue }) => {
          const endDate = getValue();
          if (endDate) {
            return (
              <span className="text-[#2D3436]">
                {format(new Date(endDate), "MMM dd, yyyy")}
              </span>
            );
          }
          return (
            <Badge variant="soft" color="info" size="sm">
              Month to Month
            </Badge>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          let badgeColor: "success" | "warning" | "secondary" = "secondary";
          if (status === "ACTIVE") {
            badgeColor = "success";
          } else if (status === "EXPIRED") {
            badgeColor = "warning";
          }
          return (
            <Badge variant="soft" size="sm" color={badgeColor}>
              {status}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <LeaseDropdownActions leaseId={row.original.id} />,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: leasesData?.leases ?? [],
    columns,
    pageCount: leasesData?.totalPages ?? 0,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });

  const statusColumn = table.getColumn("status");
  const propertyColumn = table.getColumn("property");

  return (
    <div className="mx-auto my-10 flex max-w-7xl flex-col">
      {/* Single Card for Page Header and Main Content */}
      <Card>
        {/* Page Header */}
        <CardHeader className="border-b border-gray-200">
          <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-[#2D3436]">
                Leases Management
              </CardTitle>
              <CardDescription className="text-[#7F8C8D]">
                Manage tenant lease agreements and rental terms
              </CardDescription>
            </div>
            <div className="mt-4 flex gap-3 md:mt-0">
              <Link href="/leases/create">
                <Button>
                  <Plus className="size-4" />
                  Add Lease
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-[#2D3436]">
                  All Leases
                </CardTitle>
                <CardDescription>
                  {leasesData?.totalCount
                    ? `${leasesData.totalCount} total leases`
                    : "Loading..."}
                </CardDescription>
              </div>
            </div>

            {!properties ? (
              <LeaseTableSkeleton />
            ) : (
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search leases, tenants, or properties..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="max-w-md pl-10"
                  />
                  {globalFilter && (
                    <button
                      onClick={() => setGlobalFilter("")}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <DataTableFilter
                  column={statusColumn}
                  title="Status"
                  options={[
                    { label: "All Status", value: "all" },
                    { label: "Active", value: "ACTIVE" },
                    { label: "Expired", value: "EXPIRED" },
                    { label: "Terminated", value: "TERMINATED" },
                  ]}
                  type="select"
                />

                <DataTableFilter
                  column={propertyColumn}
                  title="Property"
                  options={[
                    { label: "All Properties", value: "all" },
                    ...(properties?.map((property) => ({
                      label: property.name,
                      value: property.id,
                    })) || []),
                  ]}
                  type="select"
                />
              </div>
            )}

            {leasesLoading ? (
              <LeaseTableSkeleton />
            ) : (
              <div className="space-y-4">
                <DataTable
                  columns={columns}
                  data={leasesData?.leases ?? []}
                  table={table}
                />
                <DataTablePagination
                  table={table}
                  pageSize={pagination.pageSize}
                  totalCount={leasesData?.totalCount}
                  totalPages={leasesData?.totalPages}
                  currentPage={leasesData?.currentPage}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
