/**
 * 🧪 Test Mocks - Mocks Typés pour Tests Unitaires
 * ✅ Mocks robustes pour éviter les erreurs de type
 * ✅ Compatible avec les interfaces Clean Architecture
 */

import type { ICacheService } from '@application/ports/cache.port';
import type { I18nService } from '@application/ports/i18n.port';
import type { Logger } from '@application/ports/logger.port';
import type { IPasswordService } from '@application/ports/password.service.interface';
import type { UserRepository } from '@domain/repositories/user.repository.interface';
import type { ExecutionContext } from '@nestjs/common';
import type { Request, Response } from 'express';

// 🎭 Mock ExecutionContext
export const createMockExecutionContext = (
  request?: Partial<Request>,
): jest.Mocked<ExecutionContext> => {
  const mockRequest = {
    path: '/test',
    method: 'GET',
    ip: '127.0.0.1',
    headers: { 'user-agent': 'test-agent' },
    ...request,
  } as Request;

  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue({} as Response),
    }),
    getHandler: jest.fn().mockReturnValue({ name: 'testHandler' }),
    getClass: jest.fn().mockReturnValue({ name: 'TestController' }),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  } as jest.Mocked<ExecutionContext>;
};

// 🗄️ Mock UserRepository (méthodes principales pour les tests)
export const createMockUserRepository = () =>
  ({
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    search: jest.fn(),
    findByRole: jest.fn(),
    emailExists: jest.fn(),
    existsByUsername: jest.fn(),
    updatePassword: jest.fn(),
    updateActiveStatus: jest.fn(),
    countSuperAdmins: jest.fn(),
    count: jest.fn(),
    // Méthodes supplémentaires (si nécessaires dans les tests)
    countWithFilters: jest.fn(),
    update: jest.fn(),
    updateBatch: jest.fn(),
    deleteBatch: jest.fn(),
    export: jest.fn(),
  }) as jest.Mocked<UserRepository>;

// 🗂️ Mock CacheService
export const createMockCacheService = (): jest.Mocked<ICacheService> => ({
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  deletePattern: jest.fn(),
  invalidateUserCache: jest.fn(),
});

// 📝 Mock Logger
export const createMockLogger = (): jest.Mocked<Logger> => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  audit: jest.fn(),
  child: jest.fn().mockReturnThis(),
});

// 🌐 Mock I18nService
export const createMockI18nService = (): jest.Mocked<I18nService> => ({
  translate: jest.fn().mockReturnValue('Mocked message'),
  t: jest.fn().mockReturnValue('Mocked message'),
  setDefaultLanguage: jest.fn(),
  exists: jest.fn().mockReturnValue(true),
});

// 🔐 Mock PasswordService
export const createMockPasswordService = (): jest.Mocked<IPasswordService> => ({
  hash: jest.fn(),
  verify: jest.fn(),
});

// 🎯 Mock ConfigService
export const createMockConfigService = () => ({
  get: jest.fn().mockImplementation((key: string) => {
    const config = {
      'jwt.secret': 'test-secret',
      'jwt.expiresIn': '15m',
      'jwt.refreshExpiresIn': '7d',
    };
    return config[key as keyof typeof config];
  }),
});
