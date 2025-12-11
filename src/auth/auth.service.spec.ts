import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';

// Mock implementations
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

// Helper to create mock user
const createMockUser = async (overrides = {}) => ({
  id: 1,
  email: 'test@test.com',
  password: await bcrypt.hash('password123', 10),
  name: 'Test User',
  role: 'USER',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Clear mocks between tests
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return user and token with valid credentials', async () => {
      // Arrange
      const mockUser = await createMockUser();
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('valid.jwt.token');

      // Act
      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      // Assert
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
        token: 'valid.jwt.token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login({ email: 'email@not.exists', password: 'anyPassword' }),
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      // Arrange
      const mockUser = await createMockUser();
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        service.login({ email: 'test@test.com', password: 'wrongPassword' }),
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      // Arrange
      const mockUser = await createMockUser({ active: false });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        service.login({ email: 'test@test.com', password: 'password123' }),
      ).rejects.toThrow('USER_INACTIVE');
    });
  });

  describe('changePassword', () => {
    it('should change password with valid current password', async () => {
      // Arrange
      const mockUser = await createMockUser();
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      // Act
      await service.changePassword(1, 'password123', 'newPassword');

      // Assert
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: expect.any(String) },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.changePassword(999, 'anyPassword', 'newPassword'),
      ).rejects.toThrow('USER_NOT_FOUND');
    });

    it('should throw UnauthorizedException if current password is invalid', async () => {
      // Arrange
      const mockUser = await createMockUser();
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        service.changePassword(1, 'wrongPassword', 'newPassword'),
      ).rejects.toThrow('INVALID_CURRENT_PASSWORD');
    });
  });
});
