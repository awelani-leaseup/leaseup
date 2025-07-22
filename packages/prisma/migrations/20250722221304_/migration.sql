/*
  Warnings:

  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "country",
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "countryCode" TEXT DEFAULT 'ZA',
ADD COLUMN     "numberOfProperties" INTEGER,
ADD COLUMN     "numberOfUnits" INTEGER,
ADD COLUMN     "phone" TEXT;
