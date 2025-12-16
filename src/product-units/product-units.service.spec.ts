import { Test, TestingModule } from '@nestjs/testing';
import { ProductUnitsService } from './product-units.service';
import { PrismaService } from '../prisma.service';
import { ProductType, ProductUnitStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  productUnit: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const createMockProductUnit = (overrides = {}) => ({
  id: 1,
  type: 'STOPWATCH' as ProductType,
  serialNumber: 'SW-001',
  notes: null,
  status: 'AVAILABLE' as ProductUnitStatus,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ProductUnitsService', () => {
  let service: ProductUnitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductUnitsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProductUnitsService>(ProductUnitsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  describe('create', () => {
    it('should create a product unit', async () => {
      // Arrange
      const dto = {
        type: 'STOPWATCH' as ProductType,
        serialNumber: 'SW-001',
      };
      const unitFromDb = createMockProductUnit();

      mockPrismaService.productUnit.findUnique.mockResolvedValue(null);
      mockPrismaService.productUnit.create.mockResolvedValue(unitFromDb);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(unitFromDb);
      expect(mockPrismaService.productUnit.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it('should throw error if serialNumber already exists', async () => {
      // Arrange
      const dto = {
        type: 'STOPWATCH' as ProductType,
        serialNumber: 'SW-001',
      };
      const existingUnit = createMockProductUnit();

      mockPrismaService.productUnit.findUnique.mockResolvedValue(existingUnit);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(
        'SERIAL_NUMBER_ALREADY_EXISTS',
      );
    });
  });

  // FIND ALL
  describe('findAll', () => {
    it('should return paginated product units', async () => {
      // Arrange
      const units = [
        createMockProductUnit({ id: 1 }),
        createMockProductUnit({ id: 2 }),
      ];
      mockPrismaService.productUnit.findMany.mockResolvedValue(units);
      mockPrismaService.productUnit.count.mockResolvedValue(2);

      // Act
      const result = await service.findAll({ page: 1, pageSize: 10 });

      // Assert
      expect(result.data).toEqual(units);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
    });

    it('should filter by type', async () => {
      // Arrange
      mockPrismaService.productUnit.findMany.mockResolvedValue([]);
      mockPrismaService.productUnit.count.mockResolvedValue(0);

      // Act
      await service.findAll({ type: 'PHONE' as ProductType });

      // Assert
      expect(mockPrismaService.productUnit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'PHONE' }),
        }),
      );
    });

    it('should filter by status', async () => {
      // Arrange
      mockPrismaService.productUnit.findMany.mockResolvedValue([]);
      mockPrismaService.productUnit.count.mockResolvedValue(0);

      // Act
      await service.findAll({ status: 'RENTED' as ProductUnitStatus });

      // Assert
      expect(mockPrismaService.productUnit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'RENTED' }),
        }),
      );
    });

    it('should filter by active status', async () => {
      // Arrange
      mockPrismaService.productUnit.findMany.mockResolvedValue([]);
      mockPrismaService.productUnit.count.mockResolvedValue(0);

      // Act
      await service.findAll({ active: true });

      // Assert
      expect(mockPrismaService.productUnit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ active: true }),
        }),
      );
    });
  });

  // FIND ONE
  describe('findOne', () => {
    it('should return a product unit by id', async () => {
      // Arrange
      const unit = createMockProductUnit({ id: 1 });
      mockPrismaService.productUnit.findUnique.mockResolvedValue(unit);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result).toEqual(unit);
    });

    it('should throw NotFoundException if product unit does not exist', async () => {
      // Arrange
      mockPrismaService.productUnit.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // FIND BY SERIAL
  describe('findBySerial', () => {
    it('should return a product unit by serial number', async () => {
      // Arrange
      const unit = createMockProductUnit({ serialNumber: 'SW-001' });
      mockPrismaService.productUnit.findUnique.mockResolvedValue(unit);

      // Act
      const result = await service.findBySerial('SW-001');

      // Assert
      expect(result).toEqual(unit);
      expect(mockPrismaService.productUnit.findUnique).toHaveBeenCalledWith({
        where: { serialNumber: 'SW-001' },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      // Arrange
      mockPrismaService.productUnit.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findBySerial('UNKNOWN')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // UPDATE
  describe('update', () => {
    it('should update a product unit', async () => {
      // Arrange
      const existingUnit = createMockProductUnit({ id: 1 });
      const updatedUnit = createMockProductUnit({ id: 1, notes: 'Updated' });

      mockPrismaService.productUnit.findUnique.mockResolvedValue(existingUnit);
      mockPrismaService.productUnit.update.mockResolvedValue(updatedUnit);

      // Act
      const result = await service.update(1, { notes: 'Updated' });

      // Assert
      expect(result.notes).toBe('Updated');
    });

    it('should throw NotFoundException if product unit does not exist', async () => {
      // Arrange
      mockPrismaService.productUnit.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, { notes: 'test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if new serialNumber already exists', async () => {
      // Arrange
      const existingUnit = createMockProductUnit({ id: 1 });
      const anotherUnit = createMockProductUnit({
        id: 2,
        serialNumber: 'SW-002',
      });

      mockPrismaService.productUnit.findUnique
        .mockResolvedValueOnce(existingUnit)
        .mockResolvedValueOnce(anotherUnit);

      // Act & Assert
      await expect(
        service.update(1, { serialNumber: 'SW-002' }),
      ).rejects.toThrow('SERIAL_NUMBER_ALREADY_EXISTS');
    });
  });

  // UPDATE STATUS
  describe('updateStatus', () => {
    it('should update product unit status', async () => {
      // Arrange
      const existingUnit = createMockProductUnit({ id: 1 });
      const updatedUnit = createMockProductUnit({
        id: 1,
        status: 'RENTED',
      });

      mockPrismaService.productUnit.findUnique.mockResolvedValue(existingUnit);
      mockPrismaService.productUnit.update.mockResolvedValue(updatedUnit);

      // Act
      const result = await service.updateStatus(
        1,
        'RENTED' as ProductUnitStatus,
      );

      // Assert
      expect(result.status).toBe('RENTED');
      expect(mockPrismaService.productUnit.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'RENTED' },
      });
    });

    it('should throw NotFoundException if product unit does not exist', async () => {
      // Arrange
      mockPrismaService.productUnit.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateStatus(999, 'RENTED' as ProductUnitStatus),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // REMOVE (soft delete)
  describe('remove', () => {
    it('should soft delete by setting active to false', async () => {
      // Arrange
      const existingUnit = createMockProductUnit({ id: 1 });
      const deletedUnit = createMockProductUnit({ id: 1, active: false });

      mockPrismaService.productUnit.findUnique.mockResolvedValue(existingUnit);
      mockPrismaService.productUnit.update.mockResolvedValue(deletedUnit);

      // Act
      const result = await service.remove(1);

      // Assert
      expect(result.active).toBe(false);
    });

    it('should throw NotFoundException if product unit does not exist', async () => {
      // Arrange
      mockPrismaService.productUnit.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // REACTIVATE
  describe('reactivate', () => {
    it('should reactivate a soft-deleted product unit', async () => {
      // Arrange
      const inactiveUnit = createMockProductUnit({ id: 1, active: false });
      const reactivatedUnit = createMockProductUnit({ id: 1, active: true });

      mockPrismaService.productUnit.findUnique.mockResolvedValue(inactiveUnit);
      mockPrismaService.productUnit.update.mockResolvedValue(reactivatedUnit);

      // Act
      const result = await service.reactivate(1);

      // Assert
      expect(result.active).toBe(true);
    });

    it('should throw NotFoundException if product unit does not exist', async () => {
      // Arrange
      mockPrismaService.productUnit.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.reactivate(999)).rejects.toThrow(NotFoundException);
    });
  });
});
