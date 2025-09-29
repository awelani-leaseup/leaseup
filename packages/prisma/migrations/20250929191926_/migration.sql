-- AlterTable
ALTER TABLE "public"."file" ADD COLUMN     "transactionId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."file" ADD CONSTRAINT "file_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
