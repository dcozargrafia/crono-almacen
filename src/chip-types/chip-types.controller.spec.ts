/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { ChipTypesController } from './chip-types.controller';
import { ChipTypesService } from './chip-types.service';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

describe('ChipTypesController', () => {
  let controller: ChipTypesController;
  let mockService: any;

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
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      uploadSequenceFromCsv: jest.fn(),
      getSequence: jest.fn(),
      getSequenceRange: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChipTypesController],
      providers: [{ provide: ChipTypesService, useValue: mockService }],
    }).compile();

    controller = module.get<ChipTypesController>(ChipTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /chip-types', () => {
    it('should create a chip type', async () => {
      // Arrange
      const dto = { name: 'TRITON', displayName: 'Triton', totalStock: 5500 };
      const mockChipType = createMockChipType();
      mockService.create.mockResolvedValue(mockChipType);

      // Act
      const result = await controller.create(dto);

      // Assert
      expect(result.name).toBe('TRITON');
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });

    it('should propagate ConflictException on duplicate name', async () => {
      // Arrange
      const dto = { name: 'TRITON', displayName: 'Triton', totalStock: 5500 };
      mockService.create.mockRejectedValue(
        new ConflictException('CHIP_TYPE_NAME_ALREADY_EXISTS'),
      );

      // Act & Assert
      await expect(controller.create(dto)).rejects.toThrow(
        'CHIP_TYPE_NAME_ALREADY_EXISTS',
      );
    });
  });

  describe('GET /chip-types', () => {
    it('should return all chip types', async () => {
      // Arrange
      const mockChipTypes = [
        createMockChipType({ id: 1, name: 'TRITON' }),
        createMockChipType({ id: 2, name: 'POD', displayName: 'Pod' }),
      ];
      mockService.findAll.mockResolvedValue(mockChipTypes);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(mockService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /chip-types/:id', () => {
    it('should return a chip type by id', async () => {
      // Arrange
      const mockChipType = createMockChipType();
      mockService.findOne.mockResolvedValue(mockChipType);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(result.id).toBe(1);
      expect(mockService.findOne).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException', async () => {
      // Arrange
      mockService.findOne.mockRejectedValue(
        new NotFoundException('CHIP_TYPE_NOT_FOUND'),
      );

      // Act & Assert
      await expect(controller.findOne(999)).rejects.toThrow(
        'CHIP_TYPE_NOT_FOUND',
      );
    });
  });

  describe('PATCH /chip-types/:id', () => {
    it('should update a chip type', async () => {
      // Arrange
      const updatedChipType = createMockChipType({ totalStock: 6000 });
      mockService.update.mockResolvedValue(updatedChipType);

      // Act
      const result = await controller.update(1, { totalStock: 6000 });

      // Assert
      expect(result.totalStock).toBe(6000);
      expect(mockService.update).toHaveBeenCalledWith(1, { totalStock: 6000 });
    });

    it('should propagate NotFoundException', async () => {
      // Arrange
      mockService.update.mockRejectedValue(
        new NotFoundException('CHIP_TYPE_NOT_FOUND'),
      );

      // Act & Assert
      await expect(controller.update(999, { totalStock: 100 })).rejects.toThrow(
        'CHIP_TYPE_NOT_FOUND',
      );
    });
  });

  describe('DELETE /chip-types/:id', () => {
    it('should delete a chip type', async () => {
      // Arrange
      const mockChipType = createMockChipType();
      mockService.remove.mockResolvedValue(mockChipType);

      // Act
      const result = await controller.remove(1);

      // Assert
      expect(result.id).toBe(1);
      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException', async () => {
      // Arrange
      mockService.remove.mockRejectedValue(
        new NotFoundException('CHIP_TYPE_NOT_FOUND'),
      );

      // Act & Assert
      await expect(controller.remove(999)).rejects.toThrow(
        'CHIP_TYPE_NOT_FOUND',
      );
    });
  });

  describe('PUT /chip-types/:id/sequence', () => {
    const createMockFile = (content: string): Express.Multer.File =>
      ({
        buffer: Buffer.from(content),
        originalname: 'sequence.csv',
        mimetype: 'text/csv',
      }) as Express.Multer.File;

    it('should upload sequence from CSV file', async () => {
      // Arrange
      const sequenceData = [
        { chip: 1, code: 'ABC123' },
        { chip: 2, code: 'DEF456' },
      ];
      const updatedChipType = createMockChipType({ sequenceData });
      const mockFile = createMockFile('Chip,Code\n1,ABC123\n2,DEF456');
      mockService.uploadSequenceFromCsv.mockResolvedValue(updatedChipType);

      // Act
      const result = await controller.uploadSequence(1, mockFile);

      // Assert
      expect(result.sequenceData).toEqual(sequenceData);
      expect(mockService.uploadSequenceFromCsv).toHaveBeenCalledWith(
        1,
        mockFile.buffer,
      );
    });

    it('should throw BadRequestException if no file provided', () => {
      // Act & Assert
      expect(() =>
        controller.uploadSequence(1, undefined as unknown as Express.Multer.File),
      ).toThrow(BadRequestException);
    });

    it('should propagate NotFoundException', async () => {
      // Arrange
      const mockFile = createMockFile('Chip,Code\n1,ABC123');
      mockService.uploadSequenceFromCsv.mockRejectedValue(
        new NotFoundException('CHIP_TYPE_NOT_FOUND'),
      );

      // Act & Assert
      await expect(controller.uploadSequence(999, mockFile)).rejects.toThrow(
        'CHIP_TYPE_NOT_FOUND',
      );
    });
  });

  describe('GET /chip-types/:id/sequence', () => {
    it('should return full sequence data', async () => {
      // Arrange
      const sequenceData = [
        { chip: 1, code: 'ABC123' },
        { chip: 2, code: 'DEF456' },
      ];
      mockService.getSequence.mockResolvedValue(sequenceData);

      // Act
      const result = await controller.getSequence(1, undefined, undefined);

      // Assert
      expect(result).toEqual(sequenceData);
      expect(mockService.getSequence).toHaveBeenCalledWith(1);
    });

    it('should return sequence range when start and end provided', async () => {
      // Arrange
      const rangeData = [
        { chip: 2, code: 'B' },
        { chip: 3, code: 'C' },
      ];
      mockService.getSequenceRange.mockResolvedValue(rangeData);

      // Act
      const result = await controller.getSequence(1, 2, 3);

      // Assert
      expect(result).toEqual(rangeData);
      expect(mockService.getSequenceRange).toHaveBeenCalledWith(1, 2, 3);
    });

    it('should propagate NotFoundException', async () => {
      // Arrange
      mockService.getSequence.mockRejectedValue(
        new NotFoundException('CHIP_TYPE_NOT_FOUND'),
      );

      // Act & Assert
      await expect(
        controller.getSequence(999, undefined, undefined),
      ).rejects.toThrow('CHIP_TYPE_NOT_FOUND');
    });
  });
});
