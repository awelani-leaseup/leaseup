"use client";

import { useAppForm } from "@leaseup/ui/components/form";
import { User, Phone } from "lucide-react";
import { personalInfoFormOptions } from "../_utils";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import type { PersonalInfoData } from "../_types";
import { useStore } from "@tanstack/react-form";
import { useRouter } from "next/navigation";

interface PersonalInfoFormProps {
  initialData?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
}

export function PersonalInfoForm({ initialData }: PersonalInfoFormProps) {
  const router = useRouter();
  const form = useAppForm({
    ...personalInfoFormOptions,
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
    } as PersonalInfoData,
    onSubmit: async ({ value }) => {
      await updatePersonalInfoMutation.mutateAsync({
        fullName: value.fullName,
        phone: value.phone,
      });
    },
  });

  const updatePersonalInfoMutation = api.profile.updatePersonalInfo.useMutation(
    {
      onSuccess: () => {
        toast.success("Personal information updated");
        router.refresh();
        form.reset();
      },
      onError: () => {
        toast.error("Failed to update personal information");
      },
    },
  );

  const isDirty = useStore(form.store, (state) => state.isDirty);

  return (
    <form.AppForm>
      <p className="font-bold tracking-tight">Personal Information</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <form.AppField name="fullName">
            {(field) => (
              <field.TextField
                icon={<User />}
                asterisk
                label="Full Name"
                description="Enter your full legal name"
              />
            )}
          </form.AppField>

          <form.AppField name="email">
            {(field) => (
              <field.TextField
                readOnly
                asterisk
                label="Email"
                disabled
                description="Email cannot be changed"
              />
            )}
          </form.AppField>

          <form.AppField name="phone">
            {(field) => (
              <field.TextField
                icon={<Phone />}
                label="Phone"
                asterisk
                type="tel"
                description="Enter your primary phone number"
              />
            )}
          </form.AppField>
        </div>

        <div className="mt-6 flex justify-end">
          <form.SubmitFormButton
            disabled={!isDirty}
            isLoading={updatePersonalInfoMutation.isPending}
          >
            Save Changes
          </form.SubmitFormButton>
        </div>
      </form>
    </form.AppForm>
  );
}
