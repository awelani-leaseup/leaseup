-- CreateEnum
CREATE TYPE "public"."CustomerIdentificationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."invoice" ADD COLUMN     "offlineReference" TEXT DEFAULT '';

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "customerIdentificationStatus" "public"."CustomerIdentificationStatus" NOT NULL DEFAULT 'PENDING';
