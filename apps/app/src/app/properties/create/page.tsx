"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Badge } from "@leaseup/ui/components/badge";
import { Button } from "@leaseup/ui/components/button";
import { Input } from "@leaseup/ui/components/input";
import { Label } from "@leaseup/ui/components/label";
import { Checkbox } from "@leaseup/ui/components/checkbox";
import { Plus, Trash, File, Upload } from "lucide-react";
import * as v from "valibot";
import { useAppForm } from "@leaseup/ui/components/form";
import { Separator } from "@leaseup/ui/components/separator";
import { EmptyState } from "@leaseup/ui/components/state";
import { H2, H5, H6 } from "@leaseup/ui/components/typography";

const PROPERTY_TYPES = [
  { label: "Single Unit", value: "single_unit" },
  { label: "Multi Unit", value: "multi_unit" },
];

const FEATURE_OPTIONS = [
  "Alarm System",
  "Air Conditioning",
  "WIFI Internet",
  "Cable TV",
  "Dishwasher",
  "Dryer",
  "Fridge",
  "Microwave",
  "Oven",
  "Stove",
  "Fireplace",
];

const AMENITIES = [
  "BBQ Grill",
  "Pool",
  "Fitness Center",
  "Pet Friendly",
  "Gym",
  "Laundry",
  "Parking",
  "Storage",
];

type Unit = {
  number: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  rent: string;
  deposit: string;
};

const DEFAULT_UNIT: Unit = {
  number: "",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  rent: "",
  deposit: "",
};

const VPropertySchema = v.object({
  propertyName: v.pipe(v.string(), v.minLength(1, "Property name is required")),
  propertyType: v.pipe(v.string(), v.minLength(1, "Property type is required")),
  fullAddressId: v.string(),
  propertyUnits: v.pipe(
    v.nullable(
      v.array(
        v.object({
          number: v.pipe(v.string(), v.minLength(1, "Unit number is required")),
          bedrooms: v.pipe(v.number()),
          bathrooms: v.number(),
          sqft: v.number(),
          rent: v.number(),
          deposit: v.number(),
        }),
      ),
    ),
  ),
  addressLine1: v.pipe(
    v.string(),
    v.minLength(1, "Address line 1 is required"),
  ),
  addressLine2: v.pipe(
    v.string(),
    v.minLength(1, "Address line 2 is required"),
  ),
  city: v.pipe(v.string(), v.minLength(1, "City is required")),
  state: v.pipe(v.string(), v.minLength(1, "State is required")),
  zip: v.pipe(v.string(), v.minLength(1, "Zip code is required")),
  countryCode: v.pipe(v.string(), v.minLength(1, "Country code is required")),
  propertyFeatures: v.array(v.string()),
  propertyAmenities: v.array(v.string()),
  bedrooms: v.number(),
  bathrooms: v.number(),
  sqmt: v.number(),
  marketRent: v.number(),
  deposit: v.number(),
});

