"use client";

import { Button } from "@leaseup/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@leaseup/ui/components/dropdown-menu";
import {
  Edit,
  Eye,
  MoreVertical,
  Receipt,
  FileText,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";

export const LeaseDropdownActions = ({ leaseId }: { leaseId: string }) => {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="icon" className="ml-auto size-8">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Eye className="size-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileText className="size-4" />
          View Contract
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Receipt className="size-4" />
          Generate Invoice
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="size-4" />
          Edit Lease
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <Trash className="text-destructive size-4" />
          Terminate Lease
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
