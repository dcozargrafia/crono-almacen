import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { stringify } from 'csv-stringify/sync';
import { PrismaService } from '../prisma.service';
import { ProductsService } from '../products/products.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import {
  OperationalStatus,
  ProductUnitStatus,
  RentalStatus,
  Prisma,
} from '@prisma/client';

@Injectable()
export class RentalsService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  // POST /rentals - Create new rental
  async create(createRentalDto: CreateRentalDto) {
    return this.prisma.$transaction(async (tx) => {
      // Validate client exists
      const client = await tx.client.findUnique({
        where: { id: createRentalDto.clientId },
      });

      if (!client) {
        throw new NotFoundException('CLIENT_NOT_FOUND');
      }

      // Validate and prepare devices
      if (createRentalDto.deviceIds?.length) {
        const devices = await tx.device.findMany({
          where: { id: { in: createRentalDto.deviceIds } },
        });

        // Validate all devices exist
        if (devices.length !== createRentalDto.deviceIds.length) {
          throw new NotFoundException('DEVICE_NOT_FOUND');
        }

        // Validate all devices are available for rental
        const unavailableForRental = devices.find((d) => !d.availableForRental);
        if (unavailableForRental) {
          throw new BadRequestException('DEVICE_NOT_AVAILABLE_FOR_RENTAL');
        }

        // Validate all devices have AVAILABLE status
        const notAvailable = devices.find(
          (d) => d.operationalStatus !== OperationalStatus.AVAILABLE,
        );
        if (notAvailable) {
          throw new BadRequestException('DEVICE_NOT_AVAILABLE');
        }

        // Mark devices as rented
        await tx.device.updateMany({
          where: { id: { in: createRentalDto.deviceIds } },
          data: { operationalStatus: OperationalStatus.RENTED },
        });
      }

      // Validate and prepare products
      if (createRentalDto.products?.length) {
        for (const productItem of createRentalDto.products) {
          const product = await tx.product.findUnique({
            where: { id: productItem.productId },
          });

          if (!product) {
            throw new NotFoundException('PRODUCT_NOT_FOUND');
          }

          if (product.availableQuantity < productItem.quantity) {
            throw new BadRequestException('NOT_ENOUGH_PRODUCT_QUANTITY');
          }
        }

        // Update product quantities using ProductsService
        for (const productItem of createRentalDto.products) {
          await this.productsService.rentQuantity(
            productItem.productId,
            productItem.quantity,
          );
        }
      }

      // Validate and prepare product units
      if (createRentalDto.productUnitIds?.length) {
        const productUnits = await tx.productUnit.findMany({
          where: { id: { in: createRentalDto.productUnitIds } },
        });

        // Validate all product units exist
        if (productUnits.length !== createRentalDto.productUnitIds.length) {
          throw new NotFoundException('PRODUCT_UNIT_NOT_FOUND');
        }

        // Validate all product units are available
        const notAvailable = productUnits.find(
          (pu) => pu.status !== ProductUnitStatus.AVAILABLE,
        );
        if (notAvailable) {
          throw new BadRequestException('PRODUCT_UNIT_NOT_AVAILABLE');
        }

        // Mark product units as rented
        await tx.productUnit.updateMany({
          where: { id: { in: createRentalDto.productUnitIds } },
          data: { status: ProductUnitStatus.RENTED },
        });
      }

      // Validate chip types exist
      if (createRentalDto.chipRanges?.length) {
        const chipTypeIds = [
          ...new Set(createRentalDto.chipRanges.map((cr) => cr.chipTypeId)),
        ];

        const chipTypes = await tx.chipType.findMany({
          where: { id: { in: chipTypeIds } },
        });

        if (chipTypes.length !== chipTypeIds.length) {
          throw new NotFoundException('CHIP_TYPE_NOT_FOUND');
        }

        // Validate rangeStart <= rangeEnd for each range
        for (const range of createRentalDto.chipRanges) {
          if (range.rangeStart > range.rangeEnd) {
            throw new BadRequestException('INVALID_CHIP_RANGE');
          }
        }
      }

      // Create the rental with all relations
      const rental = await tx.rental.create({
        data: {
          clientId: createRentalDto.clientId,
          startDate: new Date(createRentalDto.startDate),
          expectedEndDate: new Date(createRentalDto.expectedEndDate),
          notes: createRentalDto.notes,
          devices: createRentalDto.deviceIds?.length
            ? {
                create: createRentalDto.deviceIds.map((deviceId) => ({
                  deviceId,
                })),
              }
            : undefined,
          products: createRentalDto.products?.length
            ? {
                create: createRentalDto.products.map((p) => ({
                  productId: p.productId,
                  quantity: p.quantity,
                })),
              }
            : undefined,
          productUnits: createRentalDto.productUnitIds?.length
            ? {
                create: createRentalDto.productUnitIds.map((productUnitId) => ({
                  productUnitId,
                })),
              }
            : undefined,
          chipRanges: createRentalDto.chipRanges?.length
            ? {
                create: createRentalDto.chipRanges.map((cr) => ({
                  chipTypeId: cr.chipTypeId,
                  rangeStart: cr.rangeStart,
                  rangeEnd: cr.rangeEnd,
                })),
              }
            : undefined,
        },
        include: {
          client: true,
          devices: true,
          products: true,
          productUnits: true,
          chipRanges: { include: { chipType: true } },
        },
      });

      return rental;
    });
  }

  // GET /rentals - List rentals with pagination and filters
  async findAll(
    options: {
      page?: number;
      pageSize?: number;
      status?: RentalStatus;
      clientId?: number;
    } = {},
  ) {
    const { page = 1, pageSize = 10, ...filters } = options;

    const where: Prisma.RentalWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.clientId) where.clientId = filters.clientId;

    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.rental.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          client: true,
          devices: { include: { device: true } },
          products: { include: { product: true } },
          productUnits: { include: { productUnit: true } },
          chipRanges: { include: { chipType: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rental.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // GET /rentals/:id - Get rental by ID
  async findOne(id: number) {
    const rental = await this.prisma.rental.findUnique({
      where: { id },
      include: {
        client: true,
        devices: { include: { device: true } },
        products: { include: { product: true } },
        productUnits: { include: { productUnit: true } },
        chipRanges: { include: { chipType: true } },
      },
    });

    if (!rental) {
      throw new NotFoundException('RENTAL_NOT_FOUND');
    }

    return rental;
  }

  // PATCH /rentals/:id - Update rental basic fields
  async update(id: number, updateRentalDto: UpdateRentalDto) {
    const rental = await this.prisma.rental.findUnique({
      where: { id },
    });

    if (!rental) {
      throw new NotFoundException('RENTAL_NOT_FOUND');
    }

    if (rental.status !== RentalStatus.ACTIVE) {
      throw new BadRequestException('RENTAL_NOT_ACTIVE');
    }

    return this.prisma.rental.update({
      where: { id },
      data: {
        startDate: updateRentalDto.startDate
          ? new Date(updateRentalDto.startDate)
          : undefined,
        expectedEndDate: updateRentalDto.expectedEndDate
          ? new Date(updateRentalDto.expectedEndDate)
          : undefined,
        notes: updateRentalDto.notes,
      },
    });
  }

  // POST /rentals/:id/return - Mark rental as returned
  async returnRental(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const rental = await tx.rental.findUnique({
        where: { id },
        include: {
          devices: true,
          products: true,
          productUnits: true,
        },
      });

      if (!rental) {
        throw new NotFoundException('RENTAL_NOT_FOUND');
      }

      if (rental.status !== RentalStatus.ACTIVE) {
        throw new BadRequestException('RENTAL_NOT_ACTIVE');
      }

      // Restore devices to AVAILABLE
      if (rental.devices.length > 0) {
        await tx.device.updateMany({
          where: { id: { in: rental.devices.map((d) => d.deviceId) } },
          data: { operationalStatus: OperationalStatus.AVAILABLE },
        });
      }

      // Restore product quantities
      for (const rentalProduct of rental.products) {
        await this.productsService.returnQuantity(
          rentalProduct.productId,
          rentalProduct.quantity,
        );
      }

      // Restore product units to AVAILABLE
      if (rental.productUnits.length > 0) {
        await tx.productUnit.updateMany({
          where: {
            id: { in: rental.productUnits.map((pu) => pu.productUnitId) },
          },
          data: { status: ProductUnitStatus.AVAILABLE },
        });
      }

      // Update rental status
      return tx.rental.update({
        where: { id },
        data: {
          status: RentalStatus.RETURNED,
          actualEndDate: new Date(),
        },
        include: {
          client: true,
          devices: { include: { device: true } },
          products: { include: { product: true } },
          productUnits: { include: { productUnit: true } },
          chipRanges: { include: { chipType: true } },
        },
      });
    });
  }

  // POST /rentals/:id/cancel - Cancel rental and restore inventory
  async cancelRental(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const rental = await tx.rental.findUnique({
        where: { id },
        include: {
          devices: true,
          products: true,
          productUnits: true,
        },
      });

      if (!rental) {
        throw new NotFoundException('RENTAL_NOT_FOUND');
      }

      if (rental.status !== RentalStatus.ACTIVE) {
        throw new BadRequestException('RENTAL_NOT_ACTIVE');
      }

      // Restore devices to AVAILABLE
      if (rental.devices.length > 0) {
        await tx.device.updateMany({
          where: { id: { in: rental.devices.map((d) => d.deviceId) } },
          data: { operationalStatus: OperationalStatus.AVAILABLE },
        });
      }

      // Restore product quantities
      for (const rentalProduct of rental.products) {
        await this.productsService.returnQuantity(
          rentalProduct.productId,
          rentalProduct.quantity,
        );
      }

      // Restore product units to AVAILABLE
      if (rental.productUnits.length > 0) {
        await tx.productUnit.updateMany({
          where: {
            id: { in: rental.productUnits.map((pu) => pu.productUnitId) },
          },
          data: { status: ProductUnitStatus.AVAILABLE },
        });
      }

      // Update rental status
      return tx.rental.update({
        where: { id },
        data: {
          status: RentalStatus.CANCELLED,
        },
        include: {
          client: true,
          devices: { include: { device: true } },
          products: { include: { product: true } },
          productUnits: { include: { productUnit: true } },
          chipRanges: { include: { chipType: true } },
        },
      });
    });
  }

  // GET /rentals/:id/chip-sequence - Get chip sequence data for rental
  async getChipSequenceForRental(id: number) {
    const rental = await this.prisma.rental.findUnique({
      where: { id },
      include: {
        chipRanges: { include: { chipType: true } },
      },
    });

    if (!rental) {
      throw new NotFoundException('RENTAL_NOT_FOUND');
    }

    if (!rental.chipRanges?.length) {
      return [];
    }

    return rental.chipRanges.map((range) => {
      const sequenceData =
        (range.chipType.sequenceData as { chip: number; code: string }[]) || [];

      const filteredSequence = sequenceData.filter(
        (item) => item.chip >= range.rangeStart && item.chip <= range.rangeEnd,
      );

      return {
        chipType: range.chipType.name,
        chipTypeDisplayName: range.chipType.displayName,
        rangeStart: range.rangeStart,
        rangeEnd: range.rangeEnd,
        sequence: filteredSequence,
      };
    });
  }

  // GET /rentals/:id/chip-file/:chipTypeId - Generate CSV file for chip type
  async getChipFileForRental(
    rentalId: number,
    chipTypeId: number,
  ): Promise<{ csv: string; filename: string }> {
    const rental = await this.prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        client: true,
        chipRanges: { include: { chipType: true } },
      },
    });

    if (!rental) {
      throw new NotFoundException('RENTAL_NOT_FOUND');
    }

    const chipRange = rental.chipRanges?.find(
      (range) => range.chipTypeId === chipTypeId,
    );

    if (!chipRange) {
      throw new NotFoundException('CHIP_TYPE_NOT_IN_RENTAL');
    }

    const sequenceData =
      (chipRange.chipType.sequenceData as { chip: number; code: string }[]) ||
      [];

    const filteredSequence = sequenceData.filter(
      (item) =>
        item.chip >= chipRange.rangeStart && item.chip <= chipRange.rangeEnd,
    );

    const csv = stringify(filteredSequence, {
      header: true,
      columns: [
        { key: 'chip', header: 'Chip' },
        { key: 'code', header: 'Code' },
      ],
    });

    // Format: cliente-aaaammdd-chiptype-rent.csv
    const clientName = this.sanitizeFilename(rental.client.name);
    const dateStr = this.formatDateForFilename(rental.startDate);
    const chipTypeName = chipRange.chipType.name.toLowerCase();
    const filename = `${clientName}-${dateStr}-${chipTypeName}-rent.csv`;

    return { csv, filename };
  }

  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private formatDateForFilename(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}
