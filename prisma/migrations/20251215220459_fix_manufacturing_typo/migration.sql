/*
  Warnings:

  - The `manufactoringStatus` column on the `devices` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ManufactoringStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PHASE1_COMPLETED', 'AWAITING_QA', 'COMPLETED', 'OUT_OF_STOCK');

-- AlterTable
ALTER TABLE "devices" DROP COLUMN "manufactoringStatus",
ADD COLUMN     "manufactoringStatus" "ManufactoringStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "ManufacturingStatus";

-- CreateIndex
CREATE INDEX "devices_manufactoringStatus_idx" ON "devices"("manufactoringStatus");
