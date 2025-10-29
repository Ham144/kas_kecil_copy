-- AlterTable
ALTER TABLE "User" ALTER COLUMN "refreshToken" DROP NOT NULL,
ALTER COLUMN "two_faIsVerified" SET DEFAULT false,
ALTER COLUMN "two_faSecret" DROP NOT NULL;
