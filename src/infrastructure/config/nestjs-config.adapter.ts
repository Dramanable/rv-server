/**
 * 🔧 NestJS Config Service Adapter
 *
 * Adaptateur pour le ConfigService de NestJS qui implémente l'interface IConfigService
 * Couche Infrastructure qui bridge NestJS ConfigService vers notre port
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfigService } from '../../application/ports/config.port';
import { InvalidInputError } from '@infrastructure/exceptions/infrastructure.exceptions';

@Injectable()
export class NestJsConfigServiceAdapter implements IConfigService {
  constructor(private readonly configService: ConfigService) {}

  getAccessTokenExpirationTime(): number {
    return this.configService.get<number>('ACCESS_TOKEN_EXPIRATION', 3600); // 1 hour
  }

  getRefreshTokenExpirationDays(): number {
    return this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_DAYS', 30); // 30 days
  }

  getUserSessionDurationMinutes(): number {
    return this.configService.get<number>('USER_SESSION_DURATION_MINUTES', 30);
  }

  getAccessTokenSecret(): string {
    const secret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
    if (!secret) {
      throw new InvalidInputError(
        'configuration',
        'ACCESS_TOKEN_SECRET is required but not configured',
      );
    }
    return secret;
  }

  getRefreshTokenSecret(): string {
    const secret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    if (!secret) {
      throw new InvalidInputError(
        'configuration',
        'REFRESH_TOKEN_SECRET is required but not configured',
      );
    }
    return secret;
  }

  getJwtIssuer(): string {
    return this.configService.get<string>('JWT_ISSUER', 'clean-arch-app');
  }

  getJwtAudience(): string {
    return this.configService.get<string>('JWT_AUDIENCE', 'clean-arch-users');
  }

  getAccessTokenAlgorithm(): string {
    return this.configService.get<string>('ACCESS_TOKEN_ALGORITHM', 'HS256');
  }

  getRefreshTokenAlgorithm(): string {
    return this.configService.get<string>('REFRESH_TOKEN_ALGORITHM', 'HS256');
  }

  getJwtSecret(): string {
    // Pour la sécurité des cookies, on utilise le secret d'access token
    return this.getAccessTokenSecret();
  }

  getPasswordHashAlgorithm(): string {
    return this.configService.get<string>('PASSWORD_HASH_ALGORITHM', 'bcrypt');
  }

  getBcryptRounds(): number {
    return this.configService.get<number>('BCRYPT_ROUNDS', 12);
  }

  getEnvironment(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  getDatabaseType(): 'postgresql' | 'mongodb' | 'mysql' | 'sqlite' {
    const dbType = this.configService.get<string>(
      'DATABASE_TYPE',
      'postgresql',
    );
    if (!['postgresql', 'mongodb', 'mysql', 'sqlite'].includes(dbType)) {
      throw new InvalidInputError(
        'configuration',
        `Invalid DATABASE_TYPE: ${dbType}`,
      );
    }
    return dbType as 'postgresql' | 'mongodb' | 'mysql' | 'sqlite';
  }

  getDatabaseHost(): string {
    return this.configService.get<string>('DATABASE_HOST', 'localhost');
  }

  getDatabasePort(): number {
    return this.configService.get<number>('DATABASE_PORT', 5432);
  }

  getDatabaseUsername(): string {
    return this.configService.get<string>('DATABASE_USERNAME', '');
  }

  getDatabasePassword(): string {
    return this.configService.get<string>('DATABASE_PASSWORD', '');
  }

  getDatabaseName(): string {
    return this.configService.get<string>('DATABASE_NAME', '');
  }

  getDatabasePoolSize(): number {
    return this.configService.get<number>('DATABASE_POOL_SIZE', 10);
  }

  getRedisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  getRedisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  getRedisPassword(): string {
    return this.configService.get<string>('REDIS_PASSWORD', '');
  }

  getPort(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  getHost(): string {
    return this.configService.get<string>('HOST', 'localhost');
  }

  getCorsOrigins(): string[] {
    const origins = this.configService.get<string>(
      'CORS_ORIGINS',
      'http://localhost:3000',
    );
    return origins.split(',').map((origin: string) => origin.trim());
  }

  getCorsCredentials(): boolean {
    return this.configService.get<boolean>('CORS_CREDENTIALS', true);
  }

  getHelmetConfig(): Record<string, unknown> {
    return {};
  }

  getCompressionConfig(): Record<string, unknown> {
    return {};
  }

  getRateLimitConfig(): Record<string, unknown> {
    return {
      windowMs: this.configService.get<number>(
        'RATE_LIMIT_WINDOW_MS',
        15 * 60 * 1000,
      ), // 15 minutes
      max: this.configService.get<number>('RATE_LIMIT_MAX_REQUESTS', 100), // limit each IP to 100 requests per windowMs
    };
  }

  getBodyParserConfig(): Record<string, unknown> {
    return {
      limit: this.configService.get<string>('BODY_PARSER_LIMIT', '1mb'),
    };
  }

  isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }

  isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }

  isTest(): boolean {
    return this.getEnvironment() === 'test';
  }

  getUserCacheRetentionMinutes(): number {
    return this.configService.get<number>('USER_CACHE_RETENTION_MINUTES', 60);
  }

  getAccessTokenCookieName(): string {
    return this.configService.get<string>(
      'ACCESS_TOKEN_COOKIE_NAME',
      'accessToken',
    );
  }

  getRefreshTokenCookieName(): string {
    return this.configService.get<string>(
      'REFRESH_TOKEN_COOKIE_NAME',
      'refreshToken',
    );
  }

  getRefreshTokenCookiePath(): string {
    return this.configService.get<string>(
      'REFRESH_TOKEN_COOKIE_PATH',
      '/api/v1/auth/refresh',
    );
  }
}
