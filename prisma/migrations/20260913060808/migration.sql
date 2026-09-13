-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "subDistrict" DROP NOT NULL,
ALTER COLUMN "district" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "baseCurrency" "CurrencyCode" NOT NULL DEFAULT 'THB',
ADD COLUMN     "exchangeRate" DECIMAL(12,6) NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "ShippingZone" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countries" "CountryCode"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingZoneRate" (
    "id" TEXT NOT NULL,
    "shippingZoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "estimatedDays" TEXT,
    "minWeight" DECIMAL(10,3) NOT NULL DEFAULT 0.00,
    "maxWeight" DECIMAL(10,3) NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingZoneRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShippingZone_storeId_idx" ON "ShippingZone"("storeId");

-- CreateIndex
CREATE INDEX "ShippingZoneRate_shippingZoneId_idx" ON "ShippingZoneRate"("shippingZoneId");

-- CreateIndex
CREATE INDEX "Address_country_idx" ON "Address"("country");

-- AddForeignKey
ALTER TABLE "ShippingZone" ADD CONSTRAINT "ShippingZone_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingZoneRate" ADD CONSTRAINT "ShippingZoneRate_shippingZoneId_fkey" FOREIGN KEY ("shippingZoneId") REFERENCES "ShippingZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
