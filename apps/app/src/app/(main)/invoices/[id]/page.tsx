"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@leaseup/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@leaseup/ui/components/card";
import { Badge } from "@leaseup/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@leaseup/ui/components/table";
import {
  ArrowLeft,
  Edit,
  Check,
  Clock,
  AlertTriangle,
  Send,
  Copy,
  Printer,
  Ban,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { PDFDownloadButton } from "@/components/pdf/PDFDownloadButton";

// Type for invoice with bank details
type LandlordBankDetails = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

function InvoiceSkeleton() {
  return (
    <div className="mx-auto my-10 flex max-w-4xl flex-col space-y-8">
      <Card>
        <CardHeader>
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-96 animate-pulse rounded bg-gray-200"></div>
          <CardAction>
            <div className="flex gap-3">
              <div className="h-10 w-20 animate-pulse rounded bg-gray-200"></div>
              <div className="h-10 w-24 animate-pulse rounded bg-gray-200"></div>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200"></div>
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="text-right">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
              <div className="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-80 animate-pulse rounded bg-gray-200"></div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg bg-[#ECF0F1] p-4">
            <div className="h-4 flex-1 animate-pulse rounded bg-gray-200"></div>
            <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-8">
          {/* Company & Tenant Info Skeleton */}
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <div className="mb-4 h-6 w-16 animate-pulse rounded bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-44 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-36 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-52 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
            <div>
              <div className="mb-4 h-6 w-16 animate-pulse rounded bg-gray-200"></div>
              <div className="flex items-start">
                <div className="mr-3 h-12 w-12 animate-pulse rounded-full bg-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-44 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-36 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-6 rounded-lg bg-[#ECF0F1] p-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="mb-1 h-3 w-20 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="overflow-x-auto">
              <Table className="rounded-lg">
                <TableHeader>
                  <TableRow>
                    <TableHead className="p-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                    </TableHead>
                    <TableHead className="p-4">
                      <div className="h-4 w-8 animate-pulse rounded bg-gray-200"></div>
                    </TableHead>
                    <TableHead className="p-4">
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                    </TableHead>
                    <TableHead className="p-4">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i} className="border-t border-gray-200">
                      <TableCell className="p-4">
                        <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
                        <div className="mt-1 h-3 w-32 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Invoice Summary Skeleton */}
          <div className="mb-8 flex justify-end">
            <div className="w-full rounded-lg bg-[#ECF0F1] p-6 md:w-80">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between">
                    <div className="h-5 w-12 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="mb-3 h-6 w-32 animate-pulse rounded bg-gray-200"></div>
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div>
              <div className="mb-3 h-6 w-32 animate-pulse rounded bg-gray-200"></div>
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-4 h-6 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="rounded-lg bg-[#ECF0F1] p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div>
                  <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div>
                  <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-36 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 h-6 w-16 animate-pulse rounded bg-gray-200"></div>
            <div className="rounded-lg bg-[#ECF0F1] p-4">
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-10 flex-1 animate-pulse rounded bg-gray-200"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvoiceViewPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const utils = api.useUtils();
  const [isCopied, setIsCopied] = useState(false);

  const { data: invoice, isLoading } = api.invoice.getById.useQuery(id);
  const { mutate: voidInvoice, isPending: isVoiding } =
    api.invoice.voidInvoice.useMutation({
      onSuccess: () => {
        utils.lease.getById.invalidate();
      },
    });
  const { mutateAsync: markInvoiceAsPaid, isPending: isMarkingInvoiceAsPaid } =
    api.invoice.markInvoiceAsPaid.useMutation({
      onSuccess: () => {
        utils.lease.getById.invalidate();
      },
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <Check className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "OVERDUE":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleMarkAsPaid = () => {
    markInvoiceAsPaid(
      { invoiceId: id },
      {
        onSuccess: () => {
          toast.success("Invoice marked as paid");
          utils.lease.getById.invalidate();
        },
        onError: () => {
          toast.error("Failed to mark invoice as paid");
        },
      },
    );
  };

  const calculateSubtotal = () => {
    if (!invoice?.lineItems) return 0;
    const lineItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
    return lineItems.reduce((sum: number, item: unknown) => {
      const lineItem = item as { amount: number };
      return sum + lineItem.amount;
    }, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.15;
  };

  const handleVoidInvoice = () => {
    voidInvoice(
      { invoiceId: id },
      {
        onSuccess: () => {
          toast.success("Invoice voided successfully");
          utils.invoice.getById.invalidate();
        },
        onError: () => {
          toast.error("Failed to void invoice");
        },
      },
    );
  };

  const handleDuplicateInvoice = () => {
    router.push(`/invoices/create?duplicate=${id}`);
  };

  const handleCopyPaymentUrl = async () => {
    if (!invoice?.paymentRequestUrl) return;

    try {
      await navigator.clipboard.writeText(invoice.paymentRequestUrl);
      setIsCopied(true);
      toast.success("Payment URL copied to clipboard!");

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch {
      toast.error("Failed to copy payment URL");
    }
  };

  if (isLoading) {
    return <InvoiceSkeleton />;
  }

  if (!invoice) {
    return (
      <div className="mx-auto my-10 flex max-w-7xl items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invoice not found</p>
          <Link href="/invoices">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Invoices
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);

  const tenant = invoice.lease?.tenantLease?.[0]?.tenant || invoice.tenant;
  const property = invoice.lease?.unit?.property;
  const unit = invoice.lease?.unit;

  const landlord =
    invoice.lease?.unit?.property?.landlord ||
    invoice.tenant?.landlord ||
    invoice.lease?.tenantLease?.[0]?.tenant?.landlord;

  return (
    <div className="mx-auto my-10 flex max-w-4xl flex-col space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Invoice #{invoice.id.slice(-8).toUpperCase()}
          </CardTitle>
          <CardDescription>{invoice.description}</CardDescription>
          <CardAction>
            <div className="flex gap-3">
              <Link href={`/invoices/${id}/edit`}>
                <Button variant="outlined">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <PDFDownloadButton invoice={invoice as any} />
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge
                variant="soft"
                color={getStatusColor(invoice.status)}
                className="flex items-center gap-1"
              >
                {getStatusIcon(invoice.status)}
                {getStatusBadge(invoice.status)}
              </Badge>
              {invoice.status === "PAID" && (
                <span className="text-sm text-[#7F8C8D]">
                  Paid on{" "}
                  {invoice.transactions?.[0]?.createdAt
                    ? format(
                        new Date(invoice.transactions[0].createdAt),
                        "MMM dd, yyyy",
                      )
                    : "N/A"}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-[#7F8C8D]">Total Amount</p>
              <p className="text-2xl font-bold text-[#2D3436]">
                {formatCurrency(invoice.dueAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {invoice.paymentRequestUrl &&
        invoice.status !== "PAID" &&
        invoice.status !== "CANCELLED" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Request URL</CardTitle>
              <CardDescription>
                Share this URL with the tenant to allow them to pay the invoice
                online
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 rounded-lg bg-[#ECF0F1] p-4">
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-mono text-sm text-[#2D3436]">
                    {invoice.paymentRequestUrl}
                  </p>
                </div>
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={handleCopyPaymentUrl}
                >
                  {isCopied ? (
                    <span className="animate-in fade-in-10 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Copied!
                    </span>
                  ) : (
                    <span className="animate-in fade-in-10 flex items-center gap-2">
                      <Copy className="h-4 w-4" />
                      Copy URL
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      <Card>
        <CardContent className="p-8">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-semibold tracking-tight text-[#2D3436]">
                From
              </h3>
              <div className="text-[#7F8C8D]">
                <p className="font-medium text-[#2D3436]">
                  {landlord?.businessName ||
                    landlord?.name ||
                    "Property Management"}
                </p>
                {landlord?.addressLine1 && <p>{landlord.addressLine1}</p>}
                {landlord?.addressLine2 && <p>{landlord.addressLine2}</p>}
                {landlord?.city && landlord?.state && landlord?.zip && (
                  <p>
                    {landlord.city}, {landlord.state} {landlord.zip}
                  </p>
                )}
                {landlord?.phone && <p>Phone: {landlord.phone}</p>}
                {landlord?.email && <p>Email: {landlord.email}</p>}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold tracking-tight text-[#2D3436]">
                Bill To
              </h3>
              <div className="flex items-start">
                <Avatar className="mr-3 h-12 w-12">
                  <AvatarImage src={tenant?.avatarUrl || undefined} />
                  <AvatarFallback>
                    {tenant?.firstName?.[0]}
                    {tenant?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-[#7F8C8D]">
                  <p className="font-medium tracking-tight text-[#2D3436]">
                    {tenant?.firstName} {tenant?.lastName}
                  </p>
                  {unit && property && (
                    <>
                      <p>
                        Unit {unit.name}, {property.name}
                      </p>
                      <p>{property.addressLine1}</p>
                      {property.addressLine2 && <p>{property.addressLine2}</p>}
                      <p>
                        {property.city}, {property.state} {property.zip}
                      </p>
                    </>
                  )}
                  <p>{tenant?.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-6 rounded-lg bg-[#ECF0F1] p-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-[#7F8C8D]">Invoice Number</p>
              <p className="font-medium tracking-tight text-[#2D3436]">
                #{invoice.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#7F8C8D]">Invoice Date</p>
              <p className="font-medium tracking-tight text-[#2D3436]">
                {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#7F8C8D]">Due Date</p>
              <p className="font-medium tracking-tight text-[#2D3436]">
                {invoice.dueDate
                  ? format(new Date(invoice.dueDate), "MMM dd, yyyy")
                  : "No due date"}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#7F8C8D]">Billing Period</p>
              <p className="font-medium tracking-tight text-[#2D3436]">
                {format(new Date(invoice.createdAt), "MMMM yyyy")}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold tracking-tight text-[#2D3436]">
              Invoice Items
            </h3>
            <div className="overflow-x-auto">
              <Table className="rounded-lg">
                <TableHeader>
                  <TableRow>
                    <TableHead className="p-4 text-left font-medium tracking-tight text-[#2D3436]">
                      Description
                    </TableHead>
                    <TableHead className="p-4 text-center font-medium tracking-tight text-[#2D3436]">
                      Qty
                    </TableHead>
                    <TableHead className="p-4 text-right font-medium tracking-tight text-[#2D3436]">
                      Rate
                    </TableHead>
                    <TableHead className="p-4 text-right font-medium tracking-tight text-[#2D3436]">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(invoice.lineItems) &&
                  invoice.lineItems.length > 0 ? (
                    invoice.lineItems.map((item: unknown, index: number) => {
                      const lineItem = item as {
                        name?: string;
                        description?: string;
                        quantity: number;
                        rate: number;
                        amount: number;
                      };
                      return (
                        <TableRow
                          key={index}
                          className="border-t border-gray-200"
                        >
                          <TableCell className="p-4">
                            <p className="font-medium text-[#2D3436]">
                              {lineItem.name || lineItem.description}
                            </p>
                            {unit && property && (
                              <p className="text-sm text-[#7F8C8D]">
                                Unit {unit.name}, {property.name}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="p-4 text-center text-[#7F8C8D]">
                            {lineItem.quantity}
                          </TableCell>
                          <TableCell className="p-4 text-right text-[#7F8C8D]">
                            {formatCurrency(lineItem.rate)}
                          </TableCell>
                          <TableCell className="p-4 text-right font-medium text-[#2D3436]">
                            {formatCurrency(lineItem.amount)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow className="border-t border-gray-200">
                      <TableCell className="p-4">
                        <p className="font-medium text-[#2D3436]">
                          {invoice.description}
                        </p>
                        {unit && property && (
                          <p className="text-sm text-[#7F8C8D]">
                            Unit {unit.name}, {property.name}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="p-4 text-center text-[#7F8C8D]">
                        1
                      </TableCell>
                      <TableCell className="p-4 text-right text-[#7F8C8D]">
                        {formatCurrency(invoice.dueAmount)}
                      </TableCell>
                      <TableCell className="p-4 text-right font-medium text-[#2D3436]">
                        {formatCurrency(invoice.dueAmount)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="mb-8 flex justify-end">
            <div className="w-full rounded-lg bg-[#ECF0F1] p-6 md:w-80">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#7F8C8D]">Subtotal:</span>
                  <span className="font-medium text-[#2D3436]">
                    {formatCurrency(subtotal || invoice.dueAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7F8C8D]">VAT (15%):</span>
                  <span className="font-medium text-[#2D3436]">
                    {formatCurrency(tax || 0)}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-[#2D3436]">
                      Total:
                    </span>
                    <span className="text-lg font-semibold text-[#2D3436]">
                      {formatCurrency(invoice.dueAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-[#2D3436]">
                Payment Terms
              </h3>
              <p className="text-[#7F8C8D]">
                {invoice.dueDate
                  ? `Due by ${format(new Date(invoice.dueDate), "MMM dd, yyyy")}`
                  : "Payment terms not specified"}
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-[#2D3436]">
                Payment Method
              </h3>
              <p className="text-[#7F8C8D]">Bank Transfer / Online Payment</p>
            </div>
          </div>

          {(invoice as any)?.landlordBankDetails && (
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-[#2D3436]">
                Bank Details
              </h3>
              <div className="rounded-lg bg-[#ECF0F1] p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-[#7F8C8D]">
                      Bank Name
                    </p>
                    <p className="font-medium text-[#2D3436]">
                      {
                        (
                          (invoice as any)
                            .landlordBankDetails as LandlordBankDetails
                        ).bankName
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#7F8C8D]">
                      Account Number
                    </p>
                    <p className="font-medium text-[#2D3436]">
                      {
                        (
                          (invoice as any)
                            .landlordBankDetails as LandlordBankDetails
                        ).accountNumber
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#7F8C8D]">
                      Account Name
                    </p>
                    <p className="font-medium text-[#2D3436]">
                      {
                        (
                          (invoice as any)
                            .landlordBankDetails as LandlordBankDetails
                        ).accountName
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {invoice.transactions && invoice.transactions.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-[#2D3436]">
                Payment History
              </h3>
              <div className="space-y-3">
                {invoice.transactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-[#3498DB] bg-[#EBF3FD] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="mr-3 h-5 w-5 text-[#2ECC71]" />
                        <div>
                          <p className="font-medium text-[#2D3436]">
                            Payment Received
                          </p>
                          <p className="text-sm text-[#7F8C8D]">
                            {format(
                              new Date(transaction.createdAt),
                              "MMM dd, yyyy 'at' h:mm a",
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#2D3436]">
                          {formatCurrency(transaction.amountPaid)}
                        </p>
                        <p className="text-sm text-[#7F8C8D]">Bank Transfer</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-lg font-semibold text-[#2D3436]">Notes</h3>
            <div className="rounded-lg bg-[#ECF0F1] p-4">
              <p className="text-[#7F8C8D]">
                Thank you for your prompt payment. Please contact us if you have
                any questions regarding this invoice.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              variant="outlined"
              className="border-info text-info flex-1"
              onClick={handleDuplicateInvoice}
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
            <Button
              variant="outlined"
              className="flex-1"
              onClick={handleMarkAsPaid}
              color="success"
              isLoading={isMarkingInvoiceAsPaid}
            >
              <Check className="h-4 w-4" />
              Mark as Paid
            </Button>
            <Button
              className="flex-1"
              variant="outlined"
              color="danger"
              onClick={handleVoidInvoice}
              isLoading={isVoiding}
              disabled={invoice.status === "PAID"}
            >
              <Ban className="h-4 w-4" />
              Void
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
