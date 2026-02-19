-- DropIndex
DROP INDEX "public"."FlowLogCategory_name_key";

-- AlterTable
ALTER TABLE "FlowLogCategory" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
