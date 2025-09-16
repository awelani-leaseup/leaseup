"use client";

import { useAppForm } from "@leaseup/ui/components/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Button } from "@leaseup/ui/components/button";
import { User, Camera } from "lucide-react";
import { profilePictureFormOptions } from "../_utils";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import type { ProfilePictureData } from "../_types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avataar";

interface ProfilePictureFormProps {
  initialData?: {
    image?: string;
  };
}

export function ProfilePictureForm({ initialData }: ProfilePictureFormProps) {
  const utils = api.useUtils();

  const updateProfilePictureMutation =
    api.profile.updateProfilePicture.useMutation({
      onSuccess: (data) => {
        toast.success("Profile picture updated");
        utils.profile.getProfile.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const form = useAppForm({
    ...profilePictureFormOptions,
    defaultValues: {
      image: initialData?.image || "",
    } as ProfilePictureData,
    onSubmit: async ({ value }) => {
      await updateProfilePictureMutation.mutateAsync({
        image: value.image,
      });
    },
  });

  return (
    <form.AppForm>
      <p className="font-bold tracking-tight">Profile Picture</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="mt-3 flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
            <Avatar className="size-20 rounded-full">
              <AvatarImage
                className="size-20 rounded-full"
                src={initialData?.image || undefined}
              />
              <AvatarFallback className="size-8 rounded-full">
                <User className="h-8 w-8 text-gray-400" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outlined"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                toast.success(
                  "File upload functionality will be implemented soon",
                );
              }}
            >
              <Camera className="h-4 w-4" />
              Change Photo
            </Button>
            <p className="text-sm text-gray-500">JPG, GIF or PNG. 1MB max.</p>
          </div>
        </div>
      </form>
    </form.AppForm>
  );
}
