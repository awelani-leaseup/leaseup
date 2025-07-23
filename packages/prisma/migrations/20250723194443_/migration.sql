-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "recurringBillableId" TEXT;

-- CreateTable
CREATE TABLE "RecurringBillable" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" "InvoiceCategory" NOT NULL,
    "cycle" "InvoiceCycle" NOT NULL DEFAULT 'MONTHLY',
    "nextInvoiceAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "leaseId" TEXT,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT,
    "landlordId" TEXT NOT NULL,

    CONSTRAINT "RecurringBillable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_recurringBillableId_fkey" FOREIGN KEY ("recurringBillableId") REFERENCES "RecurringBillable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringBillable" ADD CONSTRAINT "RecurringBillable_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringBillable" ADD CONSTRAINT "RecurringBillable_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringBillable" ADD CONSTRAINT "RecurringBillable_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringBillable" ADD CONSTRAINT "RecurringBillable_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
