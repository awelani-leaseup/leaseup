"use client";

import { H5 } from "@leaseup/ui/components/typography";
import { Separator } from "@leaseup/ui/components/separator";
import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from "@leaseup/ui/components/description-list";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@leaseup/ui/components/alert";
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
      <div className="mt-4 grid grid-cols-2">
        <div>
          <DescriptionList>
            <DescriptionTerm>Business Name</DescriptionTerm>
            <DescriptionDetails>
              {formData.businessName || "Not provided"}
            </DescriptionDetails>

            <DescriptionTerm>Number of Properties</DescriptionTerm>
            <DescriptionDetails>
              {formData.numberOfProperties || "Not provided"}
            </DescriptionDetails>
          </DescriptionList>
        </div>
        <div>
          <DescriptionList>
            <DescriptionTerm>Number of Units</DescriptionTerm>
            <DescriptionDetails>
              {formData.numberOfUnits || "Not provided"}
            </DescriptionDetails>
          </DescriptionList>
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
      <div className="mt-4 grid grid-cols-2">
        <div>
          <DescriptionList>
            <DescriptionTerm>Full Name</DescriptionTerm>
            <DescriptionDetails>
              {formData.fullName || "Not provided"}
            </DescriptionDetails>

            <DescriptionTerm>Email</DescriptionTerm>
            <DescriptionDetails>
              {formData.email || "Not provided"}
            </DescriptionDetails>
          </DescriptionList>
        </div>
        <div>
          <DescriptionList>
            <DescriptionTerm>Phone</DescriptionTerm>
            <DescriptionDetails>
              {formData.phone || "Not provided"}
            </DescriptionDetails>
          </DescriptionList>
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
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <DescriptionList>
            <DescriptionTerm>Address Line 1</DescriptionTerm>
            <DescriptionDetails>
              {formData.addressLine1 || "Not provided"}
            </DescriptionDetails>

            <DescriptionTerm>Address Line 2</DescriptionTerm>
            <DescriptionDetails>
              {formData.addressLine2 || "Not provided"}
            </DescriptionDetails>

            <DescriptionTerm>City</DescriptionTerm>
            <DescriptionDetails>
              {formData.city || "Not provided"}
            </DescriptionDetails>
          </DescriptionList>
        </div>
        <div>
          <DescriptionList>
            <DescriptionTerm>State/Province</DescriptionTerm>
            <DescriptionDetails>
              {formData.state || "Not provided"}
            </DescriptionDetails>

            <DescriptionTerm>ZIP/Postal Code</DescriptionTerm>
            <DescriptionDetails>
              {formData.zip || "Not provided"}
            </DescriptionDetails>

            <DescriptionTerm>Country</DescriptionTerm>
            <DescriptionDetails>
              {formData.countryCode
                ? getCountryName(formData.countryCode)
                : "Not provided"}
            </DescriptionDetails>
          </DescriptionList>
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
        <div className="mt-4 grid grid-cols-2 gap-4">
          <DescriptionList>
            <DescriptionTerm>Document Type</DescriptionTerm>
            <DescriptionDetails>
              {formData.documentType
                ? getDocumentTypeName(formData.documentType)
                : "Not provided"}
            </DescriptionDetails>
          </DescriptionList>
          <DescriptionList>
            <DescriptionTerm>ID Number</DescriptionTerm>
            <DescriptionDetails>
              {formData.idNumber || "Not provided"}
            </DescriptionDetails>
          </DescriptionList>
        </div>
      </div>

      <div>
        <H5>Banking Information</H5>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <DescriptionList>
            <DescriptionTerm>Bank</DescriptionTerm>
            <DescriptionDetails>
              {formData.bankCode
                ? getBankName(formData.bankCode)
                : "Not provided"}
            </DescriptionDetails>
          </DescriptionList>
          <DescriptionList>
            <DescriptionTerm>Account Number</DescriptionTerm>
            <DescriptionDetails>
              {formData.accountNumber
                ? `****${formData.accountNumber.slice(-4)}`
                : "Not provided"}
            </DescriptionDetails>
          </DescriptionList>
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
      <Separator />
      <PersonalInformationReview form={form} />
      <Separator />
      <AddressInformationReview form={form} />
      <Separator />
      <BankingDocumentInformationReview form={form} />

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Terms and Conditions</AlertTitle>
        <AlertDescription>
          By submitting this form, you agree to our Terms of Service and Privacy
          Policy. Your information will be used to set up your account and
          provide our services.
        </AlertDescription>
      </Alert>
    </div>
  );
}
