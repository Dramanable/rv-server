/**
 * 🏗️ Jest Configuration - Tests d'Intégration
 * ✅ Tests avec vraies dépendances (Redis, PostgreSQL, etc.)
 * ✅ Environnement Docker Compose nécessaire
 * ✅ Exécution dans GitHub Actions uniquement
 */

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  displayName: '🏗️ Integration Tests',
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // 📁 Fichiers de test d'intégration uniquement
  testMatch: [
    '<rootDir>/src/__tests__/integration/**/*.spec.ts',
    '<rootDir>/src/__tests__/integration/**/*.test.ts'
  ],
  
  // 🚫 Exclure les tests unitaires
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/__tests__/unit/',
    '/dist/',
    '/coverage/'
  ],
  
  // 📋 Setup et configuration avec vraies dépendances
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/integration-setup.ts'],
  
  // 🔄 Mapping des modules (tsconfig paths)
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { 
      prefix: '<rootDir>/' 
    }),
  },
  
  // 📊 Coverage spécifique à l'intégration
  collectCoverageFrom: [
    'src/infrastructure/**/*.ts',
    'src/presentation/**/*.ts',
    'src/application/use-cases/**/*.ts', // Use cases avec vraies dépendances
    '!**/*.spec.ts',
    '!**/*.test.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!src/main.ts'
  ],
  
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // ⚡ Performance pour l'intégration (plus lent)
  maxWorkers: 1, // Tests séquentiels pour éviter les conflits de BD
  cache: false, // Pas de cache pour éviter les problèmes d'état
  
  // 🎯 Seuils de couverture pour l'intégration
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // 🔧 Transformation et modules
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  
  moduleFileExtensions: ['js', 'json', 'ts'],
  
  // 📝 Reporters pour l'intégration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage/integration',
      outputName: 'junit-integration.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ],
  
  // ⏱️ Timeouts plus longs pour l'intégration
  testTimeout: 30000, // 30 secondes max par test d'intégration
  
  // 🎨 Affichage des résultats
  verbose: true,
  
  // 🔍 Pas de détection de fuites pour l'intégration (connexions persistantes)
  detectLeaks: false,
  detectOpenHandles: false,
  
  // 🧹 Nettoyage manuel entre les tests
  clearMocks: false, // Garder les connexions
  restoreMocks: false,
  resetMocks: false,
  
  // 🏗️ Variables d'environnement spécifiques à l'intégration
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // 🔄 Retry logique pour les tests d'intégration instables
  retry: 2,
  
  // 📋 Hooks globaux
  globalSetup: '<rootDir>/src/__tests__/setup/global-integration-setup.ts',
  globalTeardown: '<rootDir>/src/__tests__/setup/global-integration-teardown.ts',
};
