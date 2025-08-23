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
import { TenantFilesSubForm } from "./_components/tenant-files-sub-form";
import { nanoid } from "nanoid";
import { useSupabase } from "@/hooks/use-supabase";
import { authClient } from "@/utils/auth/client";
import { upload } from "@vercel/blob/client";

const BUCKET_NAME = "file-storage";

export default function CreateTenantPage() {
  const supabase = useSupabase();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const router = useRouter();
  const { mutateAsync: createTenant, isPending } =
    api.tenant.createTenant.useMutation();
  const form = useAppForm({
    ...createTenantFormOptions,
    onSubmit: async ({ value }) => {
      let avatarUrl = null;
      if (value.avataar) {
        const newBlob = await upload(
          `${user?.id}/${nanoid(21)}`,
          value.avataar,
          {
            access: "public",
            handleUploadUrl: "/api/file/upload",
            onUploadProgress: (progress) => {
              console.log("Avatar upload progress", progress);
            },
          },
        );

        avatarUrl = newBlob.url;
      }

      let files: { url: string; name: string; type: string; size: number }[] =
        [];

      if (value.files && value.files.length > 0) {
        const uploadedFiles = await Promise.all(
          value.files.map((file) => {
            return supabase.storage
              .from(BUCKET_NAME)
              .upload(`${user?.id}/${nanoid(21)}`, file)
              .then((res) => {
                if (res.error) return;

                return {
                  url: res.data?.path,
                  name: file.name,
                  type: file.type,
                  size: file.size,
                };
              });
          }),
        );

        files = uploadedFiles.filter((file) => file !== undefined);
      }

      toast.promise(
        createTenant(
          { ...value, files, avatarUrl: avatarUrl },
          {
            onSuccess: () => {
              router.replace("/tenants");
            },
            onError: async () => {
              if (files.length > 0) {
                await supabase.storage
                  .from(BUCKET_NAME)
                  .remove(
                    files
                      .filter((file) => file !== undefined)
                      .map((file) => file.url),
                  );
              }
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
      </Card>
      <Card className="mt-8">
        <CardContent className="">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="col-span-2">
              <form.AppForm>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <PersonalInformation form={form} />

                  <Separator className="col-span-full my-4" />

                  <div className="col-span-full grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <AdditionalEmails form={form} />
                    </div>
                    <div className="col-span-1">
                      <AdditionalPhones form={form} />
                    </div>
                  </div>

                  <Separator className="col-span-full my-4" />

                  <div className="col-span-full">
                    <EmergencyContacts form={form} />
                  </div>

                  <div className="col-span-full">
                    <Vehicles form={form} />
                  </div>

                  <Separator className="col-span-full my-4" />

                  <div className="col-span-full">
                    <TenantFilesSubForm form={form} />
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
            isLoading={isPending}
            onClick={() => {
              form.handleSubmit();
            }}
          >
            <Save />
            Save Tenant
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
