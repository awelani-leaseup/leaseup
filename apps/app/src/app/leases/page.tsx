import { Button } from "@leaseup/ui/components/button";
import {
  Card,
  CardAction,
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avataar";
import { Badge } from "@leaseup/ui/components/badge";
import { EmptyState } from "@leaseup/ui/components/state";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/server";
import { format } from "date-fns";
import { LeaseDropdownActions } from "./_components/lease-dropdown-actions";

interface LeasesPageProps {
  searchParams?: {
    page?: string;
    limit?: string;
  };
}

export default async function Leases({ searchParams }: LeasesPageProps) {
  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 10;

  const { leases, total, totalPages } = await api.lease.getAll({
    page,
    limit,
  });

  return (
    <div className="mx-auto mt-10 flex max-w-7xl flex-col">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Leases</CardTitle>
          <CardDescription>Manage your leases here.</CardDescription>
          <CardAction>
            <Link href="/leases/create">
              <Button>
                <Plus />
                Add Lease
              </Button>
            </Link>
          </CardAction>
        </CardHeader>
      </Card>

      <Card className="mt-8">
        <CardContent>
          {leases.length > 0 ? (
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
                              <AvatarImage
                                src={tenant?.avatarUrl ?? undefined}
                              />
                              <AvatarFallback className="size-8">
                                {tenant?.firstName?.[0]}
                                {tenant?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {tenant?.firstName} {tenant?.lastName}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {tenant?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{property?.name}</p>
                            <p className="text-muted-foreground text-sm">
                              Unit {unit?.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {new Intl.NumberFormat("en-ZA", {
                              style: "currency",
                              currency: "ZAR",
                            }).format(lease.rent)}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            /{lease.invoiceCycle?.toLowerCase()}
                          </p>
                        </TableCell>
                        <TableCell>
                          {format(new Date(lease.startDate), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          {lease.endDate ? (
                            format(new Date(lease.endDate), "dd MMM yyyy")
                          ) : (
                            <Badge variant="soft" color="info" size="sm">
                              Month to Month
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="soft"
                            size="sm"
                            color={
                              lease.status === "ACTIVE"
                                ? "success"
                                : lease.status === "EXPIRED"
                                  ? "warning"
                                  : "secondary"
                            }
                          >
                            {lease.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <LeaseDropdownActions leaseId={lease.id} />
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
                          className={
                            page <= 1 ? "pointer-events-none opacity-50" : ""
                          }
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
                            page >= totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
