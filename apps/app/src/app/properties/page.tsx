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
import { H5, H6 } from "@leaseup/ui/components/typography";
import {
  Bath,
  Bed,
  Building,
  CheckCheck,
  Plus,
  RulerDimensionLine,
  X,
} from "lucide-react";
import Link from "next/link";
import { PropertyStaticMap } from "./_components/PropertyStaticMap";
import { Badge } from "@leaseup/ui/components/badge";
import { EmptyState } from "@leaseup/ui/components/state";
import { Avatar, AvatarFallback } from "@leaseup/ui/components/avataar";
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

      <div className="mt-6 flex flex-col gap-4">
        {properties.length > 0 ? (
          properties.map((property) => (
            <Card key={property.id} className="w-full py-0">
              <CardContent className="flex w-full pl-0">
                <div className="shrink-0">
                  <PropertyStaticMap
                    address={`${property.addressLine1}, ${property.city}, ${property.state}, ${property.zip} South Africa`}
                  />
                </div>
                <div className="w-full py-6 pl-6">
                  <div className="flex w-full justify-between">
                    <div className="w-full">
                      <H5>{property.name}</H5>
                      <p className="text-muted-foreground mt-2 flex max-w-md items-center gap-1 text-sm">
                        {/* <Map className="size-4 shrink-0 stroke-1" /> */}
                        <span className="line-clamp-2">
                          {`${property.addressLine1}, ${property.city}, ${property.state}, ${property.zip} South Africa`}
                        </span>
                      </p>
                    </div>
                    <div className="shrink-0">
                      <H6 className="text-primary items-end text-right italic tabular-nums">
                        {new Intl.NumberFormat("en-ZA", {
                          style: "currency",
                          currency: "ZAR",
                        }).format(property?.unit[0]?.marketRent ?? 0)}
                        <span className="text-muted-foreground text-sm font-normal">
                          /mo
                        </span>
                      </H6>
                    </div>
                  </div>
                  <div className="mt-4">
                    {property.propertyType === "SINGLE_UNIT" ? (
                      <div className="flex gap-2">
                        <Badge variant="outlined" size="sm">
                          <Bed /> {property.unit[0]?.bedrooms} Bedrooms
                        </Badge>
                        <Badge variant="outlined" size="sm">
                          <Bath /> {property.unit[0]?.bathrooms} Bathrooms
                        </Badge>
                        <Badge variant="outlined" size="sm">
                          <RulerDimensionLine /> {property.unit[0]?.sqmt} sqm
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {property.unit.map((unit) => (
                          <div
                            key={unit.id}
                            className="flex w-52 flex-col gap-1 rounded-md border px-4 py-2"
                          >
                            <p className="text-muted-foreground flex items-center justify-between text-sm">
                              #Unit {unit.name}{" "}
                              <Avatar>
                                <AvatarFallback
                                  className="text-xs"
                                  title={`${unit?.lease[0]?.tenantLease[0]?.tenant?.firstName} ${unit?.lease[0]?.tenantLease[0]?.tenant?.lastName}`}
                                >
                                  {unit?.lease[0]?.tenantLease[0]?.tenant?.firstName?.charAt(
                                    0,
                                  )}
                                  {unit?.lease[0]?.tenantLease[0]?.tenant?.lastName?.charAt(
                                    0,
                                  )}
                                </AvatarFallback>
                              </Avatar>
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
                    <div className="mt-4 flex flex-col gap-2">
                      {property.amenities.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {property.amenities.map((amenity) => (
                            <Badge
                              size="sm"
                              variant="outlined"
                              key={amenity}
                              className="border-primary text-primary rounded-full font-semibold"
                            >
                              ✅ {amenity}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <Badge
                          size="sm"
                          variant="outlined"
                          className="w-fit rounded-full"
                        >
                          No amenities
                        </Badge>
                      )}
                      {property.features.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {property.features.map((feature) => (
                            <Badge
                              size="sm"
                              variant="outlined"
                              key={feature}
                              className="border-primary text-primary rounded-full font-semibold"
                            >
                              ⭐ {feature}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <Badge
                          size="sm"
                          variant="outlined"
                          className="mt-4 w-fit rounded-full"
                        >
                          No features
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={<Building />}
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
    </div>
  );
}
