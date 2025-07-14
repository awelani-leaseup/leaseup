/*
  Warnings:

  - You are about to drop the `TenantEmergencyContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TenantIncome` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TenantEmergencyContact" DROP CONSTRAINT "TenantEmergencyContact_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "TenantIncome" DROP CONSTRAINT "TenantIncome_tenantId_fkey";

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "tenantEmergencyContact" JSONB,
ADD COLUMN     "tenantIncome" JSONB;

-- DropTable
DROP TABLE "TenantEmergencyContact";

-- DropTable
DROP TABLE "TenantIncome";
