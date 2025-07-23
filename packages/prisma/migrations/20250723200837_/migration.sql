/*
  Warnings:

  - You are about to drop the column `landlordId` on the `RecurringBillable` table. All the data in the column will be lost.
  - Made the column `tenantId` on table `Invoice` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "RecurringBillable" DROP CONSTRAINT "RecurringBillable_landlordId_fkey";

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "RecurringBillable" DROP COLUMN "landlordId",
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringBillable" ADD CONSTRAINT "RecurringBillable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
