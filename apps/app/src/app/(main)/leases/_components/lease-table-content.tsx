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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avatar";
import { Badge } from "@leaseup/ui/components/badge";
import { EmptyState } from "@leaseup/ui/components/state";
import { Plus, FileText } from "lucide-react";
import { Button } from "@leaseup/ui/components/button";
import Link from "next/link";
import { api } from "@/trpc/server";
import { format } from "date-fns";
import { LeaseDropdownActions } from "./lease-dropdown-actions";
import { formatCurrencyToZAR } from "@/utils/currency";

interface LeaseTableContentProps {
  page: number;
  limit: number;
}

export async function LeaseTableContent({
  page,
  limit,
}: LeaseTableContentProps) {
  const { leases, totalPages } = await api.lease.getAll({
    page,
    limit,
  });

  if (leases.length === 0) {
    return (
      <EmptyState
        title="No leases found"
        description="Create your first lease to get started managing tenant agreements."
        buttons={
          <Link href="/leases/create">
            <Button>
              <Plus />
              Add Lease
            </Button>
          </Link>
        }
        icon={<FileText />}
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Property & Unit</TableHead>
            <TableHead>Rent Amount</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leases.map((lease) => {
            const tenant = lease.tenantLease[0]?.tenant;
            const property = lease.unit?.property;
            const unit = lease.unit;

            return (
              <TableRow key={lease.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={tenant?.avatarUrl ?? undefined} />
                      <AvatarFallback className="size-8">
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
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-[#2D3436]">
                      {property?.name}
                    </p>
                    <p className="text-sm text-[#7F8C8D]">Unit {unit?.name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-semibold text-[#2D3436]">
                    {formatCurrencyToZAR(lease.rent)}
                  </p>
                  <p className="text-sm text-[#7F8C8D]">
                    /{lease.invoiceCycle?.toLowerCase()}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="text-[#2D3436]">
                    {format(new Date(lease.startDate), "MMM dd, yyyy")}
                  </span>
                </TableCell>
                <TableCell>
                  {lease.endDate ? (
                    <span className="text-[#2D3436]">
                      {format(new Date(lease.endDate), "MMM dd, yyyy")}
                    </span>
                  ) : (
                    <Badge variant="soft" color="info" size="sm">
                      Month to Month
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {(() => {
                    let badgeColor: "success" | "warning" | "secondary" =
                      "secondary";
                    if (lease.status === "ACTIVE") {
                      badgeColor = "success";
                    } else if (lease.status === "EXPIRED") {
                      badgeColor = "warning";
                    }
                    return (
                      <Badge variant="soft" size="sm" color={badgeColor}>
                        {lease.status}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-right">
                  <LeaseDropdownActions
                    leaseId={lease.id}
                    status={lease.status}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="mt-6 flex w-full items-center justify-between">
          <Pagination className="w-fit">
            <PaginationContent className="gap-4">
              <PaginationItem>
                <PaginationPrevious
                  href={
                    page > 1
                      ? `/leases?page=${page - 1}&limit=${limit}`
                      : undefined
                  }
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href={
                    page < totalPages
                      ? `/leases?page=${page + 1}&limit=${limit}`
                      : undefined
                  }
                  className={
                    page >= totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}
