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
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as v from "valibot";

const VSignUpSchema = v.pipe(
  v.object({
    fullName: v.pipe(v.string(), v.minLength(1, "Full name is required")),
    email: v.pipe(v.string(), v.email("Invalid email address")),
    password: v.pipe(v.string(), v.nonEmpty("Please enter your password.")),
    confirmPassword: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["confirmPassword"]],
      (input) => input.password === input.confirmPassword,
      "The two passwords do not match.",
    ),
    ["confirmPassword"],
  ),
);

export default function SignUp() {
  const [errors, setErrors] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: VSignUpSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          name: value.fullName,
          email: value.email,
          password: value.password,
        },
        {
          onError: (error) => {
            setErrors(error.error.message);
          },
          onSuccess: () => {
            router.replace("/onboarding");
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
              <CardTitle>Register your account</CardTitle>
              <CardDescription>
                Enter your details below to create an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form.AppForm>
                <div className="flex flex-col gap-6">
                  <form.AppField name="fullName">
                    {(field) => <field.TextField label="Full Name" />}
                  </form.AppField>
                  <form.AppField name="email">
                    {(field) => <field.TextField label="Email" />}
                  </form.AppField>
                  <form.AppField name="password">
                    {(field) => (
                      <div className="relative">
                        <field.TextField
                          type={showPassword ? "text" : "password"}
                          label="Password"
                          autoComplete="new-password"
                          asterisk
                        />
                        {showPassword ? (
                          <button
                            className="absolute top-9.5 right-2 -translate-y-1/2"
                            onClick={() => setShowPassword(false)}
                          >
                            <Eye className="size-4" />
                          </button>
                        ) : (
                          <button
                            className="absolute top-9.5 right-2 -translate-y-1/2"
                            onClick={() => setShowPassword(true)}
                          >
                            <EyeOff className="size-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </form.AppField>
                  <form.AppField name="confirmPassword">
                    {(field) => (
                      <div className="relative">
                        <field.TextField
                          type={showPassword ? "text" : "password"}
                          label="Confirm Password"
                          autoComplete="new-password"
                          asterisk
                        />
                        {showPassword ? (
                          <button
                            className="absolute top-9.5 right-2 -translate-y-1/2"
                            onClick={() => setShowPassword(false)}
                          >
                            <Eye className="size-4" />
                          </button>
                        ) : (
                          <button
                            className="absolute top-9.5 right-2 -translate-y-1/2"
                            onClick={() => setShowPassword(true)}
                          >
                            <EyeOff className="size-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </form.AppField>
                  <div className="flex flex-col gap-3">
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => form.handleSubmit()}
                    >
                      Register
                    </Button>
                  </div>
                </div>
                <form.FormMessage>{errors}</form.FormMessage>
                <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </div>
                <p className="text-muted-foreground mt-4 text-center text-sm">
                  By signing using our service, you agree to our{" "}
                  <Link href="/terms" className="underline underline-offset-4">
                    Terms of Service
                  </Link>{" "}
                  and Data Processing Agreement
                </p>
              </form.AppForm>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
