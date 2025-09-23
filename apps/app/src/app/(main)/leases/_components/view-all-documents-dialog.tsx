"use client";

import { format } from "date-fns";
import { Download } from "lucide-react";
import { Button } from "@leaseup/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@leaseup/ui/components/dialog";

type FileData = {
  id: string;
  name: string;
  url: string;
  type: string | null;
  size: number | null;
  createdAt: Date;
  updatedAt: Date;
};

interface ViewAllDocumentsDialogProps {
  files: FileData[];
  remainingCount: number;
}

const getFileIcon = (fileType: string | null) => {
  if (!fileType) return "fa-regular fa-file-lines text-gray-500";
  if (fileType.includes("pdf")) return "fa-regular fa-file-pdf text-red-500";
  if (fileType.includes("image"))
    return "fa-regular fa-file-image text-blue-500";
  if (fileType.includes("document") || fileType.includes("word"))
    return "fa-regular fa-file-word text-blue-600";
  return "fa-regular fa-file-lines text-green-500";
};

export function ViewAllDocumentsDialog({
  files,
  remainingCount,
}: ViewAllDocumentsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="text"
          size="sm"
          className="text-blue-600 hover:text-blue-800"
        >
          {remainingCount} more file{remainingCount !== 1 ? "s" : ""}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Documents ({files.length})</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
            >
              <div className="flex items-center">
                <i className={`${getFileIcon(file.type)} mr-3 text-xl`} />
                <div>
                  <p className="text-sm font-medium tracking-tight text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Added {format(new Date(file.createdAt), "MMM d, yyyy")}
                    {file.size && (
                      <span className="ml-2">
                        • {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Button variant="text" size="sm" asChild>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
