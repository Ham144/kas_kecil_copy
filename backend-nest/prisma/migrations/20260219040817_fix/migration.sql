/*
  Warnings:

  - You are about to drop the column `warehouseId` on the `Budget` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Budget" DROP CONSTRAINT "Budget_warehouseId_fkey";

-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "warehouseId";
