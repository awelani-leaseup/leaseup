"use client";

import { useAppForm } from "@leaseup/ui/components/form";
import { businessInfoFormOptions } from "../_utils";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import type { BusinessInfoData } from "../_types";
import { useStore } from "@tanstack/react-form";
import { useRouter } from "next/navigation";

interface BusinessInfoFormProps {
  initialData?: {
    businessName?: string;
    numberOfProperties?: number;
    numberOfUnits?: number;
  };
}

export function BusinessInfoForm({ initialData }: BusinessInfoFormProps) {
  const router = useRouter();
  const form = useAppForm({
    ...businessInfoFormOptions,
    defaultValues: {
      businessName: initialData?.businessName || "",
      numberOfProperties: initialData?.numberOfProperties || 0,
      numberOfUnits: initialData?.numberOfUnits || 0,
    } as BusinessInfoData,
    onSubmit: async ({ value }) => {
      await updateBusinessInfoMutation.mutateAsync({
        businessName: value.businessName,
        numberOfProperties: value.numberOfProperties,
        numberOfUnits: value.numberOfUnits,
      });
    },
  });

  const updateBusinessInfoMutation = api.profile.updateBusinessInfo.useMutation(
    {
      onSuccess: () => {
        toast.success("Business information updated");
        router.refresh();
        form.reset();
      },
      onError: () => {
        toast.error("Failed to update business information");
      },
    },
  );

  const isDirty = useStore(form.store, (state) => state.isDirty);

  return (
    <form.AppForm>
      <p className="font-bold tracking-tight">Business Information</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <form.AppField name="businessName">
            {(field) => (
              <field.TextField
                asterisk
                label="Business Name"
                description="Enter your name or business name"
              />
            )}
          </form.AppField>

          <form.AppField name="numberOfProperties">
            {(field) => (
              <field.TextField
                asterisk
                label="Number of Properties"
                type="number"
              />
            )}
          </form.AppField>

          <form.AppField name="numberOfUnits">
            {(field) => (
              <field.TextField asterisk label="Number of Units" type="number" />
            )}
          </form.AppField>
        </div>

        <div className="mt-6 flex justify-end">
          <form.SubmitFormButton
            isLoading={updateBusinessInfoMutation.isPending}
            disabled={!isDirty}
          >
            Save Changes
          </form.SubmitFormButton>
        </div>
      </form>
    </form.AppForm>
  );
}
