/*
  Warnings:

  - You are about to drop the column `isAiEnabled` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAiEnabled",
ADD COLUMN     "isAiStoreEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isAiSupportEnabled" BOOLEAN NOT NULL DEFAULT true;
