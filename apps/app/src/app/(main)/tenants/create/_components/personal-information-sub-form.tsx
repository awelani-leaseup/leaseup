import { withForm } from "@leaseup/ui/components/form";
import { createTenantFormOptions } from "../_utils";
import { Mail, Upload, X, Phone, User } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avatar";
import { Label } from "@leaseup/ui/components/label";
import { Button } from "@leaseup/ui/components/button";
import { useFileUpload } from "@/hooks/use-file-upload";
import { upload } from "@vercel/blob/client";
import { nanoid } from "nanoid";
import { authClient } from "@/utils/auth/client";

export const PersonalInformation = withForm({
  ...createTenantFormOptions,
  render: ({ form }) => {
    const { data: session } = authClient.useSession();
    const user = session?.user;
    const [{ files }, { removeFile, openFileDialog, getInputProps }] =
      useFileUpload({
        accept: "image/*",
        maxSize: 10 * 1024 * 1024,
        onFilesAdded: async (addedFiles) => {
          const avatar = addedFiles[0]?.file as File;

          if (!avatar) return;

          try {
            const newBlob = await upload(`${user?.id}/${nanoid(21)}`, avatar, {
              access: "public",
              handleUploadUrl: "/api/file/upload",
              onUploadProgress: (progress) => {
                console.log("Avatar upload progress", progress);
              },
            });

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
          {(field) => (
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
