/**
 * 🧪 Mock I18n Service pour les tests Application
 *
 * SOLID DIP: Application ne doit pas dépendre d'Infrastructure
 */

import type { I18nService } from "../ports/i18n.port";

export class MockI18nService implements I18nService {
  private defaultLanguage = "fr";

  t(key: string): string {
    // Retourne la clé directement pour les tests
    return key;
  }

  translate(key: string): string {
    return this.t(key);
  }

  setDefaultLanguage(lang: string): void {
    this.defaultLanguage = lang;
  }

  exists(): boolean {
    // Dans les tests, on assume que toutes les clés existent
    return true;
  }
}
