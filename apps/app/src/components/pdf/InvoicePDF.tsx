import React from "react";
import { Document, Page, Text, View, Font } from "@react-pdf/renderer";
import { format } from "date-fns";
import { styles } from "./styles";
import type { Invoice, LineItem } from "./types";

Font.register({
  family: "Onest",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/onest/v9/gNMZW3F-SZuj7zOT0IfSjTS16cPh9R-Zsg.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/onest/v9/gNMZW3F-SZuj7zOT0IfSjTS16cPhEhiZsg.ttf",
      fontWeight: 700,
    },
  ],
});

interface InvoicePDFProps {
  invoice: Invoice;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  const calculateSubtotal = () => {
    if (!invoice?.lineItems) return 0;
    const lineItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
    return lineItems.reduce((sum: number, item: LineItem) => {
      return sum + item.amount;
    }, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.15;
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);

  const tenant = invoice.lease?.tenantLease?.[0]?.tenant || invoice.tenant;
  const property = invoice.lease?.unit?.property;
  const unit = invoice.lease?.unit;

  const landlord =
    invoice.lease?.unit?.property?.landlord ||
    invoice.tenant?.landlord ||
    invoice.lease?.tenantLease?.[0]?.tenant?.landlord;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.invoiceTitle}>
            Invoice #{invoice.id.slice(-8).toUpperCase()}
          </Text>
        </View>

        <View style={styles.companyTenantSection}>
          <View style={styles.companyInfo}>
            <Text style={styles.sectionTitle}>From</Text>
            <Text style={styles.companyName}>
              {landlord?.businessName ||
                landlord?.name ||
                "Property Management"}
            </Text>
            {landlord?.addressLine1 && (
              <Text style={styles.addressText}>{landlord.addressLine1}</Text>
            )}
            {landlord?.addressLine2 && (
              <Text style={styles.addressText}>{landlord.addressLine2}</Text>
            )}
            {landlord?.city && landlord?.state && landlord?.zip && (
              <Text style={styles.addressText}>
                {landlord.city}, {landlord.state} {landlord.zip}
              </Text>
            )}
            {landlord?.phone && (
              <Text style={styles.addressText}>Phone: {landlord.phone}</Text>
            )}
            {landlord?.email && (
              <Text style={styles.addressText}>Email: {landlord.email}</Text>
            )}
          </View>

