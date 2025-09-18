/**
 * 🏛️ Domain Exceptions
 * ✅ Clean Architecture - Domain Layer
 * ✅ Business rule violations and domain errors
 */

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string,
    context?: Record<string, unknown>,
  ) {
    super(message, 'VALIDATION_ERROR', { field, ...context });
    this.name = 'ValidationError';
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(
    message: string,
    public readonly rule?: string,
    context?: Record<string, unknown>,
  ) {
    super(message, 'BUSINESS_RULE_VIOLATION', { rule, ...context });
    this.name = 'BusinessRuleViolationError';
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(
    entityName: string,
    identifier: string | Record<string, unknown>,
    context?: Record<string, unknown>,
  ) {
    super(`${entityName} not found`, 'ENTITY_NOT_FOUND', {
      entityName,
      identifier,
      ...context,
    });
    this.name = 'EntityNotFoundError';
  }
}

export class DuplicateEntityError extends DomainError {
  constructor(
    entityName: string,
    field: string,
    value: string,
    context?: Record<string, unknown>,
  ) {
    super(
      `${entityName} with ${field} '${value}' already exists`,
      'DUPLICATE_ENTITY',
      { entityName, field, value, ...context },
    );
    this.name = 'DuplicateEntityError';
  }
}

export class AuthenticationError extends DomainError {
  constructor(
    message: string = 'Authentication failed',
    context?: Record<string, unknown>,
  ) {
    super(message, 'AUTHENTICATION_ERROR', context);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends DomainError {
  constructor(
    message: string = 'Access denied',
    public readonly requiredPermission?: string,
    context?: Record<string, unknown>,
  ) {
    super(message, 'AUTHORIZATION_ERROR', { requiredPermission, ...context });
    this.name = 'AuthorizationError';
  }
}

export class InvalidPasswordError extends DomainError {
  constructor(
    message: string = 'Invalid password',
    context?: Record<string, unknown>,
  ) {
    super(message, 'INVALID_PASSWORD', context);
    this.name = 'InvalidPasswordError';
  }
}

export class ExpiredTokenError extends DomainError {
  constructor(
    message: string = 'Token has expired',
    context?: Record<string, unknown>,
  ) {
    super(message, 'EXPIRED_TOKEN', context);
    this.name = 'ExpiredTokenError';
  }
}

export class InvalidTokenError extends DomainError {
  constructor(
    message: string = 'Invalid token',
    context?: Record<string, unknown>,
  ) {
    super(message, 'INVALID_TOKEN', context);
    this.name = 'InvalidTokenError';
  }
}
