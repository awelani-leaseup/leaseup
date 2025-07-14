import * as v from 'valibot';

export const VCreateLeaseSchema = v.object({
  propertyId: v.pipe(v.string(), v.minLength(1, 'Property is required')),
  unitId: v.pipe(v.string(), v.minLength(1, 'Unit is required')),
  tenantId: v.pipe(v.string(), v.minLength(1, 'Tenant is required')),
  leaseType: v.pipe(v.string(), v.minLength(1, 'Lease type is required')),
  leaseTermType: v.string(),
  leaseStartDate: v.date(),
  leaseEndDate: v.nullable(v.date()),
  depositRequired: v.boolean(),
  deposit: v.number(),
  depositDate: v.nullable(v.date()),
  automaticInvoice: v.boolean(),
  invoiceCycle: v.pipe(v.string(), v.minLength(1, 'Invoice cycle is required')),
  markPastInvoicesAsPaid: v.boolean(),
  rent: v.number(),
});
