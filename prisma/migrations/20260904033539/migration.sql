-- CreateEnum
CREATE TYPE "MarketplacePlatform" AS ENUM ('SHOPEE', 'LAZADA', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "MarketplaceConnectionStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'EXPIRED', 'ERROR');

-- CreateEnum
CREATE TYPE "MarketplaceSyncStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');

-- CreateTable
CREATE TABLE "MarketplaceConnection" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "platform" "MarketplacePlatform" NOT NULL,
    "status" "MarketplaceConnectionStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "shopId" TEXT,
    "shopName" TEXT,
    "appKey" TEXT,
    "appSecret" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "isAutoSync" BOOLEAN NOT NULL DEFAULT true,
    "isSimulator" BOOLEAN NOT NULL DEFAULT false,
    "defaultBranchId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceProductMapping" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "marketplaceItemId" TEXT NOT NULL,
    "marketplaceSku" TEXT NOT NULL,
    "autoSyncStock" BOOLEAN NOT NULL DEFAULT true,
    "autoSyncPrice" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedStock" INTEGER,
    "lastSyncedPrice" DECIMAL(10,2),
    "lastSyncedAt" TIMESTAMP(3),
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceProductMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceSyncLog" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "platform" "MarketplacePlatform" NOT NULL,
    "action" TEXT NOT NULL,
    "status" "MarketplaceSyncStatus" NOT NULL,
    "itemsCount" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB,
    "response" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketplaceConnection_storeId_idx" ON "MarketplaceConnection"("storeId");

-- CreateIndex
CREATE INDEX "MarketplaceConnection_platform_idx" ON "MarketplaceConnection"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceConnection_storeId_platform_shopId_key" ON "MarketplaceConnection"("storeId", "platform", "shopId");

-- CreateIndex
CREATE INDEX "MarketplaceProductMapping_connectionId_idx" ON "MarketplaceProductMapping"("connectionId");

-- CreateIndex
CREATE INDEX "MarketplaceProductMapping_variantId_idx" ON "MarketplaceProductMapping"("variantId");

-- CreateIndex
CREATE INDEX "MarketplaceProductMapping_marketplaceSku_idx" ON "MarketplaceProductMapping"("marketplaceSku");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceProductMapping_connectionId_variantId_key" ON "MarketplaceProductMapping"("connectionId", "variantId");

-- CreateIndex
CREATE INDEX "MarketplaceSyncLog_storeId_idx" ON "MarketplaceSyncLog"("storeId");

-- CreateIndex
CREATE INDEX "MarketplaceSyncLog_connectionId_idx" ON "MarketplaceSyncLog"("connectionId");

-- CreateIndex
CREATE INDEX "MarketplaceSyncLog_createdAt_idx" ON "MarketplaceSyncLog"("createdAt");

-- AddForeignKey
ALTER TABLE "MarketplaceConnection" ADD CONSTRAINT "MarketplaceConnection_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceConnection" ADD CONSTRAINT "MarketplaceConnection_defaultBranchId_fkey" FOREIGN KEY ("defaultBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceProductMapping" ADD CONSTRAINT "MarketplaceProductMapping_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "MarketplaceConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceProductMapping" ADD CONSTRAINT "MarketplaceProductMapping_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceSyncLog" ADD CONSTRAINT "MarketplaceSyncLog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceSyncLog" ADD CONSTRAINT "MarketplaceSyncLog_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "MarketplaceConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
