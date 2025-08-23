/*
  Warnings:

  - A unique constraint covering the columns `[landlordId,email]` on the table `tenant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[landlordId,phone]` on the table `tenant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tenant_landlordId_email_key" ON "public"."tenant"("landlordId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_landlordId_phone_key" ON "public"."tenant"("landlordId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "public"."user"("phone");
