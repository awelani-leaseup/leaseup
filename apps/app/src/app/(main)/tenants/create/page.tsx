"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Button } from "@leaseup/ui/components/button";
import { useAppForm } from "@leaseup/ui/components/form";
import { Save } from "lucide-react";
import Link from "next/link";
import { Separator } from "@leaseup/ui/components/separator";
import { createTenantFormOptions } from "./_utils";
import { PersonalInformation } from "./_components/personal-information-sub-form";
import { Vehicles } from "./_components/vehicles-sub-form";
import { AdditionalEmails } from "./_components/additional-emails-sub-form";
import { AdditionalPhones } from "./_components/additional-phones";
import { EmergencyContacts } from "./_components/emergency-contacts-sub-form";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { DocumentManagementSubForm } from "./_components/document-management-sub-form";
import { nanoid } from "nanoid";
import { authClient } from "@/utils/auth/client";
import { upload } from "@vercel/blob/client";
import { useState } from "react";

export default function CreateTenantPage() {
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const router = useRouter();
  const { mutateAsync: createTenant, isPending } =
    api.tenant.createTenant.useMutation();

  const form = useAppForm({
    ...createTenantFormOptions,
    onSubmit: async ({ value }) => {
      let avatarUrl = null;
      if (value.avatarUrl) {
        avatarUrl = value.avatarUrl;
      }

      let files: { url: string; name: string; type: string; size: number }[] =
        [];

      if (value.files && value.files.length > 0) {
        setUploadingFiles(true);
        const uploadedFiles = await Promise.all(
          value.files.map(async (file) => {
            try {
              const blob = await upload(`${user?.id}/${nanoid(21)}`, file, {
                access: "public",
                handleUploadUrl: "/api/file/upload",
              });

              return {
                url: blob.url,
                name: file.name,
                type: file.type,
                size: file.size,
              };
            } catch (error) {
              console.error("File upload failed:", error);
            }
          }),
        )
          .catch(() => {
            toast.error("Failed to upload file(s), save tenant without files.");
            return undefined;
          })
          .finally(() => {
            setUploadingFiles(false);
          });

        files =
          uploadedFiles?.filter(
            (
              file,
            ): file is {
              url: string;
              name: string;
              type: string;
              size: number;
            } => file !== undefined,
          ) || [];
      }

      toast.promise(
        createTenant(
          { ...value, files, avatarUrl: avatarUrl },
          {
            onSuccess: () => {
              router.replace("/tenants");
            },
            onError: (error) => {
              console.error("Failed to create tenant:", error);
              // Note: Vercel Blob files are automatically cleaned up if not referenced
            },
          },
        ),
        {
          loading: "Creating tenant...",
          success: "Tenant created",
          error: "Failed to create tenant",
        },
      );
    },
  });

  return (
    <div className="mx-auto my-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add Tenant</CardTitle>
          <CardDescription>Add a new tenant for your property.</CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="col-span-2">
              <form.AppForm>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <PersonalInformation form={form as any} />
                  <Separator className="col-span-full my-4" />
                  <div className="col-span-full grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <AdditionalEmails form={form as any} />
                    </div>
                    <div className="col-span-1">
                      <AdditionalPhones form={form as any} />
                    </div>
                  </div>
                  <Separator className="col-span-full my-4" />
                  <div className="col-span-full">
                    <EmergencyContacts form={form as any} />
                  </div>
                  <div className="col-span-full">
                    <Vehicles form={form as any} />
                  </div>
                  <Separator className="col-span-full my-4" />
                  <div className="col-span-full">
                    <DocumentManagementSubForm form={form as any} />
                  </div>
                  <div className="col-span-full">
                    <form.FormMessage />
                  </div>
                </div>
              </form.AppForm>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outlined">
            <Link href="/">Cancel</Link>
          </Button>
          <Button
            isLoading={isPending || uploadingFiles}
            onClick={() => {
              form.handleSubmit();
            }}
          >
            <Save />
            {uploadingFiles ? "Uploading Files..." : "Save Tenant"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
