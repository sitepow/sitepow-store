/*
  Warnings:

  - You are about to drop the column `code` on the `Courier` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `CourierService` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Courier_code_idx";

-- DropIndex
DROP INDEX "Courier_code_key";

-- DropIndex
DROP INDEX "CourierService_code_idx";

-- DropIndex
DROP INDEX "CourierService_code_key";

-- AlterTable
ALTER TABLE "Courier" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "CourierService" DROP COLUMN "code";
