"use client";

import { Button } from "@leaseup/ui/components/button";
import { H5 } from "@leaseup/ui/components/typography";
import { api } from "@/trpc/react";
import { VBankingInfoInput } from "../../../../../../../packages/trpc/src/routers/profile.types";
import { documentTypeOptions } from "@/app/(main)/onboarding/_constants";
import toast from "react-hot-toast";
import { useAppForm } from "@leaseup/ui/components/form";
import { useStore } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@leaseup/ui/components/alert";
import { CircleAlert } from "lucide-react";
import { Separator } from "@leaseup/ui/components/separator";

interface BankingInfoFormProps {
  initialData?: {
    bankCode?: string;
    accountNumber?: string;
    documentType?: string;
    idNumber?: string;
  };
}

export function BankingInfoForm({ initialData }: BankingInfoFormProps) {
  const { data: banks } = api.profile.getAllBanks.useQuery();
  const router = useRouter();
  const updateBankingInfo = api.profile.updateBankingInfo.useMutation({
    onSuccess: () => {
      toast.success("Banking information updated");
      router.refresh();
      form.reset();
    },
    onError: () => {
      toast.error("Failed to update banking information");
    },
  });

  const form = useAppForm({
    defaultValues: {
      bankCode: initialData?.bankCode?.toString() || "",
      accountNumber: initialData?.accountNumber || "",
      documentType: initialData?.documentType || "",
      idNumber: initialData?.idNumber || "",
    },
    validators: {
      onChange: VBankingInfoInput,
    },
    onSubmit: async ({ value }) => {
      updateBankingInfo.mutate(value);
    },
  });

  const isDirty = useStore(form.store, (state) => state.isDirty);

  return (
    <div className="space-y-6">
      <div>
        <H5>Banking Information</H5>
        <p className="text-muted-foreground mt-1 text-sm">
          Update your banking details for payment processing and account
          verification.
        </p>
      </div>

      <Alert>
        <CircleAlert className="stroke-1" />
        <AlertTitle>Banking Information Security</AlertTitle>
        <AlertDescription>
          Your banking information is encrypted and securely stored. We use this
          information solely for payment processing and along with your ID
          number for account verification purposes. We never store your full
          banking credentials and follow industry-standard security practices.
        </AlertDescription>
      </Alert>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <form.AppField name="bankCode">
            {(field) => (
              <field.ComboboxField
                label="Bank"
                placeholder="Select your bank"
                asterisk
                description="Select your bank from the list"
                options={
                  banks?.map(
                    (bank: { id: string; code: string; name: string }) => ({
                      id: bank.id.toString(),
                      label: bank.name,
                    }),
                  ) || []
                }
              />
            )}
          </form.AppField>

          <form.AppField name="accountNumber">
            {(field) => (
              <field.TextField
                asterisk
                label="Account Number"
                type="text"
                placeholder="Enter your account number"
                description="Enter your 10-digit account number"
              />
            )}
          </form.AppField>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <form.AppField name="documentType">
            {(field) => (
              <field.SelectField
                asterisk
                label="Document Type"
                placeholder="Select document type"
                options={documentTypeOptions}
                description="Select the type of identification document"
              />
            )}
          </form.AppField>

          <form.AppField name="idNumber">
            {(field) => (
              <field.TextField
                asterisk
                label="ID Number"
                placeholder="Enter your ID number"
                description="Enter the ID number from your selected document"
              />
            )}
          </form.AppField>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            isLoading={updateBankingInfo.isPending}
            disabled={!isDirty}
          >
            {updateBankingInfo.isPending
              ? "Updating..."
              : "Update Banking Information"}
          </Button>
        </div>
      </form>
    </div>
  );
}
