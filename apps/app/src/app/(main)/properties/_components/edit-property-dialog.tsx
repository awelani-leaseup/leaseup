"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { authClient } from "@/utils/auth/client";
import { upload } from "@vercel/blob/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@leaseup/ui/components/dialog";
import { Button } from "@leaseup/ui/components/button";
import { useAppForm } from "@leaseup/ui/components/form";
import { Separator } from "@leaseup/ui/components/separator";
import { H5 } from "@leaseup/ui/components/typography";
import { StaticMap, createStaticMapsUrl } from "@vis.gl/react-google-maps";
import { useStore } from "@tanstack/react-form";
import { api } from "@/trpc/react";
import { toast } from "react-hot-toast";
import { Save } from "lucide-react";
import { createPropertyFormOptions } from "../create/_utils";
import { formOptions } from "@tanstack/react-form";
import * as v from "valibot";
import { PropertyDocumentManagementContent } from "../create/_components/property-files-sub-form";
import {
  withForm,
  FieldLabel,
  FieldMessage,
} from "@leaseup/ui/components/form";
import { Label } from "@leaseup/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@leaseup/ui/components/radio-group";
import { Badge } from "@leaseup/ui/components/badge";
import { Checkbox } from "@leaseup/ui/components/checkbox";
import {
  Bed,
  Bath,
  DollarSign,
  RulerDimensionLine,
  Plus,
  Trash,
  Home,
} from "lucide-react";

interface PropertyData {
  id: string;
  name: string;
  propertyType: "SINGLE_UNIT" | "MULTI_UNIT";
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zip: string;
  countryCode: string;
  features: string[];
  amenities: string[];
  unit: Array<{
    id: string;
    name: string;
    bedrooms: number;
    bathrooms: number;
    sqmt: number;
    marketRent: number;
    deposit: number;
  }>;
  files: Array<{
    id: string;
    name: string;
    url: string;
    type: string | null;
    size: number | null;
    createdAt: Date;
    updatedAt: Date;
    leaseId: string | null;
    tenantId: string | null;
    propertyId: string | null;
    ownerId: string;
    invoiceId: string | null;
    maintenanceRequestId: string | null;
  }>;
}

interface EditPropertyDialogProps {
  property: PropertyData;
  children: React.ReactNode;
}

