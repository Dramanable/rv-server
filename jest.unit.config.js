/**
 * 🧪 Jest Configuration - Tests Unitaires
 * ✅ Tests rapides avec mocks complets
 * ✅ Pas de dépendances externes (Redis, PostgreSQL, etc.)
 * ✅ Idéal pour le développement local et CI rapide
 */

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  displayName: '🧪 Unit Tests',
  preset: 'ts-jest',
  testEnvironment: 'node',

  // 📁 Fichiers de test uniquement unitaires
  testMatch: [
    '<rootDir>/src/__tests__/unit/**/*.spec.ts',
    '<rootDir>/src/__tests__/unit/**/*.test.ts'
  ],

  // 🚫 Exclure les tests d'intégration et tests temporaires
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/__tests__/integration/',
    '<rootDir>/src/__tests__/unit/infrastructure/security/temp/',
    '/dist/',
    '/coverage/'
  ],

  // 📋 Setup et configuration
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/unit-setup.ts'],

  // 🔄 Mapping des modules (tsconfig paths)
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/'
    }),
  },

  // 📊 Coverage (couverture de code)
  collectCoverageFrom: [
    'src/domain/**/*.ts',
    'src/application/**/*.ts',
    'src/infrastructure/**/*.ts',
    'src/presentation/**/*.ts',
    'src/shared/**/*.ts',
    '!**/*.spec.ts',
    '!**/*.test.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!src/main.ts',
    '!src/**/*.module.ts'
  ],

  coverageDirectory: 'coverage/unit',
  coverageReporters: ['text', 'lcov', 'html'],

  // ⚡ Performance pour les tests unitaires
  maxWorkers: '50%',
  cache: true,

  // 🎯 Seuils de couverture pour les tests unitaires
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // 🏛️ Domain doit avoir 95% de couverture (logique critique)
    './src/domain/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    // 🏗️ Application doit avoir 90% de couverture (business logic)
    './src/application/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },

  // 🔧 Transformation et modules
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  moduleFileExtensions: ['js', 'json', 'ts'],

  // 📝 Reporters personnalisés
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage/unit',
      outputName: 'junit-unit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ],

  // ⏱️ Timeouts appropriés pour les tests unitaires
  testTimeout: 5000, // 5 secondes max par test unitaire

  // 🎨 Affichage des résultats
  verbose: true,

  // 🔍 Détection des fuites mémoire (désactivée pour éviter les faux positifs avec bcrypt/Redis)
  detectLeaks: false,
  detectOpenHandles: false,

  // 🧹 Nettoyage entre les tests
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
};
