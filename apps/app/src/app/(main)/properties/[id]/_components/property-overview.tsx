import { Badge } from "@leaseup/ui/components/badge";
import { H6 } from "@leaseup/ui/components/typography";
import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from "@leaseup/ui/components/description-list";
import {
  Bath,
  Bed,
  Building,
  RulerDimensionLine,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Home,
  FileText,
  Circle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@leaseup/ui/utils/cn";

interface PropertyOverviewProps {
  property: any;
}

export function PropertyOverview({ property }: PropertyOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  const totalUnits = property.unit?.length || 0;
  const occupiedUnits =
    property.unit?.filter((unit: any) => unit.lease && unit.lease.length > 0)
      .length || 0;
  const vacantUnits = totalUnits - occupiedUnits;
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  const currentRent =
    property.unit?.reduce((sum: number, unit: any) => {
      if (unit.lease && unit.lease.length > 0) {
        return sum + (unit.lease[0].rent || unit.marketRent || 0);
      }
      return sum;
    }, 0) || 0;

  // Create different stats arrays based on property type
  const getStatsArray = () => {
    if (
      property.propertyType === "SINGLE_UNIT" &&
      property.unit &&
      property.unit[0]
    ) {
      const unit = property.unit[0];
      return [
        {
          label: "Bedrooms",
          value: unit.bedrooms,
          color: "info" as const,
          icon: Bed,
          textColor: "text-blue-700",
          valueColor: "text-blue-800",
          iconColor: "text-blue-600",
        },
        {
          label: "Bathrooms",
          value: unit.bathrooms,
          color: "info" as const,
          icon: Bath,
          textColor: "text-blue-700",
          valueColor: "text-blue-800",
          iconColor: "text-blue-600",
        },
        {
          label: "Size (sqm)",
          value: unit.sqmt,
          color: "info" as const,
          icon: RulerDimensionLine,
          textColor: "text-blue-700",
          valueColor: "text-blue-800",
          iconColor: "text-blue-600",
        },
        {
          label: "Monthly Rent",
          value: formatCurrency(unit.marketRent || 0),
          color: "success" as const,
          icon: DollarSign,
          textColor: "text-green-700",
          valueColor: "text-green-800",
          iconColor: "text-green-600",
        },
      ];
    } else {
      return [
        {
          label: "Total Units",
          value: totalUnits,
          color: "info" as const,
          icon: Home,
          textColor: "text-blue-700",
          valueColor: "text-blue-800",
          iconColor: "text-blue-600",
        },
        {
          label: "Occupied",
          value: occupiedUnits,
          color: "success" as const,
          icon: Users,
          textColor: "text-green-700",
          valueColor: "text-green-800",
          iconColor: "text-green-600",
        },
        {
          label: "Vacant",
          value: vacantUnits,
          color: "warning" as const,
          icon: Building,
          textColor: "text-orange-700",
          valueColor: "text-orange-800",
          iconColor: "text-orange-600",
        },
        {
          label: "Monthly Rent",
          value: formatCurrency(currentRent),
          color: "success" as const,
          icon: DollarSign,
          textColor: "text-green-700",
          valueColor: "text-green-800",
          iconColor: "text-green-600",
        },
      ];
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {getStatsArray().map((stat, index) => (
          <Badge
            key={stat.label + index}
            variant="soft"
            color={stat.color}
            className="h-auto rounded-md p-4 [&_svg]:size-6 [&_svg]:stroke-1"
          >
            <div className="flex w-full items-center justify-between">
              <div>
                <p className={`mb-2 text-sm ${stat.textColor}`}>{stat.label}</p>
                <p className={`text-lg font-bold ${stat.valueColor}`}>
                  {stat.value}
                </p>
              </div>
              <stat.icon className={stat.iconColor} />
            </div>
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Property Details */}
        <div>
          <h3>Property Details</h3>
          <div>
            <DescriptionList>
              <DescriptionTerm>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </div>
              </DescriptionTerm>
              <DescriptionDetails>
                {property.addressLine1}
                {property.addressLine2 && `, ${property.addressLine2}`}
                <br />
                {property.city}, {property.state} {property.zip}
              </DescriptionDetails>

              <DescriptionTerm>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Property Type
                </div>
              </DescriptionTerm>
              <DescriptionDetails>
                {property.propertyType === "SINGLE_UNIT"
                  ? "Single Unit"
                  : "Multi Unit"}
              </DescriptionDetails>

              <DescriptionTerm>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created
                </div>
              </DescriptionTerm>
              <DescriptionDetails>
                {format(new Date(property.createdAt), "MMM dd, yyyy")}
              </DescriptionDetails>

              <DescriptionTerm>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Occupancy Rate
                </div>
              </DescriptionTerm>
              <DescriptionDetails>
                {occupancyRate.toFixed(1)}%
              </DescriptionDetails>
            </DescriptionList>
          </div>
        </div>

        {/* Features and Amenities */}
        <div className="space-y-6">
          <div>
            <h3>Features</h3>
            <div className="mt-4">
              {property.features && property.features.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature: string) => (
                    <Badge
                      size="sm"
                      key={feature}
                      variant="outlined"
                      className="border-primary text-primary rounded-full font-semibold"
                    >
                      ⭐ {feature}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No features listed</p>
              )}
            </div>
          </div>

          <div>
            <h3>Amenities</h3>
            <div className="mt-4">
              {property.amenities && property.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity: string) => (
                    <Badge
                      size="sm"
                      key={amenity}
                      variant="outlined"
                      className="border-primary text-primary rounded-full font-semibold"
                    >
                      ✅ {amenity}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No amenities listed</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Units Summary */}
      {property.propertyType === "MULTI_UNIT" &&
        property.unit &&
        property.unit.length > 0 && (
          <div>
            <h3>Units Summary</h3>
            <div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {property.unit.slice(0, 6).map((unit: any) => (
                  <div
                    key={unit.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        Unit {unit.name}
                      </p>
                      <Badge
                        size="sm"
                        variant="soft"
                        color={
                          unit.lease && unit.lease.length > 0
                            ? "success"
                            : "warning"
                        }
                      >
                        <Circle
                          className={cn(
                            unit.lease && unit.lease.length > 0
                              ? "fill-success text-success"
                              : "fill-warning text-warning",
                            "animate-pulse",
                          )}
                        />
                        {unit.lease && unit.lease.length > 0
                          ? "Occupied"
                          : "Vacant"}
                      </Badge>
                    </div>

                    <div className="mb-2 flex gap-2">
                      <Badge variant="outlined" size="sm">
                        <Bed className="mr-1 h-3 w-3" /> {unit.bedrooms}
                      </Badge>
                      <Badge variant="outlined" size="sm">
                        <Bath className="mr-1 h-3 w-3" /> {unit.bathrooms}
                      </Badge>
                      <Badge variant="outlined" size="sm">
                        <RulerDimensionLine className="mr-1 h-3 w-3" />{" "}
                        {unit.sqmt}m²
                      </Badge>
                    </div>

                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(unit.marketRent || 0)}/mo
                    </p>

                    {unit.lease &&
                      unit.lease.length > 0 &&
                      unit.lease[0].tenantLease && (
                        <p className="mt-1 text-xs text-gray-500">
                          Tenant:{" "}
                          {unit.lease[0].tenantLease[0]?.tenant?.firstName}{" "}
                          {unit.lease[0].tenantLease[0]?.tenant?.lastName}
                        </p>
                      )}
                  </div>
                ))}
              </div>

              {property.unit.length > 6 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    And {property.unit.length - 6} more units...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
