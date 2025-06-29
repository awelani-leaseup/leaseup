"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  Plus,
  Trash,
  File,
  Upload,
  Bed,
  Bath,
  DollarSign,
  RulerDimensionLine,
  FileText,
  FileImage,
} from "lucide-react";
import * as v from "valibot";
import {
  FieldLabel,
  FieldMessage,
  useAppForm,
} from "@leaseup/ui/components/form";
import { Separator } from "@leaseup/ui/components/separator";
import { EmptyState } from "@leaseup/ui/components/state";
import { H5, H6 } from "@leaseup/ui/components/typography";
import { RadioGroup, RadioGroupItem } from "@leaseup/ui/components/radio-group";
import { StaticMap, createStaticMapsUrl } from "@vis.gl/react-google-maps";
import { useStore } from "@tanstack/react-form";
import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@leaseup/ui/components/table";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

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

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const ImageSchema = v.pipe(
  v.file("Please select an image file."),
  v.mimeType(
    ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"],
    "Please select a PDF file.",
  ),
  v.maxSize(MAX_SIZE, "Please select a file smaller than 5 MB."),
);

const VPropertySchema = v.object({
  propertyName: v.pipe(v.string(), v.minLength(1, "Property name is required")),
  propertyType: v.pipe(v.string(), v.minLength(1, "Property type is required")),
  fullAddressId: v.string(),
  propertyUnits: v.array(
    v.object({
      unitNumber: v.pipe(v.string(), v.minLength(1, "Unit number is required")),
      bedrooms: v.pipe(
        v.number(),
        v.minValue(0, "Please enter a valid number"),
      ),
      bathrooms: v.pipe(
        v.number(),
        v.minValue(0, "Please enter a valid number"),
      ),
      sqmt: v.pipe(v.number(), v.minValue(0, "Please enter a valid number")),
      rent: v.pipe(v.number(), v.minValue(0, "Please enter a valid number")),
      deposit: v.pipe(v.number(), v.minValue(0, "Please enter a valid number")),
    }),
  ),
  addressLine1: v.pipe(
    v.string(),
    v.minLength(1, "Address line 1 is required"),
  ),
  addressLine2: v.pipe(v.string()),
  city: v.pipe(v.string(), v.minLength(1, "City is required")),
  state: v.pipe(v.string(), v.minLength(1, "State is required")),
  zip: v.pipe(v.string(), v.minLength(1, "Zip code is required")),
  countryCode: v.pipe(v.string(), v.minLength(1, "Country code is required")),
  propertyFeatures: v.array(v.string()),
  propertyAmenities: v.array(v.string()),
  bedrooms: v.pipe(
    v.number("Bedrooms required"),
    v.minValue(0, "Please enter a valid number"),
  ),
  bathrooms: v.pipe(
    v.number("Bathrooms required"),
    v.minValue(0, "Please enter a valid number"),
  ),
  sqmt: v.pipe(
    v.number("Square meters required"),
    v.minValue(0, "Please enter a valid number"),
  ),
  marketRent: v.pipe(
    v.number("Market rent required"),
    v.minValue(0, "Please enter a valid number"),
  ),
  deposit: v.pipe(
    v.number("Deposit required"),
    v.minValue(0, "Please enter a valid number"),
  ),
  files: v.nullable(v.array(ImageSchema)),
});

