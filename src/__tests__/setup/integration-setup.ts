/**
 * 🏗️ Setup Tests d'Intégration - Configuration avec vraies dépendances
 * ✅ Connexions réelles à Redis, PostgreSQL, etc.
 * ✅ Configuration Docker Compose nécessaire
 * ✅ Nettoyage automatique entre les tests
 */

import 'reflect-metadata';
import { Redis } from 'ioredis';

// 🌍 Variables d'environnement pour l'intégration
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  'integration-test-jwt-secret-key-do-not-use-in-production';
process.env.DATABASE_URL =
  'postgresql://test_user:test_password@localhost:5433/test_db';
process.env.REDIS_URL = 'redis://localhost:6380'; // Port Redis de test
process.env.USER_CACHE_RETENTION_MINUTES = '5'; // TTL court pour les tests

// 📊 Configuration des timeouts pour l'intégration
jest.setTimeout(30000); // 30 secondes max par test d'intégration

// 🔄 Instance Redis partagée pour les tests
let redisClient: Redis;

// 🏗️ Setup global avant tous les tests d'intégration
beforeAll(async () => {
  // 🔗 Connexion à Redis de test
  redisClient = new Redis(process.env.REDIS_URL!);

  // ⏳ Attendre que Redis soit prêt
  await new Promise<void>((resolve, reject) => {
    redisClient.on('ready', resolve);
    redisClient.on('error', reject);

    // Timeout de sécurité
    setTimeout(() => reject(new Error('Redis connection timeout')), 10000);
  });

  console.log('✅ Redis connection established for integration tests');
});

// 🧹 Nettoyage avant chaque test d'intégration
beforeEach(async () => {
  // 🗑️ Vider le cache Redis entre les tests
  if (redisClient && redisClient.status === 'ready') {
    await redisClient.flushdb();
  }

  // TODO: Nettoyage de la base de données de test
  // await cleanupTestDatabase();
});

// 🧹 Nettoyage après chaque test
afterEach(async () => {
  // Nettoyage supplémentaire si nécessaire
});

// 🏁 Teardown global après tous les tests
afterAll(async () => {
  // 🔌 Fermer la connexion Redis
  if (redisClient) {
    await redisClient.quit();
    console.log('✅ Redis connection closed');
  }

  // TODO: Fermer les connexions BD
  // await closeTestDatabaseConnection();
});

// 🔧 Utilitaires pour les tests d'intégration
export const testUtils = {
  /**
   * Attendre qu'une condition soit vraie (pour les tests asynchrones)
   */
  async waitFor(
    condition: () => Promise<boolean> | boolean,
    timeout: number = 5000,
    interval: number = 100,
  ): Promise<void> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  },

  /**
   * Générer des données de test aléatoires
   */
  generateTestData: {
    uuid: () =>
      '550e8400-e29b-41d4-a716-' + Math.random().toString().substr(2, 12),
    email: () => `test-${Date.now()}@example.com`,
    password: () => 'TestPassword123!',
    businessName: () => `Test Business ${Date.now()}`,
  },

  /**
   * Nettoyer les données de test dans Redis
   */
  async cleanRedis(): Promise<void> {
    if (redisClient && redisClient.status === 'ready') {
      await redisClient.flushdb();
    }
  },

  /**
   * Vérifier qu'une clé existe dans Redis
   */
  async redisKeyExists(key: string): Promise<boolean> {
    if (!redisClient || redisClient.status !== 'ready') {
      return false;
    }
    const exists = await redisClient.exists(key);
    return exists === 1;
  },

  /**
   * Obtenir une valeur de Redis pour les assertions
   */
  async getRedisValue(key: string): Promise<string | null> {
    if (!redisClient || redisClient.status !== 'ready') {
      return null;
    }
    return await redisClient.get(key);
  },
};

// 🎯 Matchers personnalisés pour les tests d'intégration
expect.extend({
  async toBeInRedis(received: string, expectedValue?: any) {
    const exists = await testUtils.redisKeyExists(received);
    const actualValue =
      expectedValue !== undefined
        ? await testUtils.getRedisValue(received)
        : null;

    let pass = exists;
    if (expectedValue !== undefined && exists) {
      pass =
        actualValue === JSON.stringify(expectedValue) ||
        actualValue === expectedValue;
    }

    if (pass) {
      return {
        message: () =>
          `expected key "${received}" not to be in Redis${expectedValue !== undefined ? ` with value ${expectedValue}` : ''}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected key "${received}" to be in Redis${expectedValue !== undefined ? ` with value ${expectedValue}, but got ${actualValue}` : ''}`,
        pass: false,
      };
    }
  },
});

// 📋 Types pour les matchers d'intégration
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInRedis(expectedValue?: any): Promise<R>;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// 🚨 Gestion des erreurs pour les tests d'intégration
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Les tests d'intégration peuvent avoir des rejections non gérées temporaires
});

// 📝 Export pour utilisation dans les tests
export { redisClient };
