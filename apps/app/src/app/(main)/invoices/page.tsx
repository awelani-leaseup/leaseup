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
import {
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  Receipt,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { InvoiceDropdownActions } from "./_components/invoice-dropdown-actions";
import { InvoiceExportButton } from "./_components/invoice-export-button";
import {
  InvoiceStatsSkeleton,
  InvoiceTableSkeleton,
  InvoiceFiltersSkeleton,
  InvoicePageSkeleton,
} from "./_components/invoice-skeletons";
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
import { formatCurrency, getStatusColor, getStatusBadge } from "./_utils";

// Invoice type definition that matches the actual API response
type Invoice = {
  id: string;
  dueAmount: number;
  dueDate: Date | null;
  status: string;
  description: string;
  createdAt: Date;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
    phone: string;
    landlordId: string;
    dateOfBirth: Date | null;
    paystackCustomerId: string | null;
    createdAt: Date;
    updatedAt: Date;
    tenantEmergencyContact: any | null;
  } | null;
  lease: {
    id: string;
    unit: {
      id: string;
      name: string;
      property: {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string;
        zip: string;
        countryCode: string;
        landlordId: string;
      } | null;
    } | null;
    tenantLease: Array<{
      tenant: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl?: string | null;
        phone: string;
        landlordId: string;
        dateOfBirth: Date | null;
        paystackCustomerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantEmergencyContact: any | null;
      };
    }>;
  } | null;
  transactions: Array<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    leaseId: string | null;
    invoiceId: string | null;
    amountPaid: number;
    referenceId: string | null;
  }>;
};

