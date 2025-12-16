import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

    // Validate quantity coherence if totalQuantity is being updated
    if (updateProductDto.totalQuantity !== undefined) {
      const usedQuantity =
        product.availableQuantity +
        product.rentedQuantity +
        product.inRepairQuantity;

      if (updateProductDto.totalQuantity < usedQuantity) {
        throw new BadRequestException('TOTAL_QUANTITY_BELOW_USED');
      }
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

  // POST /products/:id/add-stock - Add units to inventory
  async addStock(id: number, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    if (quantity <= 0) {
      throw new BadRequestException('QUANTITY_MUST_BE_POSITIVE');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        totalQuantity: product.totalQuantity + quantity,
        availableQuantity: product.availableQuantity + quantity,
      },
    });
  }

  // POST /products/:id/retire - Remove units from inventory
  async retire(id: number, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    if (quantity <= 0) {
      throw new BadRequestException('QUANTITY_MUST_BE_POSITIVE');
    }

    if (product.availableQuantity < quantity) {
      throw new BadRequestException('NOT_ENOUGH_AVAILABLE_QUANTITY');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        totalQuantity: product.totalQuantity - quantity,
        availableQuantity: product.availableQuantity - quantity,
      },
    });
  }

  // POST /products/:id/send-to-repair - Move units to repair
  async sendToRepair(id: number, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    if (quantity <= 0) {
      throw new BadRequestException('QUANTITY_MUST_BE_POSITIVE');
    }

    if (product.availableQuantity < quantity) {
      throw new BadRequestException('NOT_ENOUGH_AVAILABLE_QUANTITY');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        availableQuantity: product.availableQuantity - quantity,
        inRepairQuantity: product.inRepairQuantity + quantity,
      },
    });
  }

  // POST /products/:id/mark-repaired - Return units from repair to available
  async markRepaired(id: number, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    if (quantity <= 0) {
      throw new BadRequestException('QUANTITY_MUST_BE_POSITIVE');
    }

    if (product.inRepairQuantity < quantity) {
      throw new BadRequestException('NOT_ENOUGH_IN_REPAIR_QUANTITY');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        availableQuantity: product.availableQuantity + quantity,
        inRepairQuantity: product.inRepairQuantity - quantity,
      },
    });
  }
}
