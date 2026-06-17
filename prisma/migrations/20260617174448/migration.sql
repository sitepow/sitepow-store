/*
  Warnings:

  - You are about to drop the column `lastReadMessageId` on the `ConversationMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ConversationMember" DROP COLUMN "lastReadMessageId",
ADD COLUMN     "lastReadAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ConversationMember_userId_idx" ON "ConversationMember"("userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_senderId_createdAt_idx" ON "Message"("conversationId", "senderId", "createdAt");
