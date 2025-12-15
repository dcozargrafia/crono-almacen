/*
  Warnings:

  - You are about to drop the column `manufacturingCode` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturingStatus` on the `devices` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[manufactoringCode]` on the table `devices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `manufactoringCode` to the `devices` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "devices_manufacturingCode_key";

-- DropIndex
DROP INDEX "devices_manufacturingStatus_idx";

-- AlterTable
ALTER TABLE "devices" DROP COLUMN "manufacturingCode",
DROP COLUMN "manufacturingStatus",
ADD COLUMN     "manufactoringCode" TEXT NOT NULL,
ADD COLUMN     "manufactoringStatus" "ManufacturingStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "devices_manufactoringCode_key" ON "devices"("manufactoringCode");

-- CreateIndex
CREATE INDEX "devices_manufactoringStatus_idx" ON "devices"("manufactoringStatus");
