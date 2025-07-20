// @ts-nocheck

"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@leaseup/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@leaseup/ui/components/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@leaseup/ui/components/pagination";
import { Badge } from "@leaseup/ui/components/badge";
import { EmptyState } from "@leaseup/ui/components/state";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avataar";
import { Input } from "@leaseup/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@leaseup/ui/components/select";
import {
  Plus,
  Download,
  FileText,
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
import { format } from "date-fns";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type Column,
  type Row,
} from "@tanstack/react-table";

// Add interface for html2pdf
interface Html2PdfOptions {
  margin: number;
  filename: string;
  image: { type: string; quality: number };
  html2canvas: { scale: number; useCORS: boolean; letterRendering: boolean };
  jsPDF: { unit: string; format: string; orientation: string };
  pagebreak: { mode: string[]; before: string; after: string };
}

interface Html2PdfChain {
  set: (options: Html2PdfOptions) => Html2PdfChain;
  from: (element: HTMLElement) => Html2PdfChain;
  save: () => Promise<void>;
}

interface Html2PdfLibrary {
  (): Html2PdfChain;
}

interface Html2PdfWindow extends Window {
  html2pdf?: Html2PdfLibrary;
}

declare const window: Html2PdfWindow;

// Invoice type definition for the table
type Invoice = {
  id: string;
  dueAmount: number;
  dueDate: Date | null;
  status: string;
  description: string;
  createdAt: Date;
  lease: {
    tenantLease: Array<{
      tenant: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl?: string | null;
      };
    }>;
    unit?: {
      name: string;
      property?: {
        id: string;
        name: string;
      };
    };
  };
};

// Column helper for type safety
const columnHelper = createColumnHelper<Invoice>();

