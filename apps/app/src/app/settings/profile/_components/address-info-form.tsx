"use client";

import { useAppForm } from "@leaseup/ui/components/form";
import { MapPin } from "lucide-react";
import { addressInfoFormOptions } from "../_utils";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import type { AddressInfoData } from "../_types";
import { useRouter } from "next/navigation";
import { useStore } from "@tanstack/react-form";

const countryOptions = [{ id: "ZA", label: "South Africa" }];

interface AddressInfoFormProps {
  initialData?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zip?: string;
    countryCode?: string;
  };
}

export function AddressInfoForm({ initialData }: AddressInfoFormProps) {
  const router = useRouter();

  const updateAddressInfoMutation = api.profile.updateAddressInfo.useMutation({
    onSuccess: () => {
      toast.success("Address information updated");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to update address information");
    },
  });

  const form = useAppForm({
    ...addressInfoFormOptions,
    defaultValues: {
      addressLine1: initialData?.addressLine1 || "",
      addressLine2: initialData?.addressLine2 || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      zip: initialData?.zip || "",
      countryCode: initialData?.countryCode || "",
    } as AddressInfoData,
    onSubmit: async ({ value }) => {
      await updateAddressInfoMutation.mutateAsync({
        addressLine1: value.addressLine1,
        addressLine2: value.addressLine2,
        city: value.city,
        state: value.state,
        zip: value.zip,
        countryCode: value.countryCode,
      });
    },
  });

  const isDirty = useStore(form.store, (state) => state.isDirty);

  return (
    <form.AppForm>
      <p className="font-bold tracking-tight">Address Information</p>
      <form.AppForm>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <form.AppField name="addressLine1">
              {(field) => (
                <field.TextField
                  icon={<MapPin />}
                  asterisk
                  label="Address Line 1"
                  description="Street address, P.O. box, company name, c/o"
                />
              )}
            </form.AppField>

            <form.AppField name="addressLine2">
              {(field) => (
                <field.TextField
                  label="Address Line 2"
                  description="Apartment, suite, unit, building, floor, etc."
                />
              )}
            </form.AppField>

            <form.AppField name="city">
              {(field) => <field.TextField asterisk label="City" />}
            </form.AppField>

            <form.AppField name="state">
              {(field) => <field.TextField asterisk label="State/Province" />}
            </form.AppField>

            <form.AppField name="zip">
              {(field) => <field.TextField asterisk label="ZIP/Postal Code" />}
            </form.AppField>

            <form.AppField name="countryCode">
              {(field) => (
                <field.SelectField
                  asterisk
                  label="Country"
                  placeholder="Select country"
                  options={countryOptions}
                />
              )}
            </form.AppField>
          </div>

          <div className="mt-6 flex justify-end">
            <form.SubmitFormButton
              isLoading={updateAddressInfoMutation.isPending}
              disabled={!isDirty}
            >
              Save Changes
            </form.SubmitFormButton>
          </div>
        </form>
      </form.AppForm>
    </form.AppForm>
  );
}
