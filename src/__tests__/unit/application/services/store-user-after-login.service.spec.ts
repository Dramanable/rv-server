/**
 * 🧪 Tests TDD - Store User After Login Service - Application Layer
 * ✅ Clean Architecture - Application Layer Only
 */

import type { IConfigService } from "@application/ports/config.port";
import type { I18nService } from "@application/ports/i18n.port";
import type { Logger } from "@application/ports/logger.port";
import type { IUserCache } from "@application/ports/user-cache.port";
import type { StoreUserRequest } from "@application/services/user-cache.service";
import { UserCacheService } from "@application/services/user-cache.service";
import { User } from "@domain/entities/user.entity";
import { UserRole } from "@shared/enums/user-role.enum";

describe("UserCacheService - TDD Clean Architecture", () => {
  let storeUserService: UserCacheService;
  let mockUserCache: jest.Mocked<IUserCache>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;
  let mockConfigService: jest.Mocked<IConfigService>;

  beforeEach(() => {
    // 🔧 Setup des mocks
    mockUserCache = {
      storeUser: jest.fn(),
      getUser: jest.fn(),
      removeUser: jest.fn(),
      refreshUserTTL: jest.fn(),
      exists: jest.fn(),
      clear: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    mockI18n = {
      t: jest.fn(),
      translate: jest.fn().mockImplementation((key: string) => {
        const translations: Record<string, string> = {
          "operations.cache.storing_user": "Storing user in cache",
          "operations.cache.user_stored": "User stored successfully in cache",
          "operations.cache.cache_error": "Error storing user in cache",
        };
        return translations[key] || key;
      }),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn(),
    };

    mockConfigService = {
      getUserCacheRetentionMinutes: jest.fn().mockReturnValue(60),
      get: jest.fn(),
      isProduction: jest.fn().mockReturnValue(false),
    } as jest.Mocked<IConfigService>;

    storeUserService = new UserCacheService(
      mockUserCache,
      mockLogger,
      mockI18n,
      mockConfigService,
    );
  });

  describe("✅ Successful User Storage", () => {
    it("should store user in cache with default TTL after successful login", async () => {
      // 📋 Arrange
      const user = {
        id: "user-123",
        email: { value: "test@example.com" },
        name: "John Doe",
        role: UserRole.REGULAR_CLIENT,
      } as User;

      const request: StoreUserRequest = {
        user,
        ttlMinutes: undefined, // Utilise la valeur par défaut
      };

      // 🎬 Act
      await storeUserService.execute(request);

      // 🔍 Assert
      expect(mockUserCache.storeUser).toHaveBeenCalledWith(
        user.id,
        user,
        60, // TTL par défaut du configService
      );
      expect(mockLogger.info).toHaveBeenCalledWith("Storing user in cache", {
        userId: user.id,
        ttlMinutes: 60,
      });
    });

    it("should store user in cache with custom TTL", async () => {
      // 📋 Arrange
      const user = {
        id: "admin-123",
        email: { value: "admin@example.com" },
        name: "Admin User",
        role: UserRole.ADMIN,
      } as User;

      const customTTL = 120;
      const request: StoreUserRequest = {
        user,
        ttlMinutes: customTTL,
      };

      // 🎬 Act
      await storeUserService.execute(request);

      // 🔍 Assert
      expect(mockUserCache.storeUser).toHaveBeenCalledWith(
        user.id,
        user,
        customTTL,
      );
      expect(mockLogger.info).toHaveBeenCalledWith("Storing user in cache", {
        userId: user.id,
        ttlMinutes: customTTL,
      });
    });
  });

  describe("❌ Error Handling", () => {
    it("should handle cache storage errors gracefully", async () => {
      // 📋 Arrange
      const user = {
        id: "test-123",
        email: { value: "test@example.com" },
        name: "Test User",
        role: UserRole.REGULAR_CLIENT,
      } as User;

      const request: StoreUserRequest = {
        user,
      };

      const cacheError = new Error("Redis connection failed");
      mockUserCache.storeUser.mockRejectedValue(cacheError);

      // 🎬 Act & Assert
      await expect(storeUserService.execute(request)).rejects.toThrow(
        "Redis connection failed",
      );

      // Vérifier que logger.error a été appelé avec le bon message
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      const errorCall = mockLogger.error.mock.calls[0];
      expect(errorCall[0]).toBe("Error storing user in cache");
    });
  });

  describe("🔧 Configuration Integration", () => {
    it("should use configured cache retention time", async () => {
      // 📋 Arrange
      const customRetentionTime = 180;
      mockConfigService.getUserCacheRetentionMinutes.mockReturnValue(
        customRetentionTime,
      );

      // Recréer le service avec la nouvelle config
      storeUserService = new UserCacheService(
        mockUserCache,
        mockLogger,
        mockI18n,
        mockConfigService,
      );

      const user = {
        id: "configured-123",
        email: { value: "configured@example.com" },
        name: "Configured User",
        role: UserRole.REGULAR_CLIENT,
      } as User;

      const request: StoreUserRequest = {
        user,
      };

      // 🎬 Act
      await storeUserService.execute(request);

      // 🔍 Assert
      expect(mockUserCache.storeUser).toHaveBeenCalledWith(
        user.id,
        user,
        customRetentionTime,
      );
    });
  });
});
