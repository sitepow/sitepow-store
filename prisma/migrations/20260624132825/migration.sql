-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'ACTIVE', 'FAILED');

-- CreateTable
CREATE TABLE "StoreDomain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "status" "DomainStatus" NOT NULL DEFAULT 'PENDING',
    "verificationRecord" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreDomain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreDomain_domain_key" ON "StoreDomain"("domain");

-- CreateIndex
CREATE INDEX "StoreDomain_storeId_idx" ON "StoreDomain"("storeId");

-- AddForeignKey
ALTER TABLE "StoreDomain" ADD CONSTRAINT "StoreDomain_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
