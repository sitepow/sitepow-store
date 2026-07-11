/*
  Warnings:

  - You are about to drop the column `isAiStoreEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isAiSupportEnabled` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "isAiEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAiStoreEnabled",
DROP COLUMN "isAiSupportEnabled";
