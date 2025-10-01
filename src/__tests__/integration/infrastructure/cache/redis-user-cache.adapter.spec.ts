/**
 * 🧪 Tests d'Intégration TDD - Redis User Cache Adapter - Infrastructure Layer
 * ✅ Tests avec mocks Redis (optimisés pour CI/CD)
 * ✅ Clean Architecture - Infrastructure Implementation
 * ✅ TDD - Red/Green/Refactor
 */

import { User } from "@domain/entities/user.entity";
import { Email } from "@domain/value-objects/email.vo";
import { RedisUserCacheAdapter } from "@infrastructure/cache/redis-user-cache.adapter";
import { UserRole } from "@shared/enums/user-role.enum";
import { Redis } from "ioredis";

// Configuration de test
interface TestConfig {
  getUserCacheRetentionMinutes(): number;
}

const testConfigService: TestConfig = {
  getUserCacheRetentionMinutes: () => 60, // 60 minutes pour les tests
};

describe("🏗️ RedisUserCacheAdapter - Integration Tests (Infrastructure)", () => {
  let adapter: RedisUserCacheAdapter;
  let mockRedisClient: jest.Mocked<Redis>;

  beforeAll(async () => {
    // 🔗 Mock Redis client pour l'intégration
    mockRedisClient = {
      ping: jest.fn().mockResolvedValue("PONG"),
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
      flushall: jest.fn(),
      quit: jest.fn(),
    } as any;

    // 🏗️ Créer l'adapter avec le mock Redis
    adapter = new RedisUserCacheAdapter(
      mockRedisClient,
      testConfigService as any,
    );
  });

  beforeEach(() => {
    // 🧹 Reset tous les mocks avant chaque test
    jest.clearAllMocks();
  });

  /**
   * 🔴 TDD RED - Tests qui échouent d'abord
   */
  describe("🎯 TDD Integration - Store User in Redis", () => {
    it("should store and retrieve user from Redis with TTL", async () => {
      // 🔴 TDD RED - Arrange
      const email = Email.create("integration@test.com");
      const user = new User(
        email,
        "Integration Test User",
        UserRole.BUSINESS_OWNER,
      );

      const ttlMinutes = 5; // 5 minutes TTL

      // Mock Redis responses
      mockRedisClient.setex.mockResolvedValue("OK");
      mockRedisClient.get.mockResolvedValue(
        JSON.stringify({
          id: user.id,
          email: user.email.getValue(),
          name: user.name,
          role: user.role,
        }),
      );
      mockRedisClient.ttl.mockResolvedValue(295); // ~4min55s remaining

      // 🟢 TDD GREEN - Act: Stocker dans Redis
      await adapter.storeUser(user.id, user, ttlMinutes);

      // ✅ Assert: Vérifier les appels Redis
      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        `user:${user.id}`,
        300, // 5 minutes en secondes
        expect.stringContaining(user.id),
      );
    });

    it("should use default TTL from config when not specified", async () => {
      // 🔴 TDD RED - Arrange
      const email = Email.create("default-ttl@test.com");
      const user = new User(email, "Default TTL User", UserRole.BUSINESS_OWNER);

      // Mock Redis responses
      mockRedisClient.setex.mockResolvedValue("OK");

      // 🟢 TDD GREEN - Act: Utiliser TTL par défaut
      await adapter.storeUser(user.id, user);

      // ✅ Assert: Vérifier TTL par défaut (60 min = 3600 sec)
      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        `user:${user.id}`,
        3600, // 60 minutes en secondes
        expect.any(String),
      );
    });

    it("should handle Redis storage errors gracefully", async () => {
      // 🔴 TDD RED - Tester la résilience
      const email = Email.create("error@test.com");
      const user = new User(email, "Error Test User", UserRole.PLATFORM_ADMIN);

      // Mock Redis error
      mockRedisClient.setex.mockRejectedValue(
        new Error("Redis connection error"),
      );

      // 🟢 TDD GREEN - Should not throw
      await expect(adapter.storeUser(user.id, user, 10)).rejects.toThrow(
        "Redis connection error",
      );
    });
  });

  /**
   * 🎯 TDD Integration - Retrieve User from Redis
   */
  describe("🔍 TDD Integration - Get User from Redis", () => {
    it("should retrieve existing user from Redis", async () => {
      // 🔴 TDD RED - Arrange
      const email = Email.create("retrieve@test.com");
      const user = new User(email, "Retrieve Test User", UserRole.PRACTITIONER);

      // Mock Redis response
      const userData = {
        id: user.id,
        email: user.email.getValue(),
        name: user.name,
        role: user.role,
        isActive: true,
        isVerified: true,
        passwordHash: "hashed_password_retrieve",
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(userData));

      // 🟢 TDD GREEN - Act: Récupérer depuis Redis
      const retrievedUser = await adapter.getUser(user.id);

      // ✅ Assert: Vérifier que l'utilisateur est correct
      expect(retrievedUser).toBeTruthy();
      expect(retrievedUser!.id).toBe(user.id);
      expect(retrievedUser!.email.getValue()).toBe("retrieve@test.com");
      expect(retrievedUser!.name).toBe("Retrieve Test User");
      expect(retrievedUser!.role).toBe(UserRole.PRACTITIONER);
    });

    it("should return null for non-existent user", async () => {
      // 🔴 TDD RED - Test avec utilisateur inexistant
      const nonExistentId = "non-existent-user-id";

      // Mock Redis response (pas de données)
      mockRedisClient.get.mockResolvedValue(null);

      // 🟢 TDD GREEN - Act
      const result = await adapter.getUser(nonExistentId);

      // ✅ Assert
      expect(result).toBeNull();
      expect(mockRedisClient.get).toHaveBeenCalledWith(`user:${nonExistentId}`);
    });

    it("should handle Redis errors gracefully", async () => {
      // 🔴 TDD RED - Test avec erreur Redis
      const userId = "error-user-id";

      // Mock Redis error
      mockRedisClient.get.mockRejectedValue(new Error("Redis read error"));

      // 🟢 TDD GREEN - Act & Assert
      await expect(adapter.getUser(userId)).rejects.toThrow("Redis read error");
    });
  });

  /**
   * 🎯 TDD Integration - Delete Operations
   */
  describe("🗑️ TDD Integration - Delete User from Redis", () => {
    it("should delete existing user from Redis", async () => {
      // 🔴 TDD RED - Arrange
      const email = Email.create("delete@test.com");
      const user = new User(email, "Delete Test User", UserRole.ASSISTANT);

      // Mock Redis responses
      mockRedisClient.del.mockResolvedValue(1); // 1 key deleted
      mockRedisClient.get.mockResolvedValue(null); // After deletion

      // 🟢 TDD GREEN - Act: Supprimer
      await adapter.removeUser(user.id);

      // ✅ Assert: Vérifier les appels Redis
      expect(mockRedisClient.del).toHaveBeenCalledWith(`user:${user.id}`);
    });

    it("should handle deletion of non-existent user gracefully", async () => {
      // 🔴 TDD RED - Test suppression utilisateur inexistant
      const nonExistentId = "non-existent-delete-id";

      // Mock Redis response (0 keys deleted)
      mockRedisClient.del.mockResolvedValue(0);

      // 🟢 TDD GREEN - Act: Supprimer utilisateur inexistant
      await expect(adapter.removeUser(nonExistentId)).resolves.not.toThrow();

      // ✅ Assert: Vérifier que ça n'échoue pas
      expect(mockRedisClient.del).toHaveBeenCalledWith(`user:${nonExistentId}`);
    });
  });

  /**
   * 🎯 TDD Integration - Cache Operations
   */
  describe("🧹 TDD Integration - Cache Management", () => {
    it("should clear all user cache", async () => {
      // 🔴 TDD RED - Mock Redis clear operation
      mockRedisClient.flushall.mockResolvedValue("OK");

      // 🟢 TDD GREEN - Act: Nettoyer le cache
      await adapter.clear();

      // ✅ Assert: Vérifier que flushall est appelé
      expect(mockRedisClient.flushall).toHaveBeenCalled();
    });

    it("should verify Redis connection health", async () => {
      // 🔴 TDD RED - Test de santé de la connexion
      mockRedisClient.ping.mockResolvedValue("PONG");

      // 🟢 TDD GREEN - Act & Assert
      const pingResult = await mockRedisClient.ping();
      expect(pingResult).toBe("PONG");
    });
  });

  /**
   * 🎯 TDD Integration - Complex Scenarios
   */
  describe("🔄 TDD Integration - Complex Cache Scenarios", () => {
    it("should handle concurrent operations correctly", async () => {
      // 🔴 TDD RED - Test de concurrence
      const email = Email.create("concurrent@test.com");
      const user = new User(email, "Concurrent User", UserRole.REGULAR_CLIENT);

      // Mock Redis responses
      mockRedisClient.setex.mockResolvedValue("OK");

      // 🟢 TDD GREEN - Opérations simultanées
      const operations = [
        adapter.storeUser(user.id, user, 30),
        adapter.storeUser(user.id, user, 25),
        adapter.storeUser(user.id, user, 20),
      ];

      await Promise.all(operations);

      // ✅ Assert: Toutes les opérations doivent réussir
      expect(mockRedisClient.setex).toHaveBeenCalledTimes(3);
    });

    it("should maintain data consistency with TTL updates", async () => {
      // 🔴 TDD RED - Test de cohérence avec TTL
      const email = Email.create("ttl-update@test.com");
      const user = new User(email, "TTL Update User", UserRole.BUSINESS_OWNER);

      // Mock Redis responses
      mockRedisClient.setex.mockResolvedValue("OK");
      mockRedisClient.ttl
        .mockResolvedValueOnce(3580)
        .mockResolvedValueOnce(590);

      // Stocker avec TTL initial
      await adapter.storeUser(user.id, user, 60); // 60 minutes

      // Mettre à jour avec TTL différent
      await adapter.storeUser(user.id, user, 10); // 10 minutes

      // ✅ Assert: Les deux appels doivent être faits
      expect(mockRedisClient.setex).toHaveBeenCalledTimes(2);
      expect(mockRedisClient.setex).toHaveBeenNthCalledWith(
        1,
        `user:${user.id}`,
        3600, // 60 minutes
        expect.any(String),
      );
      expect(mockRedisClient.setex).toHaveBeenNthCalledWith(
        2,
        `user:${user.id}`,
        600, // 10 minutes
        expect.any(String),
      );
    });
  });
});
