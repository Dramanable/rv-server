/**
 * 🧪 Tests Unitaires - Login Use Case
 *
 * Tests complets du use case de login avec approche TDD
 */

import { LoginUseCase, LoginRequest, LoginResponse } from './login.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { IPasswordService } from '../../ports/password.service.interface';
import { AuthenticationService } from '../../ports/authentication.port';
import { Logger } from '../../ports/logger.port';
import { I18nService } from '../../ports/i18n.port';
import { IConfigService } from '../../ports/config.port';
import { InvalidCredentialsError } from '../../exceptions/auth.exceptions';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import {
  createMockUserRepository,
  createMockPasswordService,
  createMockAuthService,
  createMockConfigService,
  createMockLogger,
  createMockI18nService,
} from '../../mocks/auth-test-mocks';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordService: jest.Mocked<IPasswordService>;
  let mockAuthService: jest.Mocked<AuthenticationService>;
  let mockConfigService: jest.Mocked<IConfigService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  beforeEach(() => {
    // 🔧 Setup des mocks typés
    mockUserRepository = createMockUserRepository();
    mockPasswordService = createMockPasswordService();
    mockAuthService = createMockAuthService();
    mockConfigService = createMockConfigService();
    mockLogger = createMockLogger();
    mockI18n = createMockI18nService();

    loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockPasswordService,
      mockAuthService,
      mockConfigService,
      mockLogger,
      mockI18n,
    );
  });

  describe('✅ Successful Login', () => {
    it('should login user successfully with valid credentials', async () => {
      // 📋 Arrange
      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'validPassword123',
        rememberMe: false,
        ip: '192.168.1.1',
        userAgent: 'Test Browser',
      };

      const mockUser = {
        id: 'user-123',
        email: { value: 'test@example.com' },
        name: 'Test User',
        role: UserRole.REGULAR_CLIENT,
        hashedPassword: 'hashed-password',
      } as User;

      const mockTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600,
      };

      // Setup mocks
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.verify.mockResolvedValue(true);
      mockAuthService.generateTokens.mockResolvedValue(mockTokens);

      // 🎬 Act
      const result: LoginResponse = await loginUseCase.execute(request);

      // 🔍 Assert
      expect(result).toEqual({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: UserRole.REGULAR_CLIENT,
        },
        tokens: {
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-123',
          expiresIn: 3600,
        },
        cookieSettings: {
          accessTokenMaxAge: 3600000, // 1 hour in milliseconds
          refreshTokenMaxAge: undefined, // Session cookie when rememberMe = false
          isProduction: false,
        },
        message: 'Login successful',
      });

      // Verify interactions
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'test@example.com' }),
      );
      expect(mockPasswordService.verify).toHaveBeenCalledWith(
        'validPassword123',
        'hashed-password',
      );
      expect(mockAuthService.generateTokens).toHaveBeenCalledWith(mockUser);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Login attempt',
        expect.objectContaining({ context: expect.any(String) }),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Login success',
        expect.objectContaining({ context: expect.any(String) }),
      );
    });

    it('should set persistent cookie when rememberMe is true', async () => {
      // 📋 Arrange
      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'validPassword123',
        rememberMe: true,
      };

      const mockUser = {
        id: 'user-123',
        email: { value: 'test@example.com' },
        name: 'Test User',
        role: UserRole.REGULAR_CLIENT,
        hashedPassword: 'hashed-password',
      } as User;

      const mockTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600,
      };

      // Setup mocks
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.verify.mockResolvedValue(true);
      mockAuthService.generateTokens.mockResolvedValue(mockTokens);

      // 🎬 Act
      const result: LoginResponse = await loginUseCase.execute(request);

      // 🔍 Assert - Should set persistent refresh token
      expect(result.cookieSettings.refreshTokenMaxAge).toBe(
        30 * 24 * 60 * 60 * 1000,
      ); // 30 days in milliseconds
    });
  });

  describe('❌ Authentication Failures', () => {
    it('should throw InvalidCredentialsError when user not found', async () => {
      // 📋 Arrange
      const request: LoginRequest = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // 🎬 Act & Assert
      await expect(loginUseCase.execute(request)).rejects.toThrow(
        InvalidCredentialsError,
      );

      // Verify logging
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'User not found for email',
        expect.objectContaining({ context: expect.any(String) }),
      );
      expect(mockPasswordService.verify).not.toHaveBeenCalled();
      expect(mockAuthService.generateTokens).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsError when password is invalid', async () => {
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
      mockPasswordService.verify.mockResolvedValue(false);

      // 🎬 Act & Assert
      await expect(loginUseCase.execute(request)).rejects.toThrow(
        InvalidCredentialsError,
      );

      // Verify interactions
      expect(mockPasswordService.verify).toHaveBeenCalledWith(
        'wrongPassword',
        'hashed-password',
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid password for user',
        expect.objectContaining({ context: expect.any(String) }),
      );
      expect(mockAuthService.generateTokens).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsError when user has no hashed password', async () => {
      // 📋 Arrange
      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-123',
        email: { value: 'test@example.com' },
        name: 'Test User',
        role: UserRole.REGULAR_CLIENT,
        hashedPassword: undefined, // No password set
      } as User;

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.verify.mockResolvedValue(false);

      // 🎬 Act & Assert
      await expect(loginUseCase.execute(request)).rejects.toThrow(
        InvalidCredentialsError,
      );

      expect(mockPasswordService.verify).toHaveBeenCalledWith(
        'password123',
        '',
      );
    });
  });

  describe('🛡️ Security & Error Handling', () => {
    it('should log and rethrow token generation errors', async () => {
      // 📋 Arrange
      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'validPassword123',
      };

      const mockUser = {
        id: 'user-123',
        email: { value: 'test@example.com' },
        name: 'Test User',
        role: UserRole.REGULAR_CLIENT,
        hashedPassword: 'hashed-password',
      } as User;

      const tokenError = new Error('Token generation failed');

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.verify.mockResolvedValue(true);
      mockAuthService.generateTokens.mockRejectedValue(tokenError);

      // 🎬 Act & Assert
      await expect(loginUseCase.execute(request)).rejects.toThrow(
        'Token generation failed',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Login failed',
        tokenError,
        expect.objectContaining({ context: expect.any(String) }),
      );
    });

    it('should handle invalid email format', async () => {
      // 📋 Arrange
      const request: LoginRequest = {
        email: 'invalid-email',
        password: 'password123',
      };

      // Email.create should throw for invalid email
      // This test assumes Email.create validates format

      // 🎬 Act & Assert
      await expect(loginUseCase.execute(request)).rejects.toThrow();
    });
  });

  describe('🎯 Cookie Settings Configuration', () => {
    it('should configure production cookies correctly', async () => {
      // 📋 Arrange
      mockConfigService.isProduction.mockReturnValue(true);

      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'validPassword123',
        rememberMe: true,
      };

      const mockUser = {
        id: 'user-123',
        email: { value: 'test@example.com' },
        name: 'Test User',
        role: UserRole.REGULAR_CLIENT,
        hashedPassword: 'hashed-password',
      } as User;

      const mockTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600,
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.verify.mockResolvedValue(true);
      mockAuthService.generateTokens.mockResolvedValue(mockTokens);

      // 🎬 Act
      const result: LoginResponse = await loginUseCase.execute(request);

      // 🔍 Assert
      expect(result.cookieSettings.isProduction).toBe(true);
    });

    it('should use custom token expiration times from config', async () => {
      // 📋 Arrange
      mockConfigService.getAccessTokenExpirationTime.mockReturnValue(7200); // 2 hours
      mockConfigService.getRefreshTokenExpirationDays.mockReturnValue(7); // 7 days

      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'validPassword123',
        rememberMe: true,
      };

      const mockUser = {
        id: 'user-123',
        email: { value: 'test@example.com' },
        name: 'Test User',
        role: UserRole.REGULAR_CLIENT,
        hashedPassword: 'hashed-password',
      } as User;

      const mockTokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 7200,
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.verify.mockResolvedValue(true);
      mockAuthService.generateTokens.mockResolvedValue(mockTokens);

      // 🎬 Act
      const result: LoginResponse = await loginUseCase.execute(request);

      // 🔍 Assert
      expect(result.cookieSettings.accessTokenMaxAge).toBe(7200000); // 2 hours in ms
      expect(result.cookieSettings.refreshTokenMaxAge).toBe(
        7 * 24 * 60 * 60 * 1000,
      ); // 7 days in ms
    });
  });
});
