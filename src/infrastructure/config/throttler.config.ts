import { ThrottlerModuleOptions } from "@nestjs/throttler";
import { ConfigService } from "@nestjs/config";
import { ExecutionContext } from "@nestjs/common";
import { Request } from "express";

/**
 * 🔐 Rate Limiting Configuration
 *
 * Configuration enterprise du rate limiting avec différents niveaux :
 * - Global : Protection générale de l'API
 * - Auth : Protection renforcée pour l'authentification
 * - Public : Limite pour les endpoints publics
 */
export const createThrottlerConfig = (
  configService: ConfigService,
): ThrottlerModuleOptions => {
  const environment = configService.get<string>("NODE_ENV", "development");

  // Configuration par environnement
  const configs = {
    development: [
      {
        name: "global",
        ttl: 60000, // 1 minute
        limit: 100, // 100 requêtes par minute
      },
      {
        name: "auth",
        ttl: 900000, // 15 minutes
        limit: 5, // 5 tentatives d'auth par 15 minutes
      },
    ],
    test: [
      {
        name: "global",
        ttl: 60000,
        limit: 1000, // Plus permissif pour les tests
      },
      {
        name: "auth",
        ttl: 60000,
        limit: 10,
      },
    ],
    staging: [
      {
        name: "global",
        ttl: 60000, // 1 minute
        limit: 60, // 60 requêtes par minute
      },
      {
        name: "auth",
        ttl: 900000, // 15 minutes
        limit: 3, // 3 tentatives d'auth par 15 minutes
      },
    ],
    production: [
      {
        name: "global",
        ttl: 60000, // 1 minute
        limit: 30, // 30 requêtes par minute (strict)
      },
      {
        name: "auth",
        ttl: 900000, // 15 minutes
        limit: 3, // 3 tentatives d'auth par 15 minutes
      },
    ],
  };

  return {
    throttlers:
      configs[environment as keyof typeof configs] || configs.development,
    // Skip rate limiting pour les health checks
    skipIf: (context: ExecutionContext): boolean => {
      const request = context.switchToHttp().getRequest<Request>();
      return request.url?.includes("/health") ?? false;
    },
  };
};

/**
 * Constantes pour les différents types de rate limiting
 */
export const THROTTLE_CONFIGS = {
  // Protection générale API
  GLOBAL: { name: "global" },

  // Protection authentification (login, refresh token)
  AUTH: { name: "auth" },

  // Protection endpoints publics
  PUBLIC: { name: "public", ttl: 60000, limit: 20 },

  // Protection admin (plus strict)
  ADMIN: { name: "admin", ttl: 60000, limit: 10 },

  // Protection upload de fichiers
  UPLOAD: { name: "upload", ttl: 60000, limit: 5 },
} as const;

export type ThrottleConfigType = keyof typeof THROTTLE_CONFIGS;
