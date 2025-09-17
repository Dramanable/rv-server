/**
 * 💾 Redis User Cache Adapter - Infrastructure Layer
 * ✅ Implémentation Redis pour le cache des utilisateurs
 * ✅ Clean Architecture - Infrastructure Adapter
 */

import type { IUserCache } from '../../application/ports/user-cache.port';
import type { User } from '../../domain/entities/user.entity';
import type { Redis } from 'ioredis';
import type { AppConfigService } from '../config/app-config.service';

export class RedisUserCacheAdapter implements IUserCache {
  private readonly keyPrefix = 'user:';

  constructor(
    private readonly redisClient: Redis,
    private readonly configService: AppConfigService,
  ) {}

  async storeUser(userId: string, user: User, ttlMinutes?: number): Promise<void> {
    const key = this.buildKey(userId);
    const ttlSeconds = this.convertMinutesToSeconds(
      ttlMinutes ?? this.configService.getUserCacheRetentionMinutes(),
    );

    await this.redisClient.setex(key, ttlSeconds, JSON.stringify(user));
  }

  async getUser(userId: string): Promise<User | null> {
    const key = this.buildKey(userId);
    const result = await this.redisClient.get(key);

    if (!result) {
      return null;
    }

    try {
      return JSON.parse(result) as User;
    } catch (error) {
      // En cas d'erreur de parsing, considérer comme non trouvé
      return null;
    }
  }

  async removeUser(userId: string): Promise<void> {
    const key = this.buildKey(userId);
    await this.redisClient.del(key);
  }

  async refreshUserTTL(userId: string, ttlMinutes?: number): Promise<boolean> {
    const key = this.buildKey(userId);
    const ttlSeconds = this.convertMinutesToSeconds(
      ttlMinutes ?? this.configService.getUserCacheRetentionMinutes(),
    );

    const result = await this.redisClient.expire(key, ttlSeconds);
    return result === 1; // Redis renvoie 1 si la clé existe, 0 sinon
  }

  async exists(userId: string): Promise<boolean> {
    const key = this.buildKey(userId);
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  async clear(): Promise<void> {
    await this.redisClient.flushall();
  }

  private buildKey(userId: string): string {
    return `${this.keyPrefix}${userId}`;
  }

  private convertMinutesToSeconds(minutes: number): number {
    return minutes * 60;
  }
}
