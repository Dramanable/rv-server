import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTooManyRequestsResponse } from '@nestjs/swagger';

/**
 * 🔐 Rate Limiting Decorators
 *
 * Décorateurs prêts à l'emploi pour appliquer du rate limiting
 * avec documentation Swagger automatique
 */

/**
 * Rate limiting pour les endpoints d'authentification
 * (3 tentatives par 15 minutes en production)
 */
export const AuthRateLimit = () =>
  applyDecorators(
    Throttle({ default: { ttl: 900000, limit: 3 } }),
    ApiTooManyRequestsResponse({
      description: "Trop de tentatives d'authentification",
    }),
  );

/**
 * Rate limiting pour les endpoints publics
 * (20 requêtes par minute)
 */
export const PublicRateLimit = () =>
  applyDecorators(
    Throttle({ default: { ttl: 60000, limit: 20 } }),
    ApiTooManyRequestsResponse({
      description: 'Limite de requêtes publiques atteinte',
    }),
  );

/**
 * Rate limiting pour les endpoints admin
 * (10 requêtes par minute - plus strict)
 */
export const AdminRateLimit = () =>
  applyDecorators(
    Throttle({ default: { ttl: 60000, limit: 10 } }),
    ApiTooManyRequestsResponse({
      description: 'Limite admin atteinte - accès restreint',
    }),
  );

/**
 * Rate limiting pour les uploads de fichiers
 * (5 requêtes par minute)
 */
export const UploadRateLimit = () =>
  applyDecorators(
    Throttle({ default: { ttl: 60000, limit: 5 } }),
    ApiTooManyRequestsResponse({
      description: "Limite d'upload atteinte",
    }),
  );

/**
 * Rate limiting personnalisé
 */
export const CustomRateLimit = (ttl: number, limit: number) =>
  applyDecorators(
    Throttle({ default: { ttl, limit } }),
    ApiTooManyRequestsResponse({
      description: `Limite personnalisée atteinte: ${limit} requêtes par ${ttl / 1000}s`,
    }),
  );
