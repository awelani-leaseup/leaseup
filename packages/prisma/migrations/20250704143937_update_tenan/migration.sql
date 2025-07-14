/*
  Warnings:

  - You are about to drop the column `altEmail` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `altPhone` on the `Tenant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "altEmail",
DROP COLUMN "altPhone",
ADD COLUMN     "dateOfBirth" TIMESTAMP(3);
