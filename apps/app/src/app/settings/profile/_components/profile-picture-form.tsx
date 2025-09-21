"use client";

import { useAppForm } from "@leaseup/ui/components/form";
import { Button } from "@leaseup/ui/components/button";
import { User } from "lucide-react";
import { profilePictureFormOptions } from "../_utils";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import type { ProfilePictureData } from "../_types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avataar";
import { useFileUpload } from "@/hooks/use-file-upload";
import { upload } from "@vercel/blob/client";
import { authClient } from "@/utils/auth/client";
import { nanoid } from "nanoid";
import { useState } from "react";

interface ProfilePictureFormProps {
  initialData?: {
    image?: string;
  };
}

export function ProfilePictureForm({ initialData }: ProfilePictureFormProps) {
  const utils = api.useUtils();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(
    initialData?.image || "",
  );

  const updateProfilePictureMutation =
    api.profile.updateProfilePicture.useMutation({
      onSuccess: () => {
        utils.profile.getProfile.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const [fileState, fileActions] = useFileUpload({
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: "image/*",
    multiple: false,
    onFilesAdded: (files) => {
      if (files.length > 0 && files[0]) {
        handleFileUpload(files[0].file as File).catch((error) => {
          console.error("File upload error:", error);
        });
      }
    },
  });

  const handleFileUpload = async (file: File) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `profile-pictures/${user.id}/${nanoid(21)}`;
      const blob = await upload(fileName, file, {
        access: "public",
        handleUploadUrl: "/api/file/upload",
      });

      await updateProfilePictureMutation.mutateAsync({
        image: blob.url,
      });

      setCurrentImageUrl(blob.url);
      fileActions.clearFiles();
    } catch (error) {
      console.error("File upload failed:", error);
      toast.error("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      await updateProfilePictureMutation.mutateAsync({});

      setCurrentImageUrl("");
      toast.success("Profile picture removed");
    } catch (error) {
      console.error("Failed to remove profile picture:", error);
      toast.error("Failed to remove profile picture. Please try again.");
    }
  };

  const form = useAppForm({
    ...profilePictureFormOptions,
    defaultValues: {
      image: initialData?.image || "",
    } as ProfilePictureData,
    onSubmit: async () => {},
  });

  return (
    <form.AppForm>
      <p className="font-bold tracking-tight">Profile Picture</p>

      <div className="mt-3">
        <div className="flex items-center gap-6">
          <div className="flex size-14 items-center justify-center rounded-full bg-gray-200">
            <Avatar className="size-14 rounded-full">
              <AvatarImage
                className="size-14 rounded-full"
                src={currentImageUrl || undefined}
              />
              <AvatarFallback className="size-14 rounded-full">
                <User className="size-4 text-gray-400" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-2">
            <input
              {...fileActions.getInputProps()}
              style={{ display: "none" }}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outlined"
                size="sm"
                className="flex items-center gap-2"
                onClick={fileActions.openFileDialog}
                isLoading={isUploading}
                disabled={isUploading || updateProfilePictureMutation.isPending}
              >
                {currentImageUrl ? "Change Photo" : "Upload Photo"}
              </Button>
              {currentImageUrl && (
                <Button
                  type="button"
                  variant="outlined"
                  size="sm"
                  className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={handleRemoveImage}
                  disabled={
                    isUploading || updateProfilePictureMutation.isPending
                  }
                  isLoading={updateProfilePictureMutation.isPending}
                >
                  Remove
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500">JPG, GIF or PNG. 5MB max.</p>
          </div>
        </div>

        {fileState.errors.length > 0 && (
          <div className="mt-2 space-y-1">
            {fileState.errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    </form.AppForm>
  );
}
