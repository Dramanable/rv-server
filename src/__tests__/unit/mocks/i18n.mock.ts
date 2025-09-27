/**
 * 🧪 MOCK CENTRALISÉ - I18nService
 *
 * Mock réutilisable du I18nService pour tous les tests
 * Respecte exactement l'interface I18nService
 */

import type { I18nService } from "@application/ports/i18n.port";

export const createMockI18nService = (): jest.Mocked<I18nService> => {
  return {
    translate: jest.fn().mockReturnValue("Translated message"),
    t: jest.fn().mockReturnValue("Translated message"),
    setDefaultLanguage: jest.fn(),
    exists: jest.fn().mockReturnValue(true),
  } as jest.Mocked<I18nService>;
};
