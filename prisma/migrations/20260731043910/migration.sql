-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "ResellerType" AS ENUM ('INTERNAL_STORE', 'EXTERNAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DefaultRole" ADD VALUE 'POS_RESELLER';
ALTER TYPE "DefaultRole" ADD VALUE 'POS_CASHIER';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "resellerAgreementId" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "supplierVariantId" TEXT;

-- CreateTable
CREATE TABLE "ResellerAgreement" (
    "id" TEXT NOT NULL,
    "supplierStoreId" TEXT NOT NULL,
    "resellerType" "ResellerType" NOT NULL,
    "resellerStoreId" TEXT,
    "resellerCustomerId" TEXT,
    "status" "AgreementStatus" NOT NULL DEFAULT 'PENDING',
    "defaultDiscountType" "DiscountType",
    "defaultDiscountAmount" DECIMAL(10,2),
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResellerAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResellerCustomPrice" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "specialPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ResellerCustomPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResellerAgreement_supplierStoreId_idx" ON "ResellerAgreement"("supplierStoreId");

-- CreateIndex
CREATE UNIQUE INDEX "ResellerAgreement_supplierStoreId_resellerStoreId_key" ON "ResellerAgreement"("supplierStoreId", "resellerStoreId");

-- CreateIndex
CREATE UNIQUE INDEX "ResellerAgreement_supplierStoreId_resellerCustomerId_key" ON "ResellerAgreement"("supplierStoreId", "resellerCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "ResellerCustomPrice_agreementId_variantId_key" ON "ResellerCustomPrice"("agreementId", "variantId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_resellerAgreementId_fkey" FOREIGN KEY ("resellerAgreementId") REFERENCES "ResellerAgreement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResellerAgreement" ADD CONSTRAINT "ResellerAgreement_supplierStoreId_fkey" FOREIGN KEY ("supplierStoreId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResellerAgreement" ADD CONSTRAINT "ResellerAgreement_resellerStoreId_fkey" FOREIGN KEY ("resellerStoreId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResellerAgreement" ADD CONSTRAINT "ResellerAgreement_resellerCustomerId_fkey" FOREIGN KEY ("resellerCustomerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResellerCustomPrice" ADD CONSTRAINT "ResellerCustomPrice_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "ResellerAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResellerCustomPrice" ADD CONSTRAINT "ResellerCustomPrice_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
