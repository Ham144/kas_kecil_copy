/*
  Warnings:

  - You are about to drop the column `description` on the `Warehouse` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Warehouse` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Budget` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Warehouse_name_key";

-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "description" SET DEFAULT 'kasir';

-- AlterTable
ALTER TABLE "Warehouse" DROP COLUMN "description",
DROP COLUMN "location";

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FlowLogCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
