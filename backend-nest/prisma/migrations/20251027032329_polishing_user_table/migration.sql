/*
  Warnings:

  - Added the required column `displayName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `two_faIsVerified` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `two_faSecret` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthMethod" AS ENUM ('LDAP');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authMethod" "AuthMethod" NOT NULL DEFAULT 'LDAP',
ADD COLUMN     "displayName" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT NOT NULL,
ADD COLUMN     "two_faIsVerified" BOOLEAN NOT NULL,
ADD COLUMN     "two_faSecret" TEXT NOT NULL;
