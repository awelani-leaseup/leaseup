/*
  Warnings:

  - Made the column `paystackId` on table `Invoice` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "InvoiceStatus" ADD VALUE 'PARTIALLY_PAID';

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "paystackId" SET NOT NULL;
