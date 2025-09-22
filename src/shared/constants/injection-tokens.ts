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
  GET_USER_BY_ID_USE_CASE: 'GetUserByIdUseCase',
  GET_ME_USE_CASE: 'GetMeUseCase',
  UPDATE_USER_USE_CASE: 'UpdateUserUseCase',
  DELETE_USER_USE_CASE: 'DeleteUserUseCase',
  LIST_USERS_USE_CASE: 'ListUsersUseCase',
  LOGIN_USE_CASE: 'LoginUseCase',
  REGISTER_USE_CASE: 'RegisterUseCase',
  REFRESH_TOKEN_USE_CASE: 'RefreshTokenUseCase',
  LOGOUT_USE_CASE: 'LogoutUseCase',

  // BusinessSector Use Cases
  CREATE_BUSINESS_SECTOR_USE_CASE: 'CreateBusinessSectorUseCase',
  LIST_BUSINESS_SECTORS_USE_CASE: 'ListBusinessSectorsUseCase',
  UPDATE_BUSINESS_SECTOR_USE_CASE: 'UpdateBusinessSectorUseCase',
  DELETE_BUSINESS_SECTOR_USE_CASE: 'DeleteBusinessSectorUseCase',

  // Business Use Cases
  CREATE_BUSINESS_USE_CASE: 'CreateBusinessUseCase',
  GET_BUSINESS_USE_CASE: 'GetBusinessUseCase',
  LIST_BUSINESS_USE_CASE: 'ListBusinessUseCase',
  UPDATE_BUSINESS_USE_CASE: 'UpdateBusinessUseCase',
  DELETE_BUSINESS_USE_CASE: 'DeleteBusinessUseCase',
  MANAGE_BUSINESS_HOURS_USE_CASE: 'ManageBusinessHoursUseCase',

  // Calendar Use Cases
  CREATE_CALENDAR_USE_CASE: 'CreateCalendarUseCase',
  GET_CALENDAR_USE_CASE: 'GetCalendarUseCase',
  LIST_CALENDARS_USE_CASE: 'ListCalendarsUseCase',
  UPDATE_CALENDAR_USE_CASE: 'UpdateCalendarUseCase',
  DELETE_CALENDAR_USE_CASE: 'DeleteCalendarUseCase',

  // Service Use Cases
  CREATE_SERVICE_USE_CASE: 'CreateServiceUseCase',
  GET_SERVICE_USE_CASE: 'GetServiceUseCase',
  LIST_SERVICES_USE_CASE: 'ListServicesUseCase',
  UPDATE_SERVICE_USE_CASE: 'UpdateServiceUseCase',
  DELETE_SERVICE_USE_CASE: 'DeleteServiceUseCase',

  // Staff Use Cases
  CREATE_STAFF_USE_CASE: 'CreateStaffUseCase',
  GET_STAFF_USE_CASE: 'GetStaffUseCase',
  LIST_STAFF_USE_CASE: 'ListStaffUseCase',
  UPDATE_STAFF_USE_CASE: 'UpdateStaffUseCase',
  DELETE_STAFF_USE_CASE: 'DeleteStaffUseCase',

  // Appointment Use Cases
  BOOK_APPOINTMENT_USE_CASE: 'BookAppointmentUseCase',
  GET_APPOINTMENT_USE_CASE: 'GetAppointmentUseCase',
  LIST_APPOINTMENTS_USE_CASE: 'ListAppointmentsUseCase',
  GET_AVAILABLE_SLOTS_USE_CASE: 'GetAvailableSlotsUseCase',

  // Notification Use Cases
  SEND_NOTIFICATION_USE_CASE: 'SendNotificationUseCase',
  SEND_BULK_NOTIFICATION_USE_CASE: 'SendBulkNotificationUseCase',

  // Notification Services
  NOTIFICATION_SERVICE: 'NotificationService',
  USER_SEGMENTATION_SERVICE: 'UserSegmentationService',
  CAMPAIGN_SERVICE: 'CampaignService',

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
  BUSINESS_SECTOR_REPOSITORY: 'BusinessSectorRepository',
  BUSINESS_REPOSITORY: 'BusinessRepository',
  CALENDAR_REPOSITORY: 'CalendarRepository',
  SERVICE_REPOSITORY: 'ServiceRepository',
  STAFF_REPOSITORY: 'StaffRepository',
  APPOINTMENT_REPOSITORY: 'AppointmentRepository',
  NOTIFICATION_REPOSITORY: 'NotificationRepository',

  // Domain Services
  USER_DOMAIN_SERVICE: 'UserDomainService',
  PASSWORD_DOMAIN_SERVICE: 'PasswordDomainService',
  EMAIL_DOMAIN_SERVICE: 'EmailDomainService',
  PERMISSION_SERVICE: 'IPermissionService',
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
  TYPEORM_BUSINESS_SECTOR_REPOSITORY: 'TypeOrmBusinessSectorRepository',

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
