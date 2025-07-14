/*
  Warnings:

  - You are about to drop the column `deposit` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `leaseTerm` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `leaseTermType` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `sqmt` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the `LeaseDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PropertyDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TenantDocument` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LeaseDocument" DROP CONSTRAINT "LeaseDocument_leaseId_fkey";

-- DropForeignKey
ALTER TABLE "PropertyDocument" DROP CONSTRAINT "PropertyDocument_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "TenantDocument" DROP CONSTRAINT "TenantDocument_tenantId_fkey";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "deposit",
DROP COLUMN "leaseTerm",
DROP COLUMN "leaseTermType",
DROP COLUMN "sqmt";

-- DropTable
DROP TABLE "LeaseDocument";

-- DropTable
DROP TABLE "PropertyDocument";

-- DropTable
DROP TABLE "TenantDocument";

-- DropEnum
DROP TYPE "DocumentType";

-- DropEnum
DROP TYPE "TenantDocumentType";

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "tenantId" TEXT,
    "propertyId" TEXT,
    "leaseId" TEXT,
    "invoiceId" TEXT,
    "maintenanceRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Landlord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES "MaintenanceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
