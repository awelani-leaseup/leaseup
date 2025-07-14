/*
  Warnings:

  - You are about to drop the column `propertyId` on the `Lease` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `Lease` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Lease" DROP CONSTRAINT "Lease_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "Lease" DROP CONSTRAINT "Lease_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Lease" DROP CONSTRAINT "Lease_unitId_fkey";

-- AlterTable
ALTER TABLE "Lease" DROP COLUMN "propertyId",
DROP COLUMN "tenantId",
ALTER COLUMN "unitId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
