-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('ANTENNA', 'STOPWATCH', 'PHONE', 'MIFI', 'CABLE', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductUnitStatus" AS ENUM ('AVAILABLE', 'RENTED', 'IN_REPAIR', 'RETIRED');

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "availableQuantity" INTEGER NOT NULL DEFAULT 0,
    "rentedQuantity" INTEGER NOT NULL DEFAULT 0,
    "inRepairQuantity" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_units" (
    "id" SERIAL NOT NULL,
    "type" "ProductType" NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "notes" TEXT,
    "status" "ProductUnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_units_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_type_idx" ON "products"("type");

-- CreateIndex
CREATE INDEX "products_active_idx" ON "products"("active");

-- CreateIndex
CREATE UNIQUE INDEX "product_units_serialNumber_key" ON "product_units"("serialNumber");

-- CreateIndex
CREATE INDEX "product_units_type_idx" ON "product_units"("type");

-- CreateIndex
CREATE INDEX "product_units_status_idx" ON "product_units"("status");

-- CreateIndex
CREATE INDEX "product_units_active_idx" ON "product_units"("active");
