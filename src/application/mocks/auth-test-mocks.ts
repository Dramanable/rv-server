/**
 * 🧪 Mocks Typés pour Tests - Application Layer
 */

import type { UserRepository } from "../../domain/repositories/user.repository.interface";
import type { AuthenticationService } from "../ports/authentication.port";
import type { I18nService } from "../ports/i18n.port";
import type { Logger } from "../ports/logger.port";
import type { IPasswordService } from "../ports/password.service.interface";

export function createMockUserRepository(): jest.Mocked<UserRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    search: jest.fn(),
    findByRole: jest.fn(),
    emailExists: jest.fn(),
    existsByUsername: jest.fn(),
    updatePassword: jest.fn(),
    updateActiveStatus: jest.fn(),
    countSuperAdmins: jest.fn(),
    count: jest.fn(),
    countWithFilters: jest.fn(),
    update: jest.fn(),
    updateBatch: jest.fn(),
    deleteBatch: jest.fn(),
    export: jest.fn(),
  };
}

export function createMockPasswordService(): jest.Mocked<IPasswordService> {
  return {
    hash: jest.fn(),
    verify: jest.fn(),
  };
}

export function createMockAuthService(): jest.Mocked<AuthenticationService> {
  return {
    generateTokens: jest.fn(),
    validateAccessToken: jest.fn(),
    validateRefreshToken: jest.fn(),
    refreshTokens: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeAllUserTokens: jest.fn(),
    generateResetSessionToken: jest.fn(),
    validateResetSessionToken: jest.fn(),
  };
}

export const createMockConfigService = () => {
  return {
    getJwtSecret: jest
      .fn()
      .mockReturnValue("test-jwt-secret-32chars-minimum-req"),
    getAccessTokenExpirationTime: jest.fn().mockReturnValue(3600),
    getRefreshTokenExpirationDays: jest.fn().mockReturnValue(30),
    isProduction: jest.fn().mockReturnValue(false),
    isDevelopment: jest.fn().mockReturnValue(true),
    isTest: jest.fn().mockReturnValue(false),
    getAccessTokenSecret: jest
      .fn()
      .mockReturnValue("test-access-secret-32-chars-min-length"),
    getRefreshTokenSecret: jest
      .fn()
      .mockReturnValue("test-refresh-secret-32-chars-min-length"),
    getJwtIssuer: jest.fn().mockReturnValue("test-issuer"),
    getJwtAudience: jest.fn().mockReturnValue("test-audience"),
    getAccessTokenAlgorithm: jest.fn().mockReturnValue("HS256"),
    getRefreshTokenAlgorithm: jest.fn().mockReturnValue("HS256"),
    getPasswordHashAlgorithm: jest.fn().mockReturnValue("bcrypt"),
    getBcryptRounds: jest.fn().mockReturnValue(12),
    getUserSessionDurationMinutes: jest.fn().mockReturnValue(30),
    getEnvironment: jest.fn().mockReturnValue("test"),
    getDatabaseType: jest.fn().mockReturnValue("postgresql"),
    getDatabaseHost: jest.fn().mockReturnValue("localhost"),
    getDatabasePort: jest.fn().mockReturnValue(5432),
    getDatabaseUsername: jest.fn().mockReturnValue("testuser"),
    getDatabasePassword: jest.fn().mockReturnValue("testpass"),
    getDatabaseName: jest.fn().mockReturnValue("testdb"),
    getDatabasePoolSize: jest.fn().mockReturnValue(10),
    getRedisHost: jest.fn().mockReturnValue("localhost"),
    getRedisPort: jest.fn().mockReturnValue(6379),
    getRedisPassword: jest.fn().mockReturnValue(""),
    getPort: jest.fn().mockReturnValue(3001),
    getHost: jest.fn().mockReturnValue("localhost"),
    getCorsOrigins: jest.fn().mockReturnValue(["http://localhost:3000"]),
    getCorsCredentials: jest.fn().mockReturnValue(true),
    getHelmetConfig: jest.fn().mockReturnValue({}),
    getCompressionConfig: jest.fn().mockReturnValue({}),
    getRateLimitConfig: jest.fn().mockReturnValue({}),
    getBodyParserConfig: jest.fn().mockReturnValue({}),
  };
};

export function createMockLogger(): jest.Mocked<Logger> {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    audit: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };
}

export function createMockI18nService(): jest.Mocked<I18nService> {
  // Map des traductions pour les tests
  const translations: Record<string, string> = {
    // Success messages
    "success.auth.login_successful": "Login successful",
    "success.auth.tokens_refreshed": "Tokens refreshed successfully",
    "success.auth.logout_successful": "Logged out successfully",

    // Error messages
    "errors.auth.invalid_credentials": "Invalid credentials",
    "errors.auth.user_not_found": "User not found",
    "errors.auth.invalid_password": "Invalid password",
    "errors.auth.no_refresh_token": "Refresh token is required",
    "errors.auth.invalid_refresh_token": "Invalid refresh token",
    "errors.auth.token_expired": "Token expired",

    // Operations
    "operations.auth.login_attempt": "Login attempt",
    "operations.auth.login_success": "Login success",
    "operations.auth.login_failed": "Login failed",
    "operations.auth.logout_attempt": "Logout attempt",
    "operations.auth.logout_success": "Logout success",
    "operations.auth.logout_failed": "Logout failed",
    "operations.auth.current_token_revoked": "Current refresh token revoked",
    "operations.auth.all_tokens_revoked":
      "All tokens revoked for user: {{userId}}",
    "operations.auth.logout_error": "Logout error: {{error}}",
    "operations.auth.token_refresh_attempt": "Token refresh attempt",
    "operations.auth.token_refresh_success": "Token refresh success",
    "operations.auth.token_refresh_failed": "Token refresh failed",
    "operations.auth.user_not_found": "User not found for email",
    "operations.auth.invalid_password": "Invalid password for user",
    "operations.auth.no_refresh_token": "No refresh token provided",
  };

  const mockTranslate = jest
    .fn()
    .mockImplementation((key: string, params?: any) => {
      let translation = translations[key] || key;
      // Handle template substitution for parameters like {{userId}}, {{message}}
      if (params && typeof translation === "string") {
        Object.keys(params).forEach((paramKey) => {
          translation = translation.replace(
            new RegExp(`{{${paramKey}}}`, "g"),
            params[paramKey],
          );
        });
      }
      return translation;
    });

  return {
    translate: mockTranslate,
    t: mockTranslate, // t est un alias de translate
    setDefaultLanguage: jest.fn(),
    exists: jest.fn().mockReturnValue(true),
  };
}
