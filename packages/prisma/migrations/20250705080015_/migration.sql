-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "additionalEmails" TEXT[],
ADD COLUMN     "additionalPhones" TEXT[],
ADD COLUMN     "emergencyContacts" JSONB,
ADD COLUMN     "vehicles" JSONB;
