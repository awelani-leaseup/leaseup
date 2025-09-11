-- AlterTable
ALTER TABLE "user" ADD COLUMN     "lastPaymentFailure" TEXT,
ADD COLUMN     "nextPaymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentRetryCount" INTEGER DEFAULT 0,
ADD COLUMN     "paystackSubscriptionStatus" TEXT,
ADD COLUMN     "subscriptionAmount" INTEGER,
ADD COLUMN     "subscriptionCreatedAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionCurrency" TEXT,
ADD COLUMN     "subscriptionInterval" TEXT,
ADD COLUMN     "subscriptionPlanCode" TEXT,
ADD COLUMN     "subscriptionUpdatedAt" TIMESTAMP(3);
