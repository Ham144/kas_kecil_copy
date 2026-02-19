/*
  Warnings:

  - A unique constraint covering the columns `[name,warehouseId]` on the table `FlowLogCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `warehouseId` to the `FlowLogCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."FlowLog" DROP CONSTRAINT "FlowLog_categoryId_fkey";

-- AlterTable
ALTER TABLE "FlowLogCategory" ADD COLUMN     "warehouseId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_FlowLogToFlowLogCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FlowLogToFlowLogCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FlowLogToFlowLogCategory_B_index" ON "_FlowLogToFlowLogCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "FlowLogCategory_name_warehouseId_key" ON "FlowLogCategory"("name", "warehouseId");

-- AddForeignKey
ALTER TABLE "_FlowLogToFlowLogCategory" ADD CONSTRAINT "_FlowLogToFlowLogCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "FlowLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FlowLogToFlowLogCategory" ADD CONSTRAINT "_FlowLogToFlowLogCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "FlowLogCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
