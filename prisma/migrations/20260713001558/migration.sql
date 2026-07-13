/*
  Warnings:

  - You are about to drop the column `aiSearchCredits` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `aiVisionCredits` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the `AiLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoreUsage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiLog" DROP CONSTRAINT "AiLog_storeId_fkey";

-- DropForeignKey
ALTER TABLE "StoreUsage" DROP CONSTRAINT "StoreUsage_storeId_fkey";

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "aiSearchCredits",
DROP COLUMN "aiVisionCredits";

-- DropTable
DROP TABLE "AiLog";

-- DropTable
DROP TABLE "StoreUsage";
