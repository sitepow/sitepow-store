/*
  Warnings:

  - The values [RESTAURANT,DIGITAL_GAME,NATURAL_ORGANIC,TECH_GADGET,HEALTH_BEAUTY,BARBER_SALON,MASSAGE_SPA,CLINIC_WELLNESS] on the enum `ThemeKey` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `discountAmount` to the `ResellerCustomPrice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "ThemeKey_new" AS ENUM ('DEFAULT', 'FOOD_BEVERAGE', 'FASHION_LUXURY', 'TECH_DIGITAL', 'BOOKING_SERVICE');
ALTER TABLE "public"."StoreThemeConfig" ALTER COLUMN "themeKey" DROP DEFAULT;
ALTER TABLE "StoreThemeConfig" ALTER COLUMN "themeKey" TYPE "ThemeKey_new" USING ("themeKey"::text::"ThemeKey_new");
ALTER TYPE "ThemeKey" RENAME TO "ThemeKey_old";
ALTER TYPE "ThemeKey_new" RENAME TO "ThemeKey";
DROP TYPE "public"."ThemeKey_old";
ALTER TABLE "StoreThemeConfig" ALTER COLUMN "themeKey" SET DEFAULT 'DEFAULT';
COMMIT;

-- AlterTable
ALTER TABLE "ResellerAgreement" ADD COLUMN     "contractDocument" TEXT,
ADD COLUMN     "contractTitle" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "signatureUrl" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ResellerCustomPrice" ADD COLUMN     "discountAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
ALTER COLUMN "specialPrice" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ResellerStock" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "allocatedQuantity" INTEGER NOT NULL DEFAULT 0,
    "soldQuantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResellerStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResellerPayout" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "paymentProof" TEXT,
    "paidAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResellerPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResellerStock_agreementId_variantId_key" ON "ResellerStock"("agreementId", "variantId");

-- CreateIndex
CREATE INDEX "ResellerPayout_agreementId_idx" ON "ResellerPayout"("agreementId");

-- CreateIndex
CREATE INDEX "ResellerAgreement_expiresAt_status_idx" ON "ResellerAgreement"("expiresAt", "status");

-- AddForeignKey
ALTER TABLE "ResellerStock" ADD CONSTRAINT "ResellerStock_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "ResellerAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResellerStock" ADD CONSTRAINT "ResellerStock_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResellerPayout" ADD CONSTRAINT "ResellerPayout_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "ResellerAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
