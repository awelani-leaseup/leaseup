import * as v from 'valibot';

export const VGetSignedUploadUrlSchema = v.object({
  path: v.string(),
});
