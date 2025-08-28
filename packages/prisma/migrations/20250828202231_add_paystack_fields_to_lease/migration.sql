-- DropIndex
DROP INDEX "tenant_email_key";

-- AlterTable
ALTER TABLE "lease" ADD COLUMN     "paystackAuthorizationUrl" TEXT,
ADD COLUMN     "paystackPlanCode" TEXT,
ADD COLUMN     "paystackReference" TEXT,
ADD COLUMN     "paystackSubscriptionCode" TEXT;
