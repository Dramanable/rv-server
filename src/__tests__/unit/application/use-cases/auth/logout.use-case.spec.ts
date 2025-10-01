/**
 * 🧪 Tests Unitaires - Logout Use Case
 * ✅ Clean Architecture compliant
 */

import { AuthenticationService } from '@application/ports/authentication.port';
import { IConfigService } from '@application/ports/config.port';
import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import {
  LogoutRequest,
  LogoutResponse,
  LogoutUseCase,
} from '@application/use-cases/auth/logout.use-case';
// Mock créés directement ici avec les méthodes nécessaires
const createMockAuthService = (): jest.Mocked<AuthenticationService> => ({
  generateTokens: jest.fn(),
  validateAccessToken: jest.fn(),
  validateRefreshToken: jest.fn(),
  refreshTokens: jest.fn(),
  revokeRefreshToken: jest.fn(),
  revokeAllUserTokens: jest.fn(),
  generateResetSessionToken: jest.fn(),
  validateResetSessionToken: jest.fn(),
});

const createMockConfigService = (): jest.Mocked<IConfigService> =>
  ({
    isProduction: jest.fn().mockReturnValue(false),
    getAccessTokenExpirationTime: jest.fn().mockReturnValue(3600), // 1 hour
    getRefreshTokenExpirationDays: jest.fn().mockReturnValue(30), // 30 days
    getUserSessionDurationMinutes: jest.fn().mockReturnValue(30),
    getAccessTokenSecret: jest.fn().mockReturnValue('test-secret'),
    getRefreshTokenSecret: jest.fn().mockReturnValue('test-refresh-secret'),
    getJwtIssuer: jest.fn().mockReturnValue('test-issuer'),
    getJwtAudience: jest.fn().mockReturnValue('test-audience'),
    getAccessTokenAlgorithm: jest.fn().mockReturnValue('HS256'),
  }) as any;

const createMockLogger = (): jest.Mocked<Logger> => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  audit: jest.fn(),
  child: jest.fn().mockReturnThis(),
});

