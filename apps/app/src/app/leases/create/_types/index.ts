import * as v from "valibot";

export const VLeaseSchema = v.object({
  propertyId: v.pipe(v.string(), v.minLength(1, "Property is required")),
  unitId: v.pipe(v.string(), v.minLength(1, "Unit is required")),
  tenantId: v.pipe(v.string(), v.minLength(1, "Tenant is required")),
  leaseType: v.pipe(v.string(), v.minLength(1, "Lease type is required")),
  automaticInvoice: v.boolean(),
  startDate: v.date(),
  endDate: v.date(),
  markPastInvoicesAsPaid: v.boolean(),
  rent: v.number(),
  depositRequired: v.boolean(),
  deposit: v.number(),
  depositDate: v.nullable(v.date()),
  invoiceFrequency: v.pipe(
    v.string(),
    v.minLength(1, "Invoice frequency is required"),
  ),
});
