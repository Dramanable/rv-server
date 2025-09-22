/**
 * @fileoverview Notification Rate Limiting Guard
 * @module Presentation/Security
 * @version 1.0.0
 */

import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

/**
 * Interface pour la configuration du rate limiting
 */
export interface RateLimitConfig {
  readonly ttl: number; // Time to live en secondes
  readonly limit: number; // Nombre max de requêtes
  readonly skipSuccessfulRequests?: boolean;
  readonly skipFailedRequests?: boolean;
}

/**
 * Clé pour les métadonnées de rate limiting
 */
export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Decorator pour définir les limites de taux
 */
export const RateLimit = (config: RateLimitConfig) =>
  SetMetadata(RATE_LIMIT_KEY, config);

/**
 * Interface utilisateur authentifié
 */
interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Extension de Request avec user
 */
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Guard de rate limiting pour les notifications
 * Limite : 100 notifications par heure par utilisateur
 */
@Injectable()
export class NotificationRateLimitGuard implements CanActivate {
  private readonly cache = new Map<
    string,
    { count: number; resetTime: number }
  >();

  // Configuration par défaut pour les notifications
  private readonly defaultConfig: RateLimitConfig = {
    ttl: 3600, // 1 heure en secondes
    limit: 100, // 100 notifications max
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  };

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Récupérer la configuration depuis le decorator ou utiliser la default
    const config =
      this.reflector.get<RateLimitConfig>(
        RATE_LIMIT_KEY,
        context.getHandler(),
      ) || this.defaultConfig;

    // Identifier l'utilisateur (user ID ou IP comme fallback)
    const identifier = this.getIdentifier(request);

    // Vérifier la limite
    const isAllowed = this.checkRateLimit(identifier, config);

    if (!isAllowed) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded: ${config.limit} requests per ${config.ttl} seconds`,
            retryAfter: this.getRetryAfter(identifier),
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  /**
   * Obtient l'identifiant unique pour le rate limiting
   */
  private getIdentifier(request: AuthenticatedRequest): string {
    // Préférer l'ID utilisateur si authentifié
    if (request.user?.id) {
      return `user:${request.user.id}`;
    }

    // Fallback sur l'IP (avec support des proxies)
    const ip = this.getClientIp(request);
    return `ip:${ip}`;
  }

  /**
   * Extrait l'IP client en tenant compte des proxies
   */
  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Vérifie et met à jour les limites de taux
   */
  private checkRateLimit(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowMs = config.ttl * 1000;

    // Récupérer ou créer l'entrée de cache
    let entry = this.cache.get(identifier);

    // Si l'entrée n'existe pas ou a expiré, la réinitialiser
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Incrémenter le compteur
    entry.count++;

    // Sauvegarder dans le cache
    this.cache.set(identifier, entry);

    // Nettoyer les entrées expirées périodiquement
    this.cleanupExpiredEntries();

    // Vérifier si la limite est dépassée
    return entry.count <= config.limit;
  }

  /**
   * Calcule le temps d'attente avant la prochaine tentative
   */
  private getRetryAfter(identifier: string): number {
    const entry = this.cache.get(identifier);
    if (!entry) return 0;

    const retryAfterMs = entry.resetTime - Date.now();
    return Math.ceil(retryAfterMs / 1000); // Retourner en secondes
  }

  /**
   * Nettoie les entrées de cache expirées (appelé périodiquement)
   */
  private cleanupExpiredEntries(): void {
    // Nettoyer seulement 1 fois sur 100 pour éviter la surcharge
    if (Math.random() > 0.01) return;

    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.resetTime) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Méthode utilitaire pour obtenir les statistiques actuelles
   */
  public getStats(): { totalEntries: number; activeUsers: number } {
    const now = Date.now();
    let activeUsers = 0;

    for (const [, entry] of this.cache.entries()) {
      if (now <= entry.resetTime) {
        activeUsers++;
      }
    }

    return {
      totalEntries: this.cache.size,
      activeUsers,
    };
  }

  /**
   * Méthode utilitaire pour réinitialiser les limites d'un utilisateur (admin)
   */
  public resetUserLimit(userId: string): void {
    const identifier = `user:${userId}`;
    this.cache.delete(identifier);
  }
}
