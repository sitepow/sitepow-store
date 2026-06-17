/*
  Warnings:

  - You are about to drop the column `lastReadAt` on the `ConversationMember` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ConversationMember_userId_idx";

-- DropIndex
DROP INDEX "Message_conversationId_senderId_createdAt_idx";

-- AlterTable
ALTER TABLE "ConversationMember" DROP COLUMN "lastReadAt";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "readBy" TEXT[];
