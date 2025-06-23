/*
  Warnings:

  - You are about to drop the column `name` on the `Landlord` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Tenant` table. All the data in the column will be lost.
  - Added the required column `addressLine1` to the `Landlord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Landlord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Landlord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Landlord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Landlord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Landlord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Landlord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip` to the `Landlord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rentDueCurrency` to the `Lease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `Lease` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LeaseTermType" AS ENUM ('MONTHLY', 'FIXED_TERM');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('SINGLE_UNIT', 'MULTI_UNIT');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('LEASE_AGREEMENT', 'RECEIPT', 'OTHER');

-- CreateEnum
CREATE TYPE "TenantDocumentType" AS ENUM ('ID', 'DRIVING_LICENSE', 'PROOF_OF_BANK_ACCOUNT', 'PROOF_OF_INCOME', 'PROOF_OF_VEHICLE_REGISTRATION', 'LEASE_AGREEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "TenantIncomeType" AS ENUM ('SALARY', 'SELF_EMPLOYED', 'UNEMPLOYED', 'RETIRED', 'DISABILITY', 'OTHER');

-- CreateEnum
CREATE TYPE "TenantRelationship" AS ENUM ('SPOUSE', 'PARENT', 'GRANDPARENT', 'GRANDCHILD', 'SIBLING', 'CHILD', 'AUNT_UNCLE', 'COUSIN', 'NEPHEW_NIECE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaintenanceRequestStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'CANCELLED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "MaintenanceRequestPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "InvoiceCategory" AS ENUM ('DEPOSIT', 'RENT', 'MAINTENANCE', 'UTILITY_BILL', 'LEVY', 'RATES_AND_TAXES', 'SERVICE_CHARGE', 'WATER_ELECTRICITY', 'OTHER');

-- DropForeignKey
ALTER TABLE "Lease" DROP CONSTRAINT "Lease_propertyId_fkey";

-- AlterTable
ALTER TABLE "Landlord" DROP COLUMN "name",
ADD COLUMN     "addressLine1" TEXT NOT NULL,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "zip" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lease" ADD COLUMN     "rentDueCurrency" TEXT NOT NULL,
ADD COLUMN     "unitId" TEXT NOT NULL,
ALTER COLUMN "propertyId" DROP NOT NULL,
ALTER COLUMN "rent" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "deposit" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "bathrooms" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "bedrooms" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "deposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "leaseTerm" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "leaseTermType" "LeaseTermType" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "marketRent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "propertyStatus" "PropertyStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "propertyType" "PropertyType" NOT NULL DEFAULT 'MULTI_UNIT',
ADD COLUMN     "squareMeters" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "name",
ADD COLUMN     "altEmail" TEXT,
ADD COLUMN     "altPhone" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TenantEmergencyContact" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "relationship" "TenantRelationship" NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantEmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantIncome" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "income" DOUBLE PRECISION NOT NULL,
    "incomeType" "TenantIncomeType" NOT NULL,
    "position" TEXT,
    "employer" TEXT,
    "employerAddressLine1" TEXT,
    "employerAddressLine2" TEXT,
    "employerCity" TEXT,
    "employerState" TEXT,
    "employerZip" TEXT,
    "employerCountryCode" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "currentIncome" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantIncome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueAmount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "category" "InvoiceCategory" NOT NULL,
    "status" "InvoiceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "invoiceId" TEXT,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "MaintenanceRequestStatus" NOT NULL,
    "priority" "MaintenanceRequestPriority" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "documentType" "TenantDocumentType" NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaseDocument" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaseDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyDocument" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TenantEmergencyContact" ADD CONSTRAINT "TenantEmergencyContact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantIncome" ADD CONSTRAINT "TenantIncome_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantDocument" ADD CONSTRAINT "TenantDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaseDocument" ADD CONSTRAINT "LeaseDocument_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
