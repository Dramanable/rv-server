/**
 * 🌍 Port d'internationalisation pour les Use Cases
 *
 * Service de traduction avec support des paramètres et langues multiples
 */

export interface I18nService {
  /**
   * Traduit une clé avec paramètres optionnels
   */
  translate(
    key: string,
    params?: Record<string, unknown>,
    lang?: string,
  ): string;

  /**
   * Alias for translate method
   */
  t(key: string, params?: Record<string, unknown>, lang?: string): string;

  /**
   * Définit la langue par défaut
   */
  setDefaultLanguage(lang: string): void;

  /**
   * Vérifie si une clé de traduction existe
   */
  exists(key: string, lang?: string): boolean;
}

// Export de type pour compatibilité
export type { I18nService as I18nPort };
