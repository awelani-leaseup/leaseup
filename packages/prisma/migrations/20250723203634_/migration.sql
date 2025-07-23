/*
  Warnings:

  - You are about to drop the column `userId` on the `RecurringBillable` table. All the data in the column will be lost.
  - Added the required column `startDate` to the `RecurringBillable` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RecurringBillable" DROP CONSTRAINT "RecurringBillable_userId_fkey";

-- AlterTable
ALTER TABLE "RecurringBillable" DROP COLUMN "userId",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" DATE NOT NULL;
