/*
  Warnings:

  - You are about to drop the column `isEmailVerifed` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isEmailVerifed",
ADD COLUMN     "isEmailVerified" BOOLEAN DEFAULT false;
