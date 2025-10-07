/*
  Warnings:

  - The `invoiceNumber` column on the `invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[invoiceNumber]` on the table `invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "invoiceNumber",
ADD COLUMN     "invoiceNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceNumber_key" ON "invoice"("invoiceNumber");
