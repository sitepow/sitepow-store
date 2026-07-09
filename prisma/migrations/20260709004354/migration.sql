/*
  Warnings:

  - You are about to drop the column `digitalUrl` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "digitalUrl";

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "digitalUrl" TEXT;
