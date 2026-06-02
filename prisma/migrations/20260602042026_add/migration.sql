/*
  Warnings:

  - You are about to drop the column `shippopLabelUrl` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippopPurchaseId` on the `Order` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ShippingZoneType" AS ENUM ('NORMAL', 'REMOTE_AREA', 'BORDER_PROVINCES');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "shippopLabelUrl",
DROP COLUMN "shippopPurchaseId";

-- CreateTable
CREATE TABLE "Courier" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Courier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourierService" (
    "id" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "estimatedDays" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourierService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingSetting" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "freeShipMin" DECIMAL(10,2) NOT NULL DEFAULT 999.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreCourierService" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "courierServiceId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreCourierService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreServiceWeightRate" (
    "id" TEXT NOT NULL,
    "storeCourierServiceId" TEXT NOT NULL,
    "minWeight" DECIMAL(10,3) NOT NULL DEFAULT 0.00,
    "maxWeight" DECIMAL(10,3) NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreServiceWeightRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreServiceZoneRate" (
    "id" TEXT NOT NULL,
    "storeCourierServiceId" TEXT NOT NULL,
    "zoneType" "ShippingZoneType" NOT NULL,
    "additionalFee" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreServiceZoneRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Courier_code_key" ON "Courier"("code");

-- CreateIndex
CREATE INDEX "Courier_code_idx" ON "Courier"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CourierService_code_key" ON "CourierService"("code");

-- CreateIndex
CREATE INDEX "CourierService_courierId_idx" ON "CourierService"("courierId");

-- CreateIndex
CREATE INDEX "CourierService_code_idx" ON "CourierService"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingSetting_storeId_key" ON "ShippingSetting"("storeId");

-- CreateIndex
CREATE INDEX "StoreCourierService_storeId_idx" ON "StoreCourierService"("storeId");

-- CreateIndex
CREATE INDEX "StoreCourierService_courierServiceId_idx" ON "StoreCourierService"("courierServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreCourierService_storeId_courierServiceId_key" ON "StoreCourierService"("storeId", "courierServiceId");

-- CreateIndex
CREATE INDEX "StoreServiceWeightRate_storeCourierServiceId_idx" ON "StoreServiceWeightRate"("storeCourierServiceId");

-- CreateIndex
CREATE INDEX "StoreServiceZoneRate_storeCourierServiceId_idx" ON "StoreServiceZoneRate"("storeCourierServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreServiceZoneRate_storeCourierServiceId_zoneType_key" ON "StoreServiceZoneRate"("storeCourierServiceId", "zoneType");

-- AddForeignKey
ALTER TABLE "CourierService" ADD CONSTRAINT "CourierService_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingSetting" ADD CONSTRAINT "ShippingSetting_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreCourierService" ADD CONSTRAINT "StoreCourierService_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreCourierService" ADD CONSTRAINT "StoreCourierService_courierServiceId_fkey" FOREIGN KEY ("courierServiceId") REFERENCES "CourierService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreServiceWeightRate" ADD CONSTRAINT "StoreServiceWeightRate_storeCourierServiceId_fkey" FOREIGN KEY ("storeCourierServiceId") REFERENCES "StoreCourierService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreServiceZoneRate" ADD CONSTRAINT "StoreServiceZoneRate_storeCourierServiceId_fkey" FOREIGN KEY ("storeCourierServiceId") REFERENCES "StoreCourierService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
