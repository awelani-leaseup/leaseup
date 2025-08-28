"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { authClient } from "@/utils/auth/client";
import { upload } from "@vercel/blob/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Button } from "@leaseup/ui/components/button";
import { useAppForm } from "@leaseup/ui/components/form";
import { Separator } from "@leaseup/ui/components/separator";
import { H5 } from "@leaseup/ui/components/typography";
import { StaticMap, createStaticMapsUrl } from "@vis.gl/react-google-maps";
import { useStore } from "@tanstack/react-form";
import { api } from "@/trpc/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createPropertyFormOptions } from "./_utils";
import { BasicInformationSubForm } from "./_components/basic-information-sub-form";
import { PropertyDetailsSubForm } from "./_components/property-details-sub-form";
import { FeaturesAndAmenitiesSubForm } from "./_components/features-and-ammenities";
import { PropertyFilesSubForm } from "./_components/property-files-sub-form";

export default function CreatePropertyPage() {
  const [address, setAddress] = useState<string>("");
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;
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
    ...createPropertyFormOptions,
    onSubmit: async ({ value }) => {
      const data = { ...value, countryCode: "ZA" };
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
      const formFiles = form.getFieldValue("files") as File[] | null;

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
              "Failed to upload file(s), save property without files.",
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
        createProperty.mutateAsync(
          {
            ...data,
            name: data.propertyName,
            features: data.propertyFeatures,
            amenities: data.propertyAmenities,
            propertyType: data.propertyType as "SINGLE_UNIT" | "MULTI_UNIT",
            propertyUnits:
              data.propertyType === "SINGLE_UNIT"
                ? [propertyUnit]
                : mappedPropertyUnits,
            files,
          },
          {
            onSuccess: () => {
              router.replace("/properties");
            },
            onError: (error) => {
              console.error("Failed to create property:", error);
              // Note: Vercel Blob files are automatically cleaned up if not referenced
            },
          },
        ),
        {
          success: "Property created",
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
                      <BasicInformationSubForm form={form} />
                    </div>
                  </div>
                  <Separator className="my-8" />

                  <PropertyDetailsSubForm form={form} />

                  <Separator className="my-8" />

                  <FeaturesAndAmenitiesSubForm form={form} />

                  <Separator className="my-8" />

                  <PropertyFilesSubForm form={form} />

                  <div className="mt-4">
                    <form.FormMessage />
                  </div>

                  <div className="flex gap-4 border-t border-gray-100 pt-6">
                    <Button
                      color="secondary"
                      type="button"
                      variant="outlined"
                      onClick={() => router.replace("/properties")}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => form.handleSubmit()}
                      type="button"
                      isLoading={createProperty.isPending || uploadingFiles}
                    >
                      Create Property
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
