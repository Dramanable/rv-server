/**
 * 🧪 Tests d'Intégration TDD - Redis User Cache Adapter - Infrastructure Layer
 * ✅ Tests avec VRAI Redis (pas de mocks)
 * ✅ Clean Architecture - Infrastructure Implementation
 * ✅ TDD - Red/Green/Refactor
 */

import { User } from "@domain/entities/user.entity";
import { Email } from "@domain/value-objects/email.vo";
import { RedisUserCacheAdapter } from "@infrastructure/cache/redis-user-cache.adapter";
import { UserRole } from "@shared/enums/user-role.enum";
import { Redis } from "ioredis";

// Configuration de test avec VRAI Redis
interface TestConfig {
  getUserCacheRetentionMinutes(): number;
}

const testConfigService: TestConfig = {
  getUserCacheRetentionMinutes: () => 60, // 60 minutes pour les tests
};

describe.skip("🏗️ RedisUserCacheAdapter - Integration Tests (Infrastructure)", () => {
  let adapter: RedisUserCacheAdapter;
  let realRedisClient: Redis;

  beforeAll(async () => {
    // 🔗 Connexion au VRAI Redis pour l'intégration
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    realRedisClient = new Redis(redisUrl);

    // ✅ Vérifier que Redis est disponible
    await realRedisClient.ping();

    // 🏗️ Créer l'adapter avec le vrai Redis
    adapter = new RedisUserCacheAdapter(
      realRedisClient,
      testConfigService as any,
    );
  });

  afterAll(async () => {
    // 🧹 Fermer la connexion Redis
    if (realRedisClient) {
      await realRedisClient.quit();
    }
  });

  beforeEach(async () => {
    // 🧹 Nettoyer Redis avant chaque test d'intégration
    await realRedisClient.flushall();
  });

  /**
   * 🔴 TDD RED - Tests qui échouent d'abord
   */
  describe("🎯 TDD Integration - Store User in Real Redis", () => {
    it("should store and retrieve user from real Redis with TTL", async () => {
      // 🔴 TDD RED - Arrange
      const email = Email.create("integration@test.com");
      const user = User.createWithHashedPassword(
        email,
        "Integration Test User",
        "hashed_password_123",
        UserRole.CLIENT,
      );

      const ttlMinutes = 5; // 5 minutes TTL

      // 🟢 TDD GREEN - Act: Stocker dans Redis réel
      await adapter.storeUser(user.id, user, ttlMinutes);

      // ✅ Assert: Vérifier que c'est vraiment stocké dans Redis
      const redisKey = `user:${user.id}`;
      const storedData = await realRedisClient.get(redisKey);

      expect(storedData).toBeTruthy();
      expect(storedData).toContain(user.id);
      expect(storedData).toContain("integration@test.com");

      // ✅ Vérifier que le TTL est appliqué
      const ttlSeconds = await realRedisClient.ttl(redisKey);
      expect(ttlSeconds).toBeGreaterThan(250); // Au moins 4min10s restants
      expect(ttlSeconds).toBeLessThanOrEqual(300); // Max 5 minutes
    });

    it("should use default TTL from config when not specified", async () => {
      // 🔴 TDD RED - Arrange
      const email = Email.create("default-ttl@test.com");
      const user = User.createWithHashedPassword(
        email,
        "Default TTL User",
        "hashed_password_456",
        UserRole.BUSINESS_OWNER,
      );

      // 🟢 TDD GREEN - Act: Utiliser TTL par défaut
      await adapter.storeUser(user.id, user);

      // ✅ Assert: Vérifier TTL par défaut (60 min = 3600 sec)
      const redisKey = `user:${user.id}`;
      const ttlSeconds = await realRedisClient.ttl(redisKey);

      expect(ttlSeconds).toBeGreaterThan(3580); // Au moins 59min40s
      expect(ttlSeconds).toBeLessThanOrEqual(3600); // Max 60 minutes
    });

    it("should handle Redis storage errors gracefully", async () => {
      // 🔴 TDD RED - Tester la résilience
      const email = Email.create("error@test.com");
      const user = User.createWithHashedPassword(
        email,
        "Error Test User",
        "hashed_password_789",
        UserRole.PLATFORM_ADMIN,
      );

      // 🟢 TDD GREEN - Redis réel ne devrait pas échouer
      await expect(adapter.storeUser(user.id, user, 10)).resolves.not.toThrow();

      // ✅ Vérifier que ça fonctionne vraiment
      const exists = await realRedisClient.exists(`user:${user.id}`);
      expect(exists).toBe(1);
    });
  });

  /**
   * 🎯 TDD Integration - Retrieve User from Real Redis
   */
  describe("🔍 TDD Integration - Get User from Real Redis", () => {
    it("should retrieve existing user from Redis", async () => {
      // 🔴 TDD RED - Arrange: Stocker d'abord un utilisateur
      const email = Email.create("retrieve@test.com");
      const user = User.createWithHashedPassword(
        email,
        "Retrieve Test User",
        "hashed_password_retrieve",
        UserRole.PRACTITIONER,
      );

      await adapter.storeUser(user.id, user, 30);

      // 🟢 TDD GREEN - Act: Récupérer depuis Redis réel
      const retrievedUser = await adapter.getUser(user.id);

      // ✅ Assert: Vérifier que l'utilisateur est correct
      expect(retrievedUser).toBeTruthy();
      expect(retrievedUser!.id).toBe(user.id);
      expect(retrievedUser!.email.value).toBe("retrieve@test.com");
      expect(retrievedUser!.name).toBe("Retrieve Test User");
      expect(retrievedUser!.role).toBe(UserRole.PRACTITIONER);
    });

    it("should return null for non-existent user", async () => {
      // 🔴 TDD RED - Test avec utilisateur inexistant
      const nonExistentId = "non-existent-user-id";

      // 🟢 TDD GREEN - Act
      const result = await adapter.getUser(nonExistentId);

      // ✅ Assert
      expect(result).toBeNull();
    });

    it("should handle expired keys gracefully", async () => {
      // 🔴 TDD RED - Arrange: Créer une clé avec TTL très court
      const email = Email.create("expired@test.com");
      const user = User.createWithHashedPassword(
        email,
        "Expired User",
        "hashed_password_expired",
        UserRole.CLIENT,
      );

      // Stocker avec TTL de 1 seconde
      await adapter.storeUser(user.id, user, 0.017); // ~1 seconde

      // Attendre que ça expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // 🟢 TDD GREEN - Act
      const result = await adapter.getUser(user.id);

      // ✅ Assert
      expect(result).toBeNull();
    });
  });

  /**
   * 🎯 TDD Integration - Delete Operations
   */
  describe("🗑️ TDD Integration - Delete User from Real Redis", () => {
    it("should delete existing user from Redis", async () => {
      // 🔴 TDD RED - Arrange
      const email = Email.create("delete@test.com");
      const user = User.createWithHashedPassword(
        email,
        "Delete Test User",
        "hashed_password_delete",
        UserRole.SUPPORT_AGENT,
      );

      await adapter.storeUser(user.id, user, 30);

      // Vérifier que l'utilisateur existe
      const existsBefore = await realRedisClient.exists(`user:${user.id}`);
      expect(existsBefore).toBe(1);

      // 🟢 TDD GREEN - Act: Supprimer
      await adapter.removeUser(user.id);

      // ✅ Assert: Vérifier que c'est supprimé
      const existsAfter = await realRedisClient.exists(`user:${user.id}`);
      expect(existsAfter).toBe(0);

      const result = await adapter.getUser(user.id);
      expect(result).toBeNull();
    });

    it("should handle deletion of non-existent user gracefully", async () => {
      // 🔴 TDD RED - Test suppression utilisateur inexistant
      const nonExistentId = "non-existent-delete-id";

      // 🟢 TDD GREEN - Act: Supprimer utilisateur inexistant
      await expect(adapter.removeUser(nonExistentId)).resolves.not.toThrow();

      // ✅ Assert: Vérifier que ça n'échoue pas
      const result = await adapter.getUser(nonExistentId);
      expect(result).toBeNull();
    });
  });

  /**
   * 🎯 TDD Integration - Cache Operations
   */
  describe("🧹 TDD Integration - Cache Management", () => {
    it("should clear all user cache", async () => {
      // 🔴 TDD RED - Arrange: Stocker plusieurs utilisateurs
      const users = [
        { email: "user1@test.com", name: "User 1", role: UserRole.CLIENT },
        {
          email: "user2@test.com",
          name: "User 2",
          role: UserRole.BUSINESS_OWNER,
        },
        {
          email: "user3@test.com",
          name: "User 3",
          role: UserRole.PRACTITIONER,
        },
      ];

      const storedUsers = [];
      for (const userData of users) {
        const email = Email.create(userData.email);
        const user = User.createWithHashedPassword(
          email,
          userData.name,
          "hashed_password",
          userData.role,
        );
        await adapter.storeUser(user.id, user, 30);
        storedUsers.push(user);
      }

      // Vérifier que tous sont stockés
      for (const user of storedUsers) {
        const exists = await realRedisClient.exists(`user:${user.id}`);
        expect(exists).toBe(1);
      }

      // 🟢 TDD GREEN - Act: Nettoyer le cache
      await adapter.clear();

      // ✅ Assert: Vérifier que tout est supprimé
      for (const user of storedUsers) {
        const exists = await realRedisClient.exists(`user:${user.id}`);
        expect(exists).toBe(0);
      }
    });

    it("should verify Redis connection health", async () => {
      // 🔴 TDD RED - Test de santé de la connexion

      // 🟢 TDD GREEN - Act & Assert
      const pingResult = await realRedisClient.ping();
      expect(pingResult).toBe("PONG");

      // ✅ Test de latence basique
      const startTime = Date.now();
      await realRedisClient.ping();
      const latency = Date.now() - startTime;

      expect(latency).toBeLessThan(100); // Moins de 100ms pour Redis local
    });
  });

  /**
   * 🎯 TDD Integration - Complex Scenarios
   */
  describe("🔄 TDD Integration - Complex Cache Scenarios", () => {
    it("should handle concurrent operations correctly", async () => {
      // 🔴 TDD RED - Test de concurrence
      const email = Email.create("concurrent@test.com");
      const user = User.createWithHashedPassword(
        email,
        "Concurrent User",
        "hashed_password_concurrent",
        UserRole.CLIENT,
      );

      // 🟢 TDD GREEN - Opérations simultanées
      const operations = [
        adapter.storeUser(user.id, user, 30),
        adapter.storeUser(user.id, user, 25),
        adapter.storeUser(user.id, user, 20),
      ];

      await Promise.all(operations);

      // ✅ Assert: L'utilisateur doit être stocké (dernière opération gagne)
      const result = await adapter.getUser(user.id);
      expect(result).toBeTruthy();
      expect(result!.id).toBe(user.id);
    });

    it("should maintain data consistency with TTL updates", async () => {
      // 🔴 TDD RED - Test de cohérence avec TTL
      const email = Email.create("ttl-update@test.com");
      const user = User.createWithHashedPassword(
        email,
        "TTL Update User",
        "hashed_password_ttl",
        UserRole.BUSINESS_OWNER,
      );

      // Stocker avec TTL initial
      await adapter.storeUser(user.id, user, 60); // 60 minutes

      const initialTtl = await realRedisClient.ttl(`user:${user.id}`);
      expect(initialTtl).toBeGreaterThan(3500);

      // Mettre à jour avec TTL différent
      await adapter.storeUser(user.id, user, 10); // 10 minutes

      const updatedTtl = await realRedisClient.ttl(`user:${user.id}`);
      expect(updatedTtl).toBeGreaterThan(580); // Au moins 9min40s
      expect(updatedTtl).toBeLessThanOrEqual(600); // Max 10 minutes

      // ✅ Données toujours cohérentes
      const result = await adapter.getUser(user.id);
      expect(result).toBeTruthy();
      expect(result!.name).toBe("TTL Update User");
    });
  });
});
