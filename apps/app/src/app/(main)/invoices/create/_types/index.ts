import * as v from "valibot";

export const VInvoiceItemSchema = v.object({
  description: v.pipe(v.string(), v.nonEmpty()),
  quantity: v.pipe(v.number(), v.minValue(1, "Quantity must be at least 1")),
  rate: v.pipe(v.number(), v.minValue(0, "Rate must be positive")),
  amount: v.number(),
});

export const VCreateInvoiceFormSchema = v.object({
  tenantId: v.pipe(v.string(), v.minLength(1, "Tenant is required")),
  leaseId: v.optional(v.string()), // Made optional
  invoiceDate: v.date("Invoice date is required"),
  dueDate: v.date("Due date is required"),
  invoiceCategory: v.pipe(
    v.string(),
    v.minLength(1, "Invoice category is required"),
  ),
  invoiceItems: v.pipe(
    v.array(VInvoiceItemSchema),
    v.minLength(1, "At least one invoice item is required"),
  ),
  totalAmount: v.number(),
  notes: v.pipe(v.string()),
  markAsPaid: v.boolean(),
});

export type InvoiceItem = v.InferInput<typeof VInvoiceItemSchema>;
export type CreateInvoiceForm = v.InferInput<typeof VCreateInvoiceFormSchema>;
