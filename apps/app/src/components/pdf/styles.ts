import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    fontFamily: "Onest",
    fontSize: 10,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 30,
    backgroundColor: "#ffffff",
  },
  // Header styles
  header: {
    marginBottom: 30,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 5,
  },
  invoiceDescription: {
    fontSize: 12,
    color: "#7F8C8D",
    marginBottom: 20,
  },
  statusBadge: {
    backgroundColor: "#ECF0F1",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  statusText: {
    fontSize: 10,
    color: "#2D3436",
    fontWeight: "bold",
  },
  // Company and tenant info
  companyTenantSection: {
    flexDirection: "row",
    marginBottom: 30,
  },
  companyInfo: {
    flex: 1,
    paddingRight: 20,
  },
  tenantInfo: {
    flex: 1,
    paddingLeft: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 10,
  },
  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 3,
  },
  addressText: {
    fontSize: 10,
    color: "#7F8C8D",
    marginBottom: 2,
  },
  tenantName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 3,
  },
  // Invoice details
  invoiceDetailsSection: {
    backgroundColor: "#ECF0F1",
    padding: 15,
    borderRadius: 4,
    marginBottom: 30,
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  detailsColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    color: "#7F8C8D",
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 10,
    color: "#2D3436",
    fontWeight: "bold",
  },
  // Table styles
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2D3436",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F9FA",
  },
  tableCell: {
    fontSize: 10,
    color: "#7F8C8D",
  },
  tableCellBold: {
    fontSize: 10,
    color: "#2D3436",
    fontWeight: "bold",
  },
  // Column widths
  descriptionColumn: {
    flex: 3,
    paddingRight: 10,
  },
  qtyColumn: {
    flex: 1,
    textAlign: "center",
  },
  rateColumn: {
    flex: 1.5,
    textAlign: "right",
    paddingRight: 10,
  },
  amountColumn: {
    flex: 1.5,
    textAlign: "right",
  },
  // Summary styles
  summarySection: {
    alignItems: "flex-end",
    marginBottom: 30,
  },
  summaryBox: {
    backgroundColor: "#ECF0F1",
    padding: 15,
    borderRadius: 4,
    width: 250,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#7F8C8D",
  },
  summaryValue: {
    fontSize: 10,
    color: "#2D3436",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#BDC3C7",
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 12,
    color: "#2D3436",
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 12,
    color: "#2D3436",
    fontWeight: "bold",
  },
  // Payment info styles
  paymentSection: {
    flexDirection: "row",
    marginBottom: 30,
  },
  paymentColumn: {
    flex: 1,
    paddingRight: 20,
  },
  paymentTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 8,
  },
  paymentText: {
    fontSize: 10,
    color: "#7F8C8D",
  },
  // Bank details styles
  bankDetailsSection: {
    marginBottom: 30,
  },
  bankDetailsBox: {
    backgroundColor: "#ECF0F1",
    padding: 15,
    borderRadius: 4,
  },
  bankDetailsRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  bankDetailsColumn: {
    flex: 1,
    paddingRight: 20,
  },
  bankDetailLabel: {
    fontSize: 9,
    color: "#7F8C8D",
    marginBottom: 3,
    fontWeight: "bold",
  },
  bankDetailValue: {
    fontSize: 10,
    color: "#2D3436",
    fontWeight: "bold",
  },
  // Payment history styles
  paymentHistorySection: {
    marginBottom: 30,
  },
  paymentHistoryItem: {
    backgroundColor: "#EBF3FD",
    border: "1pt solid #3498DB",
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  paymentHistoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentHistoryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentHistoryTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 2,
  },
  paymentHistoryDate: {
    fontSize: 9,
    color: "#7F8C8D",
  },
  paymentHistoryAmount: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2D3436",
  },
  paymentHistoryMethod: {
    fontSize: 9,
    color: "#7F8C8D",
  },
  // Notes styles
  notesSection: {
    marginBottom: 20,
  },
  notesBox: {
    backgroundColor: "#ECF0F1",
    padding: 12,
    borderRadius: 4,
  },
  notesText: {
    fontSize: 10,
    color: "#7F8C8D",
    lineHeight: 1.4,
  },
});
