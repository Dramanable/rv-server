import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import { Request } from 'express';

/**
 * 🔐 Enhanced Throttler Guard
 *
 * Guard personnalisé pour le rate limiting avec :
 * - Logging des tentatives de dépassement
 * - Gestion des IP en whitelist
 * - Messages d'erreur personnalisés selon le contexte
 * - Audit trail des tentatives de dépassement
 */
@Injectable()
export class EnhancedThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(EnhancedThrottlerGuard.name);

  // IP en whitelist (par exemple pour les services internes)
  private readonly whitelistedIPs = new Set([
    '127.0.0.1',
    '::1',
    // Ajoutez d'autres IPs de confiance ici
  ]);

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Skip pour les IPs en whitelist
    if (this.isWhitelisted(request)) {
      return true;
    }

    // Skip pour les health checks
    if (request.url?.includes('/health')) {
      return true;
    }

    // Skip pour les endpoints de monitoring
    if (request.url?.includes('/metrics')) {
      return true;
    }

    return super.shouldSkip(context);
  }

  protected throwThrottlingException(context: ExecutionContext): never {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIP(request);
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const endpoint = request.url;
    const method = request.method;

    // Log de sécurité
    this.logger.warn(
      `Rate limit exceeded: ${method} ${endpoint} from ${clientIp}`,
      {
        ip: clientIp,
        userAgent,
        endpoint,
        method,
        timestamp: new Date().toISOString(),
      },
    );

    // Message d'erreur personnalisé selon l'endpoint
    const errorMessage = this.getThrottleMessage(endpoint);

    throw new UnauthorizedException({
      statusCode: 429,
      message: errorMessage,
      error: 'Too Many Requests',
      retryAfter: this.getRetryAfter(endpoint),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Vérifie si l'IP est en whitelist
   */
  private isWhitelisted(request: Request): boolean {
    const clientIp = this.getClientIP(request);
    return this.whitelistedIPs.has(clientIp);
  }

  /**
   * Récupère l'IP du client en tenant compte des proxies
   */
  private getClientIP(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Message d'erreur personnalisé selon l'endpoint
   */
  private getThrottleMessage(endpoint?: string): string {
    if (endpoint?.includes('/auth/login')) {
      return 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.';
    }

    if (endpoint?.includes('/auth')) {
      return "Trop de requêtes d'authentification. Veuillez patienter.";
    }

    if (endpoint?.includes('/api/v1/users')) {
      return 'Limite de requêtes utilisateur atteinte. Veuillez ralentir.';
    }

    return 'Trop de requêtes. Veuillez ralentir vos appels API.';
  }

  /**
   * Temps d'attente recommandé selon l'endpoint
   */
  private getRetryAfter(endpoint?: string): number {
    if (endpoint?.includes('/auth/login')) {
      return 900; // 15 minutes pour les tentatives de login
    }

    if (endpoint?.includes('/auth')) {
      return 300; // 5 minutes pour l'auth
    }

    return 60; // 1 minute par défaut
  }
}
