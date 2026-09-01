/*
  Warnings:

  - A unique constraint covering the columns `[customDomain]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SslStatus" AS ENUM ('PENDING', 'ISSUED', 'FAILED');

-- CreateEnum
CREATE TYPE "CustomDomainStatus" AS ENUM ('PENDING', 'ACTIVE', 'FAILED');

-- AlterEnum
ALTER TYPE "DomainStatus" ADD VALUE 'VERIFIED';

-- AlterEnum
ALTER TYPE "PermissionDomain" ADD VALUE 'DOMAIN';

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "customDomain" TEXT,
ADD COLUMN     "customDomainStatus" "CustomDomainStatus";

-- AlterTable
ALTER TABLE "StoreDomain" ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sslStatus" "SslStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "Store_customDomain_key" ON "Store"("customDomain");

-- CreateIndex
CREATE INDEX "StoreDomain_domain_status_idx" ON "StoreDomain"("domain", "status");
