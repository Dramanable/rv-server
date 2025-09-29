/**
 * 🚨 DOMAIN EXCEPTIONS - RBAC Business Context
 *
 * Exceptions spécifiques au domaine RBAC Business Context
 * Respectent les principes de Clean Architecture
 */

import { DomainException } from './domain.exception';

/**
 * Exception jetée quand l'ID de contexte est manquant pour la reconstruction
 */
export class ContextIdRequiredError extends DomainException {
  constructor(message: string = 'Context ID is required for reconstruction') {
    super(message, 'CONTEXT_ID_REQUIRED');
  }
}

/**
 * Exception jetée quand le nom du contexte est manquant ou vide
 */
export class ContextNameRequiredError extends DomainException {
  constructor(message: string = 'Context name is required') {
    super(message, 'CONTEXT_NAME_REQUIRED');
  }
}

/**
 * Exception jetée pour un type de contexte invalide
 */
export class InvalidContextTypeError extends DomainException {
  constructor(contextType: string) {
    super(`Invalid context type: ${contextType}`, 'INVALID_CONTEXT_TYPE', {
      contextType,
    });
  }
}

/**
 * Exception jetée quand un contexte business a un parent (ce qui n'est pas autorisé)
 */
export class BusinessContextCannotHaveParentError extends DomainException {
  constructor(message: string = 'Business context cannot have parent') {
    super(message, 'BUSINESS_CONTEXT_CANNOT_HAVE_PARENT');
  }
}

/**
 * Exception jetée quand un contexte non-business n'a pas de parent (requis)
 */
export class ContextMustHaveParentError extends DomainException {
  constructor(contextType: string) {
    super(
      `${contextType} context must have parent`,
      'CONTEXT_MUST_HAVE_PARENT',
      { contextType },
    );
  }
}

/**
 * Exception jetée quand une location existe déjà
 */
export class LocationAlreadyExistsError extends DomainException {
  constructor(locationId: string) {
    super(`Location ${locationId} already exists`, 'LOCATION_ALREADY_EXISTS', {
      locationId,
    });
  }
}

/**
 * Exception jetée quand une location n'est pas trouvée
 */
export class LocationNotFoundError extends DomainException {
  constructor(locationId: string) {
    super(`Location ${locationId} not found`, 'LOCATION_NOT_FOUND', {
      locationId,
    });
  }
}

/**
 * Exception jetée quand un département existe déjà
 */
export class DepartmentAlreadyExistsError extends DomainException {
  constructor(departmentId: string, locationId: string) {
    super(
      `Department ${departmentId} already exists in location ${locationId}`,
      'DEPARTMENT_ALREADY_EXISTS',
      { departmentId, locationId },
    );
  }
}

/**
 * Exception jetée quand le nom du contexte est trop court
 */
export class ContextNameTooShortError extends DomainException {
  constructor(
    message: string = 'Context name must be at least 2 characters long',
  ) {
    super(message, 'CONTEXT_NAME_TOO_SHORT');
  }
}

/**
 * Exception jetée quand le nom du contexte est trop long
 */
export class ContextNameTooLongError extends DomainException {
  constructor(
    message: string = 'Context name must be less than 200 characters',
  ) {
    super(message, 'CONTEXT_NAME_TOO_LONG');
  }
}
