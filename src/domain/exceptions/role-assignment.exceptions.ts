/**
 * 🚨 DOMAIN EXCEPTIONS - Role Assignment
 *
 * Exceptions spécifiques au domaine Role Assignment
 * Respectent les principes de Clean Architecture
 */

import { DomainException } from './domain.exception';
import { UserRole } from '@shared/enums/user-role.enum';

/**
 * Exception jetée quand l'assignation de rôle ne respecte pas les contraintes métier
 */
export class InvalidRoleAssignmentError extends DomainException {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'INVALID_ROLE_ASSIGNMENT', details);
  }
}

/**
 * Exception jetée quand une date d'expiration est invalide
 */
export class InvalidExpirationDateError extends DomainException {
  constructor(message: string = 'New expiration date must be in the future') {
    super(message, 'INVALID_EXPIRATION_DATE');
  }
}

/**
 * Exception jetée quand l'ID de business est manquant
 */
export class BusinessIdRequiredError extends DomainException {
  constructor(message: string = 'Business ID is required') {
    super(message, 'BUSINESS_ID_REQUIRED');
  }
}

/**
 * Exception jetée quand une assignation de département n'inclut pas le contexte de location
 */
export class DepartmentContextError extends DomainException {
  constructor(
    message: string = 'Department assignments must include location context',
  ) {
    super(message, 'DEPARTMENT_CONTEXT_REQUIRED');
  }
}

/**
 * Exception jetée quand un rôle ne peut être assigné qu'au niveau business
 */
export class RoleBusinessLevelOnlyError extends DomainException {
  constructor(role: UserRole) {
    super(
      `Role ${role} must be assigned at business level only`,
      'ROLE_BUSINESS_LEVEL_ONLY',
      { role },
    );
  }
}

/**
 * Exception jetée quand un rôle ne peut être assigné qu'au niveau location
 */
export class RoleLocationLevelOnlyError extends DomainException {
  constructor(role: UserRole) {
    super(
      `Role ${role} must be assigned at location level only`,
      'ROLE_LOCATION_LEVEL_ONLY',
      { role },
    );
  }
}

/**
 * Exception jetée quand un rôle ne peut être assigné qu'au niveau department
 */
export class RoleDepartmentLevelOnlyError extends DomainException {
  constructor(role: UserRole) {
    super(
      `Role ${role} must be assigned at department level`,
      'ROLE_DEPARTMENT_LEVEL_ONLY',
      { role },
    );
  }
}

/**
 * Exception jetée pour violation générale des règles d'assignation de contexte
 */
export class RoleContextViolationError extends DomainException {
  constructor(
    message: string,
    role: UserRole,
    context?: Record<string, unknown>,
  ) {
    super(message, 'ROLE_CONTEXT_VIOLATION', { role, ...context });
  }
}
