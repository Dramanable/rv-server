/**
 * 🔧 Config Service Implementation
 *
 * Service de configuration basé sur @nestjs/config
 */

import { IConfigService } from '@application/ports/config.port';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService implements IConfigService {
  constructor(private readonly configService: ConfigService) {}

  getAccessTokenExpirationTime(): number {
    const expiration = this.configService.get<string>(
      'ACCESS_TOKEN_EXPIRATION',
    );
    if (!expiration) {
      throw new Error(
        'ACCESS_TOKEN_EXPIRATION is required. Please set this environment variable.',
      );
    }

    const parsed = parseInt(expiration, 10);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error(
        `ACCESS_TOKEN_EXPIRATION must be a positive number. Got: ${expiration}`,
      );
    }

    return parsed;
  }

  getRefreshTokenExpirationDays(): number {
    const expirationDays = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRATION_DAYS',
    );
    if (!expirationDays) {
      throw new Error(
        'REFRESH_TOKEN_EXPIRATION_DAYS is required. Please set this environment variable.',
      );
    }

    const numericValue = parseInt(expirationDays, 10);
    if (isNaN(numericValue) || numericValue <= 0) {
      throw new Error(
        `REFRESH_TOKEN_EXPIRATION_DAYS must be a positive number. Got: ${expirationDays}`,
      );
    }

    return numericValue;
  }

  getUserSessionDurationMinutes(): number {
    const durationMinutes = this.configService.get<string>(
      'USER_SESSION_DURATION_MINUTES',
      '30',
    );

    const parsed = parseInt(durationMinutes, 10);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error(
        `USER_SESSION_DURATION_MINUTES must be a positive number. Got: ${durationMinutes}`,
      );
    }

    return parsed;
  }

  getAccessTokenSecret(): string {
    const secret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
    if (!secret) {
      throw new Error(
        'ACCESS_TOKEN_SECRET is required. Please set this environment variable.',
      );
    }
    if (secret.length < 32) {
      throw new Error(
        'ACCESS_TOKEN_SECRET must be at least 32 characters long for security.',
      );
    }
    return secret;
  }

  getRefreshTokenSecret(): string {
    const secret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    if (!secret) {
      throw new Error(
        'REFRESH_TOKEN_SECRET is required. Please set this environment variable.',
      );
    }
    if (secret.length < 32) {
      throw new Error(
        'REFRESH_TOKEN_SECRET must be at least 32 characters long for security.',
      );
    }

    // Vérification de sécurité : les secrets doivent être différents
    if (secret === this.getAccessTokenSecret()) {
      throw new Error(
        'REFRESH_TOKEN_SECRET must be different from ACCESS_TOKEN_SECRET for security reasons.',
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
    const rounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    if (rounds < 10 || rounds > 20) {
      throw new Error(
        'BCRYPT_ROUNDS must be between 10 and 20 for security and performance balance.',
      );
    }
    return rounds;
  }

  // 🌍 Environment Configuration
  getEnvironment(): 'development' | 'test' | 'production' {
    return this.configService.get<string>('NODE_ENV', 'development') as
      | 'development'
      | 'test'
      | 'production';
  }

  getDatabaseType(): 'postgresql' | 'mongodb' | 'mysql' | 'sqlite' {
    const dbType = this.configService.get<string>(
      'DATABASE_TYPE',
      'postgresql',
    );
    if (!['postgresql', 'mongodb', 'mysql', 'sqlite'].includes(dbType)) {
      throw new Error(
        `Unsupported DATABASE_TYPE: ${dbType}. Supported: postgresql, mongodb, mysql, sqlite`,
      );
    }
    return dbType as 'postgresql' | 'mongodb' | 'mysql' | 'sqlite';
  }

  // 🐘 Database PostgreSQL Configuration
  getDatabaseHost(): string {
    return this.configService.get<string>('DATABASE_HOST', 'localhost');
  }

  getDatabasePort(): number {
    return this.configService.get<number>('DATABASE_PORT', 5432);
  }

  getDatabaseUsername(): string {
    return this.configService.get<string>('DATABASE_USERNAME', 'admin');
  }

  getDatabasePassword(): string {
    const password = this.configService.get<string>('DATABASE_PASSWORD');
    if (!password) {
      throw new Error(
        'DATABASE_PASSWORD is required. Please set this environment variable.',
      );
    }
    return password;
  }

  getDatabaseName(): string {
    return this.configService.get<string>('DATABASE_NAME', 'cleanarchi');
  }

  getDatabasePoolSize(): number {
    return this.configService.get<number>('DATABASE_POOL_SIZE', 10);
  }

  // 🍃 Redis Configuration
  getRedisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  getRedisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  getRedisPassword(): string {
    return this.configService.get<string>('REDIS_PASSWORD', '');
  }

  // 🕰️ User Cache Configuration
  getUserCacheRetentionMinutes(): number {
    const retentionMinutes = this.configService.get<string>(
      'USER_CACHE_RETENTION_MINUTES',
      '60',
    );

    const parsed = parseInt(retentionMinutes, 10);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error(
        `USER_CACHE_RETENTION_MINUTES must be a positive number. Got: ${retentionMinutes}`,
      );
    }

    return parsed;
  }

  // 🌐 Server Configuration
  getPort(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  getHost(): string {
    return this.configService.get<string>('HOST', '0.0.0.0');
  }

  // 🗄️ MongoDB Configuration (alternative)
  getMongoConnectionString(): string {
    const host = this.configService.get<string>('MONGO_HOST', 'localhost');
    const port = this.configService.get<number>('MONGO_PORT', 27017);
    const username = this.configService.get<string>('MONGO_USERNAME', '');
    const password = this.configService.get<string>('MONGO_PASSWORD', '');
    const database = this.configService.get<string>(
      'MONGO_DATABASE',
      'cleanarchi',
    );

    if (username && password) {
      return `mongodb://${username}:${password}@${host}:${port}/${database}`;
    }
    return `mongodb://${host}:${port}/${database}`;
  }

  // 🔧 Logging Configuration
  getLogLevel(): string {
    return this.configService.get<string>('LOG_LEVEL', 'info');
  }

  isProductionLogging(): boolean {
    return this.getEnvironment() === 'production';
  }

  // 🔒 Security Configuration
  getCorsOrigins(): string[] {
    const origins = this.configService.get<string>(
      'CORS_ORIGINS',
      // 🎯 Configuration CORS développement frontend étendue
      'http://localhost:3000,http://localhost:3001,http://localhost:3002,' + // React, Next.js
        'http://localhost:4000,http://localhost:4173,http://localhost:4200,' + // Angular, Vite preview
        'http://localhost:5000,http://localhost:5173,http://localhost:5174,' + // Vite dev, Svelte
        'http://localhost:8000,http://localhost:8080,http://localhost:8081,' + // Vue.js, Webpack dev
        'http://localhost:9000,http://localhost:9090,' + // Custom dev servers
        'http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:4173', // IPv4 loopback
    );
    return origins.split(',').map((origin) => origin.trim());
  }

  getCorsCredentials(): boolean {
    return this.configService.get<boolean>('CORS_CREDENTIALS', true);
  }

  getHelmetConfig(): Record<string, unknown> {
    return {
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    };
  }

  // 🚀 Performance Configuration
  getCompressionConfig(): Record<string, unknown> {
    return {
      level: this.configService.get<number>('COMPRESSION_LEVEL', 6),
      threshold: this.configService.get<number>('COMPRESSION_THRESHOLD', 1024),
    };
  }

  getRateLimitConfig(): Record<string, unknown> {
    return {
      windowMs: this.getRateLimitWindowMs(),
      max: this.getRateLimitMax(),
      message: 'Too many requests from this IP, please try again later.',
    };
  }

  getBodyParserConfig(): Record<string, unknown> {
    return {
      limit: this.configService.get<string>('BODY_PARSER_LIMIT', '50mb'),
      extended: true,
    };
  }

  // 🌍 Environment Flags
  isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }

  isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }

  isTest(): boolean {
    return this.getEnvironment() === 'test';
  }

  getRateLimitMax(): number {
    return this.configService.get<number>('RATE_LIMIT_MAX', 100);
  }

  getRateLimitWindowMs(): number {
    return this.configService.get<number>('RATE_LIMIT_WINDOW_MS', 900000); // 15 minutes
  }

  // 📊 Monitoring Configuration
  isSwaggerEnabled(): boolean {
    return this.getEnvironment() !== 'production';
  }

  getSwaggerPath(): string {
    return this.configService.get<string>('SWAGGER_PATH', 'api/docs');
  }

  // 🎯 Feature Flags
  isFeatureEnabled(featureName: string): boolean {
    return this.configService.get<boolean>(
      `FEATURE_${featureName.toUpperCase()}`,
      false,
    );
  }

  // 📧 Email Configuration (future)
  getEmailHost(): string {
    return this.configService.get<string>('EMAIL_HOST', '');
  }

  getEmailPort(): number {
    return this.configService.get<number>('EMAIL_PORT', 587);
  }

  getEmailUser(): string {
    return this.configService.get<string>('EMAIL_USER', '');
  }

  getEmailPassword(): string {
    return this.configService.get<string>('EMAIL_PASSWORD', '');
  }

  // 🔄 Health Check Configuration
  getHealthCheckTimeout(): number {
    return this.configService.get<number>('HEALTH_CHECK_TIMEOUT', 5000);
  }

  getHealthCheckInterval(): number {
    return this.configService.get<number>('HEALTH_CHECK_INTERVAL', 30000);
  }

  // 🌐 Frontend Configuration
  getFrontendUrl(): string | undefined {
    return this.configService.get<string>('FRONTEND_URL');
  }

  // 🍪 Cookie Configuration
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
