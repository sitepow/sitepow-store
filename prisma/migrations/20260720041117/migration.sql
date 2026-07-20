-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "bankAccountId" TEXT;

-- CreateIndex
CREATE INDEX "Order_bankAccountId_idx" ON "Order"("bankAccountId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
