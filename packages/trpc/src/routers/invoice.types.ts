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
