/*
  Warnings:

  - The values [DISABILITY] on the enum `TenantIncomeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."LeaseStatus" ADD VALUE 'ENDED';
ALTER TYPE "public"."LeaseStatus" ADD VALUE 'RENEWED';

-- AlterEnum
BEGIN;
CREATE TYPE "public"."TenantIncomeType_new" AS ENUM ('SALARY', 'SELF_EMPLOYED', 'UNEMPLOYED', 'RETIRED', 'OTHER');
ALTER TYPE "public"."TenantIncomeType" RENAME TO "TenantIncomeType_old";
ALTER TYPE "public"."TenantIncomeType_new" RENAME TO "TenantIncomeType";
DROP TYPE "public"."TenantIncomeType_old";
COMMIT;
