/*
  Warnings:

  - You are about to drop the column `unreadCount` on the `ConversationMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ConversationMember" DROP COLUMN "unreadCount",
ADD COLUMN     "lastReadMessageId" TEXT;