type TransformedInvoicesResponse = {
  invoices: Invoice[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
};

type ExportableInvoice = {
  id: string;
  description: string;
  dueAmount: number;
  dueDate: Date | null;
  status: string;
  lease: {
    tenantLease: Array<{
      tenant: {
        firstName: string;
        lastName: string;
        email: string;
      };
    }>;
    unit: {
      name: string;
      property: {
        name: string;
      };
    } | null;
  };
};

const columnHelper = createColumnHelper<Invoice>();

export default function Invoices() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data: stats, isLoading: statsLoading } =
    api.invoice.getInvoiceStats.useQuery();

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

  const { data: rawInvoicesData, isLoading: invoicesLoading } =
    api.invoice.getAll.useQuery(queryParams);

  const invoicesData: TransformedInvoicesResponse | undefined = useMemo(() => {
    if (!rawInvoicesData) return undefined;

    return {
      invoices: rawInvoicesData.invoices,
      totalCount: rawInvoicesData.total,
      currentPage: rawInvoicesData.page,
      totalPages: rawInvoicesData.totalPages,
    };
  }, [rawInvoicesData]);

  const exportInvoicesData = useMemo(() => {
    if (!invoicesData) return undefined;

    const exportableInvoices: ExportableInvoice[] = invoicesData.invoices
      .filter((invoice) => invoice.lease) // Only include invoices with leases for export
      .map((invoice) => ({
        id: invoice.id,
        description: invoice.description,
        dueAmount: invoice.dueAmount,
        dueDate: invoice.dueDate,
        status: invoice.status,
        lease: {
          tenantLease: invoice.lease!.tenantLease.map((tl) => ({
            tenant: {
              firstName: tl.tenant.firstName,
              lastName: tl.tenant.lastName,
              email: tl.tenant.email,
            },
          })),
          unit: invoice.lease!.unit
            ? {
                name: invoice.lease!.unit.name,
                property: {
                  name: invoice.lease!.unit.property?.name || "",
                },
              }
            : null,
        },
      }));

    return {
      invoices: exportableInvoices,
    };
  }, [invoicesData]);

  const { data: properties } = api.portfolio.getAllProperties.useQuery();

  const columns = useMemo<ColumnDef<Invoice, any>[]>(
    () => [
      columnHelper.accessor("id", {
        id: "invoice",
        header: "Invoice",
        cell: ({ row }: { row: Row<Invoice> }) => (
          <div>
            <Link
              href={`/invoices/${row.original.id}`}
              className="font-medium text-[#2D3436] transition-colors hover:text-blue-600 hover:underline"
            >
              #{row.original.id.slice(-8).toUpperCase()}
            </Link>
            <p className="text-sm text-[#7F8C8D]">{row.original.description}</p>
          </div>
        ),
        enableSorting: false,
      }),
      columnHelper.display({
        id: "tenant",
        header: ({ column }: { column: Column<Invoice, unknown> }) => (
          <Button
            variant="text"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Tenant
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }: { row: Row<Invoice> }) => {
          // Check for tenant in lease first, then check direct tenant (for invoices without leases)
          const tenant =
            row.original?.lease?.tenantLease?.[0]?.tenant ||
            row.original?.tenant;
          return (
            <Link href={`/tenants/${tenant?.id}`} className="group">
              <div className="flex items-center">
                <Avatar className="mr-3 h-8 w-8">
                  <AvatarImage src={tenant?.avatarUrl || undefined} />
                  <AvatarFallback>
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
        header: ({ column }: { column: Column<Invoice, unknown> }) => (
          <Button
            variant="text"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Property
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }: { row: Row<Invoice> }) => {
          const property = row.original?.lease?.unit?.property;
          const unit = row.original?.lease?.unit;

          // Handle invoices without leases
          if (!property || !unit) {
            return (
              <div>
                <p className="text-[#2D3436]">-</p>
                <p className="text-sm text-[#7F8C8D]">No property</p>
              </div>
            );
          }

          return (
            <div>
              <p className="text-[#2D3436]">{property?.name}</p>
              <p className="text-sm text-[#7F8C8D]">Unit {unit?.name}</p>
            </div>
          );
        },
      }),
      columnHelper.accessor("dueAmount", {
        header: ({ column }: { column: Column<Invoice, unknown> }) => (
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
        cell: ({ getValue }: { getValue: () => number }) => {
          const amount = getValue() as number;
          return (
            <span className="font-semibold text-[#2D3436]">
              {formatCurrency(amount)}
            </span>
          );
        },
      }),
      columnHelper.accessor("dueDate", {
        header: ({ column }: { column: Column<Invoice, unknown> }) => (
          <Button
            variant="text"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Due Date
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({
          getValue,
          row,
        }: {
          getValue: () => Date | null;
          row: Row<Invoice>;
        }) => {
          const dueDate = getValue() as Date | null;
          const status = row.original.status;
          return (
            <p
              className={`text-[#2D3436] ${
                status === "OVERDUE" ? "text-[#E74C3C]" : ""
              }`}
            >
              {dueDate
                ? format(new Date(dueDate), "MMM dd, yyyy")
                : "No due date"}
            </p>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: ({ column }: { column: Column<Invoice, unknown> }) => (
          <Button
            variant="text"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Status
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ getValue }: { getValue: () => string }) => {
          const status = getValue() as string;
          return (
            <Badge variant="soft" color={getStatusColor(status)} size="sm">
              {getStatusBadge(status)}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: Row<Invoice> }) => (
          <InvoiceDropdownActions
            invoiceId={row.original.id}
            status={row.original.status}
          />
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: invoicesData?.invoices ?? [],
    columns,
    pageCount: invoicesData?.totalPages ?? 0,
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

  // Show full page skeleton while initial data is loading
  if (statsLoading && invoicesLoading) {
    return <InvoicePageSkeleton />;
  }

  return (
    <div className="mx-auto my-10 flex max-w-7xl flex-col">
      {/* Single Card for Page Header and Main Content */}
      <Card>
        {/* Page Header */}
        <CardHeader>
          <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-[#2D3436]">
                Invoices Management
              </CardTitle>
            </div>
            <div className="mt-4 flex gap-3 md:mt-0">
              <InvoiceExportButton
                invoicesData={exportInvoicesData}
                formatCurrency={formatCurrency}
                getStatusBadge={getStatusBadge}
              />
              <Link href="/invoices/create">
                <Button>
                  <Plus className="size-4" />
                  Create Invoice
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-6">
            {statsLoading ? (
              <InvoiceStatsSkeleton />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {[
                  {
                    label: "Total Invoiced",
                    value: stats
                      ? formatCurrency(stats.totalInvoiced)
                      : formatCurrency(0),
                    color: "success" as const,
                    icon: Receipt,
                    textColor: "text-green-700",
                    valueColor: "text-green-800",
                    iconColor: "text-green-600",
                  },
                  {
                    label: "Pending Payment",
                    value: stats
                      ? formatCurrency(stats.pendingPayment)
                      : formatCurrency(0),
                    color: "warning" as const,
                    icon: Clock,
                    textColor: "text-orange-700",
                    valueColor: "text-orange-800",
                    iconColor: "text-orange-600",
                  },
                  {
                    label: "Overdue",
                    value: stats
                      ? formatCurrency(stats.overdue)
                      : formatCurrency(0),
                    color: "danger" as const,
                    icon: AlertTriangle,
                    textColor: "text-red-700",
                    valueColor: "text-red-800",
                    iconColor: "text-red-600",
                  },
                  {
                    label: "This Month",
                    value: stats?.thisMonthInvoices || 0,
                    color: "info" as const,
                    icon: Calendar,
                    textColor: "text-blue-700",
                    valueColor: "text-blue-800",
                    iconColor: "text-blue-600",
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
                        <p className={`text-lg font-bold ${stat.valueColor}`}>
                          {stat.value}
                        </p>
                      </div>
                      <stat.icon className={stat.iconColor} />
                    </div>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-[#2D3436]">
                  All Invoices
                </CardTitle>
                <CardDescription>
                  {invoicesData?.totalCount
                    ? `${invoicesData.totalCount} total invoices`
                    : "Loading..."}
                </CardDescription>
              </div>
            </div>

            {!properties ? (
              <InvoiceFiltersSkeleton />
            ) : (
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search invoices, tenants, or properties..."
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
                    { label: "Paid", value: "PAID" },
                    { label: "Pending", value: "PENDING" },
                    { label: "Overdue", value: "OVERDUE" },
                    { label: "Cancelled", value: "CANCELLED" },
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

            {invoicesLoading ? (
              <InvoiceTableSkeleton />
            ) : (
              <div className="space-y-4">
                <DataTable
                  columns={columns}
                  data={invoicesData?.invoices ?? []}
                  table={table}
                />
                <DataTablePagination
                  table={table}
                  pageSize={pagination.pageSize}
                  totalCount={invoicesData?.totalCount}
                  totalPages={invoicesData?.totalPages}
                  currentPage={invoicesData?.currentPage}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
