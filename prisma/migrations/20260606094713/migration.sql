-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "notifyBillingAlert" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyDailySummary" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyLowStock" BOOLEAN NOT NULL DEFAULT true;
