import { Avatar, AvatarFallback } from "@leaseup/ui/components/avataar";
import { Badge } from "@leaseup/ui/components/badge";
import { Button } from "@leaseup/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Input } from "@leaseup/ui/components/input";
import {
  Banknote,
  Calendar,
  CalendarCog,
  DoorOpen,
  Filter,
  Phone,
  Plus,
  Search,
  Signature,
  User,
} from "lucide-react";
import Link from "next/link";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@leaseup/ui/components/description-list";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@leaseup/ui/components/pagination";
import { EmptyState } from "@leaseup/ui/components/state";
import { api } from "@/trpc/server";
import { TenantDropdownActions } from "./_components/tenant-dropdown-actions";

export default async function Tenants() {
  const tenants = await api.tenant.getAll();
  return (
    <div className="mx-auto my-10 flex max-w-7xl flex-col">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Tenants</CardTitle>
          <CardDescription>Manage your tenants here.</CardDescription>
          <CardAction>
            <Link href="/tenants/create">
              <Button>
                <Plus />
                Add Tenant
              </Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Input
              icon={<Search />}
              placeholder="Search tenants"
              className="w-96"
            />

            <div className="flex items-center gap-2">
              <Button variant="outlined">
                <Filter />
                All properties
              </Button>
              <Button variant="outlined">
                <Filter />
                All Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
        {tenants.length > 0 ? (
          tenants?.map((tenant) => (
            <Card key={tenant.id}>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="size-10 shadow-sm">
                    {/* <AvatarImage src={tenant?.avatar} /> */}
                    <AvatarFallback className="size-10 shadow-sm">
                      {tenant?.firstName[0]}
                      {tenant?.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <p className="text flex items-center gap-2 text-sm leading-none font-semibold">
                        {tenant?.firstName} {tenant?.lastName}
                      </p>
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-none font-normal text-pretty">
                        {tenant?.tenantLease[0]?.lease
                          ? [
                              tenant?.tenantLease[0]?.lease?.unit?.property
                                ?.addressLine1,
                              tenant?.tenantLease[0]?.lease?.unit?.property
                                ?.city,
                              tenant?.tenantLease[0]?.lease?.unit?.property
                                ?.state,
                              tenant?.tenantLease[0]?.lease?.unit?.property
                                ?.zip,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          : "Prospect"}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {tenant?.tenantLease[0]?.lease ? (
                        <Badge
                          size="sm"
                          variant="solid"
                          className="capitalize"
                          color={
                            tenant?.tenantLease[0]?.lease?.status === "ACTIVE"
                              ? "success"
                              : "warning"
                          }
                        >
                          {tenant?.tenantLease[0]?.lease?.status === "ACTIVE"
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      ) : (
                        <Badge
                          size="sm"
                          variant="solid"
                          color="primary"
                          className="bg-slate-700 text-white"
                        >
                          No lease
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  {tenant?.tenantLease[0]?.lease ? (
                    <div className="flex items-center gap-2">
                      <DescriptionList
                        orientation="horizontal"
                        className="w-full"
                      >
                        <DescriptionTerm className="flex items-center gap-2">
                          <DoorOpen className="text-muted-foreground size-4 stroke-1" />
                          Unit
                        </DescriptionTerm>
                        <DescriptionDetails className="md:text-right">
                          {tenant?.tenantLease[0]?.lease?.unit?.name}
                        </DescriptionDetails>
                        <DescriptionTerm className="flex items-center gap-2">
                          <Banknote className="text-muted-foreground size-4 stroke-1" />
                          Monthly Rent
                        </DescriptionTerm>
                        <DescriptionDetails className="md:text-right">
                          {new Intl.NumberFormat("en-ZA", {
                            style: "currency",
                            currency: "ZAR",
                          }).format(tenant?.tenantLease[0]?.lease?.rent)}
                        </DescriptionDetails>
                        <DescriptionTerm className="flex items-center gap-2">
                          <Calendar className="text-muted-foreground size-4 stroke-1" />
                          Lease End
                        </DescriptionTerm>
                        <DescriptionDetails className="md:text-right">
                          {tenant?.tenantLease[0]?.lease?.leaseType ===
                            "FIXED_TERM" &&
                          tenant?.tenantLease[0]?.lease?.endDate
                            ? new Date(
                                tenant?.tenantLease[0]?.lease?.endDate,
                              ).toLocaleDateString("en-ZA", {
                                year: "numeric",
                                month: "long",
                              })
                            : "Month to Month"}
                        </DescriptionDetails>
                      </DescriptionList>
                    </div>
                  ) : (
                    <DescriptionList orientation="horizontal">
                      <DescriptionTerm className="flex items-center gap-2">
                        <Phone className="text-muted-foreground size-4 stroke-1" />
                        Phone Number
                      </DescriptionTerm>
                      <DescriptionDetails className="md:text-right">
                        {tenant?.phone}
                      </DescriptionDetails>
                      <DescriptionTerm className="flex items-center gap-2">
                        <Calendar className="text-muted-foreground size-4 stroke-1" />
                        Created At
                      </DescriptionTerm>
                      <DescriptionDetails className="md:text-right">
                        {tenant?.createdAt.toLocaleDateString("en-ZA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </DescriptionDetails>
                      <DescriptionTerm className="flex items-center gap-2">
                        <CalendarCog className="text-muted-foreground size-4 stroke-1" />
                        Updated At
                      </DescriptionTerm>
                      <DescriptionDetails className="md:text-right">
                        {tenant?.updatedAt.toLocaleDateString("en-ZA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </DescriptionDetails>
                    </DescriptionList>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {!tenant?.tenantLease[0]?.lease ? (
                  <Button color="secondary" variant="soft" className="w-full">
                    <Plus />
                    Add Lease
                  </Button>
                ) : (
                  <Button variant="soft" color="secondary" className="w-full">
                    <Signature />
                    View Lease
                  </Button>
                )}
                <TenantDropdownActions
                  tenantId={tenant.id}
                  lease={!!tenant?.tenantLease[0]?.lease}
                />
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              title="No tenants"
              description="Add your first tenant to get started."
              buttons={
                <Link href="/tenants/create">
                  <Button>
                    <Plus />
                    Add Tenant
                  </Button>
                </Link>
              }
              icon={<User />}
            />
          </div>
        )}
      </div>

      <Card className="mt-10 pb-4">
        <CardContent>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
    </div>
  );
}
