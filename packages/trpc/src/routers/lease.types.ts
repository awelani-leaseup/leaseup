import * as v from 'valibot';

export const VGetAllLeasesSchema = v.object({
  page: v.pipe(v.number(), v.minValue(1, 'Page must be at least 1')),
  limit: v.pipe(
    v.number(),
    v.minValue(1, 'Limit must be at least 1'),
    v.maxValue(100, 'Limit cannot exceed 100')
  ),
  search: v.optional(v.string()),
  status: v.optional(v.string()),
  propertyId: v.optional(v.string()),
  sortBy: v.optional(v.string()),
  sortOrder: v.optional(v.union([v.literal('asc'), v.literal('desc')])),
});

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

export const VAddLeaseFilesSchema = v.object({
  leaseId: v.string(),
  files: v.array(
    v.object({
      url: v.string(),
      name: v.string(),
      type: v.string(),
      size: v.number(),
    })
  ),
});

export const VDeleteLeaseFileSchema = v.object({
  id: v.string(),
});