export default function CreatePropertyPage() {
  const [address, setAddress] = useState<string>("");
  const router = useRouter();
  const staticMapsUrl = createStaticMapsUrl({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    scale: 2,
    width: 600,
    height: 600,
    center: address,
    zoom: 17,
    language: "en",
    markers: [
      {
        location: address,
      },
    ],
  });
  const form = useAppForm({
    defaultValues: {
      propertyName: "",
      propertyType: "SINGLE_UNIT",
      fullAddressId: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zip: "",
      countryCode: "",
      propertyUnits: [] as v.InferInput<
        typeof VPropertySchema
      >["propertyUnits"],
      propertyFeatures: [] as v.InferInput<
        typeof VPropertySchema
      >["propertyFeatures"],
      propertyAmenities: [] as v.InferInput<
        typeof VPropertySchema
      >["propertyAmenities"],
      bedrooms: 0,
      bathrooms: 0,
      sqmt: 0,
      marketRent: 0,
      deposit: 0,
      files: [] as v.InferInput<typeof VPropertySchema>["files"],
    },
    validators: {
      onSubmit: VPropertySchema,
    },
    onSubmit: ({ value }) => {
      const data = { ...value, countryCode: "ZA" };
      const mappedPropertyUnits = (data.propertyUnits || []).map(
        ({ rent, deposit, ...unit }) => ({
          ...unit,
          marketRent: rent,
          deposit,
        }),
      );

      toast.promise(
        createProperty.mutateAsync(
          {
            ...data,
            name: data.propertyName,
            features: data.propertyFeatures,
            amenities: data.propertyAmenities,
            propertyType: data.propertyType as "SINGLE_UNIT" | "MULTI_UNIT",
            propertyUnits: mappedPropertyUnits,
            files: Array.isArray(data.files) ? data.files : [],
          },
          {
            onSuccess: () => {
              router.replace("/properties");
            },
          },
        ),
        {
          loading: "Creating property...",
          error: "Failed to create property",
        },
      );
    },
  });

  const addressLine1 = useStore(
    form.store,
    (state) => state.values.addressLine1,
  );
  const addressLine2 = useStore(
    form.store,
    (state) => state.values.addressLine2,
  );
  const city = useStore(form.store, (state) => state.values.city);
  const state = useStore(form.store, (state) => state.values.state);
  const zip = useStore(form.store, (state) => state.values.zip);
  const countryCode = useStore(form.store, (state) => state.values.countryCode);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (addressLine1 && city && state && zip && countryCode) {
      setAddress(
        `${addressLine1}, ${addressLine2}, ${city}, ${state}, ${zip}, ${countryCode}`,
      );
      return;
    }

    setAddress("");
  }, [addressLine1, addressLine2, city, state, zip, countryCode]);

  const createProperty = api.portfolio.createProperty.useMutation();

  return (
    <div className="min-h-screen bg-[#ECF0F1] px-4 py-8 pt-[73px] md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="col-span-1">
          <Card className="sticky top-16 mt-[8.75rem] p-0">
            <CardContent className="overflow-hidden rounded-lg p-2">
              {address ? (
                <StaticMap
                  className="map h-[18.3rem] max-h-[18.3rem] rounded-md"
                  url={staticMapsUrl}
                />
              ) : (
                <div className="flex h-[18.3rem] max-h-[18.3rem] w-full items-center justify-center px-4">
                  <p className="text-muted-foreground text-center text-sm font-bold">
                    Enter an address to see the map preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="col-span-3">
          <div>
            <div className="mb-8 w-full">
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
                      <div className="col-span-full flex">
                        <form.AppField name="propertyType">
                          {(field) => (
                            <div className="w-full">
                              <FieldLabel>Property Type</FieldLabel>
                              <div className="mt-2 w-full gap-2">
                                <RadioGroup
                                  value={field.state.value}
                                  className="flex w-full gap-6"
                                  onValueChange={(value) => {
                                    field.setValue(value);
                                  }}
                                >
                                  <div className="flex h-40 flex-1 space-x-2 rounded-md border border-gray-200 p-4">
                                    <RadioGroupItem
                                      value="SINGLE_UNIT"
                                      id="SINGLE_UNIT"
                                    />
                                    <div className="flex flex-col">
                                      <Label
                                        htmlFor="SINGLE_UNIT"
                                        className="flex flex-col items-start text-sm"
                                      >
                                        Single Unit
                                        <span className="text-muted-foreground text-sm">
                                          Single family rentals are rentals in
                                          which there is only one rental
                                          associated to a specific address. This
                                          type of rental is usually used for a
                                          house This type of property does not
                                          allow to add any units/rooms
                                        </span>
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="flex h-40 flex-1 space-x-2 rounded-md border border-gray-200 p-4">
                                    <RadioGroupItem
                                      value="MULTI_UNIT"
                                      id="MULTI_UNIT"
                                    />
                                    <Label
                                      htmlFor="MULTI_UNIT"
                                      className="flex flex-col items-start text-sm"
                                    >
                                      Multi Unit
                                      <span>
                                        <p className="text-muted-foreground text-sm">
                                          Multi family rentals are rentals in
                                          which there is more than one rental
                                          associated to a specific address. This
                                          type of property allows to add any
                                          units/rooms.
                                        </p>
                                      </span>
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                              <FieldMessage />
                            </div>
                          )}
                        </form.AppField>
                      </div>
                      <form.AppField name="fullAddressId">
                        {(field) => (
                          <field.AddressField label="Search Address" />
                        )}
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
                          {(field) => <field.TextField label="Province" />}
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

                  {
                    <form.Subscribe
                      selector={(state) => state.values.propertyType}
                    >
                      {(type) => {
                        if (type === "SINGLE_UNIT") {
                          return (
                            <div className="mb-8">
                              <H5>Property Details</H5>
                              <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <form.AppField name="bedrooms">
                                  {(field) => (
                                    <field.TextField
                                      label="Bedrooms"
                                      type="number"
                                      icon={<Bed className="h-4 w-4" />}
                                    />
                                  )}
                                </form.AppField>
                                <form.AppField name="bathrooms">
                                  {(field) => (
                                    <field.TextField
                                      label="Bathrooms"
                                      type="number"
                                      icon={<Bath className="h-4 w-4" />}
                                    />
                                  )}
                                </form.AppField>
                                <form.AppField name="marketRent">
                                  {(field) => (
                                    <field.TextField
                                      label="Market Rent"
                                      type="number"
                                      icon={<DollarSign className="h-4 w-4" />}
                                    />
                                  )}
                                </form.AppField>
                                <form.AppField name="deposit">
                                  {(field) => (
                                    <field.TextField
                                      label="Deposit"
                                      type="number"
                                      icon={<DollarSign className="h-4 w-4" />}
                                    />
                                  )}
                                </form.AppField>
                                <form.AppField name="sqmt">
                                  {(field) => (
                                    <field.TextField
                                      label="Square Meters"
                                      type="number"
                                      icon={
                                        <RulerDimensionLine className="h-4 w-4" />
                                      }
                                    />
                                  )}
                                </form.AppField>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="mb-8">
                            <form.Field
                              name="propertyUnits"
                              mode="array"
                              validators={{
                                onSubmit: v.pipe(
                                  v.array(
                                    v.object({
                                      unitNumber: v.string(),
                                      bedrooms: v.number(),
                                      bathrooms: v.number(),
                                      sqmt: v.number(),
                                      rent: v.number(),
                                      deposit: v.number(),
                                    }),
                                  ),
                                  v.minLength(
                                    1,
                                    "Please add at least one unit",
                                  ),
                                ),
                              }}
                            >
                              {(field) => (
                                <>
                                  <div className="mb-6 flex items-center justify-between">
                                    <H6 className="text-lg font-semibold text-[#2D3436]">
                                      Units Information
                                    </H6>
                                    <Button
                                      type="button"
                                      variant="link"
                                      className="h-auto p-0 text-[#3498DB] hover:text-[#2C3E50]"
                                      onClick={() => {
                                        field.pushValue({
                                          unitNumber: "",
                                          bedrooms: 0,
                                          bathrooms: 0,
                                          sqmt: 0,
                                          rent: 0,
                                          deposit: 0,
                                        });
                                      }}
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Add Unit
                                    </Button>
                                  </div>
                                  {field.state.value.map((unit, idx) => (
                                    <div
                                      key={idx}
                                      className="mb-4 rounded-lg border border-gray-200 p-6"
                                    >
                                      <div className="mb-4 flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 font-semibold text-[#2D3436]">
                                          Unit{" "}
                                          <Badge variant="outline">
                                            {idx + 1}
                                          </Badge>
                                        </h3>
                                        <Button
                                          type="button"
                                          variant="link"
                                          className="cursor-pointers h-auto p-0 text-[#E74C3C] hover:text-[#C0392B]"
                                          onClick={() => field.removeValue(idx)}
                                          disabled={
                                            field.state.value.length === 1
                                          }
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                        <div>
                                          <Label className="mb-2">
                                            Unit Number/Name
                                          </Label>
                                          <form.Field
                                            name={`propertyUnits[${idx}].unitNumber`}
                                          >
                                            {(subField) => (
                                              <>
                                                <Input
                                                  placeholder="e.g. 101"
                                                  value={subField.state.value}
                                                  onChange={(e) =>
                                                    subField.setValue(
                                                      e.target.value,
                                                    )
                                                  }
                                                />
                                                {subField.state.meta.errors &&
                                                  subField.state.meta.errors
                                                    .length > 0 && (
                                                    <p className="mt-1 text-sm tracking-tight text-rose-600">
                                                      {
                                                        subField.state.meta
                                                          .errors[0]?.message
                                                      }
                                                    </p>
                                                  )}
                                              </>
                                            )}
                                          </form.Field>
                                        </div>
                                        <div>
                                          <Label className="mb-2">
                                            Bedrooms
                                          </Label>

                                          <form.Field
                                            name={`propertyUnits[${idx}].bedrooms`}
                                          >
                                            {(subField) => (
                                              <>
                                                <Input
                                                  icon={
                                                    <Bed className="h-4 w-4" />
                                                  }
                                                  type="number"
                                                  placeholder="e.g. 1, 2"
                                                  value={subField.state.value}
                                                  onChange={(e) =>
                                                    subField.setValue(
                                                      Number(e.target.value),
                                                    )
                                                  }
                                                />
                                                {subField.state.meta.errors &&
                                                  subField.state.meta.errors
                                                    .length > 0 && (
                                                    <p className="mt-1 text-sm tracking-tight text-rose-600">
                                                      {
                                                        subField.state.meta
                                                          .errors[0]?.message
                                                      }
                                                    </p>
                                                  )}
                                              </>
                                            )}
                                          </form.Field>
                                        </div>
                                        <div>
                                          <Label className="mb-2">
                                            Bathrooms
                                          </Label>
                                          <form.Field
                                            name={`propertyUnits[${idx}].bathrooms`}
                                          >
                                            {(subField) => (
                                              <>
                                                <Input
                                                  icon={
                                                    <Bath className="h-4 w-4" />
                                                  }
                                                  type="number"
                                                  placeholder="e.g. 1, 2.5"
                                                  value={subField.state.value}
                                                  onChange={(e) =>
                                                    subField.setValue(
                                                      Number(e.target.value),
                                                    )
                                                  }
                                                />
                                                {subField.state.meta.errors &&
                                                  subField.state.meta.errors
                                                    .length > 0 && (
                                                    <p className="mt-1 text-sm tracking-tight text-rose-600">
                                                      {
                                                        subField.state.meta
                                                          .errors[0]?.message
                                                      }
                                                    </p>
                                                  )}
                                              </>
                                            )}
                                          </form.Field>
                                        </div>
                                        <div>
                                          <Label className="mb-2">
                                            Square Meters
                                          </Label>
                                          <form.Field
                                            name={`propertyUnits[${idx}].sqmt`}
                                          >
                                            {(subField) => (
                                              <>
                                                <Input
                                                  icon={
                                                    <RulerDimensionLine className="h-4 w-4" />
                                                  }
                                                  type="number"
                                                  placeholder="e.g. 100, 150"
                                                  value={subField.state.value}
                                                  onChange={(e) =>
                                                    subField.setValue(
                                                      Number(e.target.value),
                                                    )
                                                  }
                                                />
                                                {subField.state.meta.errors &&
                                                  subField.state.meta.errors
                                                    .length > 0 && (
                                                    <p className="mt-1 text-sm tracking-tight text-rose-600">
                                                      {
                                                        subField.state.meta
                                                          .errors[0]?.message
                                                      }
                                                    </p>
                                                  )}
                                              </>
                                            )}
                                          </form.Field>
                                        </div>
                                        <div>
                                          <Label className="mb-2">
                                            Market Rent ($)
                                          </Label>
                                          <form.Field
                                            name={`propertyUnits[${idx}].rent`}
                                          >
                                            {(subField) => (
                                              <>
                                                <Input
                                                  icon={
                                                    <DollarSign className="h-4 w-4" />
                                                  }
                                                  type="number"
                                                  placeholder="e.g. 1000, 1500"
                                                  value={subField.state.value}
                                                  onChange={(e) =>
                                                    subField.setValue(
                                                      Number(e.target.value),
                                                    )
                                                  }
                                                />
                                                {subField.state.meta.errors &&
                                                  subField.state.meta.errors
                                                    .length > 0 && (
                                                    <p className="mt-1 text-sm tracking-tight text-rose-600">
                                                      {
                                                        subField.state.meta
                                                          .errors[0]?.message
                                                      }
                                                    </p>
                                                  )}
                                              </>
                                            )}
                                          </form.Field>
                                        </div>
                                        <div>
                                          <Label className="mb-2">
                                            Security Deposit ($)
                                          </Label>
                                          <form.Field
                                            name={`propertyUnits[${idx}].deposit`}
                                          >
                                            {(subField) => (
                                              <>
                                                <Input
                                                  icon={
                                                    <DollarSign className="h-4 w-4" />
                                                  }
                                                  type="number"
                                                  placeholder="e.g. 1000, 1500"
                                                  value={subField.state.value}
                                                  onChange={(e) =>
                                                    subField.setValue(
                                                      Number(e.target.value),
                                                    )
                                                  }
                                                />
                                                {subField.state.meta.errors &&
                                                  subField.state.meta.errors
                                                    .length > 0 && (
                                                    <p className="mt-1 text-sm tracking-tight text-rose-600">
                                                      {
                                                        subField.state.meta
                                                          .errors[0]?.message
                                                      }
                                                    </p>
                                                  )}
                                              </>
                                            )}
                                          </form.Field>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </>
                              )}
                            </form.Field>
                          </div>
                        );
                      }}
                    </form.Subscribe>
                  }

                  <Separator className="my-8" />

                  <div className="mb-8">
                    <H5>Property Features and Amenities</H5>
                    <div className="mt-3">
                      <p className="mb-2 font-semibold">Features</p>
                      <form.AppField name="propertyFeatures">
                        {(field) => (
                          <div className="flex flex-wrap gap-4">
                            {FEATURE_OPTIONS.map((feature) => (
                              <label key={feature}>
                                <Badge
                                  key={feature}
                                  variant="outline"
                                  className="cursor-pointer font-bold"
                                >
                                  <Checkbox
                                    checked={field.state.value.includes(
                                      feature,
                                    )}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.setValue([
                                          ...field.state.value,
                                          feature,
                                        ]);
                                      } else {
                                        field.setValue(
                                          field.state.value.filter(
                                            (f) => f !== feature,
                                          ),
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
                              {AMENITIES.map((amenity) => (
                                <label key={amenity}>
                                  <Badge
                                    variant="outline"
                                    className="cursor-pointer font-bold"
                                  >
                                    <Checkbox
                                      checked={field.state.value.includes(
                                        amenity,
                                      )}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.setValue([
                                            ...field.state.value,
                                            amenity,
                                          ]);
                                        } else {
                                          field.setValue(
                                            field.state.value.filter(
                                              (a) => a !== amenity,
                                            ),
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

                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <H5>Property Documents</H5>
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => inputRef.current?.click()}
                      >
                        <Upload />
                        Upload
                      </Button>
                    </div>
                    <div className="mt-2">
                      <form.AppField name="files" mode="array">
                        {(field) => (
                          <>
                            <input
                              ref={inputRef}
                              className="hidden"
                              accept="image/*, application/pdf"
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  field.setValue([
                                    ...(field.state.value ?? []),
                                    file,
                                  ]);
                                }
                              }}
                            />
                            {field.state.value?.length === 0 ? (
                              <EmptyState
                                title="Upload documents"
                                icon={<File />}
                                buttons={
                                  <Button
                                    variant="outlined"
                                    onClick={() => inputRef.current?.click()}
                                  >
                                    <Upload />
                                    Upload
                                  </Button>
                                }
                              />
                            ) : (
                              <>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>File</TableHead>
                                    </TableRow>
                                  </TableHeader>

                                  <TableBody>
                                    {field.state.value?.map((file, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>
                                          <form.AppField name={`files[${idx}]`}>
                                            {(subField) => (
                                              <div>
                                                <div className="flex items-center gap-2">
                                                  {file.type.includes(
                                                    "image",
                                                  ) ? (
                                                    <FileImage className="h-4 w-4 stroke-1" />
                                                  ) : (
                                                    <FileText className="h-4 w-4 stroke-1" />
                                                  )}
                                                  <div>
                                                    <p className="text-sm font-medium tracking-tight">
                                                      {file.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                      {file.size < 1024
                                                        ? file.size + " B"
                                                        : file.size <
                                                            1024 * 1024
                                                          ? (
                                                              file.size / 1024
                                                            ).toFixed(1) + " KB"
                                                          : (
                                                              file.size /
                                                              1024 /
                                                              1024
                                                            ).toFixed(1) +
                                                            " MB"}
                                                    </p>
                                                  </div>
                                                </div>
                                                <p>
                                                  {subField.state.meta.errors &&
                                                    subField.state.meta.errors
                                                      .length > 0 && (
                                                      <p className="mt-1 text-sm tracking-tight text-rose-600">
                                                        {
                                                          subField.state.meta
                                                            .errors[0]?.message
                                                        }
                                                      </p>
                                                    )}
                                                </p>
                                              </div>
                                            )}
                                          </form.AppField>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Button
                                            className="cursor-pointer"
                                            variant="ghost"
                                            onClick={() => {
                                              field.removeValue(idx);
                                            }}
                                          >
                                            <Trash className="h-4 w-4 text-rose-600" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </>
                            )}
                          </>
                        )}
                      </form.AppField>
                    </div>
                  </div>

                  <div className="mt-4">
                    <form.FormMessage />
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
      </div>
    </div>
  );
}
