-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_variantId_fkey";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "variantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
