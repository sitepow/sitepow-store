/*
  Warnings:

  - The values [EXPENSES] on the enum `PermissionDomain` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PermissionDomain_new" AS ENUM ('STORE', 'CATEGORY', 'PRODUCT', 'ORDER', 'INVENTORY', 'CUSTOMER', 'COUPON', 'STAFF', 'SETTING', 'REPORT', 'BRANCH', 'BLOG', 'SHIPPING', 'PAYMENT', 'SUBSCRIPTION', 'TRANSACTION', 'CONVERSATION', 'FINANCE', 'LOG', 'STORE_PROFILE', 'SECURITY', 'NOTIFICATION', 'STORE_TRANSFER', 'TAX', 'REVIEW', 'EXPENSE');
ALTER TABLE "Permission" ALTER COLUMN "domain" TYPE "PermissionDomain_new" USING ("domain"::text::"PermissionDomain_new");
ALTER TYPE "PermissionDomain" RENAME TO "PermissionDomain_old";
ALTER TYPE "PermissionDomain_new" RENAME TO "PermissionDomain";
DROP TYPE "public"."PermissionDomain_old";
COMMIT;
