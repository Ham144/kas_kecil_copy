/*
  Warnings:

  - You are about to drop the column `SOAP_CUSTOMER_PASSWORD` on the `Globalsetting` table. All the data in the column will be lost.
  - You are about to drop the column `SOAP_CUSTOMER_SOAPACTION` on the `Globalsetting` table. All the data in the column will be lost.
  - You are about to drop the column `SOAP_CUSTOMER_URL` on the `Globalsetting` table. All the data in the column will be lost.
  - You are about to drop the column `SOAP_CUSTOMER_USERNAME` on the `Globalsetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Globalsetting" DROP COLUMN "SOAP_CUSTOMER_PASSWORD",
DROP COLUMN "SOAP_CUSTOMER_SOAPACTION",
DROP COLUMN "SOAP_CUSTOMER_URL",
DROP COLUMN "SOAP_CUSTOMER_USERNAME";
