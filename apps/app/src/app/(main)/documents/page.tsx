"use client";

import { useState, useMemo, useEffect } from "react";
import { useDebounce } from "@/hooks";
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
} from "@leaseup/ui/components/avatar";
import { Input } from "@leaseup/ui/components/input";
import {
  FileText,
  Calendar,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Upload,
  FolderOpen,
  HardDrive,
} from "lucide-react";
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
import {
  DocumentPageSkeleton,
  DocumentStatsSkeleton,
  DocumentTableSkeleton,
  DocumentFiltersSkeleton,
} from "./_components/document-skeletons";
import { DocumentDropdownActions } from "./_components/document-dropdown-actions";

type DocumentFile = {
  id: string;
  name: string;
  url: string;
  type: string | null;
  size: number | null;
  createdAt: Date;
  updatedAt: Date;
  property: {
    id: string;
    name: string;
  } | null;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  } | null;
  lease: {
    id: string;
    unit: {
      name: string;
      property: {
        name: string;
      } | null;
    } | null;
  } | null;
  invoice: {
    id: string;
  } | null;
  maintenanceRequest: {
    id: string;
    description: string | null;
  } | null;
};

const columnHelper = createColumnHelper<DocumentFile>();

export default function Documents() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const debouncedGlobalFilter = useDebounce(globalFilter, 500);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedGlobalFilter]);

  const queryParams = useMemo(() => {
    const params: any = {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    };

    if (debouncedGlobalFilter) {
      params.search = debouncedGlobalFilter;
    }

    if (sorting.length > 0) {
      const sort = sorting[0];
      if (sort) {
        params.sortBy = sort.id;
        params.sortOrder = sort.desc ? "desc" : "asc";
      }
    }

    columnFilters.forEach((filter) => {
      if (filter.id === "property" && filter.value && filter.value !== "all") {
        params.propertyId = filter.value;
      }
      if (filter.id === "tenant" && filter.value && filter.value !== "all") {
        params.tenantId = filter.value;
      }
      if (filter.id === "type" && filter.value && filter.value !== "all") {
        params.type = filter.value;
      }
    });

    return params;
  }, [pagination, debouncedGlobalFilter, sorting, columnFilters]);

  const { data: documentsData, isLoading: documentsLoading } =
    api.file.getAll.useQuery(queryParams);

  const { data: properties } = api.portfolio.getAllProperties.useQuery();

  const { data: tenants } = api.tenant.getAll.useQuery({
    page: 1,
    limit: 1000,
  });

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileTypeIcon = (type: string | null) => {
    if (!type) return FileText;

    if (type.includes("image")) return FileText;
    if (type.includes("pdf")) return FileText;
    if (type.includes("document") || type.includes("word")) return FileText;
    if (type.includes("spreadsheet") || type.includes("excel")) return FileText;

    return FileText;
  };

  const columns = useMemo<ColumnDef<DocumentFile, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: ({ column }) => {
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
              File Name
              {sortIcon}
            </Button>
          );
        },
        cell: ({ getValue, row }) => {
          const name = getValue();
          const type = row.original.type;
          const FileIcon = getFileTypeIcon(type);

          return (
            <div className="flex items-center space-x-3">
              <FileIcon className="text-primary h-5 w-5 stroke-1" />
              <div>
                <p className="font-medium tracking-tight text-[#2D3436]">
                  {name}
                </p>
                {type && (
                  <p className="text-xs text-gray-500 uppercase">
                    {type.split("/")[1] || type}
                  </p>
                )}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("size", {
        header: ({ column }) => {
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
              Size
              {sortIcon}
            </Button>
          );
        },
        cell: ({ getValue }) => {
          const size = getValue();
          return (
            <span className="text-sm text-gray-600">
              {formatFileSize(size)}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "associatedWith",
        header: "Associated With",
        cell: ({ row }) => {
          const property = row.original.property;
          const tenant = row.original.tenant;
          const lease = row.original.lease;
          const invoice = row.original.invoice;
          const maintenanceRequest = row.original.maintenanceRequest;

          if (property) {
            return (
              <div className="flex items-center space-x-2">
                <Badge variant="soft" color="info" size="sm">
                  Property
                </Badge>
                <span className="text-sm">{property.name}</span>
              </div>
            );
          }

          if (tenant) {
            return (
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={tenant.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {tenant.firstName[0]}
                    {tenant.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {tenant.firstName} {tenant.lastName}
                </span>
              </div>
            );
          }

          if (lease) {
            return (
              <div className="flex items-center space-x-2">
                <Badge variant="soft" color="success" size="sm">
                  Lease
                </Badge>
                <span className="text-sm">
                  {lease.unit?.property?.name} - Unit {lease.unit?.name}
                </span>
              </div>
            );
          }

          if (invoice) {
            return (
              <div className="flex items-center space-x-2">
                <Badge variant="soft" color="warning" size="sm">
                  Invoice
                </Badge>
                <span className="text-sm">#{invoice.id.slice(0, 8)}</span>
              </div>
            );
          }

          if (maintenanceRequest) {
            return (
              <div className="flex items-center space-x-2">
                <Badge variant="soft" color="secondary" size="sm">
                  Maintenance
                </Badge>
                <span className="text-sm">
                  {maintenanceRequest.description || "Maintenance Request"}
                </span>
              </div>
            );
          }

          return (
            <Badge variant="soft" color="secondary" size="sm">
              General
            </Badge>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: ({ column }) => {
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
              Uploaded
              {sortIcon}
            </Button>
          );
        },
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
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <DocumentDropdownActions document={row.original} />,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: documentsData?.files ?? [],
    columns,
    pageCount: documentsData?.totalPages ?? 0,
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

  const summaryStats = useMemo(() => {
    if (!documentsData?.files) return null;

    const totalSize = documentsData.files.reduce(
      (sum, file) => sum + (file.size || 0),
      0,
    );
    const fileCount = documentsData.files.length;

    const typeCount = documentsData.files.reduce(
      (acc, file) => {
        const type = file.type?.split("/")[0] || "other";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalSize,
      fileCount,
      typeCount,
    };
  }, [documentsData?.files]);

  const propertyColumn = table.getColumn("property");
  const tenantColumn = table.getColumn("tenant");
  const typeColumn = table.getColumn("type");

  if (documentsLoading && !documentsData) {
    return <DocumentPageSkeleton />;
  }

  return (
    <div className="mx-auto my-10 flex max-w-7xl flex-col">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-[#2D3436]">
                Files
              </CardTitle>
            </div>
            <div className="mt-4 flex gap-3 md:mt-0">
              <Button variant="outlined">
                <Upload className="size-4" />
                Upload Document
              </Button>
            </div>
          </div>

          <div className="mt-6">
            {(() => {
              if (documentsLoading) {
                return <DocumentStatsSkeleton />;
              }

              if (!summaryStats) {
                return null;
              }

              return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    {
                      label: "Total Files",
                      value: summaryStats.fileCount,
                      color: "info" as const,
                      icon: FileText,
                      textColor: "text-blue-700",
                      valueColor: "text-blue-800",
                      iconColor: "text-blue-600",
                    },
                    {
                      label: "Storage Used",
                      value: formatFileSize(summaryStats.totalSize),
                      color: "warning" as const,
                      icon: HardDrive,
                      textColor: "text-orange-700",
                      valueColor: "text-orange-800",
                      iconColor: "text-orange-600",
                    },
                    {
                      label: "Document Types",
                      value: Object.keys(summaryStats.typeCount).length,
                      color: "success" as const,
                      icon: FolderOpen,
                      textColor: "text-green-700",
                      valueColor: "text-green-800",
                      iconColor: "text-green-600",
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
              );
            })()}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-[#2D3436]">
                  All Documents
                </CardTitle>
                <CardDescription>
                  {documentsData?.totalCount !== undefined
                    ? `${documentsData.totalCount} total documents`
                    : "Loading..."}
                </CardDescription>
              </div>
            </div>

            {documentsLoading ? (
              <DocumentFiltersSkeleton />
            ) : (
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search documents, properties, or tenants..."
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

                <DataTableFilter
                  column={tenantColumn}
                  title="Tenant"
                  options={[
                    { label: "All Tenants", value: "all" },
                    ...(tenants?.tenants.map((tenant) => ({
                      label: `${tenant.firstName} ${tenant.lastName}`,
                      value: tenant.id,
                    })) || []),
                  ]}
                  type="select"
                />

                <DataTableFilter
                  column={typeColumn}
                  title="File Type"
                  options={[
                    { label: "All Types", value: "all" },
                    { label: "Images", value: "image" },
                    { label: "PDFs", value: "pdf" },
                    { label: "Documents", value: "document" },
                    { label: "Spreadsheets", value: "spreadsheet" },
                  ]}
                  type="select"
                />
              </div>
            )}

            {documentsLoading ? (
              <DocumentTableSkeleton />
            ) : (
              documentsData?.files && (
                <div className="space-y-4">
                  <DataTable
                    columns={columns}
                    data={documentsData.files}
                    table={table}
                  />
                  <DataTablePagination
                    table={table}
                    pageSize={pagination.pageSize}
                    totalCount={documentsData.totalCount}
                    totalPages={documentsData.totalPages}
                    currentPage={documentsData.currentPage}
                  />
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
