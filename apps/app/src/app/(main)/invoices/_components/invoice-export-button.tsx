"use client";

import { useState, useEffect } from "react";
import { Button } from "@leaseup/ui/components/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

// Add interface for html2pdf
interface Html2PdfOptions {
  margin: number;
  filename: string;
  image: { type: string; quality: number };
  html2canvas: { scale: number; useCORS: boolean; letterRendering: boolean };
  jsPDF: { unit: string; format: string; orientation: string };
  pagebreak: { mode: string[]; before: string; after: string };
}

// Declare html2pdf as a global function
declare global {
  interface Window {
    html2pdf?: () => {
      set: (options: Html2PdfOptions) => {
        from: (element: HTMLElement) => {
          save: () => Promise<void>;
        };
      };
    };
  }
}

interface InvoiceData {
  id: string;
  description: string;
  dueAmount: number;
  dueDate: Date | null;
  status: string;
  lease: {
    tenantLease: Array<{
      tenant: {
        firstName: string;
        lastName: string;
        email: string;
      };
    }>;
    unit: {
      name: string;
      property: {
        name: string;
      };
    } | null;
  };
}

interface InvoiceExportButtonProps {
  invoicesData?: {
    invoices: InvoiceData[];
  };
  formatCurrency: (amount: number) => string;
  getStatusBadge: (status: string) => string;
}

