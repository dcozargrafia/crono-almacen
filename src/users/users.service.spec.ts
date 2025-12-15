import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';

// Mock implementations
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

// Helper to create mock user
const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@test.com',
  password: 'hashedPassword',
  name: 'Test User',
  role: 'USER' as Role,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper to create mock CreateUserDto
const createUserDto = {
  email: 'test@test.com',
  password: 'password123',
  name: 'Test User',
  role: 'USER' as Role,
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user and return user data without password', async () => {
      // Arrange
      const dto = createUserDto;

      const userFromDb = createMockUser({
        email: dto.email,
        name: dto.name,
      });

      mockPrismaService.user.findUnique.mockResolvedValue(null); // No existing user
      mockPrismaService.user.create.mockResolvedValue(userFromDb); // with password

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(dto.email);
      expect(result.name).toBe(dto.name);
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      const dto = createUserDto;

      const existingUser = createMockUser({ email: dto.email });

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser); // Existing user found

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      // Arrange
      const usersFromDb = [
        createMockUser({ id: 1 }),
        createMockUser({ id: 2 }),
      ];

      // Simulate Prisma select by omitting password (underscore = intentionally unused)
      const usersWithoutPassword = usersFromDb.map(
        ({ password: _, ...user }) => user,
      );

      mockPrismaService.user.findMany.mockResolvedValue(usersWithoutPassword);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result.length).toBe(2);
      result.forEach((user) => {
        expect(user).not.toHaveProperty('password');
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id without password', async () => {
      // Arrange
      const userFromDb = createMockUser({ id: 1 });

      // Simulate Prisma select by omitting password (underscore = intentionally unused)
      const { password: _, ...userWithoutPassword } = userFromDb;

      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null); // User not found

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow('USER_NOT_FOUND');
    });
  });

  describe('update', () => {
    it('should update user data and return updated user without password', async () => {
      // Arrange
      const dto = { name: 'Updated Name' };
      const existingUser = createMockUser({ id: 1 });
      const updatedUser = { ...existingUser, ...dto };

      // Simulate Prisma select by omitting password (underscore = intentionally unused)
      const { password: _, ...updatedUserWithoutPassword } = updatedUser;

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser); // User exists
      mockPrismaService.user.update.mockResolvedValue(
        updatedUserWithoutPassword,
      );

      // Act
      const result = await service.update(1, dto);

      // Assert
      expect(result).not.toHaveProperty('password');
      expect(result.name).toBe(dto.name);
    });

    it('should throw NotFoundException if user to update does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null); // User not found

      // Act & Assert
      await expect(service.update(999, { name: 'Name' })).rejects.toThrow(
        'USER_NOT_FOUND',
      );
    });

    it('should throw ConflictException if updating to an existing email', async () => {
      // Arrange
      const dto = { email: 'test@test.com' };
      const existingUser = createMockUser({ id: 1 });
      const anotherUser = createMockUser({ id: 2, email: dto.email });

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(existingUser) // For findOne
        .mockResolvedValueOnce(anotherUser); // For email check

      // Act & Assert
      await expect(service.update(1, dto)).rejects.toThrow(
        'EMAIL_ALREADY_EXISTS',
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset the user password', async () => {
      // Arrange
      const existingUser = createMockUser({ id: 1 });
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...existingUser,
        password: 'newHashedPassword',
      });

      // Act
      await service.resetPassword(1, 'newPassword');

      // Assert
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: expect.any(String) },
      });
    });

    it('should throw NotFoundException if user to reset password does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null); // User not found

      // Act & Assert
      await expect(service.resetPassword(999, 'newPassword')).rejects.toThrow(
        'USER_NOT_FOUND',
      );
    });
  });

  describe('remove', () => {
    it('should soft delete user by setting active to false', async () => {
      // Arrange
      const existingUser = createMockUser({ id: 1 });
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser); // User exists
      mockPrismaService.user.update.mockResolvedValue(existingUser);

      // Act
      await service.remove(1);

      // Assert
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: false },
      });
    });

    it('should throw NotFoundException if user to remove does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null); // User does not exist

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow('USER_NOT_FOUND');
    });
  });
});
