-- CreateTable
CREATE TABLE "PaymentSetting" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "isBankTransferEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isStripeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripeSecretKey" TEXT,
    "stripePublicKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "paymentSettingId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "qrImage" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSetting_storeId_key" ON "PaymentSetting"("storeId");

-- CreateIndex
CREATE INDEX "BankAccount_paymentSettingId_idx" ON "BankAccount"("paymentSettingId");

-- AddForeignKey
ALTER TABLE "PaymentSetting" ADD CONSTRAINT "PaymentSetting_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_paymentSettingId_fkey" FOREIGN KEY ("paymentSettingId") REFERENCES "PaymentSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
