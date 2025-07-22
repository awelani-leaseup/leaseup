-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_leaseId_fkey";

-- AlterTable
ALTER TABLE "Transactions" ALTER COLUMN "leaseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE SET NULL ON UPDATE CASCADE;
