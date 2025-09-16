/**
 * 🚨 Exceptions de domaine - Clean Architecture
 *
 * Ces exceptions représentent des violations de règles métier
 * Elles sont indépendantes de toute technologie (base de données, API, etc.)
 */

export abstract class DomainException extends Error {
  public readonly code: string;
  public readonly timestamp: Date;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();

    // Maintient la stack trace pour le debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidEmailException extends DomainException {
  constructor(email: string) {
    super(`Invalid email format: ${email}`, 'INVALID_EMAIL');
  }
}

export class InvalidNameException extends DomainException {
  constructor(name: string) {
    super(`Invalid name: ${name}`, 'INVALID_NAME');
  }
}

export class EmptyFieldException extends DomainException {
  constructor(fieldName: string) {
    super(`${fieldName} cannot be empty`, 'EMPTY_FIELD');
  }
}
