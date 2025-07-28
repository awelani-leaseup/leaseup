import * as v from 'valibot';

export const VGetAllTransactionsSchema = v.object({
  page: v.optional(v.number()),
  limit: v.optional(v.number()),
  search: v.optional(v.string()),
  sortBy: v.optional(v.string()),
  sortOrder: v.optional(v.union([v.literal('asc'), v.literal('desc')])),
  propertyId: v.optional(v.string()),
  tenantId: v.optional(v.string()),
  amountMin: v.optional(v.number()),
  amountMax: v.optional(v.number()),
  dateFrom: v.optional(v.string()),
  dateTo: v.optional(v.string()),
});

export type VGetAllTransactionsSchemaType = v.InferInput<
  typeof VGetAllTransactionsSchema
>;
