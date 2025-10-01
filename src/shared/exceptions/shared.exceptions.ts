/**
 * 🚨 SHARED EXCEPTIONS - Request Types
 *
 * Exceptions pour la couche shared / utilitaires communs
 * Respectent les principes de Clean Architecture
 */

export class SharedException extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    this.context = context;

    // Maintient la stack trace pour le debugging
    Error.captureStackTrace(this, this.constructor);
  }

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

/**
 * Exception jetée quand l'utilisateur n'est pas authentifié
 */
export class UserNotAuthenticatedError extends SharedException {
  constructor(message: string = "User not authenticated") {
    super(message, "USER_NOT_AUTHENTICATED");
  }
}

/**
 * Exception jetée quand l'utilisateur n'est pas authentifié et aucun fallback n'est fourni
 */
export class UserNotAuthenticatedNoFallbackError extends SharedException {
  constructor(
    message: string = "User not authenticated and no fallback provided",
  ) {
    super(message, "USER_NOT_AUTHENTICATED_NO_FALLBACK");
  }
}

/**
 * Exception jetée quand l'opération est requise pour AppContext
 */
export class OperationRequiredError extends SharedException {
  constructor(message: string = "Operation is required for AppContext") {
    super(message, "OPERATION_REQUIRED");
  }
}

/**
 * Exception jetée pour une couche inconnue
 */
export class UnknownLayerError extends SharedException {
  constructor(layer: unknown) {
    super(`Unknown layer: ${String(layer)}`, "UNKNOWN_LAYER", { layer });
  }
}

/**
 * Exception jetée quand le nom d'opération est requis
 */
export class OperationNameRequiredError extends SharedException {
  constructor(message: string = "Operation name is required") {
    super(message, "OPERATION_NAME_REQUIRED");
  }
}

/**
 * 🏗️ BASE EXCEPTION POUR LA COUCHE INFRASTRUCTURE
 */
export class InfrastructureException extends SharedException {
  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message, code, context);
    this.name = "InfrastructureException";
  }
}
