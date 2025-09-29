"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { formatCurrencyToZAR } from "@/utils/currency";
import { Skeleton } from "@leaseup/ui/components/skeleton";
import { Badge } from "@leaseup/ui/components/badge";
import { Button } from "@leaseup/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avatar";
import {
  X,
  Check,
  Home,
  Wrench,
  AlertTriangle,
  DollarSign,
  ClipboardCheck,
  Banknote,
  Info,
  FileCheck,
  MoreVertical,
  Trash,
  Eye,
} from "lucide-react";
import { EmptyState } from "@leaseup/ui/components/state";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@leaseup/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@leaseup/ui/components/dropdown-menu";
import Link from "next/link";
import { toast } from "react-hot-toast";

function EndLeasePageSkeleton() {
  return (
    <div className="h-[900px] px-4 py-8 pt-[73px] md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-xl bg-white p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <Skeleton className="mb-2 h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="mb-2 h-4 w-16" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-xl bg-white p-6">
              <Skeleton className="mb-6 h-6 w-32" />
              <div className="grid grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="mb-1 h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-white p-6">
              <Skeleton className="mb-6 h-6 w-40" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
          <div className="space-y-8">
            <div className="rounded-xl bg-white p-6">
              <Skeleton className="mb-6 h-6 w-32" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "rent":
      return <Home className="text-info h-4 w-4 stroke-1" />;
    case "maintenance":
      return <Wrench className="text-warning h-4 w-4 stroke-1" />;
    case "late_fee":
    case "penalty":
      return <AlertTriangle className="text-danger h-4 w-4 stroke-1" />;
    default:
      return <DollarSign className="text-muted-foreground h-4 w-4 stroke-1" />;
  }
};

