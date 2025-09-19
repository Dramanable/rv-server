/**
 * 🎯 TOKENS - Injection Tokens pour Clean Architecture
 * Tokens d'injection de dépendances pour découpler les couches
 */

// Use Cases Tokens
export const TOKENS = {
  // Auth Use Cases
  LOGIN_USE_CASE: Symbol('LOGIN_USE_CASE'),
  REGISTER_USE_CASE: Symbol('REGISTER_USE_CASE'),
  LOGOUT_USE_CASE: Symbol('LOGOUT_USE_CASE'),
  REFRESH_TOKEN_USE_CASE: Symbol('REFRESH_TOKEN_USE_CASE'),

  // User Use Cases
  GET_ME_USE_CASE: Symbol('GET_ME_USE_CASE'),

  // Business Use Cases
  LIST_BUSINESS_USE_CASE: Symbol('LIST_BUSINESS_USE_CASE'),

  // Repositories
  USER_REPOSITORY: Symbol('USER_REPOSITORY'),

  // Services
  PASSWORD_SERVICE: Symbol('PASSWORD_SERVICE'),
  TOKEN_SERVICE: Symbol('TOKEN_SERVICE'),
  I18N_SERVICE: Symbol('I18N_SERVICE'),
  LOGGER: Symbol('LOGGER'),

  // Application Services
  STORE_USER_AFTER_LOGIN_SERVICE: Symbol('STORE_USER_AFTER_LOGIN_SERVICE'),
} as const;

export type TokenType = (typeof TOKENS)[keyof typeof TOKENS];
