/*
  Warnings:

  - Added the required column `totalAmountBase` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CountryCode" AS ENUM ('TH', 'SG', 'MY', 'ID', 'JP', 'KR', 'IN', 'HK', 'TW', 'AU', 'US', 'CN', 'GB', 'DE', 'FR', 'CA');

-- CreateEnum
CREATE TYPE "CurrencyCode" AS ENUM ('THB', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'SGD', 'KRW', 'TWD', 'INR', 'IDR', 'MYR', 'PHP', 'VND', 'MMK', 'KHR', 'LAK', 'BND', 'AED', 'SAR', 'NZD');

-- AlterEnum
ALTER TYPE "ShippingZoneType" ADD VALUE 'INTERNATIONAL';

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "country" "CountryCode" NOT NULL DEFAULT 'TH';

-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "Courier" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "CourierService" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerCurrency" "CurrencyCode" NOT NULL DEFAULT 'THB',
ADD COLUMN     "totalAmountBase" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "ProductAddon" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "ProductChoice" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "ProductOption" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "baseCurrency" "CurrencyCode" NOT NULL DEFAULT 'THB',
ADD COLUMN     "isInternationalSetup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "translations" JSONB;

-- AlterTable
ALTER TABLE "StoreCourierService" ADD COLUMN     "advancedRules" JSONB;
