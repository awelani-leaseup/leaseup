import * as v from 'valibot';

export const VCreateSignedUploadUrlSchema = v.object({
  path: v.string(),
});
