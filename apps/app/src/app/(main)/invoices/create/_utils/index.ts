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
    invoiceCategory: "",
    invoiceItems: [
      {
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ],
    totalAmount: 0,
    notes: "",
    markAsPaid: false,
  } as v.InferInput<typeof VCreateInvoiceFormSchema>,
  validators: {
    onSubmit: VCreateInvoiceFormSchema,
  },
});
