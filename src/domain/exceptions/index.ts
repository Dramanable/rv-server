/**
 * 🚨 Domain Exceptions Index
 * Clean Architecture - Domain Layer Exceptions
 *
 * @description Centralized export of all domain exceptions
 * @author Clean Architecture Implementation
 */

// Base domain exceptions
export * from "./domain.exception";

// Entity-specific exceptions
export * from "./appointment.exceptions";
export * from "./calendar-type.exceptions";
export * from "./client.exceptions";
export * from "./money.exceptions";
export * from "./password-reset.exceptions";
export * from "./permission.exceptions";
export * from "./professional-role.exceptions";
export * from "./professional.exceptions";
export * from "./rbac-business-context.exceptions";
export * from "./role-assignment.exceptions";
export * from "./service-type.exceptions";
export * from "./service.exceptions";
export * from "./skill.exceptions";
export * from "./staff.exceptions";
export * from "./value-object.exceptions";

// Auth exceptions
export { AuthenticationError } from "./auth.exceptions";

// User exceptions
export { UserNotFoundError } from "./user.exceptions";
