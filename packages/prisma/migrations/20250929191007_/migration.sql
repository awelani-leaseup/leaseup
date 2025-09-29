-- CreateEnum
CREATE TYPE "public"."TransactionMethod" AS ENUM ('OFFLINE', 'PAYSTACK');

-- AlterTable
ALTER TABLE "public"."transaction" ADD COLUMN     "method" "public"."TransactionMethod" NOT NULL DEFAULT 'OFFLINE';
