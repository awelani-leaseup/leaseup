import * as v from 'valibot';

export const VGetAllInvoicesSchema = v.object({
  page: v.pipe(v.number(), v.minValue(1, 'Page must be at least 1')),
  limit: v.pipe(
    v.number(),
    v.minValue(1, 'Limit must be at least 1'),
    v.maxValue(100, 'Limit cannot exceed 100')
  ),
  status: v.optional(v.string()),
  propertyId: v.optional(v.string()),
  search: v.optional(v.string()),
  sortBy: v.optional(v.string()),
  sortOrder: v.optional(v.union([v.literal('asc'), v.literal('desc')])),
});

export const VCreateInvoiceSchema = v.object({
  leaseId: v.optional(v.string()),
  tenantId: v.pipe(v.string(), v.nonEmpty()),
  notes: v.optional(v.pipe(v.string(), v.nonEmpty())),
  dueDate: v.date('Due date is required'),
  invoiceDate: v.date('Invoice date is required'),
  markAsPaid: v.boolean(),
  category: v.pipe(v.string(), v.minLength(1, 'Invoice category is required')),
  invoiceItems: v.pipe(
    v.array(
      v.object({
        description: v.pipe(
          v.string(),
          v.minLength(1, 'Item description is required')
        ),
        quantity: v.pipe(
          v.number(),
          v.minValue(1, 'Quantity must be at least 1')
        ),
        rate: v.pipe(v.number(), v.minValue(0, 'Rate must be positive')),
        amount: v.number(),
      })
    ),
    v.minLength(1, 'At least one invoice item is required')
  ),
  totalAmount: v.number(),
});
