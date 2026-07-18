-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('PROMPTPAY', 'STANDARD_TRANSFER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LogAction" ADD VALUE 'BLOCK_CUSTOMER';
ALTER TYPE "LogAction" ADD VALUE 'UNBLOCK_CUSTOMER';

-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "promptPayId" TEXT,
ADD COLUMN     "type" "BankAccountType" NOT NULL DEFAULT 'STANDARD_TRANSFER';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "blockedUntil" TIMESTAMP(3),
ADD COLUMN     "fakeSlipCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SlipVerificationHistory" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL,
    "message" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlipVerificationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SlipVerificationHistory_customerId_idx" ON "SlipVerificationHistory"("customerId");

-- AddForeignKey
ALTER TABLE "SlipVerificationHistory" ADD CONSTRAINT "SlipVerificationHistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
