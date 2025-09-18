import * as v from 'valibot';

export const VGetSignedUploadUrlSchema = v.object({
  path: v.string(),
});

export const VDeleteFileSchema = v.object({
  url: v.string(),
});

export const VGetAllFilesSchema = v.object({
  page: v.optional(v.number(), 1),
  limit: v.optional(v.number(), 20),
  search: v.optional(v.string()),
  propertyId: v.optional(v.string()),
  tenantId: v.optional(v.string()),
  leaseId: v.optional(v.string()),
  type: v.optional(v.string()),
  sortBy: v.optional(v.string()),
  sortOrder: v.optional(v.union([v.literal('asc'), v.literal('desc')]), 'desc'),
});

export const VDeleteFileByIdSchema = v.object({
  id: v.string(),
});
