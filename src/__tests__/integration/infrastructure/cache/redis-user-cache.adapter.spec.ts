/**
 * 🧪 Tests TDD - Redis User Cache Adapter - Infrastructure Layer
 * ✅ Tests pour l'adaptateur Redis
 * ✅ Clean Architecture - Infrastructure Implementation
 */

import { RedisUserCacheAdapter } from '../../../../infrastructure/cache/redis-user-cache.adapter';
import type { User } from '../../../../domain/entities/user.entity';
import { UserRole } from '../../../../shared/enums/user-role.enum';

// Mock Redis
const mockRedisClient = {
  setex: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  flushall: jest.fn(),
} as any;

// Mock AppConfigService
const mockConfigService = {
  getUserCacheRetentionMinutes: jest.fn().mockReturnValue(60), // Retourne toujours 60 minutes
} as any;

describe('RedisUserCacheAdapter - TDD Infrastructure', () => {
  let adapter: RedisUserCacheAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    // Réinitialiser le mock pour chaque test
    mockConfigService.getUserCacheRetentionMinutes.mockReturnValue(60);
    adapter = new RedisUserCacheAdapter(mockRedisClient, mockConfigService);
  });

  describe('✅ Store User', () => {
    it('should store user in Redis with TTL in seconds', async () => {
      // 📋 Arrange
      const user = {
        id: 'user-123',
        email: { value: 'test@example.com' },
        name: 'John Doe',
        role: UserRole.REGULAR_CLIENT,
      } as User;

      const ttlMinutes = 30;
      mockRedisClient.setex.mockResolvedValue('OK');

      // 🎬 Act
      await adapter.storeUser(user.id, user, ttlMinutes);

      // 🔍 Assert
      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        'user:user-123',
        1800, // 30 minutes * 60 seconds
        JSON.stringify(user),
      );
    });

    it('should use default TTL when not specified', async () => {
      // 📋 Arrange
      const user = {
        id: 'user-456',
        email: { value: 'admin@example.com' },
        name: 'Admin',
        role: UserRole.ADMIN,
      } as User;

      mockRedisClient.setex.mockResolvedValue('OK');

      // 🎬 Act
      await adapter.storeUser(user.id, user);

      // 🔍 Assert
      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        'user:user-456',
        3600, // 60 minutes * 60 seconds (default)
        JSON.stringify(user),
      );
    });
  });

  describe('🔍 Get User', () => {
    it('should retrieve user from Redis', async () => {
      // 📋 Arrange
      const userId = 'user-789';
      const storedUser = {
        id: userId,
        email: { value: 'stored@example.com' },
        name: 'Stored User',
        role: UserRole.REGULAR_CLIENT,
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(storedUser));

      // 🎬 Act
      const result = await adapter.getUser(userId);

      // 🔍 Assert
      expect(mockRedisClient.get).toHaveBeenCalledWith('user:user-789');
      expect(result).toEqual(storedUser);
    });

    it('should return null when user not found', async () => {
      // 📋 Arrange
      const userId = 'nonexistent';
      mockRedisClient.get.mockResolvedValue(null);

      // 🎬 Act
      const result = await adapter.getUser(userId);

      // 🔍 Assert
      expect(mockRedisClient.get).toHaveBeenCalledWith('user:nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('🗑️ Remove User', () => {
    it('should remove user from Redis', async () => {
      // 📋 Arrange
      const userId = 'user-to-delete';
      mockRedisClient.del.mockResolvedValue(1);

      // 🎬 Act
      await adapter.removeUser(userId);

      // 🔍 Assert
      expect(mockRedisClient.del).toHaveBeenCalledWith('user:user-to-delete');
    });
  });

  describe('⚡ User Existence Check', () => {
    it('should check if user exists in cache', async () => {
      // 📋 Arrange
      const userId = 'existing-user';
      mockRedisClient.exists.mockResolvedValue(1);

      // 🎬 Act
      const exists = await adapter.exists(userId);

      // 🔍 Assert
      expect(mockRedisClient.exists).toHaveBeenCalledWith('user:existing-user');
      expect(exists).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      // 📋 Arrange
      const userId = 'nonexistent-user';
      mockRedisClient.exists.mockResolvedValue(0);

      // 🎬 Act
      const exists = await adapter.exists(userId);

      // 🔍 Assert
      expect(mockRedisClient.exists).toHaveBeenCalledWith('user:nonexistent-user');
      expect(exists).toBe(false);
    });
  });

  describe('🔄 Refresh TTL', () => {
    it('should refresh user TTL in Redis', async () => {
      // 📋 Arrange
      const userId = 'user-refresh';
      const newTtlMinutes = 45;
      mockRedisClient.expire.mockResolvedValue(1);

      // 🎬 Act
      const result = await adapter.refreshUserTTL(userId, newTtlMinutes);

      // 🔍 Assert
      expect(mockRedisClient.expire).toHaveBeenCalledWith(
        'user:user-refresh',
        2700, // 45 minutes * 60 seconds
      );
      expect(result).toBe(true);
    });

    it('should use default TTL when not specified for refresh', async () => {
      // 📋 Arrange
      const userId = 'user-default-refresh';
      mockRedisClient.expire.mockResolvedValue(1);

      // 🎬 Act
      const result = await adapter.refreshUserTTL(userId);

      // 🔍 Assert
      expect(mockRedisClient.expire).toHaveBeenCalledWith(
        'user:user-default-refresh',
        3600, // 60 minutes * 60 seconds (default)
      );
      expect(result).toBe(true);
    });
  });

  describe('🧹 Clear Cache', () => {
    it('should clear all cache', async () => {
      // 📋 Arrange
      mockRedisClient.flushall.mockResolvedValue('OK');

      // 🎬 Act
      await adapter.clear();

      // 🔍 Assert
      expect(mockRedisClient.flushall).toHaveBeenCalled();
    });
  });

  // 🔧 Clean up after each test to prevent memory leaks
  afterEach(() => {
    jest.clearAllMocks();
  });
});
