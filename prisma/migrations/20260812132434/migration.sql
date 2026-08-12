/*
  Warnings:

  - You are about to drop the column `blockedUntil` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `fakeSlipCount` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `isBlocked` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerId,storeId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,code]` on the table `Coupon` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,orderNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `CustomerStore` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_variantId_fkey";

-- DropForeignKey
ALTER TABLE "SlipVerificationHistory" DROP CONSTRAINT "SlipVerificationHistory_customerId_fkey";

-- DropIndex
DROP INDEX "Cart_customerId_key";

-- DropIndex
DROP INDEX "Coupon_code_key";

-- DropIndex
DROP INDEX "Message_conversationId_createdAt_idx";

-- DropIndex
DROP INDEX "Order_orderNumber_key";

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "limitPerCustomer" INTEGER;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "blockedUntil",
DROP COLUMN "fakeSlipCount",
DROP COLUMN "isBlocked";

-- AlterTable
ALTER TABLE "CustomerStore" ADD COLUMN     "blockedUntil" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fakeSlipCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "merchantNote" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DigitalItem" ADD COLUMN     "orderItemId" TEXT;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "orderId" TEXT;

-- AlterTable
ALTER TABLE "SlipVerificationHistory" ADD COLUMN     "storeId" TEXT;

-- CreateTable
CREATE TABLE "CustomerCoupon" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerCoupon_customerId_idx" ON "CustomerCoupon"("customerId");

-- CreateIndex
CREATE INDEX "CustomerCoupon_couponId_idx" ON "CustomerCoupon"("couponId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerCoupon_customerId_couponId_key" ON "CustomerCoupon"("customerId", "couponId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_customerId_storeId_key" ON "Cart"("customerId", "storeId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_storeId_code_key" ON "Coupon"("storeId", "code");

-- CreateIndex
CREATE INDEX "Customer_email_deletedAt_idx" ON "Customer"("email", "deletedAt");

-- CreateIndex
CREATE INDEX "CustomerStore_storeId_isBlocked_idx" ON "CustomerStore"("storeId", "isBlocked");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_storeId_status_idx" ON "Order"("storeId", "status");

-- CreateIndex
CREATE INDEX "Order_storeId_createdAt_idx" ON "Order"("storeId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_storeId_orderNumber_key" ON "Order"("storeId", "orderNumber");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

-- CreateIndex
CREATE INDEX "Product_storeId_categoryId_idx" ON "Product"("storeId", "categoryId");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_isAvailable_idx" ON "ProductVariant"("productId", "isAvailable");

-- CreateIndex
CREATE INDEX "SlipVerificationHistory_orderId_idx" ON "SlipVerificationHistory"("orderId");

-- CreateIndex
CREATE INDEX "SlipVerificationHistory_storeId_idx" ON "SlipVerificationHistory"("storeId");

-- AddForeignKey
ALTER TABLE "CustomerCoupon" ADD CONSTRAINT "CustomerCoupon_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCoupon" ADD CONSTRAINT "CustomerCoupon_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlipVerificationHistory" ADD CONSTRAINT "SlipVerificationHistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlipVerificationHistory" ADD CONSTRAINT "SlipVerificationHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlipVerificationHistory" ADD CONSTRAINT "SlipVerificationHistory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
