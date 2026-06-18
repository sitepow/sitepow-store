/*
  Warnings:

  - You are about to drop the column `readBy` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `guestEmail` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `guestName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `guestPhone` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippopId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `ContactTicket` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContactTicket" DROP CONSTRAINT "ContactTicket_customerId_fkey";

-- DropForeignKey
ALTER TABLE "ContactTicket" DROP CONSTRAINT "ContactTicket_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ContactTicket" DROP CONSTRAINT "ContactTicket_storeId_fkey";

-- AlterTable
ALTER TABLE "ConversationMember" ADD COLUMN     "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "unreadCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "readBy";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "guestEmail",
DROP COLUMN "guestName",
DROP COLUMN "guestPhone",
DROP COLUMN "shippopId";

-- DropTable
DROP TABLE "ContactTicket";

-- DropEnum
DROP TYPE "TicketStatus";
