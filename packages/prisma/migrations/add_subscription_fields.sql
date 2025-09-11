-- Migration to add comprehensive subscription tracking fields to User table
-- Run this after updating your schema.prisma

-- Add new subscription tracking columns
ALTER TABLE "user" ADD COLUMN "paystackSubscriptionStatus" TEXT;
ALTER TABLE "user" ADD COLUMN "subscriptionPlanCode" TEXT;
ALTER TABLE "user" ADD COLUMN "subscriptionAmount" INTEGER;
ALTER TABLE "user" ADD COLUMN "subscriptionCurrency" TEXT;
ALTER TABLE "user" ADD COLUMN "subscriptionInterval" TEXT;
ALTER TABLE "user" ADD COLUMN "nextPaymentDate" TIMESTAMP(3);
ALTER TABLE "user" ADD COLUMN "subscriptionCreatedAt" TIMESTAMP(3);
ALTER TABLE "user" ADD COLUMN "subscriptionUpdatedAt" TIMESTAMP(3);
ALTER TABLE "user" ADD COLUMN "lastPaymentFailure" TEXT;
ALTER TABLE "user" ADD COLUMN "paymentRetryCount" INTEGER DEFAULT 0;

-- Add comments to document the fields
COMMENT ON COLUMN "user"."paystackSubscriptionStatus" IS 'Subscription status: active, non-renewing, attention, completed, cancelled';
COMMENT ON COLUMN "user"."subscriptionPlanCode" IS 'Paystack plan code (PLN_xxx)';
COMMENT ON COLUMN "user"."subscriptionAmount" IS 'Subscription amount in kobo/cents';
COMMENT ON COLUMN "user"."subscriptionCurrency" IS 'Subscription currency (NGN, ZAR, etc.)';
COMMENT ON COLUMN "user"."subscriptionInterval" IS 'Billing interval (monthly, yearly, etc.)';
COMMENT ON COLUMN "user"."nextPaymentDate" IS 'Next scheduled payment date';
COMMENT ON COLUMN "user"."subscriptionCreatedAt" IS 'When the subscription was created';
COMMENT ON COLUMN "user"."subscriptionUpdatedAt" IS 'When subscription was last updated';
COMMENT ON COLUMN "user"."lastPaymentFailure" IS 'Last payment failure reason';
COMMENT ON COLUMN "user"."paymentRetryCount" IS 'Number of payment retry attempts';

-- Create index for subscription status queries
CREATE INDEX "idx_user_subscription_status" ON "user"("paystackSubscriptionStatus");
CREATE INDEX "idx_user_next_payment_date" ON "user"("nextPaymentDate");
CREATE INDEX "idx_user_subscription_id" ON "user"("paystackSubscriptionId");
