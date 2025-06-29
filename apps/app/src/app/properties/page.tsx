import { api } from "@/trpc/server";
import { Button } from "@leaseup/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { H4, H5 } from "@leaseup/ui/components/typography";
import {
  Bath,
  Bed,
  CheckCheck,
  Map,
  Pencil,
  Plus,
  RulerDimensionLine,
  X,
} from "lucide-react";
import Link from "next/link";
import { PropertyStaticMap } from "./_components/PropertyStaticMap";
import { Badge } from "@leaseup/ui/components/badge";
import { EmptyState } from "@leaseup/ui/components/state";
export default async function Properties() {
  const properties = await api.portfolio.getAll();

  return (
    <div className="mx-auto mt-10 max-w-7xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Properties</CardTitle>
            <CardDescription>Manage your properties and units.</CardDescription>
          </div>
          <CardAction>
            <Button>
              <Plus />
              <Link href="/properties/create">Create Property</Link>
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      <Card className="mt-6">
        <CardContent>
          <div className="flex flex-col gap-8">
            {properties.length > 0 ? (
              properties.map((property) => (
                <div key={property.id} className="w-full">
                  <div className="flex w-full gap-2">
                    <div className="shrink-0">
                      <PropertyStaticMap
                        address={`${property.addressLine1}, ${property.city}, ${property.state}, ${property.zip} South Africa`}
                      />
                    </div>
                    <div className="w-full">
                      <div className="flex w-full justify-between">
                        <div className="w-full">
                          <H5>{property.name}</H5>
                          <p className="text-muted-foreground flex max-w-md items-center gap-1 text-sm">
                            <Map className="size-4 shrink-0 stroke-1" />
                            <span className="line-clamp-2">
                              {`${property.addressLine1}, ${property.city}, ${property.state}, ${property.zip} South Africa`}
                            </span>
                          </p>
                        </div>
                        <div className="shrink-0">
                          <H4 className="text-right tabular-nums">
                            {new Intl.NumberFormat("en-ZA", {
                              style: "currency",
                              currency: "ZAR",
                            }).format(property?.marketRent)}
                            <span className="text-muted-foreground text-sm font-normal">
                              /mo
                            </span>
                          </H4>
                        </div>
                      </div>
                      <div className="mt-2">
                        {property.propertyType === "SINGLE_UNIT" ? (
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              <Bed /> {property.bedrooms} Bedrooms
                            </Badge>
                            <Badge variant="outline">
                              <Bath /> {property.bathrooms} Bathrooms
                            </Badge>
                            <Badge variant="outline">
                              <RulerDimensionLine /> {property.sqmt} sqm
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {property.unit.map((unit) => (
                              <div
                                key={unit.id}
                                className="flex w-52 flex-col gap-1 rounded-md border px-4 py-2"
                              >
                                <p className="text-muted-foreground text-sm">
                                  #Unit {unit.name}
                                </p>
                                {unit?.lease.length > 0 ? (
                                  <p className="flex items-center gap-2 text-sm">
                                    <CheckCheck className="size-4 shrink-0 text-green-600" />
                                    Occupied
                                  </p>
                                ) : (
                                  <p className="flex items-center gap-2 text-sm">
                                    <X className="size-4 shrink-0 text-red-600" />
                                    Vacant
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-2">
                          <div className="flex justify-end gap-2">
                            {property?.propertyType === "MULTI_UNIT" ? (
                              <Button variant="outlined">Manage Units</Button>
                            ) : null}
                            <Button variant="outlined">
                              <Pencil />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No properties found"
                buttons={
                  <Button>
                    <Plus />
                    <Link href="/properties/create">Create Property</Link>
                  </Button>
                }
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
