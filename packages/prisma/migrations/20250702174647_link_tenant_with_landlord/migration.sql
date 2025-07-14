/*
  Warnings:

  - Added the required column `landlordId` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "landlordId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "AmenityLaundry";

-- DropEnum
DROP TYPE "AmenityParking";

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "Landlord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
