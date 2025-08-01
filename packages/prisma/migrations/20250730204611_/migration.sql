/*
  Warnings:

  - Added the required column `landlordId` to the `invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."invoice" ADD COLUMN     "landlordId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."invoice" ADD CONSTRAINT "invoice_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
