/**
 * 🎯 INJECTION TOKENS - Clean Architecture
 *
 * Tokens centralisés pour l'injection de dépendances
 * Évite les dépendances circulaires et respecte Clean Architecture
 */

// 🏗️ Application Layer Tokens
export const APPLICATION_TOKENS = {
  // Ports (Interfaces)
  LOGGER: 'Logger',
  I18N_SERVICE: 'I18nService',
  CONFIG_SERVICE: 'IConfigService',
  EMAIL_SERVICE: 'EmailService',
  PASSWORD_SERVICE: 'PasswordService',
  PASSWORD_HASHER: 'IPasswordHasher', // ✅ NOUVEAU: Port pour hachage sécurisé
  PASSWORD_GENERATOR: 'PasswordGenerator',
  TOKEN_SERVICE: 'TokenService',

  // Use Cases
  CREATE_USER_USE_CASE: 'CreateUserUseCase',
  GET_USER_USE_CASE: 'GetUserUseCase',
  UPDATE_USER_USE_CASE: 'UpdateUserUseCase',
  DELETE_USER_USE_CASE: 'DeleteUserUseCase',
  LOGIN_USE_CASE: 'LoginUseCase',
  REGISTER_USE_CASE: 'RegisterUseCase',
  REFRESH_TOKEN_USE_CASE: 'RefreshTokenUseCase',
  LOGOUT_USE_CASE: 'LogoutUseCase',

  // Application Services
  USER_ONBOARDING_SERVICE: 'UserOnboardingApplicationService',
  USER_CACHE_SERVICE: 'UserCacheService',

  // Authentication Services
  AUTH_TOKEN_SERVICE: 'AuthTokenService',
  AUTH_SERVICE: 'AuthService',
  JWT_SERVICE: 'JwtService',

  // Cache Services
  CACHE_SERVICE: 'CacheService',
  USER_CACHE: 'IUserCache',

  // Session Services
  USER_SESSION_SERVICE: 'UserSessionService',
} as const;

// 🏛️ Domain Layer Tokens
export const DOMAIN_TOKENS = {
  // Repository Interfaces
  USER_REPOSITORY: 'UserRepository',
  REFRESH_TOKEN_REPOSITORY: 'RefreshTokenRepository',

  // Domain Services
  USER_DOMAIN_SERVICE: 'UserDomainService',
  PASSWORD_DOMAIN_SERVICE: 'PasswordDomainService',
  EMAIL_DOMAIN_SERVICE: 'EmailDomainService',
} as const;

// 🏗️ Infrastructure Layer Tokens
export const INFRASTRUCTURE_TOKENS = {
  // Database
  DATABASE_TYPE: 'DatabaseType',
  DATABASE_CONNECTION: 'DatabaseConnection',
  TYPEORM_CONNECTION: 'TypeOrmConnection',
  MONGO_CONNECTION: 'MongoConnection',

  // Repository Implementations
  TYPEORM_USER_REPOSITORY: 'TypeOrmUserRepository',
  MONGO_USER_REPOSITORY: 'MongoUserRepository',

  // External Services
  PINO_LOGGER: 'PinoLogger',
  CONSOLE_LOGGER: 'ConsoleLogger',
  SMTP_EMAIL_SERVICE: 'SmtpEmailService',
  BCRYPT_PASSWORD_SERVICE: 'BcryptPasswordService',
  BCRYPT_PASSWORD_HASHER: 'BcryptPasswordHasher', // ✅ NOUVEAU: Adapter bcrypt
  JWT_TOKEN_SERVICE: 'JwtTokenService',
  COOKIE_SERVICE: 'CookieService',

  // Mappers (obsolète - les mappers sont maintenant statiques)
  DATABASE_MAPPER_FACTORY: 'DatabaseMapperFactory',

  // Configuration
  APP_CONFIG: 'AppConfig',
  DATABASE_CONFIG: 'DatabaseConfig',
  LOGGER_CONFIG: 'LoggerConfig',

  // Passport Strategies
  JWT_STRATEGY: 'JwtStrategy',
  LOCAL_STRATEGY: 'LocalStrategy',
} as const;

// 🎨 Presentation Layer Tokens
export const PRESENTATION_TOKENS = {
  // Controllers
  USER_CONTROLLER: 'UserController',
  AUTH_CONTROLLER: 'AuthController',

  // HTTP Services
  HTTP_SERVICE: 'HttpService',
  VALIDATION_PIPE: 'ValidationPipe',
} as const;

// 🔄 Combined Tokens (pour faciliter l'import)
export const TOKENS = {
  ...APPLICATION_TOKENS,
  ...DOMAIN_TOKENS,
  ...INFRASTRUCTURE_TOKENS,
  ...PRESENTATION_TOKENS,
} as const;

// 📋 Types pour TypeScript
export type ApplicationToken =
  (typeof APPLICATION_TOKENS)[keyof typeof APPLICATION_TOKENS];
export type DomainToken = (typeof DOMAIN_TOKENS)[keyof typeof DOMAIN_TOKENS];
export type InfrastructureToken =
  (typeof INFRASTRUCTURE_TOKENS)[keyof typeof INFRASTRUCTURE_TOKENS];
export type PresentationToken =
  (typeof PRESENTATION_TOKENS)[keyof typeof PRESENTATION_TOKENS];
export type Token = (typeof TOKENS)[keyof typeof TOKENS];

// 🎯 Utilitaires pour validation
export function isValidToken(token: string): token is Token {
  return Object.values(TOKENS).includes(token as Token);
}

export function getTokensByLayer(
  layer: 'application' | 'domain' | 'infrastructure' | 'presentation',
) {
  switch (layer) {
    case 'application':
      return APPLICATION_TOKENS;
    case 'domain':
      return DOMAIN_TOKENS;
    case 'infrastructure':
      return INFRASTRUCTURE_TOKENS;
    case 'presentation':
      return PRESENTATION_TOKENS;
    default:
      throw new Error(`Unknown layer: ${String(layer)}`);
  }
}
