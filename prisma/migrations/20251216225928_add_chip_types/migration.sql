-- CreateTable
CREATE TABLE "chip_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "totalStock" INTEGER NOT NULL,
    "sequenceData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chip_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_chip_ranges" (
    "id" SERIAL NOT NULL,
    "rentalId" INTEGER NOT NULL,
    "chipTypeId" INTEGER NOT NULL,
    "rangeStart" INTEGER NOT NULL,
    "rangeEnd" INTEGER NOT NULL,

    CONSTRAINT "rental_chip_ranges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chip_types_name_key" ON "chip_types"("name");

-- CreateIndex
CREATE INDEX "rental_chip_ranges_rentalId_idx" ON "rental_chip_ranges"("rentalId");

-- CreateIndex
CREATE INDEX "rental_chip_ranges_chipTypeId_idx" ON "rental_chip_ranges"("chipTypeId");

-- AddForeignKey
ALTER TABLE "rental_chip_ranges" ADD CONSTRAINT "rental_chip_ranges_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_chip_ranges" ADD CONSTRAINT "rental_chip_ranges_chipTypeId_fkey" FOREIGN KEY ("chipTypeId") REFERENCES "chip_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
