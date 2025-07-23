-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_tenantId_fkey";

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "tenantId" DROP NOT NULL,
ALTER COLUMN "tenantId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
