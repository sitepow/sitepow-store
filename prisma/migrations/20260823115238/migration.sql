-- CreateEnum
CREATE TYPE "ThemeKey" AS ENUM ('DEFAULT', 'RESTAURANT', 'DIGITAL_GAME', 'NATURAL_ORGANIC', 'TECH_GADGET', 'FASHION_LUXURY', 'HEALTH_BEAUTY', 'BARBER_SALON', 'MASSAGE_SPA', 'CLINIC_WELLNESS', 'BOOKING_SERVICE');

-- CreateTable
CREATE TABLE "StoreThemeConfig" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "themeKey" "ThemeKey" NOT NULL DEFAULT 'DEFAULT',
    "layout" JSONB,
    "customCss" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreThemeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreThemeConfig_storeId_key" ON "StoreThemeConfig"("storeId");

-- AddForeignKey
ALTER TABLE "StoreThemeConfig" ADD CONSTRAINT "StoreThemeConfig_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
