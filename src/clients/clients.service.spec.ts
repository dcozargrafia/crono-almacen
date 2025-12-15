import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma.service';

// Mock implementations
const mockPrismaService = {
  client: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

// Helper to create mock Clietn
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

// Helper to create mock CreateClientDto
const createClientDto = {
  name: 'Test Client',
  codeSportmaniacs: 12345,
  email: 'test@client.com',
};

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new client and return it', async () => {
      // Arrange
      const dto = createClientDto;

      const clientFromDb = createMockClient({
        name: dto.name,
      });

      mockPrismaService.client.create.mockResolvedValue(clientFromDb);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(clientFromDb);
    });

    it('should throw ConflictException if codeSportmaniacs already exists', async () => {
      // Arrange
      const dto = {
        name: 'New Client',
        codeSportmaniacs: 12345,
      };
      const existingClient = createMockClient({ codeSportmaniacs: 12345 });

      mockPrismaService.client.findUnique.mockResolvedValue(existingClient);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(
        'CODE_SPORTMANIACS_ALREADY_EXISTS',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated active clients by default', async () => {
      // Arrange
      const activeClients = [
        createMockClient({ id: 1, name: 'Client A' }),
        createMockClient({ id: 2, name: 'Client B' }),
      ];
      mockPrismaService.client.findMany.mockResolvedValue(activeClients);
      mockPrismaService.client.count.mockResolvedValue(2);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result.data).toEqual(activeClients);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: { active: true },
        skip: 0,
        take: 10,
      });
    });

    it('should return inactive clients when active is false', async () => {
      // Arrange
      const inactiveClients = [
        createMockClient({ id: 3, name: 'Inactive Client', active: false }),
      ];
      mockPrismaService.client.findMany.mockResolvedValue(inactiveClients);
      mockPrismaService.client.count.mockResolvedValue(1);

      // Act
      const result = await service.findAll({ active: 'false' });

      // Assert
      expect(result.data).toEqual(inactiveClients);
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: { active: false },
        skip: 0,
        take: 10,
      });
    });

    it('should return all clients when active is "all"', async () => {
      // Arrange
      const allClients = [
        createMockClient({ id: 1, active: true }),
        createMockClient({ id: 2, active: false }),
      ];
      mockPrismaService.client.findMany.mockResolvedValue(allClients);
      mockPrismaService.client.count.mockResolvedValue(2);

      // Act
      const result = await service.findAll({ active: 'all' });

      // Assert
      expect(result.data).toEqual(allClients);
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
      });
    });

    it('should paginate correctly on page 2', async () => {
      // Arrange
      const clientsPage2 = [createMockClient({ id: 11, name: 'Client 11' })];
      mockPrismaService.client.findMany.mockResolvedValue(clientsPage2);
      mockPrismaService.client.count.mockResolvedValue(15);

      // Act
      const result = await service.findAll({ page: 2, pageSize: 10 });

      // Assert
      expect(result.meta).toEqual({
        total: 15,
        page: 2,
        pageSize: 10,
        totalPages: 2,
      });
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: { active: true },
        skip: 10,
        take: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      // Arrange
      const existingClient = createMockClient({ id: 1 });

      mockPrismaService.client.findUnique.mockResolvedValue(existingClient);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if client does not exist', async () => {
      // Arrange
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow('CLIENT_NOT_FOUND');
    });
  });

  describe('update', () => {
    it('should update a client and return it', async () => {
      // Arrange
      const existingClient = createMockClient({ id: 1, name: 'Old Name' });
      const updatedClient = createMockClient({ id: 1, name: 'New Name' });
      const updateDto = { name: 'New Name' };

      mockPrismaService.client.findUnique.mockResolvedValue(existingClient);
      mockPrismaService.client.update.mockResolvedValue(updatedClient);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(result.name).toBe('New Name');
    });

    it('should throw ConflictException if codeSportmaniacs already exists on another client', async () => {
      // Arrange
      const existingClient = createMockClient({ id: 1, codeSportmaniacs: 111 });
      const anotherClient = createMockClient({ id: 2, codeSportmaniacs: 222 });
      const updateDto = { codeSportmaniacs: 222 };

      mockPrismaService.client.findUnique
        .mockResolvedValueOnce(existingClient) // For findOne
        .mockResolvedValueOnce(anotherClient); // For codeSportmaniacs

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(
        'CODE_SPORTMANIACS_ALREADY_EXISTS',
      );
    });
  });

  describe('remove', () => {
    it('should soft delete client by setting active to false', async () => {
      // Arrange
      const existingClient = createMockClient({ id: 1 });
      mockPrismaService.client.findUnique.mockResolvedValue(existingClient); // Client exists
      mockPrismaService.client.update.mockResolvedValue(existingClient);

      // Act
      await service.remove(1);

      // Assert
      expect(mockPrismaService.client.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: false },
      });
    });

    it('should throw NotFoundException if client to remove does not exist', async () => {
      // Arrange
      mockPrismaService.client.findUnique.mockResolvedValue(null); // Client does not exist

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow('CLIENT_NOT_FOUND');
    });
  });

  describe('findByCodeSportmaniacs', () => {
    it('should return a client by codeSportmaniacs', async () => {
      // Arrange
      const existingClient = createMockClient({ codeSportmaniacs: 123 });

      mockPrismaService.client.findUnique.mockResolvedValue(existingClient);

      // Act
      const result = await service.findByCodeSportmaniacs(123);

      // Assert
      expect(result.codeSportmaniacs).toBe(123);
    });

    it('should throw NotFoundException if client with code does not exist', async () => {
      // Arrange
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByCodeSportmaniacs(123)).rejects.toThrow(
        'CLIENT_NOT_FOUND',
      );
    });
  });

  describe('reactivate', () => {
    it('should reactivate client by setting active to true', async () => {
      // Arrange
      const existingClient = createMockClient({ id: 1 });
      mockPrismaService.client.findUnique.mockResolvedValue(existingClient); // Client exists
      mockPrismaService.client.update.mockResolvedValue(existingClient);

      // Act
      await service.reactivate(1);

      // Assert
      expect(mockPrismaService.client.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: true },
      });
    });

    it('should throw NotFoundException if client does not exist', async () => {
      // Arrange
      mockPrismaService.client.findUnique.mockResolvedValue(null); // Client does not exist

      // Act & Assert
      await expect(service.reactivate(999)).rejects.toThrow('CLIENT_NOT_FOUND');
    });
  });
});
