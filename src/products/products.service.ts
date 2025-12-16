import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';
import { Prisma, ProductType } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // POST /products - Create new product
  async create(createProductDto: CreateProductDto) {
    const totalQuantity = createProductDto.totalQuantity ?? 0;

    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        type: createProductDto.type,
        description: createProductDto.description,
        notes: createProductDto.notes,
        totalQuantity,
        availableQuantity: totalQuantity,
      },
    });
  }

  // GET /products - List products with pagination and filters
  async findAll(
    options: {
      page?: number;
      pageSize?: number;
      type?: ProductType;
      active?: boolean;
    } = {},
  ) {
    const { page = 1, pageSize = 10, ...filters } = options;

    const where: Prisma.ProductWhereInput = {};
    if (filters.type) where.type = filters.type;
    if (filters.active !== undefined) where.active = filters.active;

    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
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

  // GET /products/:id - Get product by ID
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    return product;
  }

  // PATCH /products/:id - Update product
  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  // DELETE /products/:id - Soft delete product
  async remove(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    return this.prisma.product.update({
      where: { id },
      data: { active: false },
    });
  }

  // PATCH /products/:id/reactivate - Reactivate soft-deleted product
  async reactivate(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    return this.prisma.product.update({
      where: { id },
      data: { active: true },
    });
  }
}
