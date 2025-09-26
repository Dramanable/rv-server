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
  AUDIT_SERVICE: 'IAuditService', // ✅ NOUVEAU: Port pour audit trail

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

  // 🌩️ AWS S3 Image Management Use Cases
  UPLOAD_BUSINESS_IMAGE_USE_CASE: 'UploadBusinessImageUseCase',
  ADD_IMAGE_TO_GALLERY_USE_CASE: 'AddImageToGalleryUseCase',
  UPDATE_BUSINESS_SEO_USE_CASE: 'UpdateBusinessSeoUseCase',

  // 🖼️ Business Gallery Use Cases
  CREATE_BUSINESS_GALLERY_USE_CASE: 'CreateBusinessGalleryUseCase',
  GET_BUSINESS_GALLERY_USE_CASE: 'GetBusinessGalleryUseCase',
  UPDATE_BUSINESS_GALLERY_USE_CASE: 'UpdateBusinessGalleryUseCase',
  DELETE_BUSINESS_GALLERY_USE_CASE: 'DeleteBusinessGalleryUseCase',

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
  // 📅 Staff Availability Use Cases - NEW
  SET_STAFF_AVAILABILITY_USE_CASE: 'SetStaffAvailabilityUseCase',
  GET_STAFF_AVAILABILITY_USE_CASE: 'GetStaffAvailabilityUseCase',
  GET_AVAILABLE_STAFF_USE_CASE: 'GetAvailableStaffUseCase',

  // Appointment Use Cases
  BOOK_APPOINTMENT_USE_CASE: 'BookAppointmentUseCase',
  GET_APPOINTMENT_USE_CASE: 'GetAppointmentUseCase',
  GET_APPOINTMENT_BY_ID_USE_CASE: 'GetAppointmentByIdUseCase',
  LIST_APPOINTMENTS_USE_CASE: 'ListAppointmentsUseCase',
  UPDATE_APPOINTMENT_USE_CASE: 'UpdateAppointmentUseCase',
  CANCEL_APPOINTMENT_USE_CASE: 'CancelAppointmentUseCase',
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
  STORE_USER_AFTER_LOGIN_SERVICE: 'StoreUserAfterLoginService',

  // ✅ NEW: Skills Use Cases
  CREATE_SKILL_USE_CASE: 'CreateSkillUseCase',
  GET_SKILL_BY_ID_USE_CASE: 'GetSkillByIdUseCase',
  LIST_SKILLS_USE_CASE: 'ListSkillsUseCase',
  UPDATE_SKILL_USE_CASE: 'UpdateSkillUseCase',
  DELETE_SKILL_USE_CASE: 'DeleteSkillUseCase',

  // ✅ NEW: Service Types Use Cases
  CREATE_SERVICE_TYPE_USE_CASE: 'CreateServiceTypeUseCase',
  GET_SERVICE_TYPE_BY_ID_USE_CASE: 'GetServiceTypeByIdUseCase',
  LIST_SERVICE_TYPES_USE_CASE: 'ListServiceTypesUseCase',
  UPDATE_SERVICE_TYPE_USE_CASE: 'UpdateServiceTypeUseCase',
  DELETE_SERVICE_TYPE_USE_CASE: 'DeleteServiceTypeUseCase',

  // ✅ NEW: Calendar Types Use Cases
  CREATE_CALENDAR_TYPE_USE_CASE: 'CreateCalendarTypeUseCase',
  GET_CALENDAR_TYPE_BY_ID_USE_CASE: 'GetCalendarTypeByIdUseCase',
  LIST_CALENDAR_TYPES_USE_CASE: 'ListCalendarTypesUseCase',
  UPDATE_CALENDAR_TYPE_USE_CASE: 'UpdateCalendarTypeUseCase',
  DELETE_CALENDAR_TYPE_USE_CASE: 'DeleteCalendarTypeUseCase',

  // ✅ NEW: Professional Use Cases
  CREATE_PROFESSIONAL_USE_CASE: 'CreateProfessionalUseCase',
  GET_PROFESSIONAL_BY_ID_USE_CASE: 'GetProfessionalByIdUseCase',
  LIST_PROFESSIONALS_USE_CASE: 'ListProfessionalsUseCase',
  UPDATE_PROFESSIONAL_USE_CASE: 'UpdateProfessionalUseCase',
  DELETE_PROFESSIONAL_USE_CASE: 'DeleteProfessionalUseCase',

  // ✅ NEW: RBAC Use Cases
  ASSIGN_ROLE_USE_CASE: 'AssignRoleUseCase',
  LIST_ROLE_ASSIGNMENTS_USE_CASE: 'ListRoleAssignmentsUseCase',
  REVOKE_ROLE_USE_CASE: 'RevokeRoleUseCase',
  BATCH_REVOKE_ROLES_USE_CASE: 'BatchRevokeRolesUseCase',

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

  // ✅ NEW: Entity Repositories
  SKILL_REPOSITORY: 'SkillRepository',
  SERVICE_TYPE_REPOSITORY: 'ServiceTypeRepository',
  CALENDAR_TYPE_REPOSITORY: 'CalendarTypeRepository',
  PROFESSIONAL_REPOSITORY: 'ProfessionalRepository',

  // ✅ NEW: RBAC Repositories
  ROLE_ASSIGNMENT_REPOSITORY: 'RoleAssignmentRepository',
  RBAC_BUSINESS_CONTEXT_REPOSITORY: 'RbacBusinessContextRepository',

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

  // 🌩️ AWS S3 Services
  AWS_S3_CONFIG: 'AwsS3Config',
  AWS_S3_IMAGE_SERVICE: 'AwsS3ImageService',

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
