/**
 * 🧪 JWT STRATEGY TESTS - Tests unitaires avec TDD
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import type { ICacheService } from '../../../application/ports/cache.port';
import type { Logger } from '../../../application/ports/logger.port';
import type { I18nService } from '../../../application/ports/i18n.port';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockCacheService: jest.Mocked<ICacheService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    // 🎭 Create typed mocks
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<UserRepository>;

    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      keys: jest.fn(),
      exists: jest.fn(),
      invalidateUserCache: jest.fn(),
      setWithTTL: jest.fn(),
      deletePattern: jest.fn(),
      expire: jest.fn(),
    } as jest.Mocked<ICacheService>;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as jest.Mocked<Logger>;

    mockI18n = {
      t: jest.fn().mockReturnValue('Mocked message'),
      exists: jest.fn().mockReturnValue(true),
    } as jest.Mocked<I18nService>;

    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'ACCESS_TOKEN_SECRET') return 'test-secret';
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    mockRequest = {
      headers: { 'user-agent': 'Test-Agent' },
      ip: '127.0.0.1',
      cookies: {},
    } as Partial<Request>;

    // 📦 Create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: TOKENS.USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: TOKENS.CACHE_SERVICE,
          useValue: mockCacheService,
        },
        {
          provide: TOKENS.PINO_LOGGER,
          useValue: mockLogger,
        },
        {
          provide: TOKENS.I18N_SERVICE,
          useValue: mockI18n,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('JWT Token Validation', () => {
    it('should validate JWT payload and return user from cache', async () => {
      // Arrange
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const cachedUser = {
        id: 'user-123',
        email: 'test@example.com', // Format string pour User.restore
        name: 'Test User',
        role: UserRole.REGULAR_CLIENT,
        createdAt: new Date().toISOString(),
        hashedPassword: 'hash123',
        passwordChangeRequired: false,
      };

      // Le User reconstruit depuis le cache
      const reconstructedUser = User.restore(
        cachedUser.id,
        cachedUser.email,
        cachedUser.name,
        cachedUser.role,
        new Date(cachedUser.createdAt),
        undefined,
        cachedUser.hashedPassword,
        cachedUser.passwordChangeRequired,
      );

      mockCacheService.get.mockResolvedValue(JSON.stringify(cachedUser));

      // Act
      const result = await strategy.validate(mockRequest as Request, payload);

      // Assert
      expect(result.id).toBe(reconstructedUser.id);
      expect(result.email.value).toBe('test@example.com');
      expect(result.name).toBe(reconstructedUser.name);
      expect(result.role).toBe(reconstructedUser.role);
      expect(mockCacheService.get).toHaveBeenCalledWith('user:user-123:auth');
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Mocked message',
        expect.objectContaining({
          operation: 'JwtStrategy.validate',
          userId: 'user-123',
        }),
      );
    });

    it('should validate JWT payload and return user from database when not cached', async () => {
      // Arrange
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const user = User.createWithHashedPassword(
        'user-123',
        Email.create('test@example.com'),
        'Test User',
        UserRole.REGULAR_CLIENT,
        'hashed-password',
        new Date(),
        undefined,
        false,
      );

      mockCacheService.get.mockResolvedValue(null); // Pas en cache
      mockUserRepository.findById.mockResolvedValue(user);
      mockCacheService.set.mockResolvedValue();

      // Act
      const result = await strategy.validate(mockRequest as Request, payload);

      // Assert
      expect(result).toEqual(user);
      expect(mockCacheService.get).toHaveBeenCalledWith('user:user-123:auth');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'user:user-123:auth',
        JSON.stringify(user),
        15 * 60,
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const payload = {
        sub: 'user-not-found',
        email: 'notfound@example.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockCacheService.get.mockResolvedValue(null);
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        strategy.validate(mockRequest as Request, payload),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Mocked message',
        expect.objectContaining({
          userId: 'user-not-found',
          email: 'notfound@example.com',
        }),
      );
    });

    it('should handle cache errors gracefully and fallback to database', async () => {
      // Arrange
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const user = User.createWithHashedPassword(
        'user-123',
        Email.create('test@example.com'),
        'Test User',
        UserRole.REGULAR_CLIENT,
        'hashed-password',
        new Date(),
        undefined,
        false,
      );

      mockCacheService.get.mockRejectedValue(
        new Error('Redis connection failed'),
      );
      mockUserRepository.findById.mockResolvedValue(user);

      // Act
      const result = await strategy.validate(mockRequest as Request, payload);

      // Assert
      expect(result).toEqual(user);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Cache unavailable, falling back to database (JWT)',
        expect.objectContaining({
          userId: 'user-123',
          error: 'Redis connection failed',
        }),
      );
    });

    it('should handle database errors and throw UnauthorizedException', async () => {
      // Arrange
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockCacheService.get.mockResolvedValue(null);
      mockUserRepository.findById.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(
        strategy.validate(mockRequest as Request, payload),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Mocked message',
        expect.any(Error),
        expect.objectContaining({
          operation: 'JwtStrategy.validate',
          userId: 'user-123',
        }),
      );
    });
  });

  describe('Strategy Configuration', () => {
    it('should be properly configured with JWT extraction from cookies', () => {
      // Assert
      expect(strategy).toBeDefined();
      expect(mockConfigService.get).toHaveBeenCalledWith('ACCESS_TOKEN_SECRET');
    });
  });

  describe('Logging and Audit', () => {
    it('should log debug information during validation', async () => {
      // Arrange
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const cachedUser = {
        id: 'user-123',
        email: 'test@example.com', // Format string pour User.restore
        name: 'Test User',
        role: UserRole.REGULAR_CLIENT,
        createdAt: new Date().toISOString(),
        hashedPassword: 'hash123',
        passwordChangeRequired: false,
      };

      mockCacheService.get.mockResolvedValue(JSON.stringify(cachedUser));

      // Act
      await strategy.validate(mockRequest as Request, payload);

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Mocked message',
        expect.objectContaining({
          operation: 'JwtStrategy.validate',
          userId: 'user-123',
        }),
      );
    });
  });
});
