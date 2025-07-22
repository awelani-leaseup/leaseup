import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { VOnboardingInput } from './onboarding.types';

export const onboardingRouter = createTRPCRouter({
  completeOnboarding: protectedProcedure
    .input(VOnboardingInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth!.user.id;

      try {
        // Update the user with onboarding information
        const updatedUser = await ctx.db.user.update({
          where: { id: userId },
          data: {
            businessName: input.businessName,
            numberOfProperties: input.numberOfProperties,
            numberOfUnits: input.numberOfUnits,
            name: input.fullName,
            phone: input.phone,
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2 || null,
            city: input.city,
            state: input.state,
            zip: input.zip,
            idNumber: input.idNumber,
            onboardingCompleted: true,
          },
        });

        // TODO: Create Paystack subaccount with banking details
        // This would typically involve:
        // 1. Creating a Paystack subaccount
        // 2. Storing the subaccount ID in the user record
        // 3. Setting up split payments

        // For now, we'll just store the banking details as metadata
        // In a real implementation, you'd want to:
        // - Validate the bank account with Paystack
        // - Create the subaccount
        // - Store the subaccount ID

        return {
          success: true,
          user: updatedUser,
          message: 'Onboarding completed successfully',
        };
      } catch (error) {
        console.error('Error completing onboarding:', error);
        throw new Error('Failed to complete onboarding. Please try again.');
      }
    }),

  /**
   * Get the current user's onboarding status
   */
  getOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth!.user.id;

    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        onboardingCompleted: true,
        businessName: true,
        numberOfProperties: true,
        numberOfUnits: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        zip: true,
        countryCode: true,
        idNumber: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      onboardingCompleted: user.onboardingCompleted,
      user,
    };
  }),
});
