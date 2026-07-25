/*
  Warnings:

  - You are about to drop the column `staffId` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `staffId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `Staff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StaffBranch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StaffStore` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PermissionRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'STAFF');

-- CreateEnum
CREATE TYPE "PermissionDomain" AS ENUM ('PRODUCT', 'ORDER', 'INVENTORY', 'CUSTOMER', 'COUPON', 'STAFF', 'SETTING', 'REPORT', 'BRANCH', 'BLOG', 'SHIPPING', 'PAYMENT', 'SUBSCRIPTION', 'TRANSACTION', 'CONVERSATION');

-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT', 'APPROVE', 'CANCEL', 'VOID');

-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_userId_fkey";

-- DropForeignKey
ALTER TABLE "StaffBranch" DROP CONSTRAINT "StaffBranch_branchId_fkey";

-- DropForeignKey
ALTER TABLE "StaffBranch" DROP CONSTRAINT "StaffBranch_staffStoreId_fkey";

-- DropForeignKey
ALTER TABLE "StaffStore" DROP CONSTRAINT "StaffStore_staffId_fkey";

-- DropForeignKey
ALTER TABLE "StaffStore" DROP CONSTRAINT "StaffStore_storeId_fkey";

-- DropIndex
DROP INDEX "Order_staffId_idx";

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "staffId",
ADD COLUMN     "employeeId" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "staffId",
ADD COLUMN     "employeeId" TEXT;

-- DropTable
DROP TABLE "Staff";

-- DropTable
DROP TABLE "StaffBranch";

-- DropTable
DROP TABLE "StaffStore";

-- DropEnum
DROP TYPE "StaffRole";

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" "PermissionRole" NOT NULL DEFAULT 'STAFF',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "domain" "PermissionDomain" NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "EmployeeStore" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeBranch" (
    "employeeStoreId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "EmployeeBranch_pkey" PRIMARY KEY ("employeeStoreId","branchId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_storeId_name_key" ON "Role"("storeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_domain_action_key" ON "Permission"("domain", "action");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeStore_storeId_employeeId_key" ON "EmployeeStore"("storeId", "employeeId");

-- CreateIndex
CREATE INDEX "Order_employeeId_idx" ON "Order"("employeeId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeStore" ADD CONSTRAINT "EmployeeStore_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeStore" ADD CONSTRAINT "EmployeeStore_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeStore" ADD CONSTRAINT "EmployeeStore_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeBranch" ADD CONSTRAINT "EmployeeBranch_employeeStoreId_fkey" FOREIGN KEY ("employeeStoreId") REFERENCES "EmployeeStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeBranch" ADD CONSTRAINT "EmployeeBranch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
