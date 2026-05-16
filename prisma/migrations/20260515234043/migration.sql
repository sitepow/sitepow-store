/*
  Warnings:

  - You are about to drop the column `password` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `staffId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Staff` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_customerId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_staffId_fkey";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "password",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "password",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "customerId",
DROP COLUMN "staffId";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_key" ON "Staff"("userId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
