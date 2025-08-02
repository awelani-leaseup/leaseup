-- AlterTable
ALTER TABLE "public"."maintenance_request" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;
