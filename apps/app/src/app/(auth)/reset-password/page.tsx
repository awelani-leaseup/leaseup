"use client";

import { authClient } from "@/utils/auth/client";
import { Button } from "@leaseup/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { useAppForm } from "@leaseup/ui/components/form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as v from "valibot";

const VResetPasswordSchema = v.pipe(
  v.object({
    newPassword: v.pipe(v.string(), v.nonEmpty("Please enter your password.")),
    confirmNewPassword: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [["newPassword"], ["confirmNewPassword"]],
      (input) => input.newPassword === input.confirmNewPassword,
      "The two passwords do not match.",
    ),
    ["confirmNewPassword"],
  ),
);

export default function ResetPassword() {
  const [errors, setErrors] = useState<string | undefined>(undefined);
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
    validators: {
      onSubmit: VResetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setErrors(undefined);

      const token = new URLSearchParams(window.location.search).get("token");
      console.log("token", token);
      if (!token) {
        setErrors("Invalid token");
        return;
      }

      await authClient.resetPassword(
        {
          token,
          newPassword: value.newPassword,
        },
        {
          onError: (error) => {
            setErrors(error.error.message);
          },
          onSuccess: () => {
            router.replace("/sign-in");
          },
        },
      );
    },
  });

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>
                Enter your new password below to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form.AppForm>
                <div className="flex flex-col gap-6">
                  <form.AppField name="newPassword">
                    {(field) => (
                      <field.TextField label="New Password" type="password" />
                    )}
                  </form.AppField>
                  <form.AppField name="confirmNewPassword">
                    {(field) => (
                      <field.TextField
                        label="Confirm New Password"
                        type="password"
                      />
                    )}
                  </form.AppField>
                  <div className="flex flex-col gap-3">
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => form.handleSubmit()}
                    >
                      Reset Password
                    </Button>
                    <Link href="/sign-in" className="text-sm text-gray-500">
                      <Button variant="outlined" className="w-full">
                        <ArrowLeft />
                        Back to sign in
                      </Button>
                    </Link>
                  </div>
                </div>
                <form.FormMessage>{errors}</form.FormMessage>
              </form.AppForm>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
