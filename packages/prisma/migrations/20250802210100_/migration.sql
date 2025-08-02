/*
  Warnings:

  - Made the column `description` on table `maintenance_request` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `maintenance_request` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priority` on table `maintenance_request` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."maintenance_request" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "priority" SET NOT NULL;
