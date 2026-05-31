-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'DIGITAL');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "digitalUrl" TEXT,
ADD COLUMN     "productType" "ProductType" NOT NULL DEFAULT 'PHYSICAL';
