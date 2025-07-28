"use client";

import { H5 } from "@leaseup/ui/components/typography";
import { Separator } from "@leaseup/ui/components/separator";
import { authClient } from "@/utils/auth/client";
import { useEffect } from "react";
import { Phone, User, MapPin } from "lucide-react";
import { countryOptions } from "../_constants";

// Business Information Sub-Component
function BusinessInformationForm({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="col-span-full">
        <H5>Business Information</H5>
      </div>

      <form.AppField name="businessName">
        {(field: any) => (
          <field.TextField
            asterisk
            label="Business Name"
            description="Enter your name or business name"
          />
        )}
      </form.AppField>
      <form.AppField name="numberOfProperties">
        {(field: any) => (
          <field.TextField
            asterisk
            label="Number of Properties"
            type="number"
          />
        )}
      </form.AppField>
      <form.AppField name="numberOfUnits">
        {(field: any) => (
          <field.TextField asterisk label="Number of Units" type="number" />
        )}
      </form.AppField>
    </div>
  );
}

// Personal Information Sub-Component
function PersonalInformationForm({ form }: { form: any }) {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      form.setFieldValue("email", session.user.email);
      if (session.user.name) {
        form.setFieldValue("fullName", session.user.name);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="col-span-full">
        <H5>Personal Information</H5>
      </div>

      <form.AppField name="fullName">
        {(field: any) => (
          <field.TextField
            icon={<User />}
            asterisk
            label="Full Name"
            description="Enter your full legal name"
          />
        )}
      </form.AppField>
      <form.AppField name="email">
        {(field: any) => (
          <field.TextField readOnly asterisk label="Email" disabled />
        )}
      </form.AppField>
      <form.AppField name="phone">
        {(field: any) => (
          <field.TextField
            icon={<Phone />}
            label="Phone"
            asterisk
            type="tel"
            description="Enter your primary phone number"
          />
        )}
      </form.AppField>
    </div>
  );
}

// Address Information Sub-Component
function AddressInformationForm({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="col-span-full">
        <H5>Address Information</H5>
      </div>

      <form.AppField name="addressLine1">
        {(field: any) => (
          <field.TextField
            icon={<MapPin />}
            asterisk
            label="Address Line 1"
            description="Street address, P.O. box, company name, c/o"
          />
        )}
      </form.AppField>
      <form.AppField name="addressLine2">
        {(field: any) => (
          <field.TextField
            label="Address Line 2"
            description="Apartment, suite, unit, building, floor, etc."
          />
        )}
      </form.AppField>
      <form.AppField name="city">
        {(field: any) => <field.TextField asterisk label="City" />}
      </form.AppField>
      <form.AppField name="state">
        {(field: any) => <field.TextField asterisk label="State/Province" />}
      </form.AppField>
      <form.AppField name="zip">
        {(field: any) => <field.TextField asterisk label="ZIP/Postal Code" />}
      </form.AppField>
      <form.AppField name="countryCode">
        {(field: any) => (
          <field.SelectField
            asterisk
            label="Country"
            placeholder="Select country"
            options={countryOptions}
          />
        )}
      </form.AppField>
    </div>
  );
}

interface BasicInfoStepProps {
  form: any;
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  return (
    <div>
      <BusinessInformationForm form={form} />
      <Separator className="my-4" />
      <PersonalInformationForm form={form} />
      <Separator className="my-4" />
      <AddressInformationForm form={form} />
    </div>
  );
}
