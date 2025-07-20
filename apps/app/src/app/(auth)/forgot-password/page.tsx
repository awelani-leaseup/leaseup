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
import { useState } from "react";
import * as v from "valibot";

const VForgotPasswordSchema = v.object({
  email: v.pipe(v.string(), v.email("Invalid email address")),
});

export default function ForgotPassword() {
  const [errors, setErrors] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<boolean>(false);

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: VForgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setErrors(undefined);
      await authClient.requestPasswordReset(
        {
          email: value.email,
          redirectTo: "/reset-password",
        },
        {
          onError: () => {
            setErrors("Failed to send reset link");
          },
          onSuccess: () => {
            setSuccess(true);
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
              <CardTitle>Forgot your password?</CardTitle>
              <CardDescription>
                We&apos;ll send you an email to reset your password if you have
                an account with us.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <>
                  <p>
                    We&apos;ve sent you a link to reset your password. Please
                    check your email.
                  </p>
                  <Link href="/sign-in">
                    <Button className="mt-4 w-full">
                      <ArrowLeft />
                      Back to sign in
                    </Button>
                  </Link>
                </>
              ) : (
                <form.AppForm>
                  <div className="flex flex-col gap-6">
                    <form.AppField name="email">
                      {(field) => <field.TextField label="Email" />}
                    </form.AppField>
                    <div className="flex flex-col gap-3">
                      <Button
                        type="button"
                        className="w-full"
                        onClick={() => form.handleSubmit()}
                      >
                        Send Reset Link
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
