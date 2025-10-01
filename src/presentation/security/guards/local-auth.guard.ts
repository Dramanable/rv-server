/**
 * 🛡️ LOCAL AUTH GUARD - Presentation Layer Security Guard
 *
 * Guard d'authentification local utilisant Passport.js
 * Pour l'authentification par email/password (login endpoint)
 * Couche présentation/sécurité - validation des credentials HTTP
 */

import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import {
  AuthenticatedUser,
  isAuthenticatedUser,
  isAuthenticationError,
} from '../types/guard.types';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  private readonly logger = new Logger(LocalAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    this.logger.debug('Local authentication attempt', {
      path: request.path,
      method: request.method,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    // ✅ Utiliser l'authentification locale standard de Passport
    const result = (await super.canActivate(context)) as boolean;

    if (result) {
      const user = request.user as unknown;
      const userId = isAuthenticatedUser(user) ? user.id : 'unknown';

      this.logger.debug('Local authentication successful', {
        path: request.path,
        userId,
      });
    }

    return result;
  }

  handleRequest<TUser = AuthenticatedUser>(
    err: unknown,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    const request = context.switchToHttp().getRequest<Request>();
    const requestContext = {
      path: request.path,
      method: request.method,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    };

    // 🔍 Gestion des erreurs d'authentification locale
    if (err || !user || !isAuthenticatedUser(user)) {
      const errorMessage = isAuthenticationError(err)
        ? err.message
        : 'Invalid credentials';
      const infoMessage = this.extractInfoMessage(info);

      this.logger.warn('Local authentication failed', {
        ...requestContext,
        error: errorMessage,
        hasUser: !!user,
        info: infoMessage,
      });

      // 🔑 Credentials invalides
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS',
        statusCode: 401,
        action: 'CHECK_CREDENTIALS',
      });
    }

    // ✅ Authentification locale réussie
    this.logger.debug('Local authentication successful', {
      ...requestContext,
      userId: user.id,
      userEmail:
        typeof user.email === 'string'
          ? user.email
          : (user.email as any).value || user.email,
      userRole: user.role,
    });

    return user as TUser;
  }

  /**
   * 🔍 Extraire le message d'info de Passport de façon sécurisée
   */
  private extractInfoMessage(info: unknown): string {
    if (typeof info === 'string') {
      return info;
    }

    if (typeof info === 'object' && info !== null && 'message' in info) {
      const message = (info as { message: unknown }).message;
      return typeof message === 'string' ? message : 'Unknown info';
    }

    return 'No info available';
  }
}
