/*
  Warnings:

  - You are about to drop the column `createdAt` on the `TenantLease` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TenantLease` table. All the data in the column will be lost.
  - Added the required column `leaseType` to the `Lease` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvoiceCycle" AS ENUM ('MONTHLY');

-- AlterTable
ALTER TABLE "Lease" ADD COLUMN     "automaticInvoice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "invoiceCycle" "InvoiceCycle" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "leaseType" "LeaseTermType" NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TenantLease" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
