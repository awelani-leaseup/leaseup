import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import {
  VGetSignedUploadUrlSchema,
  VDeleteFileSchema,
  VGetAllFilesSchema,
  VDeleteFileByIdSchema,
} from './file.types';
import { TRPCError } from '@trpc/server';
import { del } from '@vercel/blob';
import { Prisma } from '@leaseup/prisma/client/index.js';

export const fileRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(VGetAllFilesSchema)
    .query(async ({ ctx, input }) => {
      const {
        page,
        limit,
        search,
        propertyId,
        tenantId,
        leaseId,
        type,
        sortBy,
        sortOrder,
      } = input;
      const skip = (page - 1) * limit;

      // Build where clause for filtering files by landlord
      const whereClause: Prisma.FileWhereInput = {
        ownerId: ctx.auth?.session?.userId ?? '',
      };

      // Add search filter
      if (search && search.trim()) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { type: { contains: search, mode: 'insensitive' } },
          {
            property: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
          {
            tenant: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ];
      }

      // Add filters
      if (propertyId && propertyId !== 'all') {
        whereClause.propertyId = propertyId;
      }

      if (tenantId && tenantId !== 'all') {
        whereClause.tenantId = tenantId;
      }

      if (leaseId && leaseId !== 'all') {
        whereClause.leaseId = leaseId;
      }

      if (type && type !== 'all') {
        whereClause.type = { contains: type, mode: 'insensitive' };
      }

      // Build orderBy clause
      let orderBy: Prisma.FileOrderByWithRelationInput = { createdAt: 'desc' };

      if (sortBy && sortOrder) {
        switch (sortBy) {
          case 'name':
            orderBy = { name: sortOrder };
            break;
          case 'createdAt':
            orderBy = { createdAt: sortOrder };
            break;
          case 'size':
            orderBy = { size: sortOrder };
            break;
          case 'type':
            orderBy = { type: sortOrder };
            break;
          default:
            orderBy = { createdAt: sortOrder };
        }
      }

      // Execute queries
      const [files, totalCount] = await Promise.all([
        ctx.db.file.findMany({
          where: whereClause,
          include: {
            property: {
              select: {
                id: true,
                name: true,
              },
            },
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
            lease: {
              select: {
                id: true,
                unit: {
                  select: {
                    name: true,
                    property: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            invoice: {
              select: {
                id: true,
              },
            },
            maintenanceRequest: {
              select: {
                id: true,
                description: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        ctx.db.file.count({
          where: whereClause,
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        files,
        totalCount,
        currentPage: page,
        totalPages,
      };
    }),

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

  deleteById: protectedProcedure
    .input(VDeleteFileByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.file.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.auth?.session?.userId ?? '',
        },
      });

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        });
      }

      await ctx.db.file.delete({
        where: {
          id: file.id,
          ownerId: ctx.auth?.session?.userId ?? '',
        },
      });

      // Delete from storage
      try {
        await del(file.url);
      } catch (error) {
        console.error('Error deleting file from storage:', error);
        // Don't fail the request if storage deletion fails
      }

      return {
        success: true,
      };
    }),
});

export type FileRouter = typeof fileRouter;
