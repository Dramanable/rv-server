/**
 * 🚨 DOMAIN EXCEPTIONS - Domain Layer
 *
 * Exceptions métier spécifiques au domaine
 * Respecte les principes de Clean Architecture - ZÉRO dépendance framework
 */

/**
 * Exception de base pour toutes les erreurs du domaine
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "DomainError";

    // Préserve la stack trace
    Error.captureStackTrace(this, DomainError);
  }
}

/**
 * Erreur de validation métier
 */
export class DomainValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
  ) {
    super(message, "DOMAIN_VALIDATION_ERROR", { field, value });
    this.name = "DomainValidationError";
  }
}

/**
 * Erreur de règle métier violée
 */
export class BusinessRuleViolationError extends DomainError {
  constructor(
    message: string,
    public readonly rule: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message, "BUSINESS_RULE_VIOLATION", { rule, ...context });
    this.name = "BusinessRuleViolationError";
  }
}

/**
 * Erreur d'état invalide
 */
export class InvalidStateError extends DomainError {
  constructor(
    message: string,
    public readonly currentState: string,
    public readonly expectedState?: string,
  ) {
    super(message, "INVALID_STATE_ERROR", { currentState, expectedState });
    this.name = "InvalidStateError";
  }
}

/**
 * Erreur de contrainte d'intégrité
 */
export class IntegrityConstraintError extends DomainError {
  constructor(
    message: string,
    public readonly constraint: string,
    public readonly violatedValue?: unknown,
  ) {
    super(message, "INTEGRITY_CONSTRAINT_ERROR", { constraint, violatedValue });
    this.name = "IntegrityConstraintError";
  }
}
