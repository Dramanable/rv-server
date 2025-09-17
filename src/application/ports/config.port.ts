/**
 * 🔧 Configuration Port
 *
 * Interface pour accéder aux variables d'environnement de manière type-safe
 */

export interface IConfigService {
  /**
   * Durée de validité de l'access token en secondes
   * @default 3600 (1 heure)
   */
  getAccessTokenExpirationTime(): number;

  /**
   * Durée de validité du refresh token en jours
   * @default 30 (30 jours)
   */
  getRefreshTokenExpirationDays(): number;

  /**
   * Durée de session utilisateur en minutes (cache)
   * @default 30 (30 minutes)
   */
  getUserSessionDurationMinutes(): number;

  /**
   * Secret pour signer les Access Tokens (JWT)
   */
  getAccessTokenSecret(): string;

  /**
   * Secret pour signer les Refresh Tokens
   */
  getRefreshTokenSecret(): string;

  /**
   * Issuer pour les JWT
   */
  getJwtIssuer(): string;

  /**
   * Audience pour les JWT
   */
  getJwtAudience(): string;

  /**
   * Algorithme de signature pour les Access Tokens
   * @default 'HS256'
   */
  getAccessTokenAlgorithm(): string;

  /**
   * Algorithme de signature pour les Refresh Tokens
   * @default 'HS256'
   */
  getRefreshTokenAlgorithm(): string;

  /**
   * Secret JWT pour signer les cookies de sécurité
   */
  getJwtSecret(): string;

  /**
   * Algorithme de hachage pour les mots de passe
   * @default 'bcrypt'
   */
  getPasswordHashAlgorithm(): string;

  /**
   * Nombre de rounds pour bcrypt
   * @default 12
   */
  getBcryptRounds(): number;

  /**
   * Environment actuel (development, production, test)
   */
  getEnvironment(): string;

  /**
   * Type de base de données (postgresql, mongodb, mysql, sqlite)
   */
  getDatabaseType(): 'postgresql' | 'mongodb' | 'mysql' | 'sqlite';

  /**
   * Configuration Database PostgreSQL
   */
  getDatabaseHost(): string;
  getDatabasePort(): number;
  getDatabaseUsername(): string;
  getDatabasePassword(): string;
  getDatabaseName(): string;
  getDatabasePoolSize(): number;

  /**
   * Configuration Redis
   */
  getRedisHost(): string;
  getRedisPort(): number;
  getRedisPassword(): string;

  /**
   * Durée de rétention des utilisateurs dans le cache Redis en minutes
   * @default 60 minutes
   */
  getUserCacheRetentionMinutes(): number;

  /**
   * Server Configuration
   */
  getPort(): number;
  getHost(): string;

  /**
   * Security Configuration
   */
  getCorsOrigins(): string[];
  getCorsCredentials(): boolean;
  getHelmetConfig(): Record<string, unknown>;

  /**
   * Performance Configuration
   */
  getCompressionConfig(): Record<string, unknown>;
  getRateLimitConfig(): Record<string, unknown>;
  getBodyParserConfig(): Record<string, unknown>;

  /**
   * Environment Flags
   */
  isProduction(): boolean;
  isDevelopment(): boolean;
  isTest(): boolean;
}
