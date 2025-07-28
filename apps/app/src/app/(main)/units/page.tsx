import { api } from "@/trpc/server";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Button } from "@leaseup/ui/components/button";
import {
  Banknote,
  CalendarDays,
  Plus,
  RulerDimensionLine,
  User,
  View,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@leaseup/ui/components/badge";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@leaseup/ui/components/description-list";
import { format } from "date-fns";

export default async function Units() {
  return (
    <div className="mx-auto my-10 max-w-7xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Units</CardTitle>
            <CardDescription>Manage your units.</CardDescription>
          </div>
          <CardAction>
            <Button>
              <Plus />
              <Link href="/units/create">Add Unit</Link>
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      <UnitCard />
    </div>
  );
}

const UnitCard = async () => {
  const units = await api.portfolio.getAllUnits();

  return (
    <div id="main-content" className="mt-6 bg-[#ECF0F1] py-8">
      <div className="mx-auto max-w-7xl">
        <div
          id="units-grid"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {units.map((unit) => (
            <Card key={unit.id}>
              <CardHeader>
                <CardTitle className="flex w-full items-start justify-between text-lg font-semibold text-[#2D3436]">
                  {unit.name}
                  <Badge
                    color={unit?.lease.length > 0 ? "success" : "secondary"}
                    size="sm"
                  >
                    {unit?.lease.length > 0 ? "Occupied" : "Vacant"}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm text-[#7F8C8D]">
                  {unit.property?.propertyType === "MULTI_UNIT"
                    ? unit.property?.name
                    : `${unit.property?.addressLine1}, ${unit.property?.city}`}
                </CardDescription>
              </CardHeader>

              <CardContent className="mt-auto">
                <DescriptionList orientation="horizontal">
                  {unit?.lease.length > 0 ? (
                    <>
                      <DescriptionTerm className="flex items-center">
                        <User className="mr-2 size-4" />
                        Tenant
                      </DescriptionTerm>
                      <DescriptionDetails className="md:text-right">
                        {unit.lease[0]?.tenantLease[0]?.tenant.firstName}{" "}
                        {unit.lease[0]?.tenantLease[0]?.tenant.lastName}
                      </DescriptionDetails>
                      <DescriptionTerm className="flex items-center">
                        <Banknote className="mr-2 size-4" />
                        Rent
                      </DescriptionTerm>
                      <DescriptionDetails className="md:text-right">
                        {new Intl.NumberFormat("en-ZA", {
                          style: "currency",
                          currency: "ZAR",
                        }).format(unit.lease[0]?.rent ?? 0)}
                        /mo
                      </DescriptionDetails>
                      <DescriptionTerm className="flex items-center">
                        <CalendarDays className="mr-2 size-4" />
                        Lease Start
                      </DescriptionTerm>
                      <DescriptionDetails className="md:text-right">
                        {unit.lease[0]?.startDate &&
                          format(unit.lease[0]?.startDate, "dd MMM yyyy")}
                      </DescriptionDetails>
                      <DescriptionTerm className="flex items-center">
                        <CalendarDays className="mr-2 size-4" />
                        Lease Ends
                      </DescriptionTerm>
                      <DescriptionDetails className="md:text-right">
                        {unit.lease[0]?.endDate &&
                        unit.lease[0]?.leaseType === "MONTHLY"
                          ? format(unit.lease[0]?.endDate, "dd MMM yyyy")
                          : "Month to month"}
                      </DescriptionDetails>
                    </>
                  ) : (
                    <>
                      <DescriptionTerm className="flex items-center">
                        <Banknote className="mr-2 size-4" />
                        Target Rent
                      </DescriptionTerm>
                      <DescriptionDetails className="md:text-right">
                        {new Intl.NumberFormat("en-ZA", {
                          style: "currency",
                          currency: "ZAR",
                        }).format(unit.marketRent)}
                      </DescriptionDetails>
                      <DescriptionTerm className="flex items-center">
                        <RulerDimensionLine className="mr-2 size-4" />
                        Size
                      </DescriptionTerm>
                      <DescriptionDetails className="md:text-right">
                        {unit.sqmt}m²
                      </DescriptionDetails>
                      <DescriptionTerm className="flex items-center">
                        <CalendarDays className="mr-2 size-4" />
                        Created At
                      </DescriptionTerm>
                      <DescriptionDetails className="md:text-right">
                        {unit.createdAt &&
                          format(unit.createdAt, "dd MMM yyyy")}
                      </DescriptionDetails>
                      <DescriptionTerm className="flex items-center">
                        <CalendarDays className="mr-2 size-4" />
                        Updated At
                      </DescriptionTerm>
                      <DescriptionDetails className="md:text-right">
                        {unit.updatedAt &&
                          format(unit.updatedAt, "dd MMM yyyy")}
                      </DescriptionDetails>
                    </>
                  )}
                </DescriptionList>
              </CardContent>

              <CardFooter>
                <Button className="w-full" variant="soft">
                  <View />
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
