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
import { EmptyState } from "@leaseup/ui/components/state";
import { Avatar, AvatarFallback } from "@leaseup/ui/components/avataar";
import { Input } from "@leaseup/ui/components/input";
import {
  FileText,
  Calendar,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Receipt,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import {
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import { DataTable } from "@leaseup/ui/components/data-table/data-table";
import { DataTableFilter } from "@leaseup/ui/components/data-table/data-table-filter";
import { DataTablePagination } from "@leaseup/ui/components/data-table/data-table-pagination";

// Type for transaction with relations
type Transaction = {
  id: string;
  description: string;
  amountPaid: number;
  referenceId: string | null;
  createdAt: Date;
  updatedAt: Date;
  invoiceId: string | null;
  leaseId: string | null;
  invoice: {
    id: string;
  } | null;
  lease: {
    id: string;
    tenantLease: Array<{
      tenant: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    }>;
    unit: {
      name: string;
      property: {
        id: string;
        name: string;
      };
    } | null;
  } | null;
};

// Column helper for type safety
const columnHelper = createColumnHelper<Transaction>();

export default function Transactions() {
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  // Build query parameters for backend
  const queryParams = useMemo(() => {
    const params: any = {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    };

    // Add search filter
    if (globalFilter) {
      params.search = globalFilter;
    }

    // Add sorting
    if (sorting.length > 0) {
      const sort = sorting[0];
      if (sort) {
        params.sortBy = sort.id;
        params.sortOrder = sort.desc ? "desc" : "asc";
      }
    }

    // Add column filters
    columnFilters.forEach((filter) => {
      if (filter.id === "property" && filter.value && filter.value !== "all") {
        params.propertyId = filter.value;
      }
      if (filter.id === "tenant" && filter.value && filter.value !== "all") {
        params.tenantId = filter.value;
      }
    });

    return params;
  }, [pagination, globalFilter, sorting, columnFilters]);

  // Fetch transactions with filters and sorting
  const { data: transactionsData, isLoading: transactionsLoading } =
    api.transaction.getAll.useQuery(queryParams);

  // Fetch properties for filter dropdown
  const { data: properties } = api.portfolio.getAllProperties.useQuery();

  // Fetch tenants for filter dropdown
  const { data: tenants } = api.tenant.getAll.useQuery();

  const columns = useMemo<ColumnDef<Transaction, any>[]>(
    () => [
      columnHelper.accessor("createdAt", {
        header: ({ column }) => (
          <Button
            variant="text"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Date
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => {
          const date = getValue();
          return (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {format(new Date(date), "MMM dd, yyyy")}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue()}</span>
        ),
      }),
      columnHelper.accessor("amountPaid", {
        header: ({ column }) => (
          <Button
            variant="text"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Amount
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => {
          const amount = getValue();
          return (
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-green-600">
                {new Intl.NumberFormat("en-ZA", {
                  style: "currency",
                  currency: "ZAR",
                }).format(amount)}
              </span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "tenant",
        header: "Tenant",
        cell: ({ row }) => {
          const tenant = row.original.lease?.tenantLease[0]?.tenant;
          if (!tenant) return <span className="text-gray-400">-</span>;

          return (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {tenant.firstName[0]}
                  {tenant.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {tenant.firstName} {tenant.lastName}
                </p>
                <p className="text-xs text-gray-500">{tenant.email}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "property",
        header: "Property & Unit",
        cell: ({ row }) => {
          const property = row.original.lease?.unit?.property;
          const unit = row.original.lease?.unit;
          if (!property || !unit)
            return <span className="text-gray-400">-</span>;

          return (
            <div>
              <p className="text-sm font-medium">{property.name}</p>
              <p className="text-xs text-gray-500">Unit {unit.name}</p>
            </div>
          );
        },
      }),
      columnHelper.accessor("invoice", {
        header: "Invoice",
        cell: ({ getValue }) => {
          const invoice = getValue();
          if (!invoice) return <span className="text-gray-400">-</span>;

          return (
            <Link
              href={`/invoices/${invoice.id}`}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm">#{invoice.id.slice(0, 8)}</span>
            </Link>
          );
        },
      }),
      columnHelper.accessor("referenceId", {
        header: "Reference",
        cell: ({ getValue }) => {
          const reference = getValue();
          return (
            <span className="text-sm text-gray-600">{reference || "-"}</span>
          );
        },
      }),
    ],
    [],
  );

  // Initialize table with manual pagination
  const table = useReactTable({
    data: transactionsData?.transactions ?? [],
    columns,
    pageCount: transactionsData?.totalPages ?? 0,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!transactionsData?.transactions) return null;

    const totalAmount = transactionsData.transactions.reduce(
      (sum, transaction) => sum + transaction.amountPaid,
      0,
    );
    const transactionCount = transactionsData.transactions.length;
    const averageAmount =
      transactionCount > 0 ? totalAmount / transactionCount : 0;

    return {
      totalAmount,
      transactionCount,
      averageAmount,
    };
  }, [transactionsData?.transactions]);

  // Get property filter column
  const propertyColumn = table.getColumn("property");
  // Get tenant filter column
  const tenantColumn = table.getColumn("tenant");

  return (
    <div className="mx-auto my-10 flex max-w-7xl flex-col space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-gray-600">
          Track all payment transactions across your properties
        </p>
      </div>

      {/* Summary Stats */}
      {summaryStats && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  label: "Total Amount",
                  value: formatCurrency(summaryStats.totalAmount),
                  color: "success" as const,
                  icon: Receipt,
                  textColor: "text-green-700",
                  valueColor: "text-green-800",
                  iconColor: "text-green-600",
                },
                {
                  label: "Total Transactions",
                  value: summaryStats.transactionCount,
                  color: "info" as const,
                  icon: FileText,
                  textColor: "text-blue-700",
                  valueColor: "text-blue-800",
                  iconColor: "text-blue-600",
                },
                {
                  label: "Average Amount",
                  value: formatCurrency(summaryStats.averageAmount),
                  color: "warning" as const,
                  icon: TrendingUp,
                  textColor: "text-orange-700",
                  valueColor: "text-orange-800",
                  iconColor: "text-orange-600",
                },
              ].map((stat, index) => (
                <Badge
                  key={stat.label + index}
                  variant="soft"
                  color={stat.color}
                  className="h-auto rounded-md p-4 [&_svg]:size-6 [&_svg]:stroke-1"
                >
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <p className={`mb-2 text-sm ${stat.textColor}`}>
                        {stat.label}
                      </p>
                      <p className={`text-2xl font-bold ${stat.valueColor}`}>
                        {stat.value}
                      </p>
                    </div>
                    <stat.icon className={stat.iconColor} />
                  </div>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">All Transactions</CardTitle>
              <CardDescription>
                {transactionsData?.totalCount
                  ? `${transactionsData.totalCount} total transactions`
                  : "Loading..."}
              </CardDescription>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative mt-6 flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search transactions, tenants, or references..."
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

            {/* Property Filter */}
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

            {/* Tenant Filter */}
            <DataTableFilter
              column={tenantColumn}
              title="Tenant"
              options={[
                { label: "All Tenants", value: "all" },
                ...(tenants?.map((tenant) => ({
                  label: `${tenant.firstName} ${tenant.lastName}`,
                  value: tenant.id,
                })) || []),
              ]}
              type="select"
            />
          </div>
        </CardHeader>

        <CardContent>
          {transactionsLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            </div>
          ) : transactionsData?.transactions &&
            transactionsData.transactions.length > 0 ? (
            <div className="space-y-4">
              <DataTable
                columns={columns}
                data={transactionsData.transactions}
                table={table}
              />
              <DataTablePagination
                table={table}
                pageSize={pagination.pageSize}
                totalCount={transactionsData.totalCount}
                totalPages={transactionsData.totalPages}
                currentPage={transactionsData.currentPage}
              />
            </div>
          ) : (
            <EmptyState
              title="No transactions found"
              description="Transactions will appear here once tenants make payments"
              icon={<FileText className="h-8 w-8" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
