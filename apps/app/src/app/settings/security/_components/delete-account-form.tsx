"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/utils/auth/client";
import { useAppForm } from "@leaseup/ui/components/form";
import { Button } from "@leaseup/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@leaseup/ui/components/alert-dialog";
import { Key, Trash2 } from "lucide-react";
import { deleteAccountFormOptions } from "../_utils";
import type { DeleteAccountData } from "../_types";
import toast from "react-hot-toast";

export function DeleteAccountForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useAppForm({
    ...deleteAccountFormOptions,
    defaultValues: {
      password: "",
    } as DeleteAccountData,
    onSubmit: async ({ value }) => {
      try {
        await authClient.deleteUser(
          {
            password: value.password,
            callbackURL: "/sign-in", // Redirect after deletion
          },
          {
            onSuccess: () => {
              toast.success("Account deleted successfully");
              setIsOpen(false);
              router.push("/sign-in");
            },
            onError: (error) => {
              toast.error(error.error.message);
              setIsDeleting(false);
            },
            onRequest: () => {
              setIsDeleting(true);
            },
            onResponse: () => {
              setIsDeleting(false);
            },
          },
        );
      } catch {
        toast.error("Failed to delete account");
        setIsDeleting(false);
      }
    },
  });

  const handleCancel = () => {
    setIsOpen(false);
    form.reset();
  };

  return (
    <div className="border-destructive/20 rounded-lg border p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-destructive text-lg font-semibold tracking-tight">
            Danger Zone
          </h3>
          <p className="text-destructive mt-2 text-sm font-medium">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
        </div>

        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button
              color="destructive"
              variant="solid"
              className="w-full sm:w-auto"
              isLoading={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <form.AppForm>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
              >
                <div className="space-y-4">
                  <form.AppField name="password">
                    {(field) => (
                      <field.TextField
                        icon={<Key />}
                        label="Enter your password to confirm"
                        type="password"
                        placeholder="Your current password"
                        asterisk
                        description="Please enter your current password to confirm account deletion"
                      />
                    )}
                  </form.AppField>
                </div>

                <AlertDialogFooter className="mt-6">
                  <AlertDialogCancel
                    onClick={handleCancel}
                    disabled={isDeleting}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      className="text-white"
                      type="submit"
                      color="destructive"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </form.AppForm>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
