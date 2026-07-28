/*
  Warnings:

  - The primary key for the `EmployeeBranch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `roleId` on the `EmployeeStore` table. All the data in the column will be lost.
  - You are about to drop the `EmployeePermission` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[employeeStoreId,branchId]` on the table `EmployeeBranch` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `EmployeeBranch` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `roleId` to the `EmployeeBranch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EmployeeBranch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EmployeePermission" DROP CONSTRAINT "EmployeePermission_employeeStoreId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeePermission" DROP CONSTRAINT "EmployeePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeStore" DROP CONSTRAINT "EmployeeStore_roleId_fkey";

-- AlterTable
ALTER TABLE "EmployeeBranch" DROP CONSTRAINT "EmployeeBranch_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "roleId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "EmployeeBranch_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "EmployeeStore" DROP COLUMN "roleId";

-- DropTable
DROP TABLE "EmployeePermission";

-- CreateTable
CREATE TABLE "EmployeeBranchPermission" (
    "employeeBranchId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "EmployeeBranchPermission_pkey" PRIMARY KEY ("employeeBranchId","permissionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeBranch_employeeStoreId_branchId_key" ON "EmployeeBranch"("employeeStoreId", "branchId");

-- AddForeignKey
ALTER TABLE "EmployeeBranchPermission" ADD CONSTRAINT "EmployeeBranchPermission_employeeBranchId_fkey" FOREIGN KEY ("employeeBranchId") REFERENCES "EmployeeBranch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeBranchPermission" ADD CONSTRAINT "EmployeeBranchPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeBranch" ADD CONSTRAINT "EmployeeBranch_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
