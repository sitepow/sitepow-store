-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "LogAction" ADD VALUE 'TRANSFER_STORE';

-- CreateTable
CREATE TABLE "StoreTransferRequest" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "fromOwnerId" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "toUserId" TEXT,
    "token" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreTransferRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreTransferRequest_token_key" ON "StoreTransferRequest"("token");

-- CreateIndex
CREATE INDEX "StoreTransferRequest_storeId_idx" ON "StoreTransferRequest"("storeId");

-- CreateIndex
CREATE INDEX "StoreTransferRequest_token_idx" ON "StoreTransferRequest"("token");

-- AddForeignKey
ALTER TABLE "StoreTransferRequest" ADD CONSTRAINT "StoreTransferRequest_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
