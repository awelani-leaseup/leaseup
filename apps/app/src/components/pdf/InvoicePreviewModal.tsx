"use client";

import React, { useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@leaseup/ui/components/dialog";
import { Button } from "@leaseup/ui/components/button";
import { Eye } from "lucide-react";
import { InvoicePDF } from "./InvoicePDF";
import { PDFDownloadButton } from "./PDFDownloadButton";
import type { Invoice } from "./types";

interface InvoicePreviewModalProps {
  invoice: Invoice;
  triggerButton?: React.ReactNode;
  className?: string;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  triggerButton,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrigger = (
    <Button type="button" variant="outlined" className={className}>
      <Eye className="h-4 w-4" />
      Preview Invoice
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton || defaultTrigger}</DialogTrigger>
      <DialogContent className="flex h-[90vh] max-w-4xl flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>
              Invoice Preview - #{invoice.id.slice(-8).toUpperCase()}
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex-1 p-6 pt-4">
          <div className="w-full rounded-lg border bg-gray-50">
            <PDFViewer
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                borderRadius: "0.5rem",
              }}
            >
              <InvoicePDF invoice={invoice} />
            </PDFViewer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
