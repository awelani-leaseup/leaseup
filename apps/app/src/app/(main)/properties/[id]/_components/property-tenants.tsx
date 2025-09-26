import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avatar";
import { Badge } from "@leaseup/ui/components/badge";
import { Button } from "@leaseup/ui/components/button";
import { Card, CardContent, CardFooter } from "@leaseup/ui/components/card";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@leaseup/ui/components/description-list";
import { EmptyState } from "@leaseup/ui/components/state";
import {
  Banknote,
  Calendar,
  DoorOpen,
  Phone,
  Signature,
  Users,
} from "lucide-react";
import Link from "next/link";

interface PropertyTenantsProps {
  property: any; // We'll type this properly later
}

export function PropertyTenants({ property }: PropertyTenantsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  // Extract all tenants from units with active leases
  const tenants =
    property.unit?.reduce((acc: any[], unit: any) => {
      if (unit.lease && unit.lease.length > 0) {
        unit.lease.forEach((lease: any) => {
          if (lease.tenantLease && lease.tenantLease.length > 0) {
            lease.tenantLease.forEach((tenantLease: any) => {
              if (tenantLease.tenant) {
                acc.push({
                  ...tenantLease.tenant,
                  unit: unit,
                  lease: lease,
                });
              }
            });
          }
        });
      }
      return acc;
    }, []) || [];

  if (tenants.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="No tenants found"
        description="This property doesn't have any tenants yet."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {tenants.map((tenant: any) => (
        <Card key={tenant.id}>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Link
                href={`/tenants/${tenant.id}`}
                className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
              >
                <Avatar className="size-10 shadow-sm">
                  <AvatarImage src={tenant?.avatarUrl ?? undefined} />
                  <AvatarFallback className="size-10 shadow-sm">
                    {tenant?.firstName[0]}
                    {tenant?.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text flex items-center gap-2 text-sm leading-none font-semibold">
                    {tenant?.firstName} {tenant?.lastName}
                  </p>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-none font-normal text-pretty">
                    Unit {tenant?.unit?.name}
                  </p>
                </div>
              </Link>
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex-1"></div>
                <div className="shrink-0">
                  <Badge
                    size="sm"
                    variant="solid"
                    className="capitalize"
                    color={
                      tenant?.lease?.status === "ACTIVE" ? "success" : "warning"
                    }
                  >
                    {tenant?.lease?.status === "ACTIVE" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-center gap-2">
                <DescriptionList orientation="horizontal" className="w-full">
                  <DescriptionTerm className="flex items-center gap-2">
                    <DoorOpen className="text-muted-foreground size-4 stroke-1" />
                    Unit
                  </DescriptionTerm>
                  <DescriptionDetails className="md:text-right">
                    {tenant?.unit?.name}
                  </DescriptionDetails>
                  <DescriptionTerm className="flex items-center gap-2">
                    <Banknote className="text-muted-foreground size-4 stroke-1" />
                    Monthly Rent
                  </DescriptionTerm>
                  <DescriptionDetails className="md:text-right">
                    {formatCurrency(tenant?.lease?.rent || 0)}
                  </DescriptionDetails>
                  <DescriptionTerm className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground size-4 stroke-1" />
                    Lease End
                  </DescriptionTerm>
                  <DescriptionDetails className="md:text-right">
                    {tenant?.lease?.leaseType === "FIXED_TERM" &&
                    tenant?.lease?.endDate
                      ? new Date(tenant?.lease?.endDate).toLocaleDateString(
                          "en-ZA",
                          {
                            year: "numeric",
                            month: "long",
                          },
                        )
                      : "Month to Month"}
                  </DescriptionDetails>
                  {tenant?.phone && (
                    <>
                      <DescriptionTerm className="flex items-center gap-2">
                        <Phone className="text-muted-foreground size-4 stroke-1" />
                        Phone Number
                      </DescriptionTerm>
                      <DescriptionDetails className="md:text-right">
                        {tenant?.phone}
                      </DescriptionDetails>
                    </>
                  )}
                </DescriptionList>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/leases/${tenant?.lease?.id}`} className="w-full">
              <Button variant="soft" color="secondary" className="w-full">
                <Signature />
                View Lease
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