const createMockI18nService = (): jest.Mocked<I18nService> => ({
  translate: jest
    .fn()
    .mockImplementation((key: string) => `Mock translation for: ${key}`),
  setDefaultLanguage: jest.fn(),
  exists: jest.fn().mockReturnValue(true),
  t: jest
    .fn()
    .mockImplementation((key: string, params?: Record<string, any>) => {
      const translations: Record<string, string> = {
        'success.auth.logout_successful': 'Logged out successfully',
        'operations.auth.logout_attempt': 'Logout attempt',
        'operations.auth.current_token_revoked':
          'Current refresh token revoked',
        'operations.auth.logout_success': 'Logout success',
        'operations.auth.all_tokens_revoked':
          'All tokens revoked for user: {{userId}}',
        'operations.auth.logout_error': 'Logout error: {{error}}',
      };

      let message = translations[key] || key;

      // Simple interpolation pour les paramètres
      if (params) {
        Object.keys(params).forEach((param) => {
          message = message.replace(`{{${param}}}`, params[param]);
        });
      }

      return message;
    }),
});

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let mockAuthService: jest.Mocked<AuthenticationService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockConfigService: jest.Mocked<IConfigService>;
  let mockI18n: jest.Mocked<I18nService>;

  beforeEach(() => {
    // 🔧 Setup des mocks
    mockAuthService = createMockAuthService();
    mockLogger = createMockLogger();
    mockConfigService = createMockConfigService();
    mockI18n = createMockI18nService();

    // 🏗️ Création de l'instance à tester
    useCase = new LogoutUseCase(
      mockAuthService,
      mockConfigService,
      mockLogger,
      mockI18n,
    );
  });

  describe('🎯 Successful Logout Cases', () => {
    it('should logout successfully with refresh token revocation', async () => {
      // 📋 Arrange
      const request: LogoutRequest = {
        refreshToken: 'valid.refresh.token',
        userId: 'user-123',
        ip: '192.168.1.1',
        userAgent: 'TestAgent',
        logoutAllDevices: false,
      };

      // 🔧 Setup mocks
      mockAuthService.revokeRefreshToken.mockResolvedValue();

      // 🎬 Act
      const result: LogoutResponse = await useCase.execute(request);

      // 🔍 Assert - Structure de réponse
      expect(result).toEqual({
        cookieSettings: {
          isProduction: false,
        },
        message: 'Logged out successfully',
      });

      // 🔍 Assert - Appels de méthodes
      expect(mockAuthService.revokeRefreshToken).toHaveBeenCalledWith(
        request.refreshToken,
      );
      expect(mockAuthService.revokeAllUserTokens).not.toHaveBeenCalled();

      // 🔍 Assert - Token revocation should be logged
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Logout attempt',
        expect.objectContaining({
          context: expect.any(String),
        }),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Current refresh token revoked',
        expect.objectContaining({
          context: expect.any(String),
        }),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Logout success',
        expect.objectContaining({
          context: expect.any(String),
        }),
      );
    });

    it('should logout from all devices when logoutAllDevices is true', async () => {
      // 📋 Arrange
      const request: LogoutRequest = {
        refreshToken: 'valid.refresh.token',
        userId: 'user-123',
        ip: '192.168.1.1',
        userAgent: 'TestAgent',
        logoutAllDevices: true, // 👈 Logout from all devices
      };

      // 🔧 Setup mocks
      mockAuthService.revokeAllUserTokens.mockResolvedValue();

      // 🎬 Act
      const result: LogoutResponse = await useCase.execute(request);

      // 🔍 Assert - Structure de réponse
      expect(result).toEqual({
        cookieSettings: {
          isProduction: false,
        },
        message: 'Logged out successfully',
      });

      // 🔍 Assert - Appels de méthodes - Should revoke all tokens
      expect(mockAuthService.revokeAllUserTokens).toHaveBeenCalledWith(
        request.userId,
      );
      expect(mockAuthService.revokeRefreshToken).not.toHaveBeenCalled();

      // 🔍 Assert - Logging for all devices logout
      expect(mockLogger.info).toHaveBeenCalledWith(
        'All tokens revoked for user: user-123',
        expect.objectContaining({
          context: expect.any(String),
        }),
      );
    });

    it('should logout successfully without refresh token', async () => {
      // 📋 Arrange - No refresh token provided
      const request: LogoutRequest = {
        userId: 'user-123',
        ip: '192.168.1.1',
        userAgent: 'TestAgent',
      };

      // 🎬 Act
      const result: LogoutResponse = await useCase.execute(request);

      // 🔍 Assert - Should still succeed
      expect(result).toEqual({
        cookieSettings: {
          isProduction: false,
        },
        message: 'Logged out successfully',
      });

      // 🔍 Assert - No token revocation should be called
      expect(mockAuthService.revokeRefreshToken).not.toHaveBeenCalled();
      expect(mockAuthService.revokeAllUserTokens).not.toHaveBeenCalled();

      // 🔍 Assert - Success should still be logged
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Logout success',
        expect.objectContaining({
          context: expect.any(String),
        }),
      );
    });

    it('should return production cookie settings when in production', async () => {
      // 📋 Arrange
      const request: LogoutRequest = {
        refreshToken: 'valid.refresh.token',
        userId: 'user-123',
      };

      // 🔧 Setup mocks - Production environment
      mockConfigService.isProduction.mockReturnValue(true);
      mockAuthService.revokeRefreshToken.mockResolvedValue();

      // 🎬 Act
      const result: LogoutResponse = await useCase.execute(request);

      // 🔍 Assert - Production cookie settings
      expect(result.cookieSettings.isProduction).toBe(true);
    });
  });

  describe('🚨 Error Handling with Graceful Degradation', () => {
    it('should return success even when token revocation fails', async () => {
      // 📋 Arrange
      const request: LogoutRequest = {
        refreshToken: 'valid.refresh.token',
        userId: 'user-123',
        ip: '192.168.1.1',
        userAgent: 'TestAgent',
      };

      const revocationError = new Error('Token revocation failed');

      // 🔧 Setup mocks - Revocation fails
      mockAuthService.revokeRefreshToken.mockRejectedValue(revocationError);

      // 🎬 Act
      const result: LogoutResponse = await useCase.execute(request);

      // 🔍 Assert - Should still return success for security reasons
      expect(result).toEqual({
        cookieSettings: {
          isProduction: false,
        },
        message: 'Logged out successfully',
      });

      // 🔍 Assert - Error should be logged
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Logout error: ${revocationError.message}`,
        revocationError,
        expect.objectContaining({
          context: expect.any(String),
        }),
      );
    });

    it('should return success even when revoking all user tokens fails', async () => {
      // 📋 Arrange
      const request: LogoutRequest = {
        refreshToken: 'valid.refresh.token',
        userId: 'user-123',
        logoutAllDevices: true,
      };

      const revocationError = new Error('Failed to revoke all user tokens');

      // 🔧 Setup mocks - Revoke all tokens fails
      mockAuthService.revokeAllUserTokens.mockRejectedValue(revocationError);

      // 🎬 Act
      const result: LogoutResponse = await useCase.execute(request);

      // 🔍 Assert - Should still return success
      expect(result).toEqual({
        cookieSettings: {
          isProduction: false,
        },
        message: 'Logged out successfully',
      });

      // 🔍 Assert - Error should be logged
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Logout error: ${revocationError.message}`,
        revocationError,
        expect.objectContaining({
          context: expect.any(String),
        }),
      );
    });

    it('should handle unknown error types gracefully', async () => {
      // 📋 Arrange
      const request: LogoutRequest = {
        refreshToken: 'valid.refresh.token',
        userId: 'user-123',
      };

      const unknownError = { message: 'Unknown error type', code: 'UNKNOWN' };

      // 🔧 Setup mocks - Non-Error object thrown
      mockAuthService.revokeRefreshToken.mockRejectedValue(unknownError);

      // 🎬 Act
      const result: LogoutResponse = await useCase.execute(request);

      // 🔍 Assert - Should still return success
      expect(result).toEqual({
        cookieSettings: {
          isProduction: false,
        },
        message: 'Logged out successfully',
      });

      // 🔍 Assert - Unknown error should be logged appropriately
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Logout error: Unknown error',
        undefined, // Not an Error instance
        expect.objectContaining({
          context: expect.any(String),
        }),
      );
    });
  });

  describe('🔧 Edge Cases and Security', () => {
    it('should handle logout with missing userId but logoutAllDevices true', async () => {
      // 📋 Arrange - Missing userId but wants to logout all devices
      const request: LogoutRequest = {
        refreshToken: 'valid.refresh.token',
        logoutAllDevices: true, // But no userId provided
        ip: '192.168.1.1',
        userAgent: 'TestAgent',
      };

      // 🔧 Setup mocks
      mockAuthService.revokeRefreshToken.mockResolvedValue();

      // 🎬 Act
      const result: LogoutResponse = await useCase.execute(request);

      // 🔍 Assert - Should fall back to single token revocation
      expect(mockAuthService.revokeRefreshToken).toHaveBeenCalledWith(
        request.refreshToken,
      );
      expect(mockAuthService.revokeAllUserTokens).not.toHaveBeenCalled();

      // 🔍 Assert - Should still succeed
      expect(result.message).toBe('Logged out successfully');
    });

    it('should handle minimal logout request', async () => {
      // 📋 Arrange - Minimal request (no optional fields)
      const request: LogoutRequest = {};

      // 🎬 Act
      const result: LogoutResponse = await useCase.execute(request);

      // 🔍 Assert - Should succeed even with minimal data
      expect(result).toEqual({
        cookieSettings: {
          isProduction: false,
        },
        message: 'Logged out successfully',
      });

      // 🔍 Assert - No token operations should be performed
      expect(mockAuthService.revokeRefreshToken).not.toHaveBeenCalled();
      expect(mockAuthService.revokeAllUserTokens).not.toHaveBeenCalled();
    });

    it('should use default client info when not provided', async () => {
      // 📋 Arrange - No IP or UserAgent
      const request: LogoutRequest = {
        refreshToken: 'valid.refresh.token',
        userId: 'user-123',
      };

      // 🔧 Setup mocks
      mockAuthService.revokeRefreshToken.mockResolvedValue();

      // 🎬 Act
      await useCase.execute(request);

      // 🔍 Assert - Should use default values in logging context
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Logout attempt',
        expect.objectContaining({
          context: expect.any(String),
        }),
      );
    });
  });
});
