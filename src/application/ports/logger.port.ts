/**
 * 🔌 APPLICATION PORT - Logger Interface
 *
 * Interface pour le logging structuré
 * Support de différents niveaux et contextes
 */

export interface Logger {
  /**
   * Log de niveau info
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Log de niveau warning
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Log de niveau error
   */
  error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
  ): void;

  /**
   * Log de niveau debug (dev uniquement)
   */
  debug(message: string, context?: Record<string, unknown>): void;

  /**
   * Log pour audit trail (actions importantes)
   */
  audit(
    action: string,
    userId: string,
    context?: Record<string, unknown>,
  ): void;

  /**
   * Crée un logger avec contexte pré-rempli
   */
  child(context: Record<string, unknown>): Logger;
}
