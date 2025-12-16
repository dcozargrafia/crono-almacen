import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma.service';
import { ProductType } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrismaService = {
  product: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const createMockProduct = (overrides = {}) => ({
  id: 1,
  name: 'Antena 900MHz',
  type: 'ANTENNA' as ProductType,
  description: null,
  notes: null,
  totalQuantity: 10,
  availableQuantity: 10,
  rentedQuantity: 0,
  inRepairQuantity: 0,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  describe('create', () => {
    it('should create a product with initial quantities', async () => {
      // Arrange
      const dto = {
        name: 'Antena 900MHz',
        type: 'ANTENNA' as ProductType,
        totalQuantity: 10,
      };
      const productFromDb = createMockProduct();

      mockPrismaService.product.create.mockResolvedValue(productFromDb);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(productFromDb);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Antena 900MHz',
          type: 'ANTENNA',
          totalQuantity: 10,
          availableQuantity: 10,
        },
      });
    });

    it('should create a product with default quantity 0', async () => {
      // Arrange
      const dto = {
        name: 'Cables USB',
        type: 'CABLE' as ProductType,
      };
      const productFromDb = createMockProduct({
        name: 'Cables USB',
        type: 'CABLE',
        totalQuantity: 0,
        availableQuantity: 0,
      });

      mockPrismaService.product.create.mockResolvedValue(productFromDb);

      // Act
      await service.create(dto);

      // Assert
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Cables USB',
          type: 'CABLE',
          totalQuantity: 0,
          availableQuantity: 0,
        },
      });
    });
  });

  // FIND ALL
  describe('findAll', () => {
    it('should return paginated products', async () => {
      // Arrange
      const products = [
        createMockProduct({ id: 1 }),
        createMockProduct({ id: 2 }),
      ];
      mockPrismaService.product.findMany.mockResolvedValue(products);
      mockPrismaService.product.count.mockResolvedValue(2);

      // Act
      const result = await service.findAll({ page: 1, pageSize: 10 });

      // Assert
      expect(result.data).toEqual(products);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
    });

    it('should filter by type', async () => {
      // Arrange
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      // Act
      await service.findAll({ type: 'ANTENNA' as ProductType });

      // Assert
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'ANTENNA' }),
        }),
      );
    });

    it('should filter by active status', async () => {
      // Arrange
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      // Act
      await service.findAll({ active: true });

      // Assert
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ active: true }),
        }),
      );
    });

    it('should return all products when active filter is not set', async () => {
      // Arrange
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      // Act
      await service.findAll({});

      // Assert
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });
  });

  // FIND ONE
  describe('findOne', () => {
    it('should return a product by id', async () => {
      // Arrange
      const product = createMockProduct({ id: 1 });
      mockPrismaService.product.findUnique.mockResolvedValue(product);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result).toEqual(product);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // UPDATE
  describe('update', () => {
    it('should update a product', async () => {
      // Arrange
      const existingProduct = createMockProduct({ id: 1 });
      const updatedProduct = createMockProduct({
        id: 1,
        name: 'Antena 900MHz v2',
      });

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.update(1, { name: 'Antena 900MHz v2' });

      // Assert
      expect(result.name).toBe('Antena 900MHz v2');
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, { name: 'test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if totalQuantity is less than sum of quantities', async () => {
      // Arrange
      const existingProduct = createMockProduct({
        id: 1,
        totalQuantity: 10,
        availableQuantity: 5,
        rentedQuantity: 3,
        inRepairQuantity: 2,
      });
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.update(1, { totalQuantity: 8 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow update if totalQuantity is greater or equal to sum of quantities', async () => {
      // Arrange
      const existingProduct = createMockProduct({
        id: 1,
        totalQuantity: 10,
        availableQuantity: 5,
        rentedQuantity: 3,
        inRepairQuantity: 2,
      });
      const updatedProduct = createMockProduct({
        id: 1,
        totalQuantity: 12,
      });

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.update(1, { totalQuantity: 12 });

      // Assert
      expect(result.totalQuantity).toBe(12);
    });
  });

  // REMOVE (soft delete)
  describe('remove', () => {
    it('should soft delete a product by setting active to false', async () => {
      // Arrange
      const existingProduct = createMockProduct({ id: 1 });
      const deletedProduct = createMockProduct({ id: 1, active: false });

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(deletedProduct);

      // Act
      const result = await service.remove(1);

      // Assert
      expect(result.active).toBe(false);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: false },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // REACTIVATE
  describe('reactivate', () => {
    it('should reactivate a soft-deleted product', async () => {
      // Arrange
      const inactiveProduct = createMockProduct({ id: 1, active: false });
      const reactivatedProduct = createMockProduct({ id: 1, active: true });

      mockPrismaService.product.findUnique.mockResolvedValue(inactiveProduct);
      mockPrismaService.product.update.mockResolvedValue(reactivatedProduct);

      // Act
      const result = await service.reactivate(1);

      // Assert
      expect(result.active).toBe(true);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: true },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.reactivate(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ADD STOCK
  describe('addStock', () => {
    it('should increase totalQuantity and availableQuantity', async () => {
      // Arrange
      const existingProduct = createMockProduct({
        id: 1,
        totalQuantity: 10,
        availableQuantity: 8,
      });
      const updatedProduct = createMockProduct({
        id: 1,
        totalQuantity: 15,
        availableQuantity: 13,
      });

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.addStock(1, 5);

      // Assert
      expect(result.totalQuantity).toBe(15);
      expect(result.availableQuantity).toBe(13);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          totalQuantity: 15,
          availableQuantity: 13,
        },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.addStock(999, 5)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if quantity is not positive', async () => {
      // Arrange
      const existingProduct = createMockProduct({ id: 1 });
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.addStock(1, 0)).rejects.toThrow(BadRequestException);
      await expect(service.addStock(1, -5)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // RETIRE STOCK
  describe('retire', () => {
    it('should decrease totalQuantity and availableQuantity', async () => {
      // Arrange
      const existingProduct = createMockProduct({
        id: 1,
        totalQuantity: 10,
        availableQuantity: 8,
      });
      const updatedProduct = createMockProduct({
        id: 1,
        totalQuantity: 7,
        availableQuantity: 5,
      });

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.retire(1, 3);

      // Assert
      expect(result.totalQuantity).toBe(7);
      expect(result.availableQuantity).toBe(5);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.retire(999, 5)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if quantity is not positive', async () => {
      // Arrange
      const existingProduct = createMockProduct({ id: 1 });
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.retire(1, 0)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if not enough available quantity', async () => {
      // Arrange
      const existingProduct = createMockProduct({
        id: 1,
        totalQuantity: 10,
        availableQuantity: 3,
      });
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.retire(1, 5)).rejects.toThrow(BadRequestException);
    });
  });

  // SEND TO REPAIR
  describe('sendToRepair', () => {
    it('should move quantity from available to inRepair', async () => {
      // Arrange
      const existingProduct = createMockProduct({
        id: 1,
        availableQuantity: 8,
        inRepairQuantity: 2,
      });
      const updatedProduct = createMockProduct({
        id: 1,
        availableQuantity: 5,
        inRepairQuantity: 5,
      });

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.sendToRepair(1, 3);

      // Assert
      expect(result.availableQuantity).toBe(5);
      expect(result.inRepairQuantity).toBe(5);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          availableQuantity: 5,
          inRepairQuantity: 5,
        },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.sendToRepair(999, 3)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if quantity is not positive', async () => {
      // Arrange
      const existingProduct = createMockProduct({ id: 1 });
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.sendToRepair(1, 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if not enough available quantity', async () => {
      // Arrange
      const existingProduct = createMockProduct({
        id: 1,
        availableQuantity: 2,
      });
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.sendToRepair(1, 5)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // MARK REPAIRED
  describe('markRepaired', () => {
    it('should move quantity from inRepair to available', async () => {
      // Arrange
      const existingProduct = createMockProduct({
        id: 1,
        availableQuantity: 5,
        inRepairQuantity: 5,
      });
      const updatedProduct = createMockProduct({
        id: 1,
        availableQuantity: 8,
        inRepairQuantity: 2,
      });

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.markRepaired(1, 3);

      // Assert
      expect(result.availableQuantity).toBe(8);
      expect(result.inRepairQuantity).toBe(2);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          availableQuantity: 8,
          inRepairQuantity: 2,
        },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.markRepaired(999, 3)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if quantity is not positive', async () => {
      // Arrange
      const existingProduct = createMockProduct({ id: 1 });
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.markRepaired(1, 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if not enough inRepair quantity', async () => {
      // Arrange
      const existingProduct = createMockProduct({
        id: 1,
        inRepairQuantity: 2,
      });
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.markRepaired(1, 5)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // RENT QUANTITY (internal method for RentalsService)
  describe('rentQuantity', () => {
    it('should move quantity from available to rented', async () => {
      // Arrange
      const existingProduct = createMockProduct({
        id: 1,
        availableQuantity: 10,
        rentedQuantity: 0,
      });
      const updatedProduct = createMockProduct({
        id: 1,
        availableQuantity: 7,
        rentedQuantity: 3,
      });

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.rentQuantity(1, 3);

      // Assert
      expect(result.availableQuantity).toBe(7);
      expect(result.rentedQuantity).toBe(3);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          availableQuantity: 7,
          rentedQuantity: 3,
        },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.rentQuantity(999, 3)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if quantity is not positive', async () => {
      // Arrange
      const existingProduct = createMockProduct({ id: 1 });
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.rentQuantity(1, 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if not enough available quantity', async () => {
      // Arrange
      const existingProduct = createMockProduct({
        id: 1,
        availableQuantity: 2,
      });
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.rentQuantity(1, 5)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // RETURN QUANTITY (internal method for RentalsService)
  describe('returnQuantity', () => {
    it('should move quantity from rented to available', async () => {
      // Arrange
      const existingProduct = createMockProduct({
        id: 1,
        availableQuantity: 7,
        rentedQuantity: 3,
      });
      const updatedProduct = createMockProduct({
        id: 1,
        availableQuantity: 10,
        rentedQuantity: 0,
      });

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.returnQuantity(1, 3);

      // Assert
      expect(result.availableQuantity).toBe(10);
      expect(result.rentedQuantity).toBe(0);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          availableQuantity: 10,
          rentedQuantity: 0,
        },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.returnQuantity(999, 3)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if quantity is not positive', async () => {
      // Arrange
      const existingProduct = createMockProduct({ id: 1 });
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.returnQuantity(1, 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if not enough rented quantity', async () => {
      // Arrange
      const existingProduct = createMockProduct({
        id: 1,
        rentedQuantity: 2,
      });
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.returnQuantity(1, 5)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
