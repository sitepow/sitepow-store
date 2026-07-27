/*
  Warnings:

  - The values [ADMIN] on the enum `DefaultRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DefaultRole_new" AS ENUM ('OWNER', 'MANAGER', 'CASHIER', 'STAFF');
ALTER TABLE "public"."Role" ALTER COLUMN "name" DROP DEFAULT;
ALTER TABLE "Role" ALTER COLUMN "name" TYPE "DefaultRole_new" USING ("name"::text::"DefaultRole_new");
ALTER TYPE "DefaultRole" RENAME TO "DefaultRole_old";
ALTER TYPE "DefaultRole_new" RENAME TO "DefaultRole";
DROP TYPE "public"."DefaultRole_old";
ALTER TABLE "Role" ALTER COLUMN "name" SET DEFAULT 'STAFF';
COMMIT;
