"use client";

import { api } from "@/trpc/react";
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
import { Trash } from "lucide-react";
import { useState } from "react";

interface ConfirmDeleteLeaseFileProps {
  fileId: string;
  fileName: string;
  onSuccess?: () => void;
}

export function ConfirmDeleteLeaseFile({
  fileId,
  fileName,
  onSuccess,
}: ConfirmDeleteLeaseFileProps) {
  const [open, setOpen] = useState(false);
  const deleteLeaseFile = api.lease.deleteLeaseFile.useMutation();

  const handleDelete = () => {
    deleteLeaseFile.mutate(
      { id: fileId },
      {
        onSuccess: () => {
          setOpen(false);
          onSuccess?.();
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="icon"
          color="destructive"
          size="sm"
          disabled={deleteLeaseFile.isPending}
        >
          <Trash className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Delete Document
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-bold underline">{fileName}</span>? This action
            cannot be undone and the file will be permanently removed from the
            lease.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteLeaseFile.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleDelete}
              color="destructive"
              isLoading={deleteLeaseFile.isPending}
            >
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
