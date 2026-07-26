/*
  Warnings:

  - You are about to drop the column `description` on the `Permission` table. All the data in the column will be lost.
  - The `name` column on the `Role` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DefaultRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'STAFF');

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "name",
ADD COLUMN     "name" "DefaultRole" NOT NULL DEFAULT 'STAFF';

-- DropEnum
DROP TYPE "DefaultRole";

-- CreateIndex
CREATE UNIQUE INDEX "Role_storeId_name_key" ON "Role"("storeId", "name");
