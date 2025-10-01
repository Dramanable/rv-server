/**
 * 🚨 DOMAIN EXCEPTIONS - Value Objects
 *
 * Exceptions génériques pour tous les Value Objects
 * Respectent les principes de Clean Architecture
 */

import { DomainException } from "./domain.exception";

/**
 * Exception de base pour tous les Value Objects
 */
export class ValueObjectException extends DomainException {
  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message, code, context);
  }
}

/**
 * Exception jetée pour une valeur invalide dans un Value Object
 */
export class InvalidValueError extends ValueObjectException {
  constructor(fieldName: string, value: unknown, reason?: string) {
    const message = reason
      ? `Invalid ${fieldName}: ${reason}`
      : `Invalid ${fieldName}: ${String(value)}`;

    super(message, "INVALID_VALUE", { fieldName, value, reason });
  }
}

/**
 * Exception jetée pour une valeur requise manquante
 */
export class RequiredValueError extends ValueObjectException {
  constructor(fieldName: string) {
    super(`${fieldName} is required`, "REQUIRED_VALUE", { fieldName });
  }
}

/**
 * Exception jetée pour une valeur trop courte
 */
export class ValueTooShortError extends ValueObjectException {
  constructor(fieldName: string, minLength: number, actualLength: number) {
    super(
      `${fieldName} must be at least ${minLength} characters long (got ${actualLength})`,
      "VALUE_TOO_SHORT",
      { fieldName, minLength, actualLength },
    );
  }
}

/**
 * Exception jetée pour une valeur trop longue
 */
export class ValueTooLongError extends ValueObjectException {
  constructor(fieldName: string, maxLength: number, actualLength: number) {
    super(
      `${fieldName} must be at most ${maxLength} characters long (got ${actualLength})`,
      "VALUE_TOO_LONG",
      { fieldName, maxLength, actualLength },
    );
  }
}

/**
 * Exception jetée pour un format de valeur invalide
 */
export class InvalidFormatError extends ValueObjectException {
  constructor(fieldName: string, value: string, expectedFormat: string) {
    super(
      `Invalid ${fieldName} format: ${value} (expected: ${expectedFormat})`,
      "INVALID_FORMAT",
      { fieldName, value, expectedFormat },
    );
  }
}

/**
 * Exception jetée pour une valeur numérique hors limites
 */
export class ValueOutOfRangeError extends ValueObjectException {
  constructor(fieldName: string, value: number, min: number, max: number) {
    super(
      `${fieldName} must be between ${min} and ${max} (got ${value})`,
      "VALUE_OUT_OF_RANGE",
      { fieldName, value, min, max },
    );
  }
}

/**
 * Exception jetée pour un array vide quand des éléments sont requis
 */
export class EmptyArrayError extends ValueObjectException {
  constructor(fieldName: string) {
    super(`${fieldName} cannot be empty`, "EMPTY_ARRAY", { fieldName });
  }
}

/**
 * Exception jetée pour un élément manquant dans un array
 */
export class ElementNotFoundError extends ValueObjectException {
  constructor(fieldName: string, element: unknown) {
    super(
      `Element not found in ${fieldName}: ${String(element)}`,
      "ELEMENT_NOT_FOUND",
      { fieldName, element },
    );
  }
}

/**
 * Exception jetée pour un élément dupliqué dans un array
 */
export class DuplicateElementError extends ValueObjectException {
  constructor(fieldName: string, element: unknown) {
    super(
      `Duplicate element in ${fieldName}: ${String(element)}`,
      "DUPLICATE_ELEMENT",
      { fieldName, element },
    );
  }
}

/**
 * Exception jetée pour une valeur dupliquée
 */
export class DuplicateValueError extends ValueObjectException {
  constructor(fieldName: string, value: unknown) {
    super(
      `Duplicate value for ${fieldName}: ${String(value)}`,
      "DUPLICATE_VALUE",
      { fieldName, value },
    );
  }
}

/**
 * Exception jetée pour une valeur non trouvée
 */
export class ValueNotFoundError extends ValueObjectException {
  constructor(fieldName: string, value: unknown) {
    super(
      `Value not found for ${fieldName}: ${String(value)}`,
      "VALUE_NOT_FOUND",
      { fieldName, value },
    );
  }
}
