/*
  Warnings:

  - Added the required column `productType` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProductType" ADD VALUE 'DIGITAL_LINK';
ALTER TYPE "ProductType" ADD VALUE 'DIGITAL_ITEM';
ALTER TYPE "ProductType" ADD VALUE 'SERVICE';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "customerNote" TEXT,
ADD COLUMN     "productType" "ProductType" NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "DigitalItem" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "variantId" TEXT NOT NULL,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DigitalItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DigitalItem" ADD CONSTRAINT "DigitalItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalItem" ADD CONSTRAINT "DigitalItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
