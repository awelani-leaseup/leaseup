"use client";

import { Button } from "@leaseup/ui/components/button";
import { useAppForm, withForm } from "@leaseup/ui/components/form";
import { Save, Plus, Trash, Mail, Upload, X, Phone, User } from "lucide-react";
import { Separator } from "@leaseup/ui/components/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@leaseup/ui/components/dialog";
import { formOptions } from "@tanstack/react-form";
import * as v from "valibot";

const VEditTenantFormSchema = v.object({
  avatarUrl: v.nullable(v.string()),
  firstName: v.pipe(v.string(), v.minLength(1, "First name is required")),
  lastName: v.pipe(v.string(), v.minLength(1, "Last name is required")),
  dateOfBirth: v.pipe(v.date("Date of birth is required")),
  primaryEmail: v.pipe(v.string(), v.email("Invalid Email")),
  primaryPhoneNumber: v.pipe(
    v.string(),
    v.minLength(1, "Phone number is required"),
  ),
  additionalEmails: v.array(v.pipe(v.string(), v.email("Invalid Email"))),
  additionalPhones: v.array(
    v.pipe(v.string(), v.minLength(1, "Phone Number is required")),
  ),
  emergencyContacts: v.array(
    v.object({
      fullName: v.pipe(v.string(), v.minLength(1, "Full Name is required")),
      email: v.pipe(v.string(), v.email("Invalid Email")),
      phoneNumber: v.pipe(
        v.string(),
        v.minLength(1, "Phone number is required"),
      ),
      relationship: v.string(),
    }),
  ),
  vehicles: v.array(
    v.object({
      make: v.pipe(v.string(), v.minLength(1, "Make is required"), v.trim()),
      model: v.string(),
      year: v.string(),
      color: v.string(),
      licensePlate: v.string(),
    }),
  ),
});
import { Label } from "@leaseup/ui/components/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avatar";
import { useFileUpload } from "@/hooks/use-file-upload";
import { upload } from "@vercel/blob/client";
import { nanoid } from "nanoid";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { authClient } from "@/utils/auth/client";
import { getUploadFileExtension } from "@/utils/file-utils";

const editTenantFormOptions = formOptions({
  defaultValues: {
    avatarUrl: null as string | null,
    firstName: "",
    lastName: "",
    dateOfBirth: new Date(),
    primaryPhoneNumber: "",
    primaryEmail: "",
    additionalEmails: [] as v.InferInput<
      typeof VEditTenantFormSchema
    >["additionalEmails"],
    additionalPhones: [] as v.InferInput<
      typeof VEditTenantFormSchema
    >["additionalPhones"],
    emergencyContacts: [] as v.InferInput<
      typeof VEditTenantFormSchema
    >["emergencyContacts"],
    vehicles: [] as v.InferInput<typeof VEditTenantFormSchema>["vehicles"],
  },
  validators: { onSubmit: VEditTenantFormSchema },
  onSubmit: () => {
    // This will be overridden in the component
  },
});

