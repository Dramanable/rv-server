/**
 * 🌐 I18N SERVICE INTERFACE
 * ✅ Clean Architecture compliant - Application layer abstraction
 * ✅ Used by use cases for internationalized messages
 */

export interface I18nService {
  /**
   * Translate a key to localized text
   */
  t(key: string, options?: Record<string, any>): string;
}
