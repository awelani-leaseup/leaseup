"use client";

import { H5 } from "@leaseup/ui/components/typography";
import { Separator } from "@leaseup/ui/components/separator";
import { CheckCircle } from "lucide-react";
import { countryOptions, documentTypeOptions } from "../_constants";
import { api } from "@/trpc/react";

// Business Information Review Sub-Component
function BusinessInformationReview({ form }: { form: any }) {
  const formData = {
    businessName: form.getFieldValue("businessName") || "",
    numberOfProperties: form.getFieldValue("numberOfProperties") || 0,
    numberOfUnits: form.getFieldValue("numberOfUnits") || 0,
  };

  return (
    <div>
      <H5>Business Information</H5>
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Business Name
            </p>
            <p className="text-sm">{formData.businessName || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Number of Properties
            </p>
            <p className="text-sm">
              {formData.numberOfProperties || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Number of Units
            </p>
            <p className="text-sm">
              {formData.numberOfUnits || "Not provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Personal Information Review Sub-Component
function PersonalInformationReview({ form }: { form: any }) {
  const formData = {
    fullName: form.getFieldValue("fullName") || "",
    email: form.getFieldValue("email") || "",
    phone: form.getFieldValue("phone") || "",
  };

  return (
    <div>
      <H5>Personal Information</H5>
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Full Name
            </p>
            <p className="text-sm">{formData.fullName || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Email</p>
            <p className="text-sm">{formData.email || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Phone</p>
            <p className="text-sm">{formData.phone || "Not provided"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Address Information Review Sub-Component
function AddressInformationReview({ form }: { form: any }) {
  const formData = {
    addressLine1: form.getFieldValue("addressLine1") || "",
    addressLine2: form.getFieldValue("addressLine2") || "",
    city: form.getFieldValue("city") || "",
    state: form.getFieldValue("state") || "",
    zip: form.getFieldValue("zip") || "",
    countryCode: form.getFieldValue("countryCode") || "",
  };

  const getCountryName = (countryCode: string) => {
    const country = countryOptions.find(
      (country) => country.id === countryCode,
    );
    return country ? country.label : countryCode;
  };

  return (
    <div>
      <H5>Address Information</H5>
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Address Line 1
            </p>
            <p className="text-sm">{formData.addressLine1 || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Address Line 2
            </p>
            <p className="text-sm">{formData.addressLine2 || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">City</p>
            <p className="text-sm">{formData.city || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              State/Province
            </p>
            <p className="text-sm">{formData.state || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              ZIP/Postal Code
            </p>
            <p className="text-sm">{formData.zip || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Country</p>
            <p className="text-sm">
              {formData.countryCode
                ? getCountryName(formData.countryCode)
                : "Not provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Banking and Document Information Review Sub-Component
function BankingDocumentInformationReview({ form }: { form: any }) {
  const { data: banks } = api.onboarding.getAllBanks.useQuery();
  const formData = {
    documentType: form.getFieldValue("documentType") || "",
    idNumber: form.getFieldValue("idNumber") || "",
    bankCode: form.getFieldValue("bankCode") || "",
    accountNumber: form.getFieldValue("accountNumber") || "",
  };

  const getBankName = (bankCode: string) => {
    const bank = banks?.find((bank) => bank.code === bankCode);
    return bank ? bank.name : bankCode;
  };

  const getDocumentTypeName = (documentType: string) => {
    const docType = documentTypeOptions.find((doc) => doc.id === documentType);
    return docType ? docType.label : documentType;
  };

  return (
    <div>
      {/* Document Verification */}
      <div>
        <H5>Document Verification</H5>
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Document Type
              </p>
              <p className="text-sm">
                {formData.documentType
                  ? getDocumentTypeName(formData.documentType)
                  : "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                ID Number
              </p>
              <p className="text-sm">{formData.idNumber || "Not provided"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Banking Information */}
      <div>
        <H5>Banking Information</H5>
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Bank</p>
              <p className="text-sm">
                {formData.bankCode
                  ? getBankName(formData.bankCode)
                  : "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Account Number
              </p>
              <p className="text-sm">
                {formData.accountNumber
                  ? `****${formData.accountNumber.slice(-4)}`
                  : "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReviewSubmitStepProps {
  form: any;
}

export function ReviewSubmitStep({ form }: ReviewSubmitStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <H5>Review Your Information</H5>
        <p className="text-muted-foreground mt-1 text-sm">
          Please review all the information below before submitting your
          onboarding application.
        </p>
      </div>

      <BusinessInformationReview form={form} />
      <PersonalInformationReview form={form} />
      <AddressInformationReview form={form} />
      <BankingDocumentInformationReview form={form} />

      <Separator />

      {/* Terms and Conditions */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
          <div className="text-sm text-gray-700">
            <p className="font-medium">Terms and Conditions</p>
            <p className="mt-1">
              By submitting this form, you agree to our{" "}
              <a
                href="/terms-of-service"
                className="text-blue-600 hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy-policy"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </a>
              . Your information will be used to set up your account and provide
              our services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
