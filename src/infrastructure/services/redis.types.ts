/**
 * 🔧 Types Redis - Configuration stricte pour éviter any
 */

import type { Redis } from 'ioredis';

export interface RedisConfig {
  host: string;
  port: number;
  db: number;
  retryDelayOnFailover: number;
  enableReadyCheck: boolean;
  maxRetriesPerRequest: null;
  lazyConnect: boolean;
  password?: string;
  tls?: {
    rejectUnauthorized: boolean;
  };
}

export type RedisClient = Redis;

export type RedisValue = string | number | Buffer;
export type RedisKey = string;
export type RedisExpiration = number; // seconds
