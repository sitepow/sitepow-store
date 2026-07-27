/*
  Warnings:

  - The values [MANAGE_STAFF] on the enum `LogAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LogAction_new" AS ENUM ('CREATE_STORE', 'UPDATE_STORE', 'DELETE_STORE', 'CHANGE_PLAN', 'ADJUST_CREDITS', 'SUSPEND_STORE', 'CREATE_ORDER', 'UPDATE_ORDER_STATUS', 'CANCEL_ORDER', 'RESTOCK_ITEMS', 'UPDATE_STOCK', 'STOCK_TRANSFER', 'CREATE_PRODUCT', 'DELETE_PRODUCT', 'UPDATE_STORE_SETTING', 'MANAGE_EMPLOYEE', 'TRANSFER_STORE', 'BLOCK_CUSTOMER', 'UNBLOCK_CUSTOMER', 'LOGIN', 'LOGOUT');
ALTER TABLE "ActivityLog" ALTER COLUMN "action" TYPE "LogAction_new" USING ("action"::text::"LogAction_new");
ALTER TYPE "LogAction" RENAME TO "LogAction_old";
ALTER TYPE "LogAction_new" RENAME TO "LogAction";
DROP TYPE "public"."LogAction_old";
COMMIT;
