import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { VGetSignedUploadUrlSchema, VDeleteFileSchema } from './file.types';
import { TRPCError } from '@trpc/server';
import { del } from '@vercel/blob';

export const fileRouter = createTRPCRouter({
  getSignedUploadUrl: protectedProcedure
    .input(VGetSignedUploadUrlSchema)
    .mutation(async ({ ctx, input }) => {
      const { path } = input;

      try {
        const { data, error } = await ctx.supabaseServer.storage
          .from('file-storage')
          .createSignedUrl(path, 600);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          });
        }

        return { signedUrl: data.signedUrl };
      } catch (error) {
        console.error('Error creating signed URL:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create signed URL',
        });
      }
    }),

  deleteFile: protectedProcedure
    .input(VDeleteFileSchema)
    .mutation(async ({ ctx, input }) => {
      const { url } = input;

      try {
        if (
          url.includes('vercel-storage.com') ||
          url.includes('blob.vercel-storage.com')
        ) {
          await del(url);
          return { success: true, message: 'File deleted from Vercel Blob' };
        }

        if (typeof url === 'string' && !url.startsWith('http')) {
          const { error } = await ctx.supabaseServer.storage
            .from('file-storage')
            .remove([url]);

          if (error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: error.message,
            });
          }

          return { success: true, message: 'File deleted from Supabase' };
        }

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid file URL or path',
        });
      } catch (error) {
        console.error('Error deleting file:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete file',
        });
      }
    }),
});

export type FileRouter = typeof fileRouter;