export default function Invoices() {
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isExporting, setIsExporting] = useState(false);

  // Load html2pdf.js dynamically
  useEffect(() => {
    const loadHtml2Pdf = () => {
      if (window.html2pdf) return Promise.resolve();

      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadHtml2Pdf().catch(console.error);
  }, []);

  // Fetch invoice stats
  const { data: stats, isLoading: statsLoading } =
    api.invoice.getInvoiceStats.useQuery();

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

    // Add status filter
    if (statusFilter && statusFilter !== "all") {
      params.status = statusFilter;
    }

    // Add property filter
    if (propertyFilter && propertyFilter !== "all") {
      params.propertyId = propertyFilter;
    }

    // Add sorting
    if (sorting.length > 0) {
      const sort = sorting[0];
      if (sort) {
        params.sortBy = sort.id;
        params.sortOrder = sort.desc ? "desc" : "asc";
      }
    }

    return params;
  }, [pagination, globalFilter, statusFilter, propertyFilter, sorting]);

  // Fetch invoices with filters and sorting
  const { data: invoicesData, isLoading: invoicesLoading } =
    api.invoice.getAll.useQuery(queryParams);

  // Fetch properties for filter dropdown
  const { data: properties } = api.portfolio.getAllProperties.useQuery();

  // Table column definitions
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      columnHelper.accessor("id", {
        id: "invoice",
        header: "Invoice",
        cell: ({ row }: { row: Row<Invoice> }) => (
          <div>
            <p className="font-medium text-[#2D3436]">
              #{row.original.id.slice(-8).toUpperCase()}
            </p>
            <p className="text-sm text-[#7F8C8D]">{row.original.description}</p>
          </div>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("lease.tenantLease.0.tenant", {
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
          const tenant = row.original.lease.tenantLease[0]?.tenant;
          return (
            <div className="flex items-center">
              <Avatar className="mr-3 h-8 w-8">
                <AvatarImage src={tenant?.avatarUrl || undefined} />
                <AvatarFallback>
                  {tenant?.firstName?.[0]}
                  {tenant?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-[#2D3436]">
                  {tenant?.firstName} {tenant?.lastName}
                </p>
                <p className="text-sm text-[#7F8C8D]">{tenant?.email}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("lease.unit.property.name", {
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
          const property = row.original.lease.unit?.property;
          const unit = row.original.lease.unit;
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

  // Initialize table
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "success";
      case "PENDING":
        return "warning";
      case "OVERDUE":
        return "danger";
      case "CANCELLED":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return "Paid";
      case "PENDING":
        return "Pending";
      case "OVERDUE":
        return "Overdue";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const clearFilters = () => {
    setGlobalFilter("");
    setStatusFilter("all");
    setPropertyFilter("all");
    table.resetSorting();
  };

  const exportInvoicesAsPDF = async () => {
    if (!window.html2pdf) {
      alert("PDF library is still loading. Please try again in a moment.");
      return;
    }

    if (!invoicesData?.invoices || invoicesData.invoices.length === 0) {
      alert("No invoices to export.");
      return;
    }

    setIsExporting(true);

    try {
      // Calculate totals
      const totalAmount = invoicesData.invoices.reduce(
        (sum, invoice) => sum + invoice.dueAmount,
        0,
      );
      const paidInvoices = invoicesData.invoices.filter(
        (inv) => inv.status === "PAID",
      );
      const pendingInvoices = invoicesData.invoices.filter(
        (inv) => inv.status === "PENDING",
      );
      const overdueInvoices = invoicesData.invoices.filter(
        (inv) => inv.status === "OVERDUE",
      );

      // Create content with only inline styles in HTML string format
      const contentHTML = `
        <div style="margin: 0; padding: 20px; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: rgb(0,0,0); background: rgb(255,255,255); width: 800px;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid rgb(45,52,54); padding-bottom: 20px;">
            <h1 style="margin: 0; color: rgb(45,52,54); font-size: 24px; font-weight: bold; font-family: Arial, sans-serif;">Invoice Report</h1>
            <p style="margin: 5px 0; color: rgb(127,140,141); font-size: 14px; font-family: Arial, sans-serif;">Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: rgb(45,52,54); font-size: 16px; margin-bottom: 15px; font-weight: bold; font-family: Arial, sans-serif;">Summary</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
              <div style="background: rgb(248,249,250); padding: 15px; border-radius: 8px;">
                <p style="margin: 0; font-weight: bold; color: rgb(45,52,54); font-family: Arial, sans-serif;">Total Invoices</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; color: rgb(45,52,54); font-family: Arial, sans-serif;">${invoicesData.invoices.length}</p>
              </div>
              <div style="background: rgb(248,249,250); padding: 15px; border-radius: 8px;">
                <p style="margin: 0; font-weight: bold; color: rgb(45,52,54); font-family: Arial, sans-serif;">Total Amount</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; color: rgb(45,52,54); font-family: Arial, sans-serif;">${formatCurrency(totalAmount)}</p>
              </div>
              <div style="background: rgb(212,237,218); padding: 15px; border-radius: 8px;">
                <p style="margin: 0; font-weight: bold; color: rgb(21,87,36); font-family: Arial, sans-serif;">Paid Invoices</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; color: rgb(21,87,36); font-family: Arial, sans-serif;">${paidInvoices.length}</p>
              </div>
              <div style="background: rgb(255,243,205); padding: 15px; border-radius: 8px;">
                <p style="margin: 0; font-weight: bold; color: rgb(133,100,4); font-family: Arial, sans-serif;">Pending Invoices</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; color: rgb(133,100,4); font-family: Arial, sans-serif;">${pendingInvoices.length}</p>
              </div>
            </div>
            ${
              overdueInvoices.length > 0
                ? `
              <div style="background: rgb(248,215,218); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; font-weight: bold; color: rgb(114,28,36); font-family: Arial, sans-serif;">Overdue Invoices: ${overdueInvoices.length}</p>
              </div>
            `
                : ""
            }
          </div>

          <div style="margin-bottom: 20px;">
            <h2 style="color: rgb(45,52,54); font-size: 16px; margin-bottom: 15px; font-weight: bold; font-family: Arial, sans-serif;">Invoice Details</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; font-family: Arial, sans-serif;">
              <thead>
                <tr style="background-color: rgb(248,249,250);">
                  <th style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: left; font-weight: bold; font-family: Arial, sans-serif; color: rgb(0,0,0);">Invoice ID</th>
                  <th style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: left; font-weight: bold; font-family: Arial, sans-serif; color: rgb(0,0,0);">Tenant</th>
                  <th style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: left; font-weight: bold; font-family: Arial, sans-serif; color: rgb(0,0,0);">Property</th>
                  <th style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: right; font-weight: bold; font-family: Arial, sans-serif; color: rgb(0,0,0);">Amount</th>
                  <th style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: left; font-weight: bold; font-family: Arial, sans-serif; color: rgb(0,0,0);">Due Date</th>
                  <th style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: center; font-weight: bold; font-family: Arial, sans-serif; color: rgb(0,0,0);">Status</th>
                </tr>
              </thead>
              <tbody>
                ${invoicesData.invoices
                  .map((invoice) => {
                    const tenant = invoice.lease.tenantLease[0]?.tenant;
                    const property = invoice.lease.unit?.property;
                    const unit = invoice.lease.unit;

                    const statusColors = {
                      PAID: "rgb(212,237,218)",
                      PENDING: "rgb(255,243,205)",
                      OVERDUE: "rgb(248,215,218)",
                      CANCELLED: "rgb(226,227,229)",
                    };

                    return `
                    <tr>
                      <td style="border: 1px solid rgb(222,226,230); padding: 8px; font-family: Arial, sans-serif; color: rgb(0,0,0);">
                        #${invoice.id.slice(-8).toUpperCase()}<br>
                        <small style="color: rgb(127,140,141); font-family: Arial, sans-serif;">${invoice.description}</small>
                      </td>
                      <td style="border: 1px solid rgb(222,226,230); padding: 8px; font-family: Arial, sans-serif; color: rgb(0,0,0);">
                        ${tenant?.firstName} ${tenant?.lastName}<br>
                        <small style="color: rgb(127,140,141); font-family: Arial, sans-serif;">${tenant?.email}</small>
                      </td>
                      <td style="border: 1px solid rgb(222,226,230); padding: 8px; font-family: Arial, sans-serif; color: rgb(0,0,0);">
                        ${property?.name}<br>
                        <small style="color: rgb(127,140,141); font-family: Arial, sans-serif;">Unit ${unit?.name}</small>
                      </td>
                      <td style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: right; font-weight: bold; font-family: Arial, sans-serif; color: rgb(0,0,0);">
                        ${formatCurrency(invoice.dueAmount)}
                      </td>
                      <td style="border: 1px solid rgb(222,226,230); padding: 8px; font-family: Arial, sans-serif; color: rgb(0,0,0);">
                        ${invoice.dueDate ? format(new Date(invoice.dueDate), "MMM dd, yyyy") : "No due date"}
                      </td>
                      <td style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: center; font-family: Arial, sans-serif;">
                        <span style="background-color: ${statusColors[invoice.status as keyof typeof statusColors] || "rgb(226,227,229)"}; padding: 4px 8px; border-radius: 4px; font-size: 10px; color: rgb(0,0,0); font-family: Arial, sans-serif;">
                          ${getStatusBadge(invoice.status)}
                        </span>
                      </td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 30px; text-align: center; border-top: 1px solid rgb(222,226,230); padding-top: 20px;">
            <p style="margin: 0; color: rgb(127,140,141); font-size: 10px; font-family: Arial, sans-serif;">
              This report was generated from LeaseUp Invoice Management System
            </p>
          </div>
        </div>
      `;

      // Create a temporary element and set its content
      const exportContent = document.createElement("div");
      exportContent.innerHTML = contentHTML;
      exportContent.style.position = "absolute";
      exportContent.style.top = "-9999px";
      exportContent.style.left = "-9999px";

      // Temporarily add to DOM
      document.body.appendChild(exportContent);

      // Configure PDF options
      const options = {
        margin: 0.5,
        filename: `invoices-report-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
          before: ".page-break-before",
          after: ".page-break-after",
        },
      };

      // Generate and download PDF
      const contentElement = exportContent.firstElementChild;
      if (!contentElement) {
        throw new Error("Failed to create export content");
      }
      await window
        .html2pdf()
        .set(options)
        .from(contentElement as HTMLElement)
        .save();

      // Clean up
      if (document.body.contains(exportContent)) {
        document.body.removeChild(exportContent);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (statsLoading || invoicesLoading) {
    return (
      <div className="mx-auto my-10 flex max-w-7xl flex-col">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-gray-600">Loading invoices...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto my-10 flex max-w-7xl flex-col space-y-8">
      {/* Page Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-[#2D3436]">
                Invoices Management
              </CardTitle>
              <CardDescription className="text-[#7F8C8D]">
                Create, track and manage tenant rental invoices
              </CardDescription>
            </div>
            <div className="mt-4 flex gap-3 md:mt-0">
              <Button
                variant="outlined"
                color="info"
                onClick={exportInvoicesAsPDF}
                disabled={isExporting || !invoicesData?.invoices?.length}
              >
                <Download className="size-4" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
              <Button>
                <Plus className="size-4" />
                Create Invoice
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Summary Cards */}
        <CardContent>
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

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle className="text-xl font-semibold text-[#2D3436]">
              All Invoices
            </CardTitle>

            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search invoices, tenants, or properties..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={propertyFilter}
                  onValueChange={setPropertyFilter}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Property" />
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

                {(globalFilter ||
                  statusFilter !== "all" ||
                  propertyFilter !== "all" ||
                  sorting.length > 0) && (
                  <Button variant="outlined" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {invoicesData?.invoices && invoicesData.invoices.length > 0 ? (
            <>
              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="text-sm text-[#7F8C8D]">
                  Showing{" "}
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}{" "}
                  to{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    invoicesData.total,
                  )}{" "}
                  of {invoicesData.total} invoices
                </div>
                <Pagination>
                  <PaginationContent className="flex items-center gap-2">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => table.previousPage()}
                        className={
                          !table.getCanPreviousPage()
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {/* Page numbers */}
                    {Array.from(
                      { length: Math.min(5, invoicesData.totalPages) },
                      (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <PaginationItem key={pageNum}>
                            <Button
                              variant={
                                table.getState().pagination.pageIndex + 1 ===
                                pageNum
                                  ? "solid"
                                  : "outlined"
                              }
                              size="sm"
                              onClick={() => table.setPageIndex(pageNum - 1)}
                            >
                              {pageNum}
                            </Button>
                          </PaginationItem>
                        );
                      },
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => table.nextPage()}
                        className={
                          !table.getCanNextPage()
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          ) : (
            <div className="p-6">
              <EmptyState
                title="No invoices found"
                description="Create your first invoice to get started."
                buttons={
                  <Link href="/invoices/create">
                    <Button>
                      <Plus className="size-4" />
                      Create Invoice
                    </Button>
                  </Link>
                }
                icon={<FileText />}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
