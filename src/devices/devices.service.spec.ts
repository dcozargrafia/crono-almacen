import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { PrismaService } from '../prisma.service';
import {
  DeviceModel,
  ManufactoringStatus,
  OperationalStatus,
} from '@prisma/client';

// Mock implementations
const mockPrismaService = {
  device: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  client: {
    findUnique: jest.fn(),
  },
};

// Helper to create mock Device
const createMockDevice = (overrides = {}) => ({
  id: 1,
  model: 'TS2' as DeviceModel,
  manufactoringCode: 'TS2-001',
  manufactoringStatus: 'PENDING' as ManufactoringStatus,
  operationalStatus: 'IN_MANUFACTURING' as OperationalStatus,
  availableForRental: false,
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

// Helper to create mock Client
const createMockClient = (overrides = {}) => ({
  id: 1,
  name: 'Test Client',
  codeSportmaniacs: null,
  email: null,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper DTO for creating Device
const createDeviceDto = {
  model: 'TS2' as DeviceModel,
  manufactoringCode: 'TS2-001',
};

describe('DevicesService', () => {
  let service: DevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  describe('create', () => {
    it('should create a new device and return it', async () => {
      // Arrange
      const dto = createDeviceDto;
      const deviceFromDb = createMockDevice();

      mockPrismaService.device.findUnique.mockResolvedValue(null);
      mockPrismaService.device.create.mockResolvedValue(deviceFromDb);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(deviceFromDb);
    });

    it('should throw ConflictException if manufactoringCode already exists', async () => {
      // Arrange
      const dto = createDeviceDto;
      const existingDevice = createMockDevice();

      mockPrismaService.device.findUnique.mockResolvedValue(existingDevice);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(
        'MANUFACTORING_CODE_ALREADY_EXISTS',
      );
    });
  });

  // FIND ALL
  describe('findAll', () => {
    it('should return paginated devices', async () => {
      // Arrange
      const devices = [
        createMockDevice({ id: 1 }),
        createMockDevice({ id: 2 }),
        createMockDevice({ id: 3 }),
      ];
      mockPrismaService.device.findMany.mockResolvedValue(devices);
      mockPrismaService.device.count.mockResolvedValue(3);

      // Act
      const result = await service.findAll({ page: 1, pageSize: 10 });

      // Assert
      expect(result.data).toEqual(devices);
      expect(result.meta).toEqual({
        total: 3,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
    });

    it('should filter by model', async () => {
      // Arrange
      const devices = [createMockDevice({ model: 'TSONE' })];
      mockPrismaService.device.findMany.mockResolvedValue(devices);
      mockPrismaService.device.count.mockResolvedValue(1);

      // Act
      await service.findAll({ model: 'TSONE' as DeviceModel });

      // Assert
      expect(mockPrismaService.device.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ model: 'TSONE' }),
        }),
      );
    });

    it('should filter by manufactoringStatus', async () => {
      // Arrange
      mockPrismaService.device.findMany.mockResolvedValue([]);
      mockPrismaService.device.count.mockResolvedValue(0);

      // Act
      await service.findAll({
        manufactoringStatus: 'COMPLETED' as ManufactoringStatus,
      });

      // Assert
      expect(mockPrismaService.device.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ manufactoringStatus: 'COMPLETED' }),
        }),
      );
    });

    it('should filter by operationalStatus', async () => {
      // Arrange
      mockPrismaService.device.findMany.mockResolvedValue([]);
      mockPrismaService.device.count.mockResolvedValue(0);

      // Act
      await service.findAll({
        operationalStatus: 'AVAILABLE' as OperationalStatus,
      });

      // Assert
      expect(mockPrismaService.device.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ operationalStatus: 'AVAILABLE' }),
        }),
      );
    });

    it('should filter by availableForRental', async () => {
      // Arrange
      mockPrismaService.device.findMany.mockResolvedValue([]);
      mockPrismaService.device.count.mockResolvedValue(0);

      // Act
      await service.findAll({ availableForRental: true });

      // Assert
      expect(mockPrismaService.device.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ availableForRental: true }),
        }),
      );
    });
  });

  // FIND ONE
  describe('findOne', () => {
    it('should return a device by id', async () => {
      // Arrange
      const device = createMockDevice({ id: 1 });
      mockPrismaService.device.findUnique.mockResolvedValue(device);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result).toEqual(device);
      expect(mockPrismaService.device.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if device does not exist', async () => {
      // Arrange
      mockPrismaService.device.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow('DEVICE_NOT_FOUND');
    });
  });

  // UPDATE
  describe('update', () => {
    it('should update a device and return it', async () => {
      // Arrange
      const existingDevice = createMockDevice({ id: 1 });
      const updatedDevice = createMockDevice({ id: 1, notes: 'Updated notes' });
      const updateDto = { notes: 'Updated notes' };

      mockPrismaService.device.findUnique.mockResolvedValue(existingDevice);
      mockPrismaService.device.update.mockResolvedValue(updatedDevice);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(result.notes).toBe('Updated notes');
    });

    it('should throw NotFoundException if device does not exist', async () => {
      // Arrange
      mockPrismaService.device.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, { notes: 'test' })).rejects.toThrow(
        'DEVICE_NOT_FOUND',
      );
    });

    it('should throw ConflictException if manufactoringCode already exists on another device', async () => {
      // Arrange
      const existingDevice = createMockDevice({ id: 1 });
      const anotherDevice = createMockDevice({
        id: 2,
        manufactoringCode: 'TS2-002',
      });

      mockPrismaService.device.findUnique
        .mockResolvedValueOnce(existingDevice) // findOne check
        .mockResolvedValueOnce(anotherDevice); // manufactoringCode check

      // Act & Assert
      await expect(
        service.update(1, { manufactoringCode: 'TS2-002' }),
      ).rejects.toThrow('MANUFACTORING_CODE_ALREADY_EXISTS');
    });
  });

  // REMOVE (retire)
  describe('remove', () => {
    it('should retire device by setting operationalStatus to RETIRED', async () => {
      // Arrange
      const existingDevice = createMockDevice({ id: 1 });
      mockPrismaService.device.findUnique.mockResolvedValue(existingDevice);
      mockPrismaService.device.update.mockResolvedValue({
        ...existingDevice,
        operationalStatus: 'RETIRED',
      });

      // Act
      await service.remove(1);

      // Assert
      expect(mockPrismaService.device.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { operationalStatus: 'RETIRED' },
      });
    });

    it('should throw NotFoundException if device does not exist', async () => {
      // Arrange
      mockPrismaService.device.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow('DEVICE_NOT_FOUND');
    });
  });

  // UPDATE MANUFACTORING STATUS
  describe('updateManufactoringStatus', () => {
    it('should update manufactoring status', async () => {
      // Arrange
      const existingDevice = createMockDevice({ id: 1 });
      const updatedDevice = {
        ...existingDevice,
        manufactoringStatus: 'COMPLETED',
      };

      mockPrismaService.device.findUnique.mockResolvedValue(existingDevice);
      mockPrismaService.device.update.mockResolvedValue(updatedDevice);

      // Act
      const result = await service.updateManufactoringStatus(
        1,
        'COMPLETED' as ManufactoringStatus,
      );

      // Assert
      expect(result.manufactoringStatus).toBe('COMPLETED');
      expect(mockPrismaService.device.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { manufactoringStatus: 'COMPLETED' },
      });
    });

    it('should throw NotFoundException if device does not exist', async () => {
      // Arrange
      mockPrismaService.device.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateManufactoringStatus(
          999,
          'COMPLETED' as ManufactoringStatus,
        ),
      ).rejects.toThrow('DEVICE_NOT_FOUND');
    });
  });

  // UPDATE OPERATIONAL STATUS
  describe('updateOperationalStatus', () => {
    it('should update operational status', async () => {
      // Arrange
      const existingDevice = createMockDevice({ id: 1 });
      const updatedDevice = {
        ...existingDevice,
        operationalStatus: 'AVAILABLE',
      };

      mockPrismaService.device.findUnique.mockResolvedValue(existingDevice);
      mockPrismaService.device.update.mockResolvedValue(updatedDevice);

      // Act
      const result = await service.updateOperationalStatus(
        1,
        'AVAILABLE' as OperationalStatus,
      );

      // Assert
      expect(result.operationalStatus).toBe('AVAILABLE');
      expect(mockPrismaService.device.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { operationalStatus: 'AVAILABLE' },
      });
    });

    it('should throw NotFoundException if device does not exist', async () => {
      // Arrange
      mockPrismaService.device.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateOperationalStatus(999, 'AVAILABLE' as OperationalStatus),
      ).rejects.toThrow('DEVICE_NOT_FOUND');
    });
  });

  // ASSIGN OWNER
  describe('assignOwner', () => {
    it('should assign owner to device', async () => {
      // Arrange
      const existingDevice = createMockDevice({ id: 1 });
      const client = createMockClient({ id: 5 });
      const updatedDevice = { ...existingDevice, ownerId: 5 };

      mockPrismaService.device.findUnique.mockResolvedValue(existingDevice);
      mockPrismaService.client.findUnique.mockResolvedValue(client);
      mockPrismaService.device.update.mockResolvedValue(updatedDevice);

      // Act
      const result = await service.assignOwner(1, 5);

      // Assert
      expect(result.ownerId).toBe(5);
      expect(mockPrismaService.device.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ownerId: 5 },
      });
    });

    it('should throw NotFoundException if device does not exist', async () => {
      // Arrange
      mockPrismaService.device.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.assignOwner(999, 1)).rejects.toThrow(
        'DEVICE_NOT_FOUND',
      );
    });

    it('should throw NotFoundException if client does not exist', async () => {
      // Arrange
      const existingDevice = createMockDevice({ id: 1 });
      mockPrismaService.device.findUnique.mockResolvedValue(existingDevice);
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.assignOwner(1, 999)).rejects.toThrow(
        'CLIENT_NOT_FOUND',
      );
    });

    it('should allow null to remove owner', async () => {
      // Arrange
      const existingDevice = createMockDevice({ id: 1, ownerId: 5 });
      const updatedDevice = { ...existingDevice, ownerId: null };

      mockPrismaService.device.findUnique.mockResolvedValue(existingDevice);
      mockPrismaService.device.update.mockResolvedValue(updatedDevice);

      // Act
      const result = await service.assignOwner(1, null);

      // Assert
      expect(result.ownerId).toBeNull();
      expect(mockPrismaService.device.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ownerId: null },
      });
    });
  });

  // FIND BY READER SERIAL
  describe('findByReaderSerial', () => {
    it('should find device by reader1SerialNumber or reader2SerialNumber', async () => {
      // Arrange
      const device = createMockDevice({
        id: 1,
        reader1SerialNumber: 'READER-001',
      });
      mockPrismaService.device.findFirst.mockResolvedValue(device);

      // Act
      const result = await service.findByReaderSerial('READER-001');

      // Assert
      expect(result).toEqual(device);
      expect(mockPrismaService.device.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { reader1SerialNumber: 'READER-001' },
            { reader2SerialNumber: 'READER-001' },
          ],
        },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      // Arrange
      mockPrismaService.device.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByReaderSerial('UNKNOWN')).rejects.toThrow(
        'DEVICE_NOT_FOUND',
      );
    });
  });

  // FIND BY CPU SERIAL
  describe('findByCpuSerial', () => {
    it('should find device by cpuSerialNumber', async () => {
      // Arrange
      const device = createMockDevice({ id: 1, cpuSerialNumber: 'CPU-001' });
      mockPrismaService.device.findFirst.mockResolvedValue(device);

      // Act
      const result = await service.findByCpuSerial('CPU-001');

      // Assert
      expect(result).toEqual(device);
      expect(mockPrismaService.device.findFirst).toHaveBeenCalledWith({
        where: { cpuSerialNumber: 'CPU-001' },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      // Arrange
      mockPrismaService.device.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByCpuSerial('UNKNOWN')).rejects.toThrow(
        'DEVICE_NOT_FOUND',
      );
    });
  });

  // FIND BY BATTERY SERIAL
  describe('findByBatterySerial', () => {
    it('should find device by batterySerialNumber', async () => {
      // Arrange
      const device = createMockDevice({
        id: 1,
        batterySerialNumber: 'BAT-001',
      });
      mockPrismaService.device.findFirst.mockResolvedValue(device);

      // Act
      const result = await service.findByBatterySerial('BAT-001');

      // Assert
      expect(result).toEqual(device);
      expect(mockPrismaService.device.findFirst).toHaveBeenCalledWith({
        where: { batterySerialNumber: 'BAT-001' },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      // Arrange
      mockPrismaService.device.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByBatterySerial('UNKNOWN')).rejects.toThrow(
        'DEVICE_NOT_FOUND',
      );
    });
  });
});
