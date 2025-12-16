import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';
import { PrismaService } from '../prisma.service';
import { Prisma, ProductType, ProductUnitStatus } from '@prisma/client';

@Injectable()
export class ProductUnitsService {
  constructor(private prisma: PrismaService) {}

  // POST /product-units - Create new product unit
  async create(createProductUnitDto: CreateProductUnitDto) {
    // Validate unique serialNumber
    const existing = await this.prisma.productUnit.findUnique({
      where: { serialNumber: createProductUnitDto.serialNumber },
    });

    if (existing) {
      throw new Error('SERIAL_NUMBER_ALREADY_EXISTS');
    }

    return this.prisma.productUnit.create({
      data: createProductUnitDto,
    });
  }

  // GET /product-units - List product units with pagination and filters
  async findAll(
    options: {
      page?: number;
      pageSize?: number;
      type?: ProductType;
      status?: ProductUnitStatus;
      active?: boolean;
    } = {},
  ) {
    const { page = 1, pageSize = 10, ...filters } = options;

    const where: Prisma.ProductUnitWhereInput = {};
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.active !== undefined) where.active = filters.active;

    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.productUnit.findMany({
        where,
        skip,
        take: pageSize,
      }),
      this.prisma.productUnit.count({ where }),
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

  // GET /product-units/:id - Get product unit by ID
  async findOne(id: number) {
    const unit = await this.prisma.productUnit.findUnique({
      where: { id },
    });

    if (!unit) {
      throw new NotFoundException('PRODUCT_UNIT_NOT_FOUND');
    }

    return unit;
  }

  // GET /product-units/serial/:serial - Find by serial number
  async findBySerial(serialNumber: string) {
    const unit = await this.prisma.productUnit.findUnique({
      where: { serialNumber },
    });

    if (!unit) {
      throw new NotFoundException('PRODUCT_UNIT_NOT_FOUND');
    }

    return unit;
  }

  // PATCH /product-units/:id - Update product unit
  async update(id: number, updateProductUnitDto: UpdateProductUnitDto) {
    const unit = await this.prisma.productUnit.findUnique({
      where: { id },
    });

    if (!unit) {
      throw new NotFoundException('PRODUCT_UNIT_NOT_FOUND');
    }

    // Check for duplicate serialNumber on another unit
    if (updateProductUnitDto.serialNumber) {
      const existing = await this.prisma.productUnit.findUnique({
        where: { serialNumber: updateProductUnitDto.serialNumber },
      });

      if (existing && existing.id !== id) {
        throw new Error('SERIAL_NUMBER_ALREADY_EXISTS');
      }
    }

    return this.prisma.productUnit.update({
      where: { id },
      data: updateProductUnitDto,
    });
  }

  // PATCH /product-units/:id/status - Update status
  async updateStatus(id: number, status: ProductUnitStatus) {
    const unit = await this.prisma.productUnit.findUnique({
      where: { id },
    });

    if (!unit) {
      throw new NotFoundException('PRODUCT_UNIT_NOT_FOUND');
    }

    return this.prisma.productUnit.update({
      where: { id },
      data: { status },
    });
  }

  // DELETE /product-units/:id - Soft delete
  async remove(id: number) {
    const unit = await this.prisma.productUnit.findUnique({
      where: { id },
    });

    if (!unit) {
      throw new NotFoundException('PRODUCT_UNIT_NOT_FOUND');
    }

    return this.prisma.productUnit.update({
      where: { id },
      data: { active: false },
    });
  }

  // PATCH /product-units/:id/reactivate - Reactivate soft-deleted unit
  async reactivate(id: number) {
    const unit = await this.prisma.productUnit.findUnique({
      where: { id },
    });

    if (!unit) {
      throw new NotFoundException('PRODUCT_UNIT_NOT_FOUND');
    }

    return this.prisma.productUnit.update({
      where: { id },
      data: { active: true },
    });
  }
}
