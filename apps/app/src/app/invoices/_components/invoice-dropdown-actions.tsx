"use client";

import { Button } from "@leaseup/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@leaseup/ui/components/dropdown-menu";
import {
  Eye,
  Download,
  MoreHorizontal,
  Bell,
  AlertTriangle,
} from "lucide-react";

export const InvoiceDropdownActions = ({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: string;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="icon" className="size-8">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Eye className="size-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className="size-4" />
          Download PDF
        </DropdownMenuItem>
        {status === "PENDING" && (
          <DropdownMenuItem>
            <Bell className="size-4" />
            Send Reminder
          </DropdownMenuItem>
        )}
        {status === "OVERDUE" && (
          <DropdownMenuItem className="text-red-600">
            <AlertTriangle className="size-4" />
            Mark Urgent
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
