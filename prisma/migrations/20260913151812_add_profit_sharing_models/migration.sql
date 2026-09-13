-- CreateEnum
CREATE TYPE "PartnerRole" AS ENUM ('SHAREHOLDER', 'DEVELOPER', 'SYSTEM', 'MARKETING', 'INVESTOR', 'OTHER');

-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('NET_PROFIT_PERCENT', 'REVENUE_PERCENT', 'FIXED_MONTHLY');

-- CreateTable
CREATE TABLE "ProfitPartner" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "PartnerRole" NOT NULL DEFAULT 'SHAREHOLDER',
    "shareType" "ShareType" NOT NULL DEFAULT 'NET_PROFIT_PERCENT',
    "shareValue" DECIMAL(10,2) NOT NULL,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankAccountName" TEXT,
    "promptPay" TEXT,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfitPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlySettlement" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalRevenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCogs" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalExpense" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netProfit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAllocated" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "retainedEarnings" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlySettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfitPayout" (
    "id" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "partnerName" TEXT NOT NULL,
    "role" "PartnerRole" NOT NULL,
    "shareType" "ShareType" NOT NULL,
    "shareValue" DECIMAL(10,2) NOT NULL,
    "calculatedAmount" DECIMAL(12,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "slipImage" TEXT,
    "paymentNote" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankAccountName" TEXT,
    "promptPay" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfitPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfitPartner_storeId_idx" ON "ProfitPartner"("storeId");

-- CreateIndex
CREATE INDEX "MonthlySettlement_storeId_idx" ON "MonthlySettlement"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySettlement_storeId_period_key" ON "MonthlySettlement"("storeId", "period");

-- CreateIndex
CREATE INDEX "ProfitPayout_settlementId_idx" ON "ProfitPayout"("settlementId");

-- CreateIndex
CREATE INDEX "ProfitPayout_partnerId_idx" ON "ProfitPayout"("partnerId");

-- AddForeignKey
ALTER TABLE "ProfitPartner" ADD CONSTRAINT "ProfitPartner_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlySettlement" ADD CONSTRAINT "MonthlySettlement_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfitPayout" ADD CONSTRAINT "ProfitPayout_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "MonthlySettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfitPayout" ADD CONSTRAINT "ProfitPayout_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "ProfitPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
