/**
 * 🗄️ Simple Cache Service - Implementation Mock
 *
 * Service de cache simple pour remplacer temporairement RedisCacheService
 */

import { Inject, Injectable } from "@nestjs/common";
import type { ICacheService } from "../../application/ports/cache.port";
import type { Logger } from "../../application/ports/logger.port";
import { TOKENS } from "../../shared/constants/injection-tokens";

@Injectable()
export class SimpleCacheService implements ICacheService {
  private readonly cache = new Map<string, any>();

  constructor(
    @Inject(TOKENS.PINO_LOGGER)
    private readonly logger: Logger,
  ) {}

  async set<T>(key: string, value: T, _ttl?: number): Promise<void> {
    this.logger.debug(`Cache SET: ${key}`);
    this.cache.set(key, value);
    return Promise.resolve();
  }

  async get<T>(key: string): Promise<T | null> {
    this.logger.debug(`Cache GET: ${key}`);
    return Promise.resolve(this.cache.get(key) || null);
  }

  async delete(key: string): Promise<void> {
    this.logger.debug(`Cache DELETE: ${key}`);
    this.cache.delete(key);
    return Promise.resolve();
  }

  async clear(): Promise<void> {
    this.logger.debug("Cache CLEAR");
    this.cache.clear();
    return Promise.resolve();
  }

  async keys(_pattern?: string): Promise<string[]> {
    return Promise.resolve(Array.from(this.cache.keys()));
  }

  async exists(key: string): Promise<boolean> {
    return Promise.resolve(this.cache.has(key));
  }

  async invalidateUserCache(userId: string): Promise<void> {
    this.logger.debug(`Invalidating cache for user: ${userId}`);
    const userKeys = Array.from(this.cache.keys()).filter((key) =>
      key.includes(userId),
    );
    userKeys.forEach((key) => this.cache.delete(key));
    return Promise.resolve();
  }

  async createUserSession(userId: string, sessionData: any): Promise<void> {
    const sessionKey = `user_session:${userId}`;
    await this.set(sessionKey, sessionData, 30 * 60); // 30 minutes
  }

  async getUserSession(userId: string): Promise<any> {
    const sessionKey = `user_session:${userId}`;
    return await this.get(sessionKey);
  }

  async deleteUserSession(userId: string): Promise<void> {
    const sessionKey = `user_session:${userId}`;
    await this.delete(sessionKey);
  }

  async increment(key: string): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current + 1;
    await this.set(key, newValue);
    return newValue;
  }

  async deletePattern(pattern: string): Promise<void> {
    this.logger.debug(`Cache DELETE PATTERN: ${pattern}`);
    const keys = Array.from(this.cache.keys());
    const matchingKeys = keys.filter((key) => key.includes(pattern));
    matchingKeys.forEach((key) => this.cache.delete(key));
    return Promise.resolve();
  }

  setWithExpiry(key: string, value: string, _seconds: number): Promise<void> {
    return this.set(key, value);
  }
}