          <View style={styles.tenantInfo}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.tenantName}>
              {tenant?.firstName} {tenant?.lastName}
            </Text>
            {unit && property && (
              <>
                <Text style={styles.addressText}>
                  Unit {unit.name}, {property.name}
                </Text>
                <Text style={styles.addressText}>{property.addressLine1}</Text>
                {property.addressLine2 && (
                  <Text style={styles.addressText}>
                    {property.addressLine2}
                  </Text>
                )}
                <Text style={styles.addressText}>
                  {property.city}, {property.state} {property.zip}
                </Text>
              </>
            )}
            <Text style={styles.addressText}>{tenant?.email}</Text>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.invoiceDetailsSection}>
          <View style={styles.detailsRow}>
            <View style={styles.detailsColumn}>
              <Text style={styles.detailLabel}>Invoice Number</Text>
              <Text style={styles.detailValue}>
                #{invoice.id.slice(-8).toUpperCase()}
              </Text>
            </View>
            <View style={styles.detailsColumn}>
              <Text style={styles.detailLabel}>Invoice Date</Text>
              <Text style={styles.detailValue}>
                {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
              </Text>
            </View>
            <View style={styles.detailsColumn}>
              <Text style={styles.detailLabel}>Due Date</Text>
              <Text style={styles.detailValue}>
                {invoice.dueDate
                  ? format(new Date(invoice.dueDate), "MMM dd, yyyy")
                  : "No due date"}
              </Text>
            </View>
            <View style={styles.detailsColumn}>
              <Text style={styles.detailLabel}>Billing Period</Text>
              <Text style={styles.detailValue}>
                {format(new Date(invoice.createdAt), "MMMM yyyy")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Invoice Items</Text>

          <View style={styles.tableHeader}>
            <View style={styles.descriptionColumn}>
              <Text style={styles.tableHeaderCell}>Description</Text>
            </View>
            <View style={styles.qtyColumn}>
              <Text style={styles.tableHeaderCell}>Qty</Text>
            </View>
            <View style={styles.rateColumn}>
              <Text style={styles.tableHeaderCell}>Rate</Text>
            </View>
            <View style={styles.amountColumn}>
              <Text style={styles.tableHeaderCell}>Amount</Text>
            </View>
          </View>

          {Array.isArray(invoice.lineItems) && invoice.lineItems.length > 0 ? (
            invoice.lineItems.map((item: LineItem, index: number) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.descriptionColumn}>
                  <Text style={styles.tableCellBold}>
                    {item.name || item.description}
                  </Text>
                  {unit && property && (
                    <Text style={styles.tableCell}>
                      Unit {unit.name}, {property.name}
                    </Text>
                  )}
                </View>
                <View style={styles.qtyColumn}>
                  <Text style={styles.tableCell}>{item.quantity}</Text>
                </View>
                <View style={styles.rateColumn}>
                  <Text style={styles.tableCell}>
                    {formatCurrency(item.rate)}
                  </Text>
                </View>
                <View style={styles.amountColumn}>
                  <Text style={styles.tableCellBold}>
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <View style={styles.descriptionColumn}>
                <Text style={styles.tableCellBold}>{invoice.description}</Text>
                {unit && property && (
                  <Text style={styles.tableCell}>
                    Unit {unit.name}, {property.name}
                  </Text>
                )}
              </View>
              <View style={styles.qtyColumn}>
                <Text style={styles.tableCell}>1</Text>
              </View>
              <View style={styles.rateColumn}>
                <Text style={styles.tableCell}>
                  {formatCurrency(invoice.dueAmount)}
                </Text>
              </View>
              <View style={styles.amountColumn}>
                <Text style={styles.tableCellBold}>
                  {formatCurrency(invoice.dueAmount)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Invoice Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(subtotal || invoice.dueAmount)}
              </Text>
            </View>
            {/* <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VAT (15%):</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(tax || 0)}
              </Text>
            </View> */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.dueAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Bank Details */}
        {invoice.landlordBankDetails && (
          <View style={styles.bankDetailsSection}>
            <Text style={styles.sectionTitle}>
              Bank Details for Direct Transfer
            </Text>
            <View style={styles.bankDetailsBox}>
              <View style={styles.bankDetailsRow}>
                <View style={styles.bankDetailsColumn}>
                  <Text style={styles.bankDetailLabel}>Bank Name</Text>
                  <Text style={styles.bankDetailValue}>
                    {invoice.landlordBankDetails.bankName}
                  </Text>
                </View>
                <View style={styles.bankDetailsColumn}>
                  <Text style={styles.bankDetailLabel}>Account Number</Text>
                  <Text style={styles.bankDetailValue}>
                    {invoice.landlordBankDetails.accountNumber}
                  </Text>
                </View>
                <View style={styles.bankDetailsColumn}>
                  <Text style={styles.bankDetailLabel}>Account Name</Text>
                  <Text style={styles.bankDetailValue}>
                    {invoice.landlordBankDetails.accountName}
                  </Text>
                </View>
              </View>
              {/* <Text style={styles.paymentText}>
                Please use invoice number #{invoice.id.slice(-8).toUpperCase()}{" "}
                as your payment reference.
              </Text> */}
            </View>
          </View>
        )}

        {/* Online Payment URL */}
        {invoice.paymentRequestUrl &&
          invoice.status !== "PAID" &&
          invoice.status !== "CANCELLED" && (
            <View style={styles.bankDetailsSection}>
              <Text style={styles.sectionTitle}>Online Payment</Text>
              <View style={styles.bankDetailsBox}>
                <Text style={styles.paymentText}>
                  For convenient online payment, visit:
                </Text>
                <Text style={styles.bankDetailValue}>
                  {invoice.paymentRequestUrl}
                </Text>
              </View>
            </View>
          )}

        {/* Payment Information */}
        <View style={styles.paymentSection}>
          <View style={styles.paymentColumn}>
            <Text style={styles.paymentTitle}>Payment Terms</Text>
            <Text style={styles.paymentText}>
              {invoice.dueDate
                ? `Due by ${format(new Date(invoice.dueDate), "MMM dd, yyyy")}`
                : "Payment terms not specified"}
            </Text>
          </View>
          <View style={styles.paymentColumn}>
            <Text style={styles.paymentTitle}>Payment Options</Text>
            <Text style={styles.paymentText}>
              • Online Payment: Use the payment link provided
            </Text>
            <Text style={styles.paymentText}>
              • Bank Transfer: Use the bank details below
            </Text>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>
              Thank you for your prompt payment. You can pay this invoice either
              online using the payment link provided above, or by making a
              direct bank transfer using the bank details shown. When making a
              bank transfer, please use the invoice number as your payment
              reference. Please contact us if you have any questions regarding
              this invoice.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
