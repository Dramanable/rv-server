/**
 * 🧪 REDIS CONNECTION TEST - Test de connectivité Redis
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import type { ICacheService } from '../../application/ports/cache.port';
import { CacheModule } from '../cache/cache.module';
import { PinoLoggerModule } from '../logging/pino-logger.module';
import { TOKENS } from '../../shared/constants/injection-tokens';

describe('Redis Connection Integration Test', () => {
  let cacheService: ICacheService;
  let testModule: TestingModule;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [CacheModule, PinoLoggerModule],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: unknown) => {
              const config: Record<string, unknown> = {
                REDIS_HOST: 'redis',
                REDIS_PORT: 6379,
                REDIS_PASSWORD: 'redis123',
                REDIS_DB: 0,
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    cacheService = testModule.get<ICacheService>(TOKENS.CACHE_SERVICE);
  });

  afterAll(async () => {
    await testModule.close();
  });

  describe('Redis Connectivity', () => {
    it('should connect to Redis server', async () => {
      // Test basic connectivity with SET operation
      const testKey = 'test:connection';
      const testValue = 'redis-connected';
      const ttl = 60; // 1 minute

      await expect(
        cacheService.set(testKey, testValue, ttl),
      ).resolves.not.toThrow();
    }, 10000);

    it('should store and retrieve data from Redis', async () => {
      // Test full round-trip: SET and GET
      const testKey = 'test:round-trip';
      const testValue = 'hello-redis';
      const ttl = 60;

      // Store data
      await cacheService.set(testKey, testValue, ttl);

      // Retrieve data
      const retrievedValue = await cacheService.get(testKey);
      expect(retrievedValue).toBe(testValue);

      // Clean up
      await cacheService.delete(testKey);
    }, 10000);

    it('should handle exists operation', async () => {
      const testKey = 'test:exists';
      const testValue = 'exists-test';
      const ttl = 60;

      // Key should not exist initially
      let exists = await cacheService.exists(testKey);
      expect(exists).toBe(false);

      // Store data
      await cacheService.set(testKey, testValue, ttl);

      // Key should exist now
      exists = await cacheService.exists(testKey);
      expect(exists).toBe(true);

      // Clean up
      await cacheService.delete(testKey);

      // Key should not exist after deletion
      exists = await cacheService.exists(testKey);
      expect(exists).toBe(false);
    }, 10000);

    it('should handle pattern deletion', async () => {
      const testPattern = 'test:pattern:*';
      const keys = [
        'test:pattern:key1',
        'test:pattern:key2',
        'test:pattern:key3',
      ];
      const testValue = 'pattern-test';
      const ttl = 60;

      // Store multiple keys with the pattern
      for (const key of keys) {
        await cacheService.set(key, testValue, ttl);
      }

      // Verify keys exist
      for (const key of keys) {
        const exists = await cacheService.exists(key);
        expect(exists).toBe(true);
      }

      // Delete all keys matching pattern
      await cacheService.deletePattern(testPattern);

      // Verify keys are deleted
      for (const key of keys) {
        const exists = await cacheService.exists(key);
        expect(exists).toBe(false);
      }
    }, 10000);

    it('should handle TTL expiration', async () => {
      const testKey = 'test:ttl';
      const testValue = 'ttl-test';
      const shortTtl = 2; // 2 seconds

      // Store data with short TTL
      await cacheService.set(testKey, testValue, shortTtl);

      // Key should exist immediately
      let exists = await cacheService.exists(testKey);
      expect(exists).toBe(true);

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Key should not exist after TTL expiration
      exists = await cacheService.exists(testKey);
      expect(exists).toBe(false);
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should return null for non-existent keys', async () => {
      const nonExistentKey = 'test:non-existent';
      const value = await cacheService.get(nonExistentKey);
      expect(value).toBeNull();
    });

    it('should handle delete operation on non-existent keys gracefully', async () => {
      const nonExistentKey = 'test:non-existent-delete';
      await expect(cacheService.delete(nonExistentKey)).resolves.not.toThrow();
    });
  });
});
