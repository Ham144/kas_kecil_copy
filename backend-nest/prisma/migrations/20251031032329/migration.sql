/*
  Warnings:

  - You are about to drop the column `two_faIsVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `two_faSecret` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "two_faIsVerified",
DROP COLUMN "two_faSecret";

-- AlterTable
ALTER TABLE "Warehouse" ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" TEXT;
