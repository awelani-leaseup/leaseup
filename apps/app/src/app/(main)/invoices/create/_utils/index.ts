import { formOptions } from "@tanstack/react-form";
import * as v from "valibot";
import { VCreateInvoiceFormSchema } from "../_types";

export const createInvoiceFormOptions = formOptions({
  defaultValues: {
    tenantId: "",
    leaseId: "", // Keep as empty string for form consistency
    // invoiceNumber removed
    invoiceDate: new Date(),
    dueDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 5); // Default to 5 days from now
      return date;
    })(),
    billingPeriod: (() => {
      const date = new Date();
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    })(),
    invoiceCategory: "",
    invoiceItems: [
      {
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ],
    subtotal: 0,
    taxRate: 8.5,
    taxAmount: 0,
    totalAmount: 0,
    notes: "",
    markAsPaid: false,
  } as v.InferInput<typeof VCreateInvoiceFormSchema>,
  validators: {
    onSubmit: VCreateInvoiceFormSchema,
  },
});

// generateInvoiceNumber function removed since we're not using invoice numbers anymore

export const billingPeriodOptions = () => {
  const options = [];
  const currentDate = new Date();

  // Generate options for current month and next 5 months
  for (let i = 0; i < 6; i++) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + i);
    options.push({
      id: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      label: date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    });
  }

  return options;
};
