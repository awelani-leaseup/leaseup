"use client";

import { Button } from "@leaseup/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@leaseup/ui/components/card";
import { authClient } from "@/utils/auth/client";
import { ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useSendVerificationEmailMutation = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      await authClient.sendVerificationEmail({
        email: email,
      });
    },
  });
};

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const { mutate, isPending } = useSendVerificationEmailMutation();

  const handleResendVerificationEmail = async () => {
    mutate(email as string, {
      onSuccess: () => {
        toast.success("Verification email sent");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xl">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Verify Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We&apos;ve sent you a verification email to{" "}
                <span className="font-bold underline">{email}</span>. Please
                check your email and click the link to verify your email
                address.
              </p>
              <p>
                If you didn&apos;t receive the email, you can resend it by
                clicking the button below.
              </p>
              <Button
                className="mt-4 w-full"
                disabled={!email}
                isLoading={isPending}
                onClick={() => handleResendVerificationEmail()}
              >
                <ArrowRight />
                Resend verification email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
