import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { VCreateSignedUploadUrlSchema } from './supabase.types';

export const supabaseRouter = createTRPCRouter({
  createSignedUploadUrl: protectedProcedure
    .input(VCreateSignedUploadUrlSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabaseServer.storage
        .from('file-storage')
        .createSignedUrl(input.path, 600);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),
});

export type SupabaseRouter = typeof supabaseRouter;
