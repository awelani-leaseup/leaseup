/*
  Warnings:

  - You are about to drop the column `addressLine1` on the `TenantEmergencyContact` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine2` on the `TenantEmergencyContact` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `TenantEmergencyContact` table. All the data in the column will be lost.
  - You are about to drop the column `countryCode` on the `TenantEmergencyContact` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `TenantEmergencyContact` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `TenantEmergencyContact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TenantEmergencyContact" DROP COLUMN "addressLine1",
DROP COLUMN "addressLine2",
DROP COLUMN "city",
DROP COLUMN "countryCode",
DROP COLUMN "state",
DROP COLUMN "zip";
