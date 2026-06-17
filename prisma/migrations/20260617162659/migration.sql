/*
  Warnings:

  - You are about to drop the column `readBy` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ConversationMember" ADD COLUMN     "unreadCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "readBy";
