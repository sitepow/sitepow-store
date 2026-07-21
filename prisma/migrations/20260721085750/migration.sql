/*
  Warnings:

  - You are about to drop the column `stripePublicKey` on the `PaymentSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentSetting" DROP COLUMN "stripePublicKey",
ADD COLUMN     "stripeWebhookSecret" TEXT;