export const InvoiceExportButton = ({
  invoicesData,
  formatCurrency,
  getStatusBadge,
}: InvoiceExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  // Load html2pdf.js dynamically
  useEffect(() => {
    const loadHtml2Pdf = () => {
      if (typeof window !== "undefined" && window.html2pdf)
        return Promise.resolve();

      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadHtml2Pdf().catch(console.error);
  }, []);

  const exportInvoicesAsPDF = async () => {
    if (!window.html2pdf) {
      alert("PDF library is still loading. Please try again in a moment.");
      return;
    }

    if (!invoicesData?.invoices || invoicesData.invoices.length === 0) {
      alert("No invoices to export.");
      return;
    }

    setIsExporting(true);

    try {
      // Calculate totals
      const totalAmount = invoicesData.invoices.reduce(
        (sum, invoice) => sum + invoice.dueAmount,
        0,
      );
      const paidInvoices = invoicesData.invoices.filter(
        (inv) => inv.status === "PAID",
      );
      const pendingInvoices = invoicesData.invoices.filter(
        (inv) => inv.status === "PENDING",
      );
      const overdueInvoices = invoicesData.invoices.filter(
        (inv) => inv.status === "OVERDUE",
      );

      // Create content with only inline styles in HTML string format
      const contentHTML = `
        <div style="margin: 0; padding: 20px; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: rgb(0,0,0); background: rgb(255,255,255); width: 800px;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid rgb(45,52,54); padding-bottom: 20px;">
            <h1 style="margin: 0; color: rgb(45,52,54); font-size: 24px; font-weight: bold; font-family: Arial, sans-serif;">Invoice Report</h1>
            <p style="margin: 5px 0; color: rgb(127,140,141); font-size: 14px; font-family: Arial, sans-serif;">Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: rgb(45,52,54); font-size: 16px; margin-bottom: 15px; font-weight: bold; font-family: Arial, sans-serif;">Summary</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
              <div style="background: rgb(248,249,250); padding: 15px; border-radius: 8px;">
                <p style="margin: 0; font-weight: bold; color: rgb(45,52,54); font-family: Arial, sans-serif;">Total Invoices</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; color: rgb(45,52,54); font-family: Arial, sans-serif;">${invoicesData.invoices.length}</p>
              </div>
              <div style="background: rgb(248,249,250); padding: 15px; border-radius: 8px;">
                <p style="margin: 0; font-weight: bold; color: rgb(45,52,54); font-family: Arial, sans-serif;">Total Amount</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; color: rgb(45,52,54); font-family: Arial, sans-serif;">${formatCurrency(totalAmount)}</p>
              </div>
              <div style="background: rgb(212,237,218); padding: 15px; border-radius: 8px;">
                <p style="margin: 0; font-weight: bold; color: rgb(21,87,36); font-family: Arial, sans-serif;">Paid Invoices</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; color: rgb(21,87,36); font-family: Arial, sans-serif;">${paidInvoices.length}</p>
              </div>
              <div style="background: rgb(255,243,205); padding: 15px; border-radius: 8px;">
                <p style="margin: 0; font-weight: bold; color: rgb(133,100,4); font-family: Arial, sans-serif;">Pending Invoices</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; color: rgb(133,100,4); font-family: Arial, sans-serif;">${pendingInvoices.length}</p>
              </div>
            </div>
            ${
              overdueInvoices.length > 0
                ? `
              <div style="background: rgb(248,215,218); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; font-weight: bold; color: rgb(114,28,36); font-family: Arial, sans-serif;">Overdue Invoices: ${overdueInvoices.length}</p>
              </div>
            `
                : ""
            }
          </div>

          <div style="margin-bottom: 20px;">
            <h2 style="color: rgb(45,52,54); font-size: 16px; margin-bottom: 15px; font-weight: bold; font-family: Arial, sans-serif;">Invoice Details</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; font-family: Arial, sans-serif;">
              <thead>
                <tr style="background-color: rgb(248,249,250);">
                  <th style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: left; font-weight: bold; font-family: Arial, sans-serif; color: rgb(0,0,0);">Invoice ID</th>
                  <th style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: left; font-weight: bold; font-family: Arial, sans-serif; color: rgb(0,0,0);">Tenant</th>
                  <th style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: left; font-weight: bold; font-family: Arial, sans-serif; color: rgb(0,0,0);">Property</th>
                  <th style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: right; font-weight: bold; font-family: Arial, sans-serif; color: rgb(0,0,0);">Amount</th>
                  <th style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: left; font-weight: bold; font-family: Arial, sans-serif; color: rgb(0,0,0);">Due Date</th>
                  <th style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: center; font-weight: bold; font-family: Arial, sans-serif; color: rgb(0,0,0);">Status</th>
                </tr>
              </thead>
              <tbody>
                ${invoicesData.invoices
                  .map((invoice) => {
                    const tenant = invoice.lease.tenantLease[0]?.tenant;
                    const property = invoice.lease.unit?.property;
                    const unit = invoice.lease.unit;

                    const statusColors = {
                      PAID: "rgb(212,237,218)",
                      PENDING: "rgb(255,243,205)",
                      OVERDUE: "rgb(248,215,218)",
                      CANCELLED: "rgb(226,227,229)",
                    };

                    return `
                    <tr>
                      <td style="border: 1px solid rgb(222,226,230); padding: 8px; font-family: Arial, sans-serif; color: rgb(0,0,0);">
                        #${invoice.id.slice(-8).toUpperCase()}<br>
                        <small style="color: rgb(127,140,141); font-family: Arial, sans-serif;">${invoice.description}</small>
                      </td>
                      <td style="border: 1px solid rgb(222,226,230); padding: 8px; font-family: Arial, sans-serif; color: rgb(0,0,0);">
                        ${tenant?.firstName} ${tenant?.lastName}<br>
                        <small style="color: rgb(127,140,141); font-family: Arial, sans-serif;">${tenant?.email}</small>
                      </td>
                      <td style="border: 1px solid rgb(222,226,230); padding: 8px; font-family: Arial, sans-serif; color: rgb(0,0,0);">
                        ${property?.name}<br>
                        <small style="color: rgb(127,140,141); font-family: Arial, sans-serif;">Unit ${unit?.name}</small>
                      </td>
                      <td style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: right; font-weight: bold; font-family: Arial, sans-serif; color: rgb(0,0,0);">
                        ${formatCurrency(invoice.dueAmount)}
                      </td>
                      <td style="border: 1px solid rgb(222,226,230); padding: 8px; font-family: Arial, sans-serif; color: rgb(0,0,0);">
                        ${invoice.dueDate ? format(new Date(invoice.dueDate), "MMM dd, yyyy") : "No due date"}
                      </td>
                      <td style="border: 1px solid rgb(222,226,230); padding: 8px; text-align: center; font-family: Arial, sans-serif;">
                        <span style="background-color: ${statusColors[invoice.status as keyof typeof statusColors] || "rgb(226,227,229)"}; padding: 4px 8px; border-radius: 4px; font-size: 10px; color: rgb(0,0,0); font-family: Arial, sans-serif;">
                          ${getStatusBadge(invoice.status)}
                        </span>
                      </td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 30px; text-align: center; border-top: 1px solid rgb(222,226,230); padding-top: 20px;">
            <p style="margin: 0; color: rgb(127,140,141); font-size: 10px; font-family: Arial, sans-serif;">
              This report was generated from LeaseUp Invoice Management System
            </p>
          </div>
        </div>
      `;

      // Create a temporary element and set its content
      const exportContent = document.createElement("div");
      exportContent.innerHTML = contentHTML;
      exportContent.style.position = "absolute";
      exportContent.style.top = "-9999px";
      exportContent.style.left = "-9999px";

      // Temporarily add to DOM
      document.body.appendChild(exportContent);

      // Configure PDF options
      const options = {
        margin: 0.5,
        filename: `invoices-report-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
          before: ".page-break-before",
          after: ".page-break-after",
        },
      };

      // Generate and download PDF
      const contentElement = exportContent.firstElementChild;
      if (!contentElement) {
        throw new Error("Failed to create export content");
      }
      await window
        .html2pdf()
        .set(options)
        .from(contentElement as HTMLElement)
        .save();

      // Clean up
      if (document.body.contains(exportContent)) {
        document.body.removeChild(exportContent);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outlined"
      color="info"
      onClick={exportInvoicesAsPDF}
      disabled={isExporting || !invoicesData?.invoices?.length}
    >
      <Download className="size-4" />
      {isExporting ? "Exporting..." : "Export"}
    </Button>
  );
};
