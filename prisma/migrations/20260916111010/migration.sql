-- CreateEnum safely
DO $$ BEGIN
    CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'BILL_REQUESTED', 'RESERVED', 'CLEANING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "KitchenItemStatus" AS ENUM ('PENDING', 'COOKING', 'READY', 'SERVED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable Order
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "kitchenNote" TEXT,
ADD COLUMN IF NOT EXISTS "orderType" "OrderType" NOT NULL DEFAULT 'DINE_IN',
ADD COLUMN IF NOT EXISTS "tableId" TEXT,
ADD COLUMN IF NOT EXISTS "tableSessionId" TEXT;

-- AlterTable OrderItem
ALTER TABLE "OrderItem" 
ADD COLUMN IF NOT EXISTS "kitchenStatus" "KitchenItemStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable TableZone
CREATE TABLE IF NOT EXISTS "TableZone" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TableZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable RestaurantTable
CREATE TABLE IF NOT EXISTS "RestaurantTable" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "zoneId" TEXT,
    "tableNumber" TEXT NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 4,
    "status" "TableStatus" NOT NULL DEFAULT 'AVAILABLE',
    "qrCodeToken" TEXT NOT NULL,
    "currentSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable TableSession
CREATE TABLE IF NOT EXISTS "TableSession" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "sessionCode" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "status" "TableStatus" NOT NULL DEFAULT 'OCCUPIED',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TableSession_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "TableZone_storeId_branchId_idx" ON "TableZone"("storeId", "branchId");
CREATE UNIQUE INDEX IF NOT EXISTS "RestaurantTable_qrCodeToken_key" ON "RestaurantTable"("qrCodeToken");
CREATE INDEX IF NOT EXISTS "RestaurantTable_storeId_branchId_idx" ON "RestaurantTable"("storeId", "branchId");
CREATE INDEX IF NOT EXISTS "RestaurantTable_qrCodeToken_idx" ON "RestaurantTable"("qrCodeToken");
CREATE UNIQUE INDEX IF NOT EXISTS "RestaurantTable_branchId_tableNumber_key" ON "RestaurantTable"("branchId", "tableNumber");
CREATE INDEX IF NOT EXISTS "TableSession_tableId_status_idx" ON "TableSession"("tableId", "status");
CREATE INDEX IF NOT EXISTS "TableSession_storeId_branchId_idx" ON "TableSession"("storeId", "branchId");
CREATE INDEX IF NOT EXISTS "Order_tableId_idx" ON "Order"("tableId");
CREATE INDEX IF NOT EXISTS "Order_tableSessionId_idx" ON "Order"("tableSessionId");
CREATE INDEX IF NOT EXISTS "OrderItem_kitchenStatus_idx" ON "OrderItem"("kitchenStatus");

-- Foreign Keys (Drop if exists first to avoid duplicate constraint errors)
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_tableId_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "RestaurantTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_tableSessionId_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableSessionId_fkey" FOREIGN KEY ("tableSessionId") REFERENCES "TableSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TableZone" DROP CONSTRAINT IF EXISTS "TableZone_storeId_fkey";
ALTER TABLE "TableZone" ADD CONSTRAINT "TableZone_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TableZone" DROP CONSTRAINT IF EXISTS "TableZone_branchId_fkey";
ALTER TABLE "TableZone" ADD CONSTRAINT "TableZone_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RestaurantTable" DROP CONSTRAINT IF EXISTS "RestaurantTable_storeId_fkey";
ALTER TABLE "RestaurantTable" ADD CONSTRAINT "RestaurantTable_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RestaurantTable" DROP CONSTRAINT IF EXISTS "RestaurantTable_branchId_fkey";
ALTER TABLE "RestaurantTable" ADD CONSTRAINT "RestaurantTable_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RestaurantTable" DROP CONSTRAINT IF EXISTS "RestaurantTable_zoneId_fkey";
ALTER TABLE "RestaurantTable" ADD CONSTRAINT "RestaurantTable_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "TableZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TableSession" DROP CONSTRAINT IF EXISTS "TableSession_tableId_fkey";
ALTER TABLE "TableSession" ADD CONSTRAINT "TableSession_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "RestaurantTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;