-- CreateTable
CREATE TABLE "GlobalShippingRateMatrix" (
    "id" TEXT NOT NULL,
    "fromProvince" TEXT NOT NULL,
    "ratesMatrix" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalShippingRateMatrix_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GlobalShippingRateMatrix_fromProvince_key" ON "GlobalShippingRateMatrix"("fromProvince");
