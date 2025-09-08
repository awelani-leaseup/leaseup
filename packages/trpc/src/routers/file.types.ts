import * as v from 'valibot';

export const VGetSignedUploadUrlSchema = v.object({
  path: v.string(),
});

export const VDeleteFileSchema = v.object({
  url: v.string(),
});
