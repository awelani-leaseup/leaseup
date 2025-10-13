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
import Image from "next/image";
import { Separator } from "@leaseup/ui/components/separator";

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
  const [status, setStatus] = useState<"loading" | "error" | "success" | null>(
    null,
  );
  const [error, setError] = useState<string | undefined>(undefined);
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

  const handleGoogleSignIn = async () => {
    setStatus("loading");
    await authClient.signIn.social(
      {
        provider: "google",
      },
      {
        onError: (error) => {
          setError(error.error.message);
          setStatus("error");
        },
        onRequest: () => {
          setStatus("loading");
        },
      },
    );
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <Image
                className="mb-4 h-10 w-10 rounded-lg"
                src="/leaseup-logo.svg"
                alt="LeaseUp"
                width={10}
                height={10}
              />
              <CardTitle>Register your account</CardTitle>
              <CardDescription>
                Enter your details below to create an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form.AppForm>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      isLoading={status === "loading"}
                    >
                      <GoogleIcon />
                      Continue with Google
                    </Button>
                    <div className="relative flex items-center justify-center">
                      <Separator className="my-4" />
                      <span className="text-muted-foreground absolute bg-white px-2 text-sm">
                        Or
                      </span>
                    </div>
                  </div>
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
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => form.handleSubmit()}
                  >
                    Register
                  </Button>
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
                  <a
                    href="https://leaseup.co.za/terms-of-service"
                    className="underline underline-offset-4"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://leaseup.co.za/privacy-policy"
                    className="underline underline-offset-4"
                  >
                    Privacy Policy
                  </a>
                </p>
              </form.AppForm>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={800}
      height={800}
      preserveAspectRatio="xMidYMid"
      viewBox="-3 0 262 262"
      {...props}
    >
      <path
        fill="#4285F4"
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
      />
      <path
        fill="#34A853"
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
      />
      <path
        fill="#FBBC05"
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
      />
      <path
        fill="#EB4335"
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
      />
    </svg>
  );
};
