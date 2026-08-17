-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "storeId" TEXT;

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "receiptImage" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "costPrice" DECIMAL(10,2) DEFAULT 0;

-- CreateIndex
CREATE INDEX "Address_customerId_idx" ON "Address"("customerId");

-- CreateIndex
CREATE INDEX "Address_storeId_idx" ON "Address"("storeId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