export default function CreatePropertyPage() {
  const form = useAppForm({
    defaultValues: {
      propertyName: "",
      propertyType: "",
      fullAddressId: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zip: "",
      countryCode: "",
      // propertyUnits: [],
      // propertyFeatures: [],
      // propertyAmenities: [],
      bedrooms: 0,
      bathrooms: 0,
      sqmt: 0,
      marketRent: 0,
      deposit: 0,
    },
    validators: {
      onSubmit: VPropertySchema,
    },
  });

  const [units, setUnits] = useState<Unit[]>([{ ...DEFAULT_UNIT }]);
  const [features, setFeatures] = useState<string[]>([]);
  const [additionalFeatures, setAdditionalFeatures] = useState("");

  const handleUnitChange = (idx: number, field: keyof Unit, value: string) => {
    setUnits((prev) => {
      const updated = [...prev];
      updated[idx] = { ...DEFAULT_UNIT, ...updated[idx], [field]: value };
      return updated;
    });
  };

  const addUnit = () => setUnits((prev) => [...prev, { ...DEFAULT_UNIT }]);
  const removeUnit = (idx: number) =>
    setUnits((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev,
    );

  const handleFeatureToggle = (value: string) => {
    setFeatures((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value],
    );
  };

  return (
    <div className="min-h-screen bg-[#ECF0F1] px-4 py-8 pt-[73px] md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Create New Property
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Enter property details below to get started.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardContent>
            <form.AppForm>
              {/* Basic Info Section */}
              <div className="mb-8">
                <H5>Basic Information</H5>
                <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <form.AppField name="propertyName">
                    {(field) => <field.TextField label="Property Name" />}
                  </form.AppField>
                  <form.AppField name="propertyType">
                    {(field) => (
                      <field.SelectField
                        label="Property Type"
                        options={PROPERTY_TYPES.map((type) => ({
                          label: type.label,
                          id: type.value,
                        }))}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="fullAddressId">
                    {(field) => <field.AddressField label="Street" />}
                  </form.AppField>
                  <form.AppField name="addressLine1">
                    {(field) => <field.TextField label="Address Line 1" />}
                  </form.AppField>
                  <form.AppField name="addressLine2">
                    {(field) => <field.TextField label="Address Line 2" />}
                  </form.AppField>
                  <form.AppField name="city">
                    {(field) => <field.TextField label="City" />}
                  </form.AppField>
                  <div className="flex gap-4">
                    <form.AppField name="state">
                      {(field) => <field.TextField label="State" />}
                    </form.AppField>
                    <form.AppField name="zip">
                      {(field) => <field.TextField label="Zip Code" />}
                    </form.AppField>
                  </div>
                  <form.AppField name="countryCode">
                    {(field) => <field.TextField label="Country" />}
                  </form.AppField>
                </div>
              </div>

              <Separator className="my-8" />

              <div className="mb-8">
                <H5>Property Details</H5>
                <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <form.AppField name="sqmt">
                    {(field) => <field.TextField label="Square Meters" />}
                  </form.AppField>
                </div>
              </div>

              {
                <form.Subscribe selector={(state) => state.values.propertyType}>
                  {(type) => {
                    if (type === "single_unit") {
                      return null;
                    }

                    return (
                      <div className="mb-8">
                        <div className="mb-6 flex items-center justify-between">
                          <H6 className="text-lg font-semibold text-[#2D3436]">
                            Units Information
                          </H6>
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-[#3498DB] hover:text-[#2C3E50]"
                            onClick={addUnit}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Unit
                          </Button>
                        </div>
                        {units.map((unit, idx) => (
                          <div
                            key={idx}
                            className="mb-4 rounded-lg border border-gray-200 p-6"
                          >
                            <div className="mb-4 flex items-center justify-between">
                              <h3 className="font-semibold text-[#2D3436]">
                                Unit #{idx + 1}
                              </h3>
                              <Button
                                type="button"
                                variant="link"
                                className="h-auto p-0 text-[#E74C3C] hover:text-[#C0392B]"
                                onClick={() => removeUnit(idx)}
                                disabled={units.length === 1}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                              <div>
                                <Label className="mb-2">Unit Number/Name</Label>
                                <Input
                                  placeholder="e.g. 101"
                                  value={unit.number}
                                  onChange={(e) =>
                                    handleUnitChange(
                                      idx,
                                      "number",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label className="mb-2">Bedrooms</Label>
                                <Input
                                  type="number"
                                  value={unit.bedrooms}
                                  onChange={(e) =>
                                    handleUnitChange(
                                      idx,
                                      "bedrooms",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label className="mb-2">Bathrooms</Label>
                                <Input
                                  type="number"
                                  value={unit.bathrooms}
                                  onChange={(e) =>
                                    handleUnitChange(
                                      idx,
                                      "bathrooms",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label className="mb-2">Square Footage</Label>
                                <Input
                                  type="number"
                                  value={unit.sqft}
                                  onChange={(e) =>
                                    handleUnitChange(
                                      idx,
                                      "sqft",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label className="mb-2">Monthly Rent ($)</Label>
                                <Input
                                  type="number"
                                  value={unit.rent}
                                  onChange={(e) =>
                                    handleUnitChange(
                                      idx,
                                      "rent",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label className="mb-2">
                                  Security Deposit ($)
                                </Label>
                                <Input
                                  type="number"
                                  value={unit.deposit}
                                  onChange={(e) =>
                                    handleUnitChange(
                                      idx,
                                      "deposit",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                </form.Subscribe>
              }

              <Separator className="my-8" />

              {/* Property Features Section */}
              <div className="mb-8">
                <H5>Property Features and Amenities</H5>
                <div className="mt-3">
                  <p className="mb-2 font-semibold">Features</p>
                  <div className="flex flex-wrap gap-4">
                    {FEATURE_OPTIONS.map((feature) => (
                      <Badge
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => handleFeatureToggle(feature)}
                      >
                        {feature}
                        <Checkbox checked={features.includes(feature)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 font-semibold">Features</p>
                  <div className="flex flex-wrap gap-4">
                    {AMENITIES.map((amenity) => (
                      <Badge
                        variant="outline"
                        className="cursor-pointer"
                        // onClick={() => handleAmenityToggle(amenity)}
                      >
                        {amenity}
                        <Checkbox
                        // checked={amenities.includes(amenity)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <H5>Property Documents</H5>
                <div className="mt-2">
                  <EmptyState
                    title="Upload documents"
                    icon={<File />}
                    buttons={
                      <Button variant="outlined">
                        <Upload />
                        Upload
                      </Button>
                    }
                  />
                </div>
              </div>

              <div className="flex gap-4 border-t border-gray-100 pt-6">
                <Button
                  onClick={() => form.handleSubmit()}
                  type="button"
                  className="rounded-lg bg-[#3498DB] text-white transition-colors hover:bg-[#2C3E50]"
                >
                  Create Property
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  className="rounded-lg border border-gray-200 text-[#7F8C8D] hover:border-[#3498DB] hover:text-[#3498DB]"
                >
                  Cancel
                </Button>
              </div>
            </form.AppForm>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
