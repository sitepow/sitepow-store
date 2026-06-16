-- AlterTable
ALTER TABLE "User" ADD COLUMN     "marketingNotify" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderNotify" BOOLEAN NOT NULL DEFAULT true;
