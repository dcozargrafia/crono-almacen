/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { RentalsService } from './rentals.service';
import { PrismaService } from '../prisma.service';
import { ProductsService } from '../products/products.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RentalStatus } from '@prisma/client';

describe('RentalsService', () => {
  let service: RentalsService;
  let mockPrismaService: any;
  let mockProductsService: any;

  const createMockRental = (overrides = {}) => ({
    id: 1,
    clientId: 1,
    startDate: new Date('2024-01-15'),
    expectedEndDate: new Date('2024-01-20'),
    actualEndDate: null,
    status: RentalStatus.ACTIVE,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const createMockClient = (overrides = {}) => ({
    id: 1,
    name: 'Test Client',
    codeSportmaniacs: null,
    email: 'test@example.com',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const createMockDevice = (overrides = {}) => ({
    id: 1,
    model: 'TSONE',
    manufactoringCode: 'TC-001',
    manufactoringStatus: 'COMPLETED',
    operationalStatus: 'AVAILABLE',
    availableForRental: true,
    ownerId: null,
    serialNumber: null,
    portCount: null,
    frequencyRegion: null,
    manufacturingDate: null,
    notes: null,
    reader1SerialNumber: null,
    reader2SerialNumber: null,
    cpuSerialNumber: null,
    batterySerialNumber: null,
    tsPowerModel: null,
    cpuFirmware: null,
    gx1ReadersRegion: null,
    hasGSM: null,
    hasGUN: null,
    bluetoothAdapter: null,
    coreVersion: null,
    heatsinks: null,
    picVersion: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const createMockProduct = (overrides = {}) => ({
    id: 1,
    name: 'Test Product',
    type: 'ANTENNA',
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

  beforeEach(async () => {
    mockPrismaService = {
      rental: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      client: {
        findUnique: jest.fn(),
      },
      device: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
      },
      productUnit: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrismaService)),
    };

    mockProductsService = {
      rentQuantity: jest.fn(),
      returnQuantity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentalsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    service = module.get<RentalsService>(RentalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a rental with only required fields', async () => {
      // Arrange
      const dto = {
        clientId: 1,
        startDate: '2024-01-15',
        expectedEndDate: '2024-01-20',
      };
      const mockClient = createMockClient();
      const mockRental = createMockRental();

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.rental.create.mockResolvedValue(mockRental);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result.id).toBe(1);
      expect(result.clientId).toBe(1);
      expect(result.status).toBe(RentalStatus.ACTIVE);
    });

    it('should throw NotFoundException if client does not exist', async () => {
      // Arrange
      const dto = {
        clientId: 999,
        startDate: '2024-01-15',
        expectedEndDate: '2024-01-20',
      };
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      await expect(service.create(dto)).rejects.toThrow('CLIENT_NOT_FOUND');
    });

    it('should create a rental with devices', async () => {
      // Arrange
      const dto = {
        clientId: 1,
        startDate: '2024-01-15',
        expectedEndDate: '2024-01-20',
        deviceIds: [1, 2],
      };
      const mockClient = createMockClient();
      const mockDevices = [
        createMockDevice({ id: 1 }),
        createMockDevice({ id: 2 }),
      ];
      const mockRental = createMockRental({
        devices: [{ deviceId: 1 }, { deviceId: 2 }],
      });

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.device.findMany.mockResolvedValue(mockDevices);
      mockPrismaService.rental.create.mockResolvedValue(mockRental);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result.devices).toHaveLength(2);
      expect(mockPrismaService.device.updateMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException if device is not available for rental', async () => {
      // Arrange
      const dto = {
        clientId: 1,
        startDate: '2024-01-15',
        expectedEndDate: '2024-01-20',
        deviceIds: [1],
      };
      const mockClient = createMockClient();
      const unavailableDevice = createMockDevice({
        id: 1,
        availableForRental: false,
      });

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.device.findMany.mockResolvedValue([unavailableDevice]);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'DEVICE_NOT_AVAILABLE_FOR_RENTAL',
      );
    });

    it('should throw BadRequestException if device is already rented', async () => {
      // Arrange
      const dto = {
        clientId: 1,
        startDate: '2024-01-15',
        expectedEndDate: '2024-01-20',
        deviceIds: [1],
      };
      const mockClient = createMockClient();
      const rentedDevice = createMockDevice({
        id: 1,
        operationalStatus: 'RENTED',
      });

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.device.findMany.mockResolvedValue([rentedDevice]);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('DEVICE_NOT_AVAILABLE');
    });

    it('should create a rental with products and update quantities', async () => {
      // Arrange
      const dto = {
        clientId: 1,
        startDate: '2024-01-15',
        expectedEndDate: '2024-01-20',
        products: [{ productId: 1, quantity: 3 }],
      };
      const mockClient = createMockClient();
      const mockProduct = createMockProduct({ availableQuantity: 10 });
      const mockRental = createMockRental({
        products: [{ productId: 1, quantity: 3 }],
      });

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockProductsService.rentQuantity.mockResolvedValue({
        ...mockProduct,
        availableQuantity: 7,
        rentedQuantity: 3,
      });
      mockPrismaService.rental.create.mockResolvedValue(mockRental);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(mockProductsService.rentQuantity).toHaveBeenCalledWith(1, 3);
      expect(result.products).toHaveLength(1);
    });

    it('should throw BadRequestException if product does not have enough available quantity', async () => {
      // Arrange
      const dto = {
        clientId: 1,
        startDate: '2024-01-15',
        expectedEndDate: '2024-01-20',
        products: [{ productId: 1, quantity: 15 }],
      };
      const mockClient = createMockClient();
      const mockProduct = createMockProduct({ availableQuantity: 10 });

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'NOT_ENOUGH_PRODUCT_QUANTITY',
      );
    });

    it('should create a rental with product units', async () => {
      // Arrange
      const dto = {
        clientId: 1,
        startDate: '2024-01-15',
        expectedEndDate: '2024-01-20',
        productUnitIds: [1, 2],
      };
      const mockClient = createMockClient();
      const mockProductUnits = [
        { id: 1, status: 'AVAILABLE', active: true },
        { id: 2, status: 'AVAILABLE', active: true },
      ];
      const mockRental = createMockRental({
        productUnits: [{ productUnitId: 1 }, { productUnitId: 2 }],
      });

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.productUnit.findMany.mockResolvedValue(
        mockProductUnits,
      );
      mockPrismaService.rental.create.mockResolvedValue(mockRental);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result.productUnits).toHaveLength(2);
      expect(mockPrismaService.productUnit.updateMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException if product unit is not available', async () => {
      // Arrange
      const dto = {
        clientId: 1,
        startDate: '2024-01-15',
        expectedEndDate: '2024-01-20',
        productUnitIds: [1],
      };
      const mockClient = createMockClient();
      const rentedProductUnit = { id: 1, status: 'RENTED', active: true };

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.productUnit.findMany.mockResolvedValue([
        rentedProductUnit,
      ]);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'PRODUCT_UNIT_NOT_AVAILABLE',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated rentals', async () => {
      // Arrange
      const mockRentals = [
        createMockRental({ id: 1 }),
        createMockRental({ id: 2 }),
      ];
      mockPrismaService.rental.findMany.mockResolvedValue(mockRentals);
      mockPrismaService.rental.count.mockResolvedValue(2);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by status', async () => {
      // Arrange
      const mockRentals = [createMockRental({ status: RentalStatus.ACTIVE })];
      mockPrismaService.rental.findMany.mockResolvedValue(mockRentals);
      mockPrismaService.rental.count.mockResolvedValue(1);

      // Act
      const result = await service.findAll({ status: RentalStatus.ACTIVE });

      // Assert
      expect(result.data).toHaveLength(1);
      expect(mockPrismaService.rental.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: RentalStatus.ACTIVE }),
        }),
      );
    });

    it('should filter by clientId', async () => {
      // Arrange
      const mockRentals = [createMockRental({ clientId: 1 })];
      mockPrismaService.rental.findMany.mockResolvedValue(mockRentals);
      mockPrismaService.rental.count.mockResolvedValue(1);

      // Act
      const result = await service.findAll({ clientId: 1 });

      // Assert
      expect(result.data).toHaveLength(1);
      expect(mockPrismaService.rental.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ clientId: 1 }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a rental by id with relations', async () => {
      // Arrange
      const mockRental = createMockRental({
        client: createMockClient(),
        devices: [],
        products: [],
        productUnits: [],
      });
      mockPrismaService.rental.findUnique.mockResolvedValue(mockRental);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result.id).toBe(1);
      expect(result.client).toBeDefined();
    });

    it('should throw NotFoundException if rental does not exist', async () => {
      // Arrange
      mockPrismaService.rental.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('RENTAL_NOT_FOUND');
    });
  });

  describe('update', () => {
    it('should update rental fields', async () => {
      // Arrange
      const mockRental = createMockRental();
      const updatedRental = createMockRental({ notes: 'Updated notes' });
      mockPrismaService.rental.findUnique.mockResolvedValue(mockRental);
      mockPrismaService.rental.update.mockResolvedValue(updatedRental);

      // Act
      const result = await service.update(1, { notes: 'Updated notes' });

      // Assert
      expect(result.notes).toBe('Updated notes');
    });

    it('should throw NotFoundException if rental does not exist', async () => {
      // Arrange
      mockPrismaService.rental.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, { notes: 'test' })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(999, { notes: 'test' })).rejects.toThrow(
        'RENTAL_NOT_FOUND',
      );
    });

    it('should throw BadRequestException if rental is not active', async () => {
      // Arrange
      const returnedRental = createMockRental({
        status: RentalStatus.RETURNED,
      });
      mockPrismaService.rental.findUnique.mockResolvedValue(returnedRental);

      // Act & Assert
      await expect(service.update(1, { notes: 'test' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(1, { notes: 'test' })).rejects.toThrow(
        'RENTAL_NOT_ACTIVE',
      );
    });
  });

  describe('returnRental', () => {
    it('should mark rental as returned and restore inventory', async () => {
      // Arrange
      const mockRental = createMockRental({
        status: RentalStatus.ACTIVE,
        devices: [{ id: 1, deviceId: 1, device: createMockDevice() }],
        products: [{ id: 1, productId: 1, quantity: 3 }],
        productUnits: [{ id: 1, productUnitId: 1 }],
      });
      const returnedRental = createMockRental({
        status: RentalStatus.RETURNED,
        actualEndDate: new Date(),
      });

      mockPrismaService.rental.findUnique.mockResolvedValue(mockRental);
      mockPrismaService.rental.update.mockResolvedValue(returnedRental);

      // Act
      const result = await service.returnRental(1);

      // Assert
      expect(result.status).toBe(RentalStatus.RETURNED);
      expect(mockPrismaService.device.updateMany).toHaveBeenCalled();
      expect(mockProductsService.returnQuantity).toHaveBeenCalledWith(1, 3);
      expect(mockPrismaService.productUnit.updateMany).toHaveBeenCalled();
    });

    it('should throw NotFoundException if rental does not exist', async () => {
      // Arrange
      mockPrismaService.rental.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.returnRental(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.returnRental(999)).rejects.toThrow(
        'RENTAL_NOT_FOUND',
      );
    });

    it('should throw BadRequestException if rental is not active', async () => {
      // Arrange
      const returnedRental = createMockRental({
        status: RentalStatus.RETURNED,
      });
      mockPrismaService.rental.findUnique.mockResolvedValue(returnedRental);

      // Act & Assert
      await expect(service.returnRental(1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.returnRental(1)).rejects.toThrow(
        'RENTAL_NOT_ACTIVE',
      );
    });
  });

  describe('cancelRental', () => {
    it('should mark rental as cancelled and restore inventory', async () => {
      // Arrange
      const mockRental = createMockRental({
        status: RentalStatus.ACTIVE,
        devices: [{ id: 1, deviceId: 1, device: createMockDevice() }],
        products: [{ id: 1, productId: 1, quantity: 3 }],
        productUnits: [{ id: 1, productUnitId: 1 }],
      });
      const cancelledRental = createMockRental({
        status: RentalStatus.CANCELLED,
      });

      mockPrismaService.rental.findUnique.mockResolvedValue(mockRental);
      mockPrismaService.rental.update.mockResolvedValue(cancelledRental);

      // Act
      const result = await service.cancelRental(1);

      // Assert
      expect(result.status).toBe(RentalStatus.CANCELLED);
      expect(mockPrismaService.device.updateMany).toHaveBeenCalled();
      expect(mockProductsService.returnQuantity).toHaveBeenCalledWith(1, 3);
      expect(mockPrismaService.productUnit.updateMany).toHaveBeenCalled();
    });

    it('should throw NotFoundException if rental does not exist', async () => {
      // Arrange
      mockPrismaService.rental.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.cancelRental(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.cancelRental(999)).rejects.toThrow(
        'RENTAL_NOT_FOUND',
      );
    });

    it('should throw BadRequestException if rental is not active', async () => {
      // Arrange
      const returnedRental = createMockRental({
        status: RentalStatus.RETURNED,
      });
      mockPrismaService.rental.findUnique.mockResolvedValue(returnedRental);

      // Act & Assert
      await expect(service.cancelRental(1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.cancelRental(1)).rejects.toThrow(
        'RENTAL_NOT_ACTIVE',
      );
    });
  });
});
