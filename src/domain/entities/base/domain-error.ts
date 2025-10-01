/**
 * 🚨 DOMAIN ERROR - Base Exception
 * ✅ Clean Architecture - Pure Domain Logic
 * ✅ Exception de base pour toutes les erreurs métier
 */

export class DomainError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(message: string, code?: string, context?: Record<string, any>) {
    super(message);
    this.name = "DomainError";
    this.code = code || "DOMAIN_ERROR";
    this.timestamp = new Date();
    this.context = context;

    // Maintenir la stack trace native
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainError);
    }
  }

  toJSON(): Record<string, any> {
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
