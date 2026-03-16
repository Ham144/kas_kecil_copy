-- AlterEnum
ALTER TYPE "ROLE" ADD VALUE 'SUPERVISION';

-- DropIndex
DROP INDEX "public"."FlowLogCategory_no_key";

-- AlterTable
ALTER TABLE "FlowLogCategory" ALTER COLUMN "description" DROP NOT NULL;
