"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
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
import { Badge } from "@leaseup/ui/components/badge";
import { EmptyState } from "@leaseup/ui/components/state";
import { FileText } from "lucide-react";
import Link from "next/link";
import { TenantTransactionsSkeleton } from "../../_components/tenant-skeletons";

export default function TenantTransactionsPage() {
  const params = useParams();
  const tenantId = params.id as string;

  const {
    data: transactions,
    isLoading,
    error,
  } = api.tenant.getTenantTransactions.useQuery({
    id: tenantId,
  });

  if (isLoading) {
    return <TenantTransactionsSkeleton />;
  }

  if (error || !transactions) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading tenant transactions</p>
          <p className="text-gray-600">
            {error?.message || "Transactions not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Date</TableHead>
                <TableHead className="text-left">Description</TableHead>
                <TableHead className="text-left">Amount</TableHead>
                <TableHead className="text-left">Status</TableHead>
                <TableHead className="text-left">Invoice</TableHead>
                <TableHead className="text-left">Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-[#7F8C8D]"
                  >
                    <EmptyState
                      title="No transactions yet"
                      description="Transactions will appear here once the tenant has made a payment"
                      icon={<FileText className="h-4 w-4" />}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-ZA", {
                        style: "currency",
                        currency: "ZAR",
                      }).format(transaction.amountPaid)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="soft" color="success" size="sm">
                        Paid
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/invoices/${transaction.invoice?.id}`}
                        className="text-muted-foreground flex items-center gap-2 underline"
                      >
                        <FileText className="h-4 w-4 stroke-1" />#
                        {transaction.invoice?.id.slice(0, 8) || "N/A"}
                      </Link>
                    </TableCell>
                    <TableCell>{transaction.referenceId || "N/A"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
