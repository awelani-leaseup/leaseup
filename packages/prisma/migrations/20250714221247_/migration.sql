/*
  Warnings:

  - You are about to drop the column `dueDate` on the `Invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "dueDate",
ADD COLUMN     "paystackId" TEXT;

-- AlterTable
ALTER TABLE "Lease" ALTER COLUMN "startDate" SET DATA TYPE DATE,
ALTER COLUMN "endDate" SET DATA TYPE DATE;
