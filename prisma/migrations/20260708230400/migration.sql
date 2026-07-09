/*
  Warnings:

  - You are about to drop the column `branchId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `branchId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_branchId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "branchId",
ADD COLUMN     "codFee" DECIMAL(10,2) DEFAULT 0;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "branchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StoreCourierService" ADD COLUMN     "codFeeAmount" DECIMAL(10,2) DEFAULT 2.3,
ADD COLUMN     "codFeeType" "DiscountType" DEFAULT 'PERCENTAGE',
ADD COLUMN     "isCodEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