// Edit form components
const EditPersonalInformation = withForm({
  ...editTenantFormOptions,
  render: function EditPersonalInformation({ form }) {
    const { data: session } = authClient.useSession();
    const user = session?.user;
    const [{ files }, { removeFile, openFileDialog, getInputProps }] =
      useFileUpload({
        accept: "image/*",
        maxSize: 10 * 1024 * 1024,
        onFilesAdded: async (addedFiles) => {
          const avatar = addedFiles[0]?.file as File;

          if (!avatar) return;

          const fileExtension = getUploadFileExtension(avatar);

          try {
            const newBlob = await upload(
              `${user?.id}/${nanoid(21)}.${fileExtension}`,
              avatar,
              {
                access: "public",
                handleUploadUrl: "/api/file/upload",
                onUploadProgress: (progress) => {
                  console.log("Avatar upload progress", progress);
                },
              },
            );

            form.setFieldValue("avatarUrl", newBlob.url);
          } catch (error) {
            console.error("Avatar upload failed:", error);
          }
        },
      });

    const previewUrl =
      files[0]?.preview || form.getFieldValue("avatarUrl") || null;

    return (
      <>
        <form.AppField name="avatarUrl">
          {() => (
            <div className="col-span-full">
              <input {...getInputProps()} className="sr-only" type="file" />
              <Label>Tenant Image</Label>
              <div className="flex items-center gap-4">
                <Avatar className="mt-2 size-20 rounded">
                  <AvatarImage src={previewUrl || undefined} />
                  <AvatarFallback className="size-20 rounded">
                    <User />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outlined"
                    onClick={() => {
                      openFileDialog();
                    }}
                  >
                    <Upload />
                    Upload
                  </Button>
                  <Button
                    size="sm"
                    variant="soft"
                    color="destructive"
                    disabled={!files[0] && !form.getFieldValue("avatarUrl")}
                    onClick={() => {
                      if (files[0]) {
                        removeFile(files[0].id);
                      }
                      form.setFieldValue("avatarUrl", null);
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
            <field.TextField label="Primary email" asterisk icon={<Mail />} />
          )}
        </form.AppField>
        <form.AppField name="primaryPhoneNumber">
          {(field) => (
            <field.TextField
              label="Primary phone number"
              asterisk
              icon={<Phone />}
            />
          )}
        </form.AppField>
      </>
    );
  },
});

const EditAdditionalEmails = withForm({
  ...editTenantFormOptions,
  render: ({ form }) => {
    return (
      <div className="col-span-full">
        <Label className="mb-4">Additional Emails</Label>
        <form.AppField name="additionalEmails" mode="array">
          {(field) => {
            return (
              <>
                {field.state.value.map((_email: string, index: number) => {
                  return (
                    <div key={index} className="mt-2 flex gap-2">
                      <form.Field name={`additionalEmails[${index}]`}>
                        {(subField) => (
                          <form.ArraySubField
                            label="Email"
                            value={subField.state.value}
                            onChange={(value) =>
                              subField.handleChange(value as string)
                            }
                            errors={
                              subField.state.meta.errors as {
                                message: string;
                              }[]
                            }
                          />
                        )}
                      </form.Field>
                      <Button
                        className="mt-4"
                        variant="outlined"
                        size="icon"
                        onClick={() => field.removeValue(index)}
                      >
                        <Trash />
                      </Button>
                    </div>
                  );
                })}
                <div>
                  <Button
                    color="secondary"
                    disabled={field.state.value.length >= 3}
                    className="mt-2 w-full"
                    onClick={() => field.pushValue("")}
                  >
                    <Plus />
                    Add Email
                  </Button>
                </div>
              </>
            );
          }}
        </form.AppField>
      </div>
    );
  },
});

const EditAdditionalPhones = withForm({
  ...editTenantFormOptions,
  render: ({ form }) => {
    return (
      <form.AppField name="additionalPhones" mode="array">
        {(field) => (
          <div className="col-span-full">
            <Label className="mb-4">Additional Phones</Label>
            {field.state.value.map((_phone: string, index: number) => {
              return (
                <div key={index} className="mt-2 flex gap-2">
                  <form.Field name={`additionalPhones[${index}]`}>
                    {(subField) => (
                      <form.ArraySubField
                        label="Phone"
                        value={subField.state.value}
                        onChange={(value) =>
                          subField.handleChange(value as string)
                        }
                        errors={
                          subField.state.meta.errors as {
                            message: string;
                          }[]
                        }
                      />
                    )}
                  </form.Field>
                  <Button
                    className="mt-4"
                    variant="outlined"
                    size="icon"
                    onClick={() => field.removeValue(index)}
                  >
                    <Trash />
                  </Button>
                </div>
              );
            })}
            <div>
              <Button
                color="secondary"
                disabled={field.state.value.length >= 3}
                className="mt-2 w-full"
                onClick={() => field.pushValue("")}
              >
                <Plus />
                Add Phone
              </Button>
            </div>
          </div>
        )}
      </form.AppField>
    );
  },
});

const EditEmergencyContacts = withForm({
  ...editTenantFormOptions,
  render: ({ form }) => {
    return (
      <form.AppField name="emergencyContacts" mode="array">
        {(field) => (
          <div className="col-span-full">
            <Label className="mb-4">Emergency Contacts</Label>
            {field.state.value.map((_contact: any, index: number) => {
              return (
                <div key={index} className="mb-4 rounded border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium">Contact {index + 1}</h4>
                    <Button
                      variant="outlined"
                      size="icon"
                      onClick={() => field.removeValue(index)}
                    >
                      <Trash />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <form.Field name={`emergencyContacts[${index}].fullName`}>
                      {(subField) => (
                        <form.ArraySubField
                          label="Full Name"
                          value={subField.state.value}
                          onChange={(value) =>
                            subField.handleChange(value as string)
                          }
                          errors={
                            subField.state.meta.errors as {
                              message: string;
                            }[]
                          }
                        />
                      )}
                    </form.Field>
                    <form.Field name={`emergencyContacts[${index}].email`}>
                      {(subField) => (
                        <form.ArraySubField
                          label="Email"
                          value={subField.state.value}
                          onChange={(value) =>
                            subField.handleChange(value as string)
                          }
                          errors={
                            subField.state.meta.errors as {
                              message: string;
                            }[]
                          }
                        />
                      )}
                    </form.Field>
                    <form.Field
                      name={`emergencyContacts[${index}].phoneNumber`}
                    >
                      {(subField) => (
                        <form.ArraySubField
                          label="Phone Number"
                          value={subField.state.value}
                          onChange={(value) =>
                            subField.handleChange(value as string)
                          }
                          errors={
                            subField.state.meta.errors as {
                              message: string;
                            }[]
                          }
                        />
                      )}
                    </form.Field>
                    <form.Field
                      name={`emergencyContacts[${index}].relationship`}
                    >
                      {(subField) => (
                        <form.ArraySubField
                          label="Relationship"
                          value={subField.state.value}
                          onChange={(value) =>
                            subField.handleChange(value as string)
                          }
                          errors={
                            subField.state.meta.errors as {
                              message: string;
                            }[]
                          }
                        />
                      )}
                    </form.Field>
                  </div>
                </div>
              );
            })}
            <div>
              <Button
                color="secondary"
                className="mt-2 w-full"
                onClick={() =>
                  field.pushValue({
                    fullName: "",
                    email: "",
                    phoneNumber: "",
                    relationship: "",
                  })
                }
              >
                <Plus />
                Add Emergency Contact
              </Button>
            </div>
          </div>
        )}
      </form.AppField>
    );
  },
});

const EditVehicles = withForm({
  ...editTenantFormOptions,
  render: ({ form }) => {
    return (
      <form.AppField name="vehicles" mode="array">
        {(field) => (
          <div className="col-span-full">
            <Label className="mb-4">Vehicles</Label>
            {field.state.value.map((_vehicle: any, index: number) => {
              return (
                <div key={index} className="mb-4 rounded border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium">Vehicle {index + 1}</h4>
                    <Button
                      variant="outlined"
                      size="icon"
                      onClick={() => field.removeValue(index)}
                    >
                      <Trash />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <form.Field name={`vehicles[${index}].make`}>
                      {(subField) => (
                        <form.ArraySubField
                          label="Make"
                          value={subField.state.value}
                          onChange={(value) =>
                            subField.handleChange(value as string)
                          }
                          errors={
                            subField.state.meta.errors as {
                              message: string;
                            }[]
                          }
                        />
                      )}
                    </form.Field>
                    <form.Field name={`vehicles[${index}].model`}>
                      {(subField) => (
                        <form.ArraySubField
                          label="Model"
                          value={subField.state.value}
                          onChange={(value) =>
                            subField.handleChange(value as string)
                          }
                          errors={
                            subField.state.meta.errors as {
                              message: string;
                            }[]
                          }
                        />
                      )}
                    </form.Field>
                    <form.Field name={`vehicles[${index}].year`}>
                      {(subField) => (
                        <form.ArraySubField
                          label="Year"
                          value={subField.state.value}
                          onChange={(value) =>
                            subField.handleChange(value as string)
                          }
                          errors={
                            subField.state.meta.errors as {
                              message: string;
                            }[]
                          }
                        />
                      )}
                    </form.Field>
                    <form.Field name={`vehicles[${index}].color`}>
                      {(subField) => (
                        <form.ArraySubField
                          label="Color"
                          value={subField.state.value}
                          onChange={(value) =>
                            subField.handleChange(value as string)
                          }
                          errors={
                            subField.state.meta.errors as {
                              message: string;
                            }[]
                          }
                        />
                      )}
                    </form.Field>
                    <form.Field name={`vehicles[${index}].licensePlate`}>
                      {(subField) => (
                        <form.ArraySubField
                          label="License Plate"
                          value={subField.state.value}
                          onChange={(value) =>
                            subField.handleChange(value as string)
                          }
                          errors={
                            subField.state.meta.errors as {
                              message: string;
                            }[]
                          }
                        />
                      )}
                    </form.Field>
                  </div>
                </div>
              );
            })}
            <div>
              <Button
                color="secondary"
                className="mt-2 w-full"
                onClick={() =>
                  field.pushValue({
                    make: "",
                    model: "",
                    year: "",
                    color: "",
                    licensePlate: "",
                  })
                }
              >
                <Plus />
                Add Vehicle
              </Button>
            </div>
          </div>
        )}
      </form.AppField>
    );
  },
});

interface EditTenantDialogProps {
  tenantId: string;
  tenant: any;
  children: React.ReactNode;
}

export function EditTenantDialog({
  tenantId,
  tenant,
  children,
}: EditTenantDialogProps) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const { mutateAsync: updateTenant, isPending } =
    api.tenant.updateTenant.useMutation();

  const form = useAppForm({
    ...editTenantFormOptions,
    defaultValues: tenant
      ? {
          avatarUrl: tenant.avatarUrl,
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          dateOfBirth: tenant.dateOfBirth || new Date(),
          primaryPhoneNumber: tenant.phone,
          primaryEmail: tenant.email,
          additionalEmails: tenant.additionalEmails as string[],
          additionalPhones: tenant.additionalPhones as string[],
          emergencyContacts: tenant.emergencyContacts
            ? (tenant.emergencyContacts as Array<{
                fullName: string;
                email: string;
                phoneNumber: string;
                relationship: string;
              }>)
            : [],
          vehicles: tenant.vehicles
            ? (tenant.vehicles as Array<{
                make: string;
                model: string;
                year: string;
                color: string;
                licensePlate: string;
                registeredIn: string;
              }>)
            : [],
        }
      : editTenantFormOptions.defaultValues,
    onSubmit: async ({ value }) => {
      const avatarUrl = value.avatarUrl;

      toast.promise(
        updateTenant({
          id: tenantId,
          firstName: value.firstName,
          lastName: value.lastName,
          dateOfBirth: value.dateOfBirth,
          primaryEmail: value.primaryEmail,
          primaryPhoneNumber: value.primaryPhoneNumber,
          additionalEmails: value.additionalEmails,
          additionalPhones: value.additionalPhones,
          emergencyContacts: value.emergencyContacts,
          vehicles: value.vehicles,
          avatarUrl: avatarUrl,
        })
          .then(() => {
            utils.tenant.getTenantById.invalidate({ id: tenantId });
            setOpen(false);
            form.reset();
          })
          .catch((error) => {
            console.error("Failed to update tenant:", error);
            throw error;
          }),
        {
          loading: "Updating tenant...",
          success: "Tenant updated successfully",
          error: "Failed to update tenant",
        },
      );
    },
  });

  useEffect(() => {
    if (tenant && open) {
      form.reset();
    }
  }, [tenant, form, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Tenant</DialogTitle>
          <DialogDescription>
            Update tenant information for {tenant?.firstName} {tenant?.lastName}
            .
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <form.AppForm>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <EditPersonalInformation form={form} />
              <Separator className="col-span-full my-4" />
              <div className="col-span-full grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <EditAdditionalEmails form={form} />
                </div>
                <div className="col-span-1">
                  <EditAdditionalPhones form={form} />
                </div>
              </div>
              <Separator className="col-span-full my-4" />
              <div className="col-span-full">
                <EditEmergencyContacts form={form} />
              </div>
              <div className="col-span-full">
                <EditVehicles form={form} />
              </div>
              <div className="col-span-full">
                <form.FormMessage />
              </div>
            </div>
          </form.AppForm>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outlined"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            isLoading={isPending}
            onClick={() => {
              form.handleSubmit();
            }}
          >
            <Save />
            Update Tenant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
