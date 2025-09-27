/**
 * 📝 LOGGER INTERFACE
 * ✅ Clean Architecture compliant - Application layer abstraction
 * ✅ Used by use cases for logging business operations
 */

export interface ILogger {
  /**
   * Log informational messages
   */
  log(message: string, context?: any): void;

  /**
   * Log error messages with optional context
   */
  error(message: string, context?: any): void;

  /**
   * Log warning messages
   */
  warn(message: string, context?: any): void;

  /**
   * Log debug messages
   */
  debug(message: string, context?: any): void;
}
