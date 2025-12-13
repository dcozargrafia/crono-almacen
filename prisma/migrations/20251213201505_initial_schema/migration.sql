-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "DeviceModel" AS ENUM ('TSONE', 'TS2', 'TS2_PLUS', 'CLB');

-- CreateEnum
CREATE TYPE "ManufacturingStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PHASE1_COMPLETED', 'AWAITING_QA', 'COMPLETED', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "OperationalStatus" AS ENUM ('IN_MANUFACTURING', 'AVAILABLE', 'RENTED', 'SOLD', 'IN_REPAIR', 'RETIRED');

-- CreateEnum
CREATE TYPE "FrequencyRegion" AS ENUM ('EU', 'FCC', 'GX1', 'GX2');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "codeSportmaniacs" INTEGER,
    "email" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" SERIAL NOT NULL,
    "model" "DeviceModel" NOT NULL,
    "manufacturingCode" TEXT NOT NULL,
    "manufacturingStatus" "ManufacturingStatus" NOT NULL DEFAULT 'PENDING',
    "operationalStatus" "OperationalStatus" NOT NULL DEFAULT 'IN_MANUFACTURING',
    "availableForRental" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" INTEGER,
    "serialNumber" TEXT,
    "portCount" INTEGER,
    "frequencyRegion" "FrequencyRegion",
    "manufacturingDate" TIMESTAMP(3),
    "notes" TEXT,
    "reader1SerialNumber" TEXT,
    "reader2SerialNumber" TEXT,
    "cpuSerialNumber" TEXT,
    "batterySerialNumber" TEXT,
    "tsPowerModel" TEXT,
    "cpuFirmware" TEXT,
    "gx1ReadersRegion" TEXT,
    "hasGSM" BOOLEAN,
    "hasGUN" BOOLEAN,
    "bluetoothAdapter" TEXT,
    "coreVersion" TEXT,
    "heatsinks" TEXT,
    "picVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_codeSportmaniacs_key" ON "clients"("codeSportmaniacs");

-- CreateIndex
CREATE UNIQUE INDEX "devices_manufacturingCode_key" ON "devices"("manufacturingCode");

-- CreateIndex
CREATE UNIQUE INDEX "devices_serialNumber_key" ON "devices"("serialNumber");

-- CreateIndex
CREATE INDEX "devices_model_idx" ON "devices"("model");

-- CreateIndex
CREATE INDEX "devices_manufacturingStatus_idx" ON "devices"("manufacturingStatus");

-- CreateIndex
CREATE INDEX "devices_operationalStatus_idx" ON "devices"("operationalStatus");

-- CreateIndex
CREATE INDEX "devices_availableForRental_idx" ON "devices"("availableForRental");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
