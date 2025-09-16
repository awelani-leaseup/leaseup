"use client";

import { useAppForm } from "@leaseup/ui/components/form";
import { Mail } from "lucide-react";
import { emailDisplayFormOptions } from "../_utils";
import type { EmailDisplayData } from "../_types";

interface EmailDisplayFormProps {
  initialData?: {
    email?: string;
  };
}

export function EmailDisplayForm({ initialData }: EmailDisplayFormProps) {
  const form = useAppForm({
    ...emailDisplayFormOptions,
    defaultValues: {
      email: initialData?.email || "",
    } as EmailDisplayData,
    onSubmit: async () => {
      // This form is read-only, no submission needed
    },
  });

  return (
    <form.AppForm>
      <p className="font-bold tracking-tight">Account Information</p>
      <div className="mt-3 grid gap-4">
        <form.AppField name="email">
          {(field) => (
            <field.TextField
              icon={<Mail />}
              readOnly
              label="Email Address"
              disabled
              description="Your account email address cannot be changed"
            />
          )}
        </form.AppField>
      </div>
    </form.AppForm>
  );
}
