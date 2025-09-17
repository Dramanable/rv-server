/**
 * 🧪 Setup Tests Unitaires - Configuration globale
 * ✅ Mocks globaux pour tous les tests unitaires
 * ✅ Configuration Jest optimisée pour la rapidité
 * ✅ Isolation complète des dépendances externes
 */

import 'reflect-metadata';

// 🎭 Mocks globaux pour les dépendances externes
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    flushall: jest.fn().mockResolvedValue('OK'),
    status: 'ready',
    on: jest.fn(),
    off: jest.fn(),
  }));
});

// 🗃️ Mock TypeORM
jest.mock('typeorm', () => ({
  Entity: jest.fn(() => jest.fn()),
  PrimaryGeneratedColumn: jest.fn(() => jest.fn()),
  Column: jest.fn(() => jest.fn()),
  CreateDateColumn: jest.fn(() => jest.fn()),
  UpdateDateColumn: jest.fn(() => jest.fn()),
  Repository: jest.fn(),
  Connection: jest.fn(),
  createConnection: jest.fn(),
  getRepository: jest.fn(),
}));

// 📧 Mock services externes (seulement ceux qui sont utilisés)
// jest.mock('nodemailer', () => ({
//   createTransporter: jest.fn(() => ({
//     sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
//   })),
// }));

// 🔐 Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('mocked-hash'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('mocked-salt'),
  hashSync: jest.fn().mockReturnValue('mocked-hash-sync'),
  compareSync: jest.fn().mockReturnValue(true),
}));

// 📝 Mock filesystem
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
}));

// ⏰ Mock setTimeout et setInterval pour les tests déterministes
jest.useFakeTimers();

// 🧹 Configuration globale Jest
beforeEach(() => {
  // Reset tous les mocks entre les tests
  jest.clearAllMocks();
  jest.clearAllTimers();
});

afterEach(() => {
  // Nettoyage après chaque test
  jest.restoreAllMocks();
});

// 🎯 Configuration des variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-unit-tests';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.USER_CACHE_RETENTION_MINUTES = '60';

// 📊 Configuration des timeouts par défaut pour les tests unitaires
jest.setTimeout(5000); // 5 secondes max par test

// 🔍 Intercepter les erreurs console pour des tests plus propres
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Filtrer certaines erreurs connues des tests
    const message = args[0]?.toString() || '';
    if (
      message.includes('Warning: ') ||
      message.includes('ReactDOMTestUtils') ||
      message.includes('act()')
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

// 🎨 Configuration des matchers Jest personnalisés
expect.extend({
  toBeUuid(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID v4`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID v4`,
        pass: false,
      };
    }
  },
  
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
});

// 📋 Types pour les matchers personnalisés
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeUuid(): R;
      toBeValidEmail(): R;
    }
  }
}
