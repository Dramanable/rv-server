/**
 * 🚨 Exceptions de domaine - Clean Architecture
 *
 * Ces exceptions représentent des violations de règles métier
 * Elles sont indépendantes de toute technologie (base de données, API, etc.)
 */

export abstract class DomainException extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    this.context = context;

    // Maintient la stack trace pour le debugging
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Sérialisation pour logging et debugging
   */
  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
    };
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
