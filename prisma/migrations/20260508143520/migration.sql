/*
  Warnings:

  - The values [FREE,STANDARD] on the enum `Plan` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- AlterEnum
BEGIN;
CREATE TYPE "Plan_new" AS ENUM ('STARTER', 'PRO', 'ULTIMATE');
ALTER TABLE "public"."Store" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Store" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TYPE "Plan" RENAME TO "Plan_old";
ALTER TYPE "Plan_new" RENAME TO "Plan";
DROP TYPE "public"."Plan_old";
ALTER TABLE "Store" ALTER COLUMN "plan" SET DEFAULT 'STARTER';
COMMIT;

-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "plan" SET DEFAULT 'STARTER';

-- CreateTable
CREATE TABLE "ContactTicket" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "storeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactTicket_storeId_idx" ON "ContactTicket"("storeId");

-- CreateIndex
CREATE INDEX "ContactTicket_customerId_idx" ON "ContactTicket"("customerId");

-- AddForeignKey
ALTER TABLE "ContactTicket" ADD CONSTRAINT "ContactTicket_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactTicket" ADD CONSTRAINT "ContactTicket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactTicket" ADD CONSTRAINT "ContactTicket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
