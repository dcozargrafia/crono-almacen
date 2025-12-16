-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('ACTIVE', 'RETURNED', 'CANCELLED');

-- CreateTable
CREATE TABLE "rentals" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expectedEndDate" TIMESTAMP(3) NOT NULL,
    "actualEndDate" TIMESTAMP(3),
    "status" "RentalStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_devices" (
    "id" SERIAL NOT NULL,
    "rentalId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,

    CONSTRAINT "rental_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_products" (
    "id" SERIAL NOT NULL,
    "rentalId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "rental_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_product_units" (
    "id" SERIAL NOT NULL,
    "rentalId" INTEGER NOT NULL,
    "productUnitId" INTEGER NOT NULL,

    CONSTRAINT "rental_product_units_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rentals_clientId_idx" ON "rentals"("clientId");

-- CreateIndex
CREATE INDEX "rentals_status_idx" ON "rentals"("status");

-- CreateIndex
CREATE INDEX "rentals_startDate_idx" ON "rentals"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "rental_devices_rentalId_deviceId_key" ON "rental_devices"("rentalId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "rental_products_rentalId_productId_key" ON "rental_products"("rentalId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "rental_product_units_rentalId_productUnitId_key" ON "rental_product_units"("rentalId", "productUnitId");

-- AddForeignKey
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_devices" ADD CONSTRAINT "rental_devices_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_devices" ADD CONSTRAINT "rental_devices_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_products" ADD CONSTRAINT "rental_products_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_products" ADD CONSTRAINT "rental_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_product_units" ADD CONSTRAINT "rental_product_units_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_product_units" ADD CONSTRAINT "rental_product_units_productUnitId_fkey" FOREIGN KEY ("productUnitId") REFERENCES "product_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
