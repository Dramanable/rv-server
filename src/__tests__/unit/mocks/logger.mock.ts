/**
 * 🧪 MOCK CENTRALISÉ - Logger
 *
 * Mock réutilisable du Logger pour tous les tests
 * Respecte exactement l'interface Logger
 */

import type { Logger } from "@application/ports/logger.port";

export const createMockLogger = (): jest.Mocked<Logger> => {
  const mockChild = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    audit: jest.fn(),
    child: jest.fn(),
  };

  return {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    audit: jest.fn(),
    child: jest.fn().mockReturnValue(mockChild),
  } as jest.Mocked<Logger>;
};
