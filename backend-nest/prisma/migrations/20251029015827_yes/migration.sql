-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_warehouseId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "warehouseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
