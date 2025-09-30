"use client";

import { Button } from "@leaseup/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@leaseup/ui/components/dropdown-menu";
import { Edit, Eye, MoreVertical, Receipt, Square } from "lucide-react";
import Link from "next/link";

export const LeaseDropdownActions = ({
  leaseId,
  status,
}: {
  leaseId: string;
  status: string;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="icon" className="ml-auto size-8">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Link href={`/leases/${leaseId}`}>
          <DropdownMenuItem>
            <Eye className="size-4" />
            View Details
          </DropdownMenuItem>
        </Link>
        {status === "ACTIVE" && (
          <>
            <Link href={`/invoices/create?leaseId=${leaseId}`}>
              <DropdownMenuItem>
                <Receipt className="size-4" />
                Generate Invoice
              </DropdownMenuItem>
            </Link>
            <Link href={`/leases/${leaseId}?edit=true`}>
              <DropdownMenuItem>
                <Edit className="size-4" />
                Edit Lease
              </DropdownMenuItem>
            </Link>
            <Link href={`/leases/${leaseId}/end`}>
              <DropdownMenuItem>
                <Square className="size-4" />
                End Lease
              </DropdownMenuItem>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
