/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Property` table. All the data in the column will be lost.
  - Added the required column `landlordId` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "lineItems" JSONB;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "ownerId",
ADD COLUMN     "landlordId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "idNumber" TEXT,
ADD COLUMN     "paystackSplitGroupId" TEXT,
ADD COLUMN     "paystackSubAccountId" TEXT,
ADD COLUMN     "paystackSubscriptionId" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zip" TEXT,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
