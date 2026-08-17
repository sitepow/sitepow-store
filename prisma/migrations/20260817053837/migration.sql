/*
  Warnings:

  - Made the column `storeId` on table `Address` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "storeId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Address_customerId_storeId_idx" ON "Address"("customerId", "storeId");
