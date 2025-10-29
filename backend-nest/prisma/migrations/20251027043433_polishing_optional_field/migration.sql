-- DropForeignKey
ALTER TABLE "public"."Globalsetting" DROP CONSTRAINT "Globalsetting_createdById_fkey";

-- AlterTable
ALTER TABLE "Globalsetting" ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isActive" SET DEFAULT true;

-- AddForeignKey
ALTER TABLE "Globalsetting" ADD CONSTRAINT "Globalsetting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;