export default function EndLeasePage() {
  const utils = api.useUtils();
  const { id } = useParams<{ id: string }>();
  const { data: lease, isLoading, error } = api.lease.getById.useQuery(id);
  const { mutateAsync: markInvoiceAsPaid, isPending: isMarkingInvoiceAsPaid } =
    api.invoice.markInvoiceAsPaid.useMutation({
      onSuccess: () => {
        utils.lease.getById.invalidate();
      },
    });
  const { mutateAsync: voidInvoice, isPending: isVoidingInvoice } =
    api.invoice.voidInvoice.useMutation({
      onSuccess: () => {
        utils.lease.getById.invalidate();
      },
    });

  if (isLoading) {
    return <EndLeasePageSkeleton />;
  }

  if (error) {
    return (
      <div className="h-[900px] px-4 py-8 pt-[73px] md:px-8">
        <div className="mx-auto max-w-7xl">
          <EmptyState
            title="Error Loading Lease"
            description={
              error.message || "Failed to load lease details. Please try again."
            }
            icon={<AlertTriangle className="h-12 w-12" />}
          />
        </div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="h-[900px] px-4 py-8 pt-[73px] md:px-8">
        <div className="mx-auto max-w-7xl">
          <EmptyState
            title="Lease Not Found"
            description="The lease you're looking for doesn't exist or you don't have permission to view it."
            icon={<FileCheck className="h-12 w-12" />}
          />
        </div>
      </div>
    );
  }

  const primaryTenant = lease.tenantLease[0]?.tenant;
  const property = lease.unit?.property;

  const unpaidInvoices =
    lease.invoice?.filter(
      (invoice) => invoice.status !== "PAID" && invoice.status !== "CANCELLED",
    ) || [];

  const totalUnpaidAmount = unpaidInvoices.reduce((sum, invoice) => {
    const totalPaid = invoice.transactions.reduce(
      (paidSum, transaction) => paidSum + transaction.amountPaid,
      0,
    );
    return sum + (invoice.dueAmount - totalPaid);
  }, 0);

  return (
    <div className="h-[900px] px-4 py-8 pt-[73px] md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8 rounded-xl bg-white p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3436]">
                End Lease Agreement
              </h1>
              <p className="text-[#7F8C8D]">
                Contract #{lease.id.slice(-8).toUpperCase()} -{" "}
                {primaryTenant
                  ? `${primaryTenant.firstName} ${primaryTenant.lastName}`
                  : "No Tenant"}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outlined" color="danger">
                <X className="h-4 w-4" />
                Cancel Process
              </Button>
              <Button color="danger">
                <Check className="h-4 w-4" />
                Complete Lease End
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-muted-foreground mb-2 text-sm">Tenant</h3>
              {primaryTenant ? (
                <div className="flex items-center">
                  <Avatar className="mr-3 h-10 w-10">
                    <AvatarImage
                      src={
                        primaryTenant.avatarUrl ||
                        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg"
                      }
                      alt={`${primaryTenant.firstName} ${primaryTenant.lastName}`}
                    />
                    <AvatarFallback>
                      {primaryTenant.firstName[0]}
                      {primaryTenant.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-[#2D3436]">
                      {primaryTenant.firstName} {primaryTenant.lastName}
                    </p>
                    <p className="text-sm text-[#7F8C8D]">
                      {primaryTenant.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[#7F8C8D]">No tenant assigned</p>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-sm text-[#7F8C8D]">Property</h3>
              {property ? (
                <>
                  <p className="font-medium text-[#2D3436]">{property.name}</p>
                  <p className="text-[#2D3436]">Unit #{lease.unit?.name}</p>
                </>
              ) : (
                <p className="text-[#7F8C8D]">No property assigned</p>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-sm text-[#7F8C8D]">End Date</h3>
              <p className="font-medium text-[#2D3436]">
                {lease.endDate
                  ? format(new Date(lease.endDate), "MMMM d, yyyy")
                  : "No end date"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section className="rounded-xl bg-white p-6">
              <h2 className="mb-6 text-xl font-semibold text-[#2D3436]">
                Lease Details
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="mb-1 text-sm text-[#7F8C8D]">Property</h3>
                  <p className="font-medium text-[#2D3436]">
                    {property
                      ? `${property.name} - Unit #${lease.unit?.name}`
                      : "No property assigned"}
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm text-[#7F8C8D]">Lease Type</h3>
                  <p className="font-medium text-[#2D3436]">
                    {lease.leaseType.charAt(0).toUpperCase() +
                      lease.leaseType.slice(1).toLowerCase().replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm text-[#7F8C8D]">Invoice Cycle</h3>
                  <p className="font-medium text-[#2D3436]">
                    {lease.invoiceCycle.charAt(0).toUpperCase() +
                      lease.invoiceCycle.slice(1).toLowerCase()}{" "}
                    (1st of each month)
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm text-[#7F8C8D]">Start Date</h3>
                  <p className="font-medium text-[#2D3436]">
                    {format(new Date(lease.startDate), "MMMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm text-[#7F8C8D]">End Date</h3>
                  <p className="font-medium text-[#2D3436]">
                    {lease.endDate
                      ? format(new Date(lease.endDate), "MMMM d, yyyy")
                      : "No end date"}
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm text-[#7F8C8D]">Monthly Rent</h3>
                  <p className="font-medium text-[#2D3436]">
                    {formatCurrencyToZAR(lease.rent)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-white p-6">
              <h2 className="mb-6 text-xl font-semibold text-[#2D3436]">
                Unpaid Invoices
              </h2>
              {unpaidInvoices.length > 0 ? (
                <>
                  <Table>
                    <TableHeader className="bg-[#ECF0F1]">
                      <TableRow>
                        <TableHead className="text-[#7F8C8D]">
                          Category
                        </TableHead>
                        <TableHead className="text-[#7F8C8D]">
                          Due Date
                        </TableHead>
                        <TableHead className="text-[#7F8C8D]">Total</TableHead>
                        <TableHead className="text-[#7F8C8D]">Paid</TableHead>
                        <TableHead className="text-[#7F8C8D]">Status</TableHead>
                        <TableHead className="text-[#7F8C8D]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unpaidInvoices.map((invoice) => {
                        const totalPaid = invoice.transactions.reduce(
                          (sum, transaction) => sum + transaction.amountPaid,
                          0,
                        );
                        return (
                          <TableRow key={invoice.id}>
                            <TableCell>
                              <div className="flex items-center">
                                {getCategoryIcon(invoice.category)}
                                <span className="ml-3 font-medium text-[#2D3436]">
                                  {invoice.category.charAt(0).toUpperCase() +
                                    invoice.category
                                      .slice(1)
                                      .toLowerCase()
                                      .replace(/_/g, " ")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-[#2D3436]">
                              {invoice.dueDate
                                ? format(
                                    new Date(invoice.dueDate),
                                    "MMM d, yyyy",
                                  )
                                : "No due date"}
                            </TableCell>
                            <TableCell className="font-medium text-[#2D3436]">
                              {formatCurrencyToZAR(invoice.dueAmount)}
                            </TableCell>
                            <TableCell className="text-[#2D3436]">
                              {formatCurrencyToZAR(totalPaid)}
                            </TableCell>
                            <TableCell>
                              <Badge color="danger" size="sm">
                                {invoice.status.charAt(0).toUpperCase() +
                                  invoice.status
                                    .slice(1)
                                    .toLowerCase()
                                    .replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell align="center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="icon" color="info">
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <Link href={`/invoices/${invoice.id}`}>
                                    <DropdownMenuItem>
                                      <Eye className="size-4" />
                                      View
                                    </DropdownMenuItem>
                                  </Link>
                                  <DropdownMenuItem
                                    disabled={
                                      isMarkingInvoiceAsPaid || isVoidingInvoice
                                    }
                                    onClick={() =>
                                      toast.promise(
                                        markInvoiceAsPaid({
                                          invoiceId: invoice.id,
                                        }),
                                        {
                                          loading: "Marking invoice as paid...",
                                          success: "Invoice marked as paid",
                                          error:
                                            "Failed to mark invoice as paid",
                                        },
                                      )
                                    }
                                  >
                                    <Check className="size-4" />
                                    Mark as Paid
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    disabled={
                                      isMarkingInvoiceAsPaid || isVoidingInvoice
                                    }
                                    onClick={() =>
                                      toast.promise(
                                        voidInvoice({
                                          invoiceId: invoice.id,
                                        }),
                                        {
                                          loading: "Voiding invoice...",
                                          success: "Invoice voided",
                                          error: "Failed to void invoice",
                                        },
                                      )
                                    }
                                  >
                                    <Trash className="text-destructive size-4" />
                                    Void
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <div className="mt-6 rounded border p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="text-warning mr-3 size-5 stroke-1" />
                      <div>
                        <p className="text-warning font-semibold">
                          Total Outstanding:{" "}
                          {formatCurrencyToZAR(totalUnpaidAmount)}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          All unpaid invoices must be settled before lease
                          termination
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="No unpaid invoices"
                  description="There are no outstanding invoices for this lease."
                  icon={<FileCheck className="h-12 w-12" />}
                />
              )}
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-xl bg-white p-6">
              <h2 className="mb-6 text-xl font-semibold text-[#2D3436]">
                Return Deposits
              </h2>

              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium text-[#2D3436]">
                      Security Deposit
                    </h3>
                    <span className="font-bold text-[#2ECC71]">
                      {formatCurrencyToZAR(lease.deposit)}
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-[#7F8C8D]">
                    Paid on: {format(new Date(lease.startDate), "MMMM d, yyyy")}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7F8C8D]">Original Amount:</span>
                      <span className="text-[#2D3436]">
                        {formatCurrencyToZAR(lease.deposit)}
                      </span>
                    </div>
                    {totalUnpaidAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7F8C8D]">
                          Outstanding Invoices:
                        </span>
                        <span className="text-[#E74C3C]">
                          -{formatCurrencyToZAR(totalUnpaidAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span className="text-[#2D3436]">Refund Amount:</span>
                      <span className="text-success">
                        {formatCurrencyToZAR(
                          Math.max(0, lease.deposit - totalUnpaidAmount),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded border-l-4 border-[#2ECC71] bg-[#E8F5E8] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#2D3436]">
                      Total Refund Amount
                    </p>
                    <p className="text-sm text-[#7F8C8D]">After deductions</p>
                  </div>
                  <span className="text-lg font-bold text-[#2ECC71]">
                    {formatCurrencyToZAR(
                      Math.max(0, lease.deposit - totalUnpaidAmount),
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-lg border p-3">
                <div className="flex items-start">
                  <Info className="text-warning mt-1 mr-2 h-4 w-4" />
                  <div>
                    <p className="text-warning text-sm font-semibold">
                      Refund Process
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Deposits will be refunded within 30 days after move-out
                      inspection
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Action Summary */}
            <section className="rounded-xl bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold text-[#2D3436]">
                Action Required
              </h2>
              <div className="space-y-3">
                {totalUnpaidAmount > 0 && (
                  <div className="flex items-center rounded-lg border p-3">
                    <DollarSign className="text-danger mr-3 size-4 stroke-1" />
                    <div>
                      <p className="text-danger text-sm font-medium">
                        Collect Outstanding
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {formatCurrencyToZAR(totalUnpaidAmount)} unpaid invoices
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center rounded-lg border p-3">
                  <ClipboardCheck className="mr-3 size-4 stroke-1" />
                  <div>
                    <p className="text-sm font-medium">Move-out Inspection</p>
                    <p className="text-muted-foreground text-sm">
                      Schedule final walkthrough
                    </p>
                  </div>
                </div>

                <div className="flex items-center rounded-lg border p-3">
                  <Banknote className="mr-3 size-4 stroke-1" />
                  <div>
                    <p className="text-sm font-medium">Process Refund</p>
                    <p className="text-muted-foreground text-sm">
                      {formatCurrencyToZAR(
                        Math.max(0, lease.deposit - totalUnpaidAmount),
                      )}{" "}
                      total refund due
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
