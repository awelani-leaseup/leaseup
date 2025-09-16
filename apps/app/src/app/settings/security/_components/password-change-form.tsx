"use client";

import { useAppForm } from "@leaseup/ui/components/form";
import { Key } from "lucide-react";
import { passwordChangeFormOptions } from "../_utils";
import toast from "react-hot-toast";
import type { PasswordChangeData } from "../_types";
import { useStore } from "@tanstack/react-form";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { authClient } from "@/utils/auth/client";

export function PasswordChangeForm() {
  const router = useRouter();
  const changePasswordMutation = api.profile.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed successfully");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to change password");
    },
  });
  const form = useAppForm({
    ...passwordChangeFormOptions,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    } as PasswordChangeData,
    onSubmit: async ({ value }) => {
      await authClient.changePassword(
        {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        },
        {
          onSuccess: () => {
            toast.success("Password changed successfully");
            router.refresh();
            form.reset();
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        },
      );
    },
  });

  const isDirty = useStore(form.store, (state) => state.isDirty);

  return (
    <form.AppForm>
      <p className="font-bold tracking-tight">Change Password</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="mt-3 grid gap-4">
          <form.AppField name="currentPassword">
            {(field) => (
              <field.TextField
                icon={<Key />}
                label="Current Password"
                type="password"
                asterisk
                description="Enter your current password"
              />
            )}
          </form.AppField>

          <form.AppField name="newPassword">
            {(field) => (
              <field.TextField
                icon={<Key />}
                label="New Password"
                type="password"
                asterisk
                description="Enter your new password (minimum 8 characters)"
              />
            )}
          </form.AppField>

          <form.AppField name="confirmPassword">
            {(field) => (
              <field.TextField
                icon={<Key />}
                label="Confirm New Password"
                type="password"
                asterisk
                description="Confirm your new password"
              />
            )}
          </form.AppField>
        </div>

        <div className="mt-6 flex justify-end">
          <form.SubmitFormButton
            disabled={!isDirty}
            isLoading={changePasswordMutation.isPending}
          >
            Change Password
          </form.SubmitFormButton>
        </div>
      </form>
    </form.AppForm>
  );
}
