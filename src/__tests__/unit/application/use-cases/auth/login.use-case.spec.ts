/**
 * 🧪 Tests Unitaires - Login Use Case - Clean Architecture
 * ✅ Tests PURS Application Layer (SANS cookies/HTTP)
 */

import { LoginUseCase, LoginRequest, LoginResponse } from '../../../../../application/use-cases/auth/login.use-case';
import type { UserRepository } from '../../../../../domain/repositories/user.repository.interface';
import type { IPasswordHasher } from '../../../../../application/ports/auth-token.service.interface';
import type { AuthenticationService } from '../../../../../application/ports/authentication.port';
import type { Logger } from '../../../../../application/ports/logger.port';
import type { I18nService } from '../../../../../application/ports/i18n.port';
import type { IConfigService } from '../../../../../application/ports/config.port';
import type { UserCacheService } from '../../../../../application/services/user-cache.service';
import { UserNotFoundError, AuthenticationFailedError } from '../../../../../application/exceptions/auth.exceptions';
import { User } from '../../../../../domain/entities/user.entity';
import { UserRole } from '../../../../../shared/enums/user-role.enum';

describe('LoginUseCase - Clean Architecture', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;
  let mockAuthService: jest.Mocked<AuthenticationService>;
  let mockConfigService: jest.Mocked<IConfigService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;
  let mockUserCacheService: jest.Mocked<UserCacheService>;

  beforeEach(() => {
    // 🔧 Setup des mocks Clean Architecture
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<UserRepository>;

    mockPasswordHasher = {
      hash: jest.fn(),
      verify: jest.fn(),
    };

    mockAuthService = {
      generateTokens: jest.fn(),
      verifyToken: jest.fn(),
      revokeToken: jest.fn(),
    } as jest.Mocked<AuthenticationService>;

    mockConfigService = {
      get: jest.fn(),
      isProduction: jest.fn().mockReturnValue(false),
    } as jest.Mocked<IConfigService>;

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as jest.Mocked<Logger>;

    mockI18n = {
      t: jest.fn(),
      translate: jest.fn(),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn(),
    } as jest.Mocked<I18nService>;

    mockUserCacheService = {
      execute: jest.fn(),
    } as jest.Mocked<UserCacheService>;

    // Valeurs par défaut pour I18n
    mockI18n.translate.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        'operations.auth.login_attempt': 'Login attempt for user',
        'operations.auth.user_not_found': 'User not found for email',
        'operations.auth.invalid_password': 'Invalid password for user',
        'operations.auth.login_success': 'Login successful for user',
        'operations.auth.login_failed': 'Login failed',
        'operations.auth.user_cached': 'User cached in Redis after login',
        'warnings.auth.user_cache_failed': 'Failed to cache user in Redis after login',
        'errors.auth.user_not_found': 'User not found',
        'errors.auth.invalid_credentials': 'Invalid credentials',
        'success.auth.login_successful': 'success.auth.login_successful',
      };
      return translations[key] || key;
    });

    loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockAuthService,
      mockConfigService,
      mockLogger,
      mockI18n,
      mockUserCacheService,
    );
  });

  describe('✅ Successful Login', () => {
    it('should login user successfully with valid credentials', async () => {
      // 📋 Arrange
      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'validPassword123',
      };

      const mockUser = {
        id: 'user-123',
        email: { value: 'test@example.com' },
        name: 'John Doe',
        role: UserRole.REGULAR_CLIENT,
        hashedPassword: 'hashed-password',
      } as User;

      const mockTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600,
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(true);
      mockAuthService.generateTokens.mockResolvedValue(mockTokens);
      mockUserCacheService.execute.mockResolvedValue({
        success: true,
        message: 'User stored successfully',
      });

      // 🎬 Act
      const result = await loginUseCase.execute(request);

      // 🔍 Assert - Clean Architecture (SANS cookies)
      expect(result).toEqual({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'John Doe',
          role: UserRole.REGULAR_CLIENT,
        },
        tokens: {
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-123',
          expiresIn: 3600,
        },
        message: 'success.auth.login_successful',
      });

      // 💾 Vérifier que l'utilisateur est mis en cache
      expect(mockUserCacheService.execute).toHaveBeenCalledWith({
        user: mockUser,
      });
    });
  });

  describe('❌ Authentication Failures', () => {
    it('should throw UserNotFoundError when user not found', async () => {
      // 📋 Arrange
      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // 🎬 Act & Assert
      await expect(loginUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );
    });

    it('should throw AuthenticationFailedError when password is invalid', async () => {
      // 📋 Arrange
      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      const mockUser = {
        id: 'user-123',
        email: { value: 'test@example.com' },
        name: 'Test User',
        role: UserRole.REGULAR_CLIENT,
        hashedPassword: 'hashed-password',
      } as User;

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.verify.mockResolvedValue(false);

      // 🎬 Act & Assert
      await expect(loginUseCase.execute(request)).rejects.toThrow(
        AuthenticationFailedError,
      );
    });
  });
});
