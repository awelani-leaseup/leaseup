-- AlterEnum
ALTER TYPE "InvoiceStatus" ADD VALUE 'DRAFT';

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_leaseId_fkey";

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "leaseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE SET NULL ON UPDATE CASCADE;
