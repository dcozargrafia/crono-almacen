/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { ChipTypesService } from './chip-types.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ChipTypesService', () => {
  let service: ChipTypesService;
  let mockPrismaService: any;

  const createMockChipType = (overrides = {}) => ({
    id: 1,
    name: 'TRITON',
    displayName: 'Triton',
    totalStock: 5500,
    sequenceData: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    mockPrismaService = {
      chipType: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChipTypesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ChipTypesService>(ChipTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a chip type', async () => {
      // Arrange
      const dto = { name: 'TRITON', displayName: 'Triton', totalStock: 5500 };
      const mockChipType = createMockChipType();
      mockPrismaService.chipType.findUnique.mockResolvedValue(null);
      mockPrismaService.chipType.create.mockResolvedValue(mockChipType);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result.name).toBe('TRITON');
      expect(result.displayName).toBe('Triton');
      expect(result.totalStock).toBe(5500);
    });

    it('should throw ConflictException if name already exists', async () => {
      // Arrange
      const dto = { name: 'TRITON', displayName: 'Triton', totalStock: 5500 };
      mockPrismaService.chipType.findUnique.mockResolvedValue(
        createMockChipType(),
      );

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'CHIP_TYPE_NAME_ALREADY_EXISTS',
      );
    });
  });

  describe('findAll', () => {
    it('should return all chip types without sequenceData', async () => {
      // Arrange
      const mockChipTypes = [
        createMockChipType({ id: 1, name: 'TRITON' }),
        createMockChipType({ id: 2, name: 'POD', displayName: 'Pod' }),
      ];
      mockPrismaService.chipType.findMany.mockResolvedValue(mockChipTypes);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(mockPrismaService.chipType.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          displayName: true,
          totalStock: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a chip type by id with sequenceData', async () => {
      // Arrange
      const mockChipType = createMockChipType({
        sequenceData: [{ chip: 1, code: 'ABC' }],
      });
      mockPrismaService.chipType.findUnique.mockResolvedValue(mockChipType);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result.id).toBe(1);
      expect(result.sequenceData).toBeDefined();
    });

    it('should throw NotFoundException if chip type does not exist', async () => {
      // Arrange
      mockPrismaService.chipType.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('CHIP_TYPE_NOT_FOUND');
    });
  });

  describe('update', () => {
    it('should update a chip type', async () => {
      // Arrange
      const mockChipType = createMockChipType();
      const updatedChipType = createMockChipType({ totalStock: 6000 });
      mockPrismaService.chipType.findUnique.mockResolvedValue(mockChipType);
      mockPrismaService.chipType.update.mockResolvedValue(updatedChipType);

      // Act
      const result = await service.update(1, { totalStock: 6000 });

      // Assert
      expect(result.totalStock).toBe(6000);
    });

    it('should throw NotFoundException if chip type does not exist', async () => {
      // Arrange
      mockPrismaService.chipType.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, { totalStock: 100 })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(999, { totalStock: 100 })).rejects.toThrow(
        'CHIP_TYPE_NOT_FOUND',
      );
    });

    it('should throw ConflictException if new name already exists', async () => {
      // Arrange
      const existingChipType = createMockChipType({ id: 1, name: 'TRITON' });
      const otherChipType = createMockChipType({ id: 2, name: 'POD' });

      mockPrismaService.chipType.findUnique
        .mockResolvedValueOnce(existingChipType) // First call: find by id
        .mockResolvedValueOnce(otherChipType); // Second call: find by name

      // Act & Assert
      await expect(service.update(1, { name: 'POD' })).rejects.toThrow(
        'CHIP_TYPE_NAME_ALREADY_EXISTS',
      );
    });
  });

  describe('remove', () => {
    it('should delete a chip type', async () => {
      // Arrange
      const mockChipType = createMockChipType();
      mockPrismaService.chipType.findUnique.mockResolvedValue(mockChipType);
      mockPrismaService.chipType.delete.mockResolvedValue(mockChipType);

      // Act
      const result = await service.remove(1);

      // Assert
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if chip type does not exist', async () => {
      // Arrange
      mockPrismaService.chipType.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow('CHIP_TYPE_NOT_FOUND');
    });
  });

  describe('uploadSequence', () => {
    it('should upload sequence data', async () => {
      // Arrange
      const mockChipType = createMockChipType();
      const sequenceData = [
        { chip: 1, code: 'ABC123' },
        { chip: 2, code: 'DEF456' },
      ];
      const updatedChipType = createMockChipType({ sequenceData });

      mockPrismaService.chipType.findUnique.mockResolvedValue(mockChipType);
      mockPrismaService.chipType.update.mockResolvedValue(updatedChipType);

      // Act
      const result = await service.uploadSequence(1, sequenceData);

      // Assert
      expect(result.sequenceData).toEqual(sequenceData);
      expect(mockPrismaService.chipType.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { sequenceData },
      });
    });

    it('should throw NotFoundException if chip type does not exist', async () => {
      // Arrange
      mockPrismaService.chipType.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.uploadSequence(999, [])).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.uploadSequence(999, [])).rejects.toThrow(
        'CHIP_TYPE_NOT_FOUND',
      );
    });
  });

  describe('getSequence', () => {
    it('should return sequence data', async () => {
      // Arrange
      const sequenceData = [
        { chip: 1, code: 'ABC123' },
        { chip: 2, code: 'DEF456' },
      ];
      const mockChipType = createMockChipType({ sequenceData });
      mockPrismaService.chipType.findUnique.mockResolvedValue(mockChipType);

      // Act
      const result = await service.getSequence(1);

      // Assert
      expect(result).toEqual(sequenceData);
    });

    it('should throw NotFoundException if chip type does not exist', async () => {
      // Arrange
      mockPrismaService.chipType.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getSequence(999)).rejects.toThrow(NotFoundException);
      await expect(service.getSequence(999)).rejects.toThrow(
        'CHIP_TYPE_NOT_FOUND',
      );
    });

    it('should return empty array if no sequence data', async () => {
      // Arrange
      const mockChipType = createMockChipType({ sequenceData: null });
      mockPrismaService.chipType.findUnique.mockResolvedValue(mockChipType);

      // Act
      const result = await service.getSequence(1);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getSequenceRange', () => {
    it('should return sequence data for a specific range', async () => {
      // Arrange
      const sequenceData = [
        { chip: 1, code: 'A' },
        { chip: 2, code: 'B' },
        { chip: 3, code: 'C' },
        { chip: 4, code: 'D' },
        { chip: 5, code: 'E' },
      ];
      const mockChipType = createMockChipType({ sequenceData });
      mockPrismaService.chipType.findUnique.mockResolvedValue(mockChipType);

      // Act
      const result = await service.getSequenceRange(1, 2, 4);

      // Assert
      expect(result).toEqual([
        { chip: 2, code: 'B' },
        { chip: 3, code: 'C' },
        { chip: 4, code: 'D' },
      ]);
    });

    it('should throw NotFoundException if chip type does not exist', async () => {
      // Arrange
      mockPrismaService.chipType.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getSequenceRange(999, 1, 10)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
