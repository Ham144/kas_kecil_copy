-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('KASIR', 'ADMIN', 'IT');

-- CreateEnum
CREATE TYPE "AuthMethod" AS ENUM ('LDAP');

-- CreateEnum
CREATE TYPE "FlowLogType" AS ENUM ('IN', 'OUT');

-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT 'kasir',
    "role" "ROLE" NOT NULL DEFAULT 'KASIR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowLog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT NOT NULL,
    "attachments" TEXT[],
    "type" "FlowLogType" NOT NULL,
    "createdByUsername" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlowLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowLogCategory" (
    "id" TEXT NOT NULL,
    "no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "warehouseId" TEXT NOT NULL,

    CONSTRAINT "FlowLogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Globalsetting" (
    "settingName" TEXT NOT NULL,
    "AD_HOST" TEXT NOT NULL,
    "AD_PORT" TEXT NOT NULL,
    "AD_DOMAIN" TEXT NOT NULL,
    "AD_BASE_DN" TEXT NOT NULL,
    "inUse" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Globalsetting_pkey" PRIMARY KEY ("settingName")
);

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_name_key" ON "Warehouse"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FlowLogCategory_no_key" ON "FlowLogCategory"("no");

-- CreateIndex
CREATE UNIQUE INDEX "FlowLogCategory_name_warehouseId_key" ON "FlowLogCategory"("name", "warehouseId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FlowLogCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowLog" ADD CONSTRAINT "FlowLog_createdByUsername_fkey" FOREIGN KEY ("createdByUsername") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowLog" ADD CONSTRAINT "FlowLog_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowLog" ADD CONSTRAINT "FlowLog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FlowLogCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Globalsetting" ADD CONSTRAINT "Globalsetting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;
