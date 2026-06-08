/*
  Warnings:

  - You are about to drop the column `role` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `staffId` on the `StaffBranch` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[staffStoreId,branchId]` on the table `StaffBranch` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `staffStoreId` to the `StaffBranch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_storeId_fkey";

-- DropForeignKey
ALTER TABLE "StaffBranch" DROP CONSTRAINT "StaffBranch_staffId_fkey";

-- DropIndex
DROP INDEX "StaffBranch_staffId_branchId_key";

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "role",
DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "StaffBranch" DROP COLUMN "staffId",
ADD COLUMN     "staffStoreId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "StaffStore" (
    "id" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'CASHIER',
    "staffId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,

    CONSTRAINT "StaffStore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffStore_staffId_storeId_key" ON "StaffStore"("staffId", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffBranch_staffStoreId_branchId_key" ON "StaffBranch"("staffStoreId", "branchId");

-- AddForeignKey
ALTER TABLE "StaffBranch" ADD CONSTRAINT "StaffBranch_staffStoreId_fkey" FOREIGN KEY ("staffStoreId") REFERENCES "StaffStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffStore" ADD CONSTRAINT "StaffStore_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffStore" ADD CONSTRAINT "StaffStore_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
