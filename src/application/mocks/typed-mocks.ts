/**
 * 🧪 Typed Mocks Factory for Tests
 *
 * Factory pour créer des mocks typés et éliminer les types `any`
 * Respect des principes SOLID + Type Safety à 100%
 */

import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { Logger } from '../ports/logger.port';
import { I18nService } from '../ports/i18n.port';
import type { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';

export interface TokenService {
  generateAccessToken(
    userId: string,
    email: string,
    role: string,
  ): Promise<string>;
  generateRefreshToken(userId: string): Promise<string>;
  verifyAccessToken(token: string): Promise<unknown>;
  verifyRefreshToken(token: string): Promise<unknown>;
}

export interface PasswordService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(pattern?: string): Promise<string[]>;
}

export interface AppConfig {
  jwtConfig: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiration: string;
    refreshTokenExpiration: string;
  };
  databaseConfig: {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  redisConfig: {
    host: string;
    port: number;
    password?: string;
  };
  appConfig: {
    port: number;
    environment: string;
  };
}

/**
 * 🎯 User Repository Mock Factory
 */
export function createMockUserRepository(): jest.Mocked<UserRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    delete: jest.fn(),
    emailExists: jest.fn(),
    existsByUsername: jest.fn(),
    updatePassword: jest.fn(),
    updateActiveStatus: jest.fn(),
    findAll: jest.fn(),
    search: jest.fn(),
    findByRole: jest.fn(),
    count: jest.fn(),
    countSuperAdmins: jest.fn(),
    countWithFilters: jest.fn(),
    update: jest.fn(),
    updateBatch: jest.fn(),
    deleteBatch: jest.fn(),
    export: jest.fn(),
  } as jest.Mocked<UserRepository>;
}

/**
 * 🎯 Refresh Token Repository Mock Factory
 */
export function createMockRefreshTokenRepository(): jest.Mocked<RefreshTokenRepository> {
  return {
    save: jest.fn(),
    findByToken: jest.fn(),
    findByUserId: jest.fn(),
    deleteByUserId: jest.fn(),
    revokeAllByUserId: jest.fn(),
    revokeByToken: jest.fn(),
    deleteExpiredTokens: jest.fn(),
  } as jest.Mocked<RefreshTokenRepository>;
}

/**
 * 🎯 Token Service Mock Factory
 */
export function createMockTokenService(): jest.Mocked<TokenService> {
  return {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  } as jest.Mocked<TokenService>;
}

/**
 * 🎯 Password Service Mock Factory
 */
export function createMockPasswordService(): jest.Mocked<PasswordService> {
  return {
    hash: jest.fn(),
    compare: jest.fn(),
  } as jest.Mocked<PasswordService>;
}

/**
 * 🎯 Cache Service Mock Factory
 */
export function createMockCacheService(): jest.Mocked<CacheService> {
  return {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    keys: jest.fn(),
  } as jest.Mocked<CacheService>;
}

/**
 * 🎯 Logger Mock Factory
 */
export function createMockLogger(): jest.Mocked<Logger> {
  return {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    audit: jest.fn(),
    child: jest.fn().mockReturnThis(),
  } as jest.Mocked<Logger>;
}

/**
 * 🎯 I18n Service Mock Factory
 */
export function createMockI18nService(): jest.Mocked<I18nService> {
  return {
    translate: jest.fn().mockReturnValue('Mock message'),
    t: jest.fn().mockReturnValue('Mock message'),
    setDefaultLanguage: jest.fn(),
    exists: jest.fn().mockReturnValue(true),
  } as jest.Mocked<I18nService>;
}

/**
 * 🎯 App Config Mock Factory
 */
export function createMockAppConfig(): AppConfig {
  return {
    jwtConfig: {
      accessTokenSecret: 'test-access-secret',
      refreshTokenSecret: 'test-refresh-secret',
      accessTokenExpiration: '15m',
      refreshTokenExpiration: '7d',
    },
    databaseConfig: {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'test',
      password: 'test',
      database: 'test',
    },
    redisConfig: {
      host: 'localhost',
      port: 6379,
      password: undefined,
    },
    appConfig: {
      port: 3000,
      environment: 'test',
    },
  };
}

/**
 * 🎯 Complete Mock Setup Factory
 * Retourne tous les mocks typés pour setup rapide
 */
export interface MockSetup {
  mockUserRepository: jest.Mocked<UserRepository>;
  mockRefreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  mockTokenService: jest.Mocked<TokenService>;
  mockPasswordService: jest.Mocked<PasswordService>;
  mockCacheService: jest.Mocked<CacheService>;
  mockLogger: jest.Mocked<Logger>;
  mockI18n: jest.Mocked<I18nService>;
  mockConfig: AppConfig;
}

export function createCompleteMockSetup(): MockSetup {
  return {
    mockUserRepository: createMockUserRepository(),
    mockRefreshTokenRepository: createMockRefreshTokenRepository(),
    mockTokenService: createMockTokenService(),
    mockPasswordService: createMockPasswordService(),
    mockCacheService: createMockCacheService(),
    mockLogger: createMockLogger(),
    mockI18n: createMockI18nService(),
    mockConfig: createMockAppConfig(),
  };
}
