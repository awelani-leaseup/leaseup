import { withForm } from "@leaseup/ui/components/form";
import { createTenantFormOptions } from "../_utils";
import { Mail, Upload, X, Phone, User } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avataar";
import { Label } from "@leaseup/ui/components/label";
import { useRef } from "react";
import { Button } from "@leaseup/ui/components/button";

export const PersonalInformation = withForm({
  ...createTenantFormOptions,
  render: ({ form }) => {
    const avataarInputRef = useRef<HTMLInputElement>(null);
    return (
      <>
        <form.AppField name="avataar">
          {(field) => (
            <div className="col-span-full">
              <input
                accept="image/*"
                className="hidden"
                type="file"
                ref={avataarInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    field.handleChange(file);
                  }
                }}
              />
              <Label>Tenant Image</Label>
              <div className="flex items-center gap-4">
                <Avatar className="mt-2 size-20 rounded">
                  <AvatarImage
                    src={
                      field.state.value
                        ? URL?.createObjectURL(field.state.value)
                        : undefined
                    }
                  />
                  <AvatarFallback className="size-20 rounded">
                    <User />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outlined"
                    onClick={() => {
                      avataarInputRef.current?.click();
                    }}
                  >
                    <Upload />
                    Upload
                  </Button>
                  <Button
                    size="sm"
                    variant="soft"
                    color="destructive"
                    disabled={!field.state.value}
                    onClick={() => {
                      field.handleChange(null);
                    }}
                  >
                    <X />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form.AppField>
        <form.AppField name="firstName">
          {(field) => <field.TextField label="First name" asterisk />}
        </form.AppField>
        <form.AppField name="lastName">
          {(field) => <field.TextField label="Last name" asterisk />}
        </form.AppField>
        <form.AppField name="dateOfBirth">
          {(field) => <field.DateField label="Date of birth" mode="single" />}
        </form.AppField>
        <form.AppField name="primaryEmail">
          {(field) => (
            <field.TextField
              icon={<Mail />}
              label="Email"
              asterisk
              type="email"
            />
          )}
        </form.AppField>
        <form.AppField name="primaryPhoneNumber">
          {(field) => (
            <field.TextField
              icon={<Phone />}
              label="Phone"
              asterisk
              type="tel"
            />
          )}
        </form.AppField>
      </>
    );
  },
});
