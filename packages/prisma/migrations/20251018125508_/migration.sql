-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SubscriptionPlanStatus" ADD VALUE 'TRIAL_ACTIVE';
ALTER TYPE "SubscriptionPlanStatus" ADD VALUE 'TRIAL_EXPIRED';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "trialEndDate" TIMESTAMP(3),
ADD COLUMN     "trialStartDate" TIMESTAMP(3),
ADD COLUMN     "trialTokenizationTransactionId" TEXT;
