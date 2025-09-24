"use client";

import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@leaseup/ui/components/button";
import { Download } from "lucide-react";
import { InvoicePDF } from "./InvoicePDF";
import type { Invoice } from "./types";

interface PDFDownloadButtonProps {
  invoice: Invoice;
  className?: string;
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  invoice,
  className,
}) => {
  const fileName = `invoice-${invoice.id.slice(-8).toUpperCase()}.pdf`;

  return (
    <PDFDownloadLink
      document={<InvoicePDF invoice={invoice} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <Button className={className} disabled={loading}>
          <Download className="h-4 w-4" />
          {loading ? "Generating PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
};
