import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import {
  VPersonalInfoInput,
  VBusinessInfoInput,
  VAddressInfoInput,
  VProfilePictureInput,
  VChangePasswordInput,
  VBankingInfoInput,
} from './profile.types';
import { auth } from '../server/auth/auth';
import { paystack } from '@leaseup/payments/open-api/client';
import type { SubaccountUpdate } from '@leaseup/payments/open-api/paystack';

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
          paystackSubAccountId: true,
          idNumber: true,
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

  getBankingInfo: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.auth?.user?.id },
        select: {
          paystackSubAccountId: true,
          idNumber: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      let subaccountDetails: SubaccountUpdate | null = null;

      if (user.paystackSubAccountId) {
        try {
          const { data, error } = await paystack.GET('/subaccount/{code}', {
            params: {
              path: {
                code: user.paystackSubAccountId,
              },
            },
          });

          if (!error && data?.data) {
            subaccountDetails = data.data;
          }
        } catch (error) {
          console.error('Error fetching subaccount details:', error);
        }
      }

      return {
        paystackSubAccountId: user.paystackSubAccountId,
        idNumber: user.idNumber,
        subaccountDetails,
      };
    } catch (error) {
      console.error('Error fetching banking info:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch banking information. Please try again.',
      });
    }
  }),

  updateBankingInfo: protectedProcedure
    .input(VBankingInfoInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Update the user's ID information
        const updatedUser = await ctx.db.user.update({
          where: { id: ctx.auth?.user?.id },
          data: {
            idNumber: input.idNumber,
          },
          select: {
            id: true,
            paystackSubAccountId: true,
            idNumber: true,
            businessName: true,
            name: true,
            phone: true,
            email: true,
          },
        });

        if (updatedUser.paystackSubAccountId) {
          try {
            await paystack.PUT('/subaccount/{code}', {
              params: {
                path: {
                  code: updatedUser.paystackSubAccountId,
                },
              },
              body: {
                settlement_bank: input.bankCode,
                account_number: input.accountNumber,
                primary_contact_name: updatedUser.name,
                primary_contact_email: updatedUser.email,
                primary_contact_phone: updatedUser.phone ?? undefined,
              },
            });
          } catch (error) {
            console.error('Error updating Paystack subaccount:', error);
          }
        }

        return {
          success: true,
          user: updatedUser,
          message: 'Banking information updated successfully',
        };
      } catch (error) {
        console.error('Error updating banking information:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update banking information. Please try again.',
        });
      }
    }),

  getAllBanks: protectedProcedure.query(async ({ ctx }) => {
    const BANKS_COUNTRY = 'south africa';
    try {
      const { data, error } = await paystack.GET('/bank', {
        params: {
          query: {
            country: BANKS_COUNTRY,
          },
        },
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch banks from Paystack',
        });
      }

      return data?.data || [];
    } catch (error) {
      console.error('Error fetching banks:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch banks. Please try again.',
      });
    }
  }),
});
