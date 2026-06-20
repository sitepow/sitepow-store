-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "storeId" TEXT;

-- CreateIndex
CREATE INDEX "Conversation_storeId_idx" ON "Conversation"("storeId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