export function EditPropertyDialog({
  property,
  children,
}: EditPropertyDialogProps) {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const utils = api.useUtils();

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

  const { mutateAsync: updateProperty, isPending } =
    api.portfolio.updateProperty.useMutation();

  // Transform property data to match form schema
  const getDefaultValues = () => {
    if (property.propertyType === "SINGLE_UNIT" && property.unit.length > 0) {
      const unit = property.unit[0];
      if (!unit) {
        throw new Error("Unit is required for single unit properties");
      }
      return {
        propertyName: property.name,
        propertyType: property.propertyType,
        fullAddressId: "",
        addressLine1: property.addressLine1,
        addressLine2: property.addressLine2 || "",
        city: property.city,
        state: property.state,
        zip: property.zip,
        countryCode: property.countryCode,
        propertyUnits: [],
        propertyFeatures: property.features,
        propertyAmenities: property.amenities,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        sqmt: unit.sqmt,
        marketRent: unit.marketRent,
        deposit: unit.deposit,
        files: null,
      };
    } else {
      return {
        propertyName: property.name,
        propertyType: property.propertyType,
        fullAddressId: "",
        addressLine1: property.addressLine1,
        addressLine2: property.addressLine2 || "",
        city: property.city,
        state: property.state,
        zip: property.zip,
        countryCode: property.countryCode,
        propertyUnits: property.unit.map((unit) => ({
          id: unit.id,
          unitNumber: unit.name,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          sqmt: unit.sqmt,
          rent: unit.marketRent,
          deposit: unit.deposit,
        })),
        propertyFeatures: property.features,
        propertyAmenities: property.amenities,
        bedrooms: 0,
        bathrooms: 0,
        sqmt: 0,
        marketRent: 0,
        deposit: 0,
        files: null,
      };
    }
  };

  // Create custom form options for edit mode
  const editPropertyFormOptions = formOptions({
    defaultValues: getDefaultValues(),
  });

  const form = useAppForm({
    ...editPropertyFormOptions,
    onSubmit: async ({ value }) => {
      const data = { ...value, countryCode: property.countryCode };

      const mappedPropertyUnits = (data.propertyUnits || []).map(
        ({ rent, deposit, ...unit }) => ({
          ...unit,
          marketRent: rent,
          deposit,
        }),
      );

      const propertyUnit = {
        unitNumber: data.propertyName,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        sqmt: data.sqmt,
        marketRent: data.marketRent,
        deposit: data.deposit,
      };

      let files: { url: string; name: string; type: string; size: number }[] =
        [];

      // Get the actual File objects from the form
      const formFiles = form.state.values.files as File[] | null;

      if (formFiles && formFiles.length > 0) {
        setUploadingFiles(true);
        const uploadedFiles = await Promise.all(
          formFiles.map(async (file) => {
            try {
              const blob = await upload(`${user?.id}/${nanoid(21)}`, file, {
                access: "public",
                handleUploadUrl: "/api/file/upload",
              });

              return {
                url: blob.url,
                name: file.name,
                type: file.type,
                size: file.size,
              };
            } catch (error) {
              console.error("File upload failed:", error);
            }
          }),
        )
          .catch(() => {
            toast.error(
              "Failed to upload file(s), saving property without new files.",
            );
            return undefined;
          })
          .finally(() => {
            setUploadingFiles(false);
          });

        files =
          uploadedFiles?.filter(
            (
              file,
            ): file is {
              url: string;
              name: string;
              type: string;
              size: number;
            } => file !== undefined,
          ) || [];
      }

      toast.promise(
        updateProperty(
          {
            id: property.id,
            name: data.propertyName,
            features: data.propertyFeatures,
            amenities: data.propertyAmenities,
            propertyType: data.propertyType as "SINGLE_UNIT" | "MULTI_UNIT",
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            state: data.state,
            zip: data.zip,
            propertyUnits:
              data.propertyType === "SINGLE_UNIT"
                ? [propertyUnit]
                : mappedPropertyUnits,
            files,
          },
          {
            onSuccess: () => {
              setOpen(false);
              utils.portfolio.getById.invalidate(property.id);
              utils.portfolio.getAllProperties.invalidate();
            },
            onError: (error) => {
              console.error("Failed to update property:", error);
            },
          },
        ),
        {
          success: "Property updated successfully",
          loading: "Updating property...",
          error: "Failed to update property",
        },
      );
    },
  });
  const { data: amenities } = api.portfolio.getPropertyAmenities.useQuery();

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
  const { data: features } = api.portfolio.getPropertyFeatures.useQuery();

  useEffect(() => {
    if (addressLine1 && city && state && zip && countryCode) {
      setAddress(
        `${addressLine1}, ${addressLine2}, ${city}, ${state}, ${zip}, ${countryCode}`,
      );
      return;
    }

    setAddress("");
  }, [addressLine1, addressLine2, city, state, zip, countryCode]);

  useEffect(() => {
    if (property && open) {
      form.reset();
    }
  }, [property, form, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Property</DialogTitle>
          <DialogDescription>
            Update property information for {property.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="col-span-4">
              <form.AppForm>
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
                                  field.setValue(value as any);
                                }}
                              >
                                <div className="flex h-32 flex-1 space-x-2 rounded-md border border-gray-200 p-4">
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
                                        associated to a specific address.
                                      </span>
                                    </Label>
                                  </div>
                                </div>
                                <div className="flex h-32 flex-1 space-x-2 rounded-md border border-gray-200 p-4">
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
                                        associated to a specific address.
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
                      {(field) => <field.AddressField label="Search Address" />}
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

                {/* Property Details Section */}
                <form.Subscribe selector={(state) => state.values.propertyType}>
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
                        <form.Field name="propertyUnits" mode="array">
                          {(field) => (
                            <>
                              <div className="mb-6 flex items-center justify-between">
                                <H5 className="text-lg font-semibold text-[#2D3436]">
                                  Units Information
                                </H5>
                                <Button
                                  type="button"
                                  variant="outlined"
                                  onClick={() => {
                                    field.pushValue({
                                      id: "",
                                      unitNumber: "",
                                      bedrooms: 0,
                                      bathrooms: 0,
                                      sqmt: 0,
                                      rent: 0,
                                      deposit: 0,
                                    });
                                  }}
                                >
                                  <Plus />
                                  Add Unit
                                </Button>
                              </div>
                              {field.state.value.map((unit, idx) => (
                                <div
                                  key={idx}
                                  className="mb-4 rounded-lg border border-gray-200 p-6"
                                >
                                  <div className="mb-4 flex items-center justify-between">
                                    <h3 className="flex items-center gap-2 font-semibold tracking-tight text-[#2D3436] underline">
                                      Unit {idx + 1}
                                    </h3>
                                    <Button
                                      type="button"
                                      variant="icon"
                                      className="cursor-pointers h-auto p-0 text-[#E74C3C] hover:text-[#C0392B]"
                                      onClick={() => field.removeValue(idx)}
                                      disabled={field.state.value.length === 1}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div>
                                      <form.AppField
                                        name={`propertyUnits[${idx}].unitNumber`}
                                      >
                                        {(field) => (
                                          <field.TextField
                                            label="Unit Number"
                                            type="text"
                                            icon={<Home className="h-4 w-4" />}
                                          />
                                        )}
                                      </form.AppField>
                                    </div>
                                    <div>
                                      <form.AppField
                                        name={`propertyUnits[${idx}].bedrooms`}
                                      >
                                        {(field) => (
                                          <field.TextField
                                            label="Bedrooms"
                                            type="number"
                                            icon={<Bed className="h-4 w-4" />}
                                          />
                                        )}
                                      </form.AppField>
                                    </div>
                                    <div>
                                      <form.AppField
                                        name={`propertyUnits[${idx}].bathrooms`}
                                      >
                                        {(field) => (
                                          <field.TextField
                                            label="Bathrooms"
                                            type="number"
                                            icon={<Bath className="h-4 w-4" />}
                                          />
                                        )}
                                      </form.AppField>
                                    </div>
                                    <div>
                                      <form.AppField
                                        name={`propertyUnits[${idx}].sqmt`}
                                      >
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
                                    <div>
                                      <form.AppField
                                        name={`propertyUnits[${idx}].rent`}
                                      >
                                        {(field) => (
                                          <field.TextField
                                            label="Market Rent"
                                            type="number"
                                            icon={
                                              <DollarSign className="h-4 w-4" />
                                            }
                                          />
                                        )}
                                      </form.AppField>
                                    </div>
                                    <div>
                                      <form.AppField
                                        name={`propertyUnits[${idx}].deposit`}
                                      >
                                        {(field) => (
                                          <field.TextField
                                            label="Security Deposit"
                                            type="number"
                                            icon={
                                              <DollarSign className="h-4 w-4" />
                                            }
                                          />
                                        )}
                                      </form.AppField>
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

                <Separator className="my-8" />

                <div className="mb-8">
                  <H5>Property Features and Amenities</H5>
                  <div className="mt-3">
                    <p className="mb-2 font-semibold">Features</p>
                    <form.AppField name="propertyFeatures">
                      {(field) => {
                        return (
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
                        );
                      }}
                    </form.AppField>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 font-semibold">Amenities</p>
                    <div className="flex flex-wrap gap-4">
                      <form.AppField name="propertyAmenities">
                        {(field) => {
                          return (
                            <div className="flex flex-wrap gap-4">
                              {amenities?.map((amenity) => (
                                <label key={amenity}>
                                  <Badge
                                    variant="outlined"
                                    className="border-border cursor-pointer font-semibold"
                                  >
                                    <Checkbox
                                      className="rounded-full"
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
                          );
                        }}
                      </form.AppField>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <PropertyDocumentManagementContent
                  form={form}
                  existingFiles={property.files.map((file) => ({
                    id: file.id,
                    name: file.name,
                    url: file.url,
                    type: file.type || "application/octet-stream",
                    size: file.size || 0,
                    createdAt: file.createdAt,
                  }))}
                />

                <div className="mt-4">
                  <form.FormMessage />
                </div>
              </form.AppForm>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outlined"
            onClick={() => setOpen(false)}
            disabled={isPending || uploadingFiles}
          >
            Cancel
          </Button>
          <Button
            isLoading={isPending || uploadingFiles}
            onClick={() => {
              form.handleSubmit();
            }}
          >
            <Save className="h-4 w-4" />
            Update Property
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
