"use client";

import { H5 } from "@leaseup/ui/components/typography";
import { Separator } from "@leaseup/ui/components/separator";
import { FileText, Info } from "lucide-react";
import { bankOptions, documentTypeOptions } from "../_constants";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@leaseup/ui/components/alert";

// Banking Information Sub-Component
function BankingInformationForm({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="col-span-full">
        <H5>Banking Information</H5>
        <p className="text-muted-foreground mt-1 text-sm">
          This information is required for payment processing and account
          verification.
        </p>
      </div>

      <form.AppField name="bankCode">
        {(field: any) => (
          <field.SelectField
            asterisk
            label="Bank"
            placeholder="Select your bank"
            options={bankOptions}
            description="Select your bank from the list"
          />
        )}
      </form.AppField>

      <form.AppField name="accountNumber">
        {(field: any) => (
          <field.TextField
            asterisk
            label="Account Number"
            type="text"
            placeholder="Enter your account number"
            description="Enter your 10-digit account number"
            maxLength={10}
          />
        )}
      </form.AppField>
    </div>
  );
}

// Document Verification Sub-Component
function DocumentVerificationForm({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="col-span-full">
        <H5>Document Verification</H5>
        <p className="text-muted-foreground mt-1 text-sm">
          Provide your identification document for account verification.
        </p>
      </div>

      <form.AppField name="documentType">
        {(field: any) => (
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
        {(field: any) => (
          <field.TextField
            icon={<FileText />}
            asterisk
            label="ID Number"
            description="Enter the ID number from your selected document"
          />
        )}
      </form.AppField>
    </div>
  );
}

interface BankingDetailsStepProps {
  form: any;
}

export function BankingDetailsStep({ form }: BankingDetailsStepProps) {
  return (
    <div className="space-y-8">
      <BankingInformationForm form={form} />
      <Separator className="my-8" />
      <DocumentVerificationForm form={form} />

      <Alert className="border-blue-200 bg-blue-100 text-blue-800">
        <Info className="h-4 w-4" />
        <AlertTitle>Banking Information Security</AlertTitle>
        <AlertDescription className="mt-2 text-sm text-blue-700">
          Your banking information is encrypted and securely stored. We use this
          information solely for payment processing and account verification
          purposes. We never store your full banking credentials and follow
          industry-standard security practices.
        </AlertDescription>
      </Alert>
    </div>
  );
}
