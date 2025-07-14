/*
  Warnings:

  - You are about to drop the column `bathrooms` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `bedrooms` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `marketRent` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `squareMeters` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `test` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "bathrooms",
DROP COLUMN "bedrooms",
DROP COLUMN "marketRent",
DROP COLUMN "squareMeters",
DROP COLUMN "test";
