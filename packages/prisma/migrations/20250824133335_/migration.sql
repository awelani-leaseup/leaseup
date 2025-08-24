/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tenant_email_key" ON "public"."tenant"("email");
