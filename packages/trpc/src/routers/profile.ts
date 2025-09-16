import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import {
  VPersonalInfoInput,
  VBusinessInfoInput,
  VAddressInfoInput,
  VProfilePictureInput,
  VChangePasswordInput,
} from './profile.types';
import { auth } from '../server/auth/auth';

export const profileRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.auth?.user?.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          businessName: true,
          numberOfProperties: true,
          numberOfUnits: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          zip: true,
          countryCode: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user profile. Please try again.',
      });
    }
  }),

  updatePersonalInfo: protectedProcedure
    .input(VPersonalInfoInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.user.update({
          where: { id: ctx.auth?.user?.id },
          data: {
            name: input.fullName,
            phone: input.phone,
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        });
      } catch (error) {
        console.error('Error updating personal information:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update personal information. Please try again.',
        });
      }
    }),

  updateBusinessInfo: protectedProcedure
    .input(VBusinessInfoInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.user.update({
          where: { id: ctx.auth?.user?.id },
          data: {
            businessName: input.businessName,
            numberOfProperties: input.numberOfProperties,
            numberOfUnits: input.numberOfUnits,
          },
          select: {
            id: true,
            businessName: true,
            numberOfProperties: true,
            numberOfUnits: true,
          },
        });
      } catch (error) {
        console.error('Error updating business information:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update business information. Please try again.',
        });
      }
    }),

  updateAddressInfo: protectedProcedure
    .input(VAddressInfoInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.user.update({
          where: { id: ctx.auth?.user?.id },
          data: {
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2 || null,
            city: input.city,
            state: input.state,
            zip: input.zip,
            countryCode: input.countryCode,
          },
          select: {
            id: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            zip: true,
            countryCode: true,
          },
        });
      } catch (error) {
        console.error('Error updating address information:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update address information. Please try again.',
        });
      }
    }),

  updateProfilePicture: protectedProcedure
    .input(VProfilePictureInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.user.update({
          where: { id: ctx.auth?.user?.id },
          data: {
            image: input.image || null,
          },
          select: {
            id: true,
            image: true,
          },
        });
      } catch (error) {
        console.error('Error updating profile picture:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile picture. Please try again.',
        });
      }
    }),

  changePassword: protectedProcedure
    .input(VChangePasswordInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await auth.api.changePassword({
          body: {
            newPassword: input.password,
            currentPassword: input.currentPassword,
            revokeOtherSessions: true,
          },
        });
      } catch (error) {
        console.error('Error changing password:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change password. Please try again.',
        });
      }
    }),
});
