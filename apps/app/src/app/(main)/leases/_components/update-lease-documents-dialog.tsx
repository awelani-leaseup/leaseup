"use client";

import { useState } from "react";
import { Button } from "@leaseup/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@leaseup/ui/components/dialog";
import { DocumentManagementContent } from "../../tenants/create/_components/document-management-sub-form";
import { Upload } from "lucide-react";
import { api } from "@/trpc/react";

interface UpdateLeaseDocumentsDialogProps {
  leaseId: string;
  trigger?: React.ReactNode;
}

export function UpdateLeaseDocumentsDialog({
  leaseId,
  trigger,
}: UpdateLeaseDocumentsDialogProps) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const { data: lease } = api.lease.getById.useQuery(leaseId, {
    enabled: open,
  });

  const handleFilesChange = () => {
    // Invalidate lease query to refresh the documents
    utils.lease.getById.invalidate(leaseId);
  };

  const existingFiles =
    lease?.File?.map((file) => ({
      id: file.id,
      name: file.name,
      url: file.url,
      type: file.type || "",
      size: file.size || 0,
      createdAt: file.createdAt,
    })) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outlined" size="sm">
            <Upload className="h-4 w-4" />
            Update Documents
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Lease Documents</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <DocumentManagementContent
            leaseId={leaseId}
            existingFiles={existingFiles}
            onFilesChange={handleFilesChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
