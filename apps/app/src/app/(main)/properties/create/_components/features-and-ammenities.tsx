import { Badge } from "@leaseup/ui/components/badge";
import { Checkbox } from "@leaseup/ui/components/checkbox";
import { withForm } from "@leaseup/ui/components/form";
import { H5 } from "@leaseup/ui/components/typography";
import { createPropertyFormOptions } from "../_utils";
import { api } from "@/trpc/react";

export const FeaturesAndAmenitiesSubForm = withForm({
  ...createPropertyFormOptions,
  render: ({ form }) => {
    const { data: features } = api.portfolio.getPropertyFeatures.useQuery();
    const { data: amenities } = api.portfolio.getPropertyAmenities.useQuery();
    return (
      <div className="mb-8">
        <H5>Property Features and Amenities</H5>
        <div className="mt-3">
          <p className="mb-2 font-semibold">Features</p>
          <form.AppField name="propertyFeatures">
            {(field) => (
              <div className="flex flex-wrap gap-4">
                {features?.map((feature) => (
                  <label key={feature}>
                    <Badge
                      key={feature}
                      variant="outlined"
                      className="border-border cursor-pointer font-semibold"
                    >
                      <Checkbox
                        className="rounded-full"
                        checked={field.state.value.includes(feature)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.setValue([...field.state.value, feature]);
                          } else {
                            field.setValue(
                              field.state.value.filter((f) => f !== feature),
                            );
                          }
                        }}
                      />
                      {feature}
                    </Badge>
                  </label>
                ))}
              </div>
            )}
          </form.AppField>
        </div>

        <div className="mt-4">
          <p className="mb-2 font-semibold">Amenities</p>
          <div className="flex flex-wrap gap-4">
            <form.AppField name="propertyAmenities">
              {(field) => (
                <div className="flex flex-wrap gap-4">
                  {amenities?.map((amenity) => (
                    <label key={amenity}>
                      <Badge
                        variant="outlined"
                        className="border-border cursor-pointer font-semibold"
                      >
                        <Checkbox
                          className="rounded-full"
                          checked={field.state.value.includes(amenity)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.setValue([...field.state.value, amenity]);
                            } else {
                              field.setValue(
                                field.state.value.filter((a) => a !== amenity),
                              );
                            }
                          }}
                        />
                        {amenity}
                      </Badge>
                    </label>
                  ))}
                </div>
              )}
            </form.AppField>
          </div>
        </div>
      </div>
    );
  },
});
