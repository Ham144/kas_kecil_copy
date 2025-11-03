/*
  Warnings:

  - You are about to drop the column `userId` on the `FlowLog` table. All the data in the column will be lost.
  - Added the required column `createdByUsername` to the `FlowLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."FlowLog" DROP CONSTRAINT "FlowLog_userId_fkey";

-- AlterTable
ALTER TABLE "FlowLog" DROP COLUMN "userId",
ADD COLUMN     "createdByUsername" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "FlowLog" ADD CONSTRAINT "FlowLog_createdByUsername_fkey" FOREIGN KEY ("createdByUsername") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
