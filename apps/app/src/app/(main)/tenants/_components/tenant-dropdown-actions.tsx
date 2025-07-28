"use client";

import { api } from "@/trpc/react";
import { Button } from "@leaseup/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@leaseup/ui/components/dropdown-menu";
import { Edit, Eye, MoreVertical, Plus, Receipt, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

export const TenantDropdownActions = ({
  tenantId,
  lease,
}: {
  tenantId: string;
  lease: boolean;
}) => {
  const router = useRouter();
  const { mutate } = api.tenant.removeTenant.useMutation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="icon" className="ml-auto size-8">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => router.push(`/tenants/${tenantId}`)}>
          <Eye className="size-4" />
          View
        </DropdownMenuItem>
        {lease && (
          <DropdownMenuItem>
            <Plus className="size-4" />
            Add Lease
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          <Receipt className="size-4" />
          Invoice
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            mutate({ id: tenantId });
            router.refresh();
          }}
        >
          <Trash className="text-destructive size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
