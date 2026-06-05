/*
  Warnings:

  - You are about to drop the column `address` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `postcode` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `subDistrict` on the `Store` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "address" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "postcode" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "subDistrict" TEXT;

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "address",
DROP COLUMN "district",
DROP COLUMN "postcode",
DROP COLUMN "province",
DROP COLUMN "subDistrict";
