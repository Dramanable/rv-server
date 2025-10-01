/**
 * DOMAIN REPOSITORIES INDEX
 * ✅ Clean Architecture compliant
 * ✅ Centralized repository interface exports
 * ✅ DDD and SOLID principles
 */

// Import types for use in type definitions
import type { UserRepository } from "./user.repository.interface";
import type { BusinessRepository } from "./business.repository.interface";
import type { CalendarRepository } from "./calendar.repository.interface";
import type { ServiceRepository } from "./service.repository.interface";
import type { StaffRepository } from "./staff.repository.interface";
import type { AppointmentRepository } from "./appointment.repository.interface";
import type { PasswordResetTokenRepository } from "./password-reset-token.repository.interface";
import type { RefreshTokenRepository } from "./refresh-token.repository.interface";

// Main Entity Repositories
export type { UserRepository } from "./user.repository.interface";
export { USER_REPOSITORY } from "./user.repository.interface";
export type { BusinessRepository } from "./business.repository.interface";
export { BUSINESS_REPOSITORY } from "./business.repository.interface";
export type { CalendarRepository } from "./calendar.repository.interface";
export { CALENDAR_REPOSITORY } from "./calendar.repository.interface";
export type { ServiceRepository } from "./service.repository.interface";
export { SERVICE_REPOSITORY } from "./service.repository.interface";
export type { StaffRepository } from "./staff.repository.interface";
export { STAFF_REPOSITORY } from "./staff.repository.interface";
export type { AppointmentRepository } from "./appointment.repository.interface";
export { APPOINTMENT_REPOSITORY } from "./appointment.repository.interface";

// Security Token Repositories
export type { PasswordResetTokenRepository } from "./password-reset-token.repository.interface";
export { PASSWORD_RESET_TOKEN_REPOSITORY } from "./password-reset-token.repository.interface";
export type { RefreshTokenRepository } from "./refresh-token.repository.interface";
export { REFRESH_TOKEN_REPOSITORY } from "./refresh-token.repository.interface";

// Repository Token Collection for DI
export const DOMAIN_REPOSITORIES = {
  USER_REPOSITORY: "USER_REPOSITORY",
  BUSINESS_REPOSITORY: "BUSINESS_REPOSITORY",
  CALENDAR_REPOSITORY: "CALENDAR_REPOSITORY",
  SERVICE_REPOSITORY: "SERVICE_REPOSITORY",
  STAFF_REPOSITORY: "STAFF_REPOSITORY",
  APPOINTMENT_REPOSITORY: "APPOINTMENT_REPOSITORY",
  PASSWORD_RESET_TOKEN_REPOSITORY: "PASSWORD_RESET_TOKEN_REPOSITORY",
  REFRESH_TOKEN_REPOSITORY: "REFRESH_TOKEN_REPOSITORY",
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
