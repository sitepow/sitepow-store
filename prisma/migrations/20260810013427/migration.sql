/*
  Warnings:

  - You are about to drop the column `imageId` on the `ProductVariant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_imageId_fkey";

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "imageId",
ADD COLUMN     "image" TEXT;
