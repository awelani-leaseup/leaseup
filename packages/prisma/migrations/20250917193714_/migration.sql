/*
  Warnings:

  - The values [INACTIVE,EXPIRED] on the enum `SubscriptionPlanStatus` will be removed. If these variants are still used in the database, this will fail.
  - The `paystackSubscriptionStatus` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."SubscriptionPlanStatus_new" AS ENUM ('ACTIVE', 'NON_RENEWING', 'ATTENTION', 'DISABLED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."user" ALTER COLUMN "paystackSubscriptionStatus" TYPE "public"."SubscriptionPlanStatus_new" USING ("paystackSubscriptionStatus"::text::"public"."SubscriptionPlanStatus_new");
ALTER TYPE "public"."SubscriptionPlanStatus" RENAME TO "SubscriptionPlanStatus_old";
ALTER TYPE "public"."SubscriptionPlanStatus_new" RENAME TO "SubscriptionPlanStatus";
DROP TYPE "public"."SubscriptionPlanStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "paystackSubscriptionStatus",
ADD COLUMN     "paystackSubscriptionStatus" "public"."SubscriptionPlanStatus";
