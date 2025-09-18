"use client";

import { Button } from "@leaseup/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@leaseup/ui/components/dropdown-menu";
import {
  MoreHorizontal,
  Download,
  Trash2,
  Eye,
  ExternalLink,
} from "lucide-react";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";

interface DocumentDropdownActionsProps {
  document: {
    id: string;
    name: string;
    url: string;
    type?: string | null;
  };
}

export function DocumentDropdownActions({
  document,
}: DocumentDropdownActionsProps) {
  const utils = api.useUtils();

  const deleteDocument = api.file.deleteById.useMutation({
    onSuccess: () => {
      toast.success("File Deleted");
      utils.file.getAll.invalidate();
    },
    onError: () => {
      toast.error("Failed to delete file");
    },
  });

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    deleteDocument.mutate({ id: document.id });
  };

  const handleDownload = () => {
    const link = window.document.createElement("a");
    link.href = document.url;
    link.download = document.name;
    link.target = "_blank";
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleView = () => {
    window.open(document.url, "_blank");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="text" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleView} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in new tab
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={deleteDocument.isPending}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deleteDocument.isPending ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
