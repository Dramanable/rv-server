/**
 * 📁 DOMAIN REPOSITORIES INDEX
 * ✅ Clean Architecture compliant
 * ✅ Centralized repository interface exports
 * ✅ DDD and SOLID principles
 */

// Main Entity Repositories
export { UserRepository, USER_REPOSITORY } from './user.repository.interface';
export { BusinessRepository, BUSINESS_REPOSITORY } from './business.repository.interface';
export { CalendarRepository, CALENDAR_REPOSITORY } from './calendar.repository.interface';
export { ServiceRepository, SERVICE_REPOSITORY } from './service.repository.interface';
export { StaffRepository, STAFF_REPOSITORY } from './staff.repository.interface';
export { AppointmentRepository, APPOINTMENT_REPOSITORY } from './appointment.repository.interface';

// Security Token Repositories
export { PasswordResetTokenRepository, PASSWORD_RESET_TOKEN_REPOSITORY } from './password-reset-token.repository.interface';
export { RefreshTokenRepository, REFRESH_TOKEN_REPOSITORY } from './refresh-token.repository.interface';

// Repository Token Collection for DI
export const DOMAIN_REPOSITORIES = {
  USER_REPOSITORY,
  BUSINESS_REPOSITORY,
  CALENDAR_REPOSITORY,
  SERVICE_REPOSITORY,
  STAFF_REPOSITORY,
  APPOINTMENT_REPOSITORY,
  PASSWORD_RESET_TOKEN_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
} as const;

// Repository Interface Collection for Type Safety
export type DomainRepositories = {
  [DOMAIN_REPOSITORIES.USER_REPOSITORY]: UserRepository;
  [DOMAIN_REPOSITORIES.BUSINESS_REPOSITORY]: BusinessRepository;
  [DOMAIN_REPOSITORIES.CALENDAR_REPOSITORY]: CalendarRepository;
  [DOMAIN_REPOSITORIES.SERVICE_REPOSITORY]: ServiceRepository;
  [DOMAIN_REPOSITORIES.STAFF_REPOSITORY]: StaffRepository;
  [DOMAIN_REPOSITORIES.APPOINTMENT_REPOSITORY]: AppointmentRepository;
  [DOMAIN_REPOSITORIES.PASSWORD_RESET_TOKEN_REPOSITORY]: PasswordResetTokenRepository;
  [DOMAIN_REPOSITORIES.REFRESH_TOKEN_REPOSITORY]: RefreshTokenRepository;
};
