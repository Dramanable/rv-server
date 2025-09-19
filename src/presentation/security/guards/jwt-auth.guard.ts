/**
 * 🛡️ JWT AUTH GUARD - Presentation Layer Security Guard
 *
 * Guard d'authentification JWT utilisant Passport.js
 * Couche présentation/sécurité - gestion des requêtes HTTP et cookies
 */

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 🔓 Vérifier si l'endpoint est public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug('Public endpoint accessed', {
        handler: context.getHandler().name,
        class: context.getClass().name,
      });
      return true;
    }

    // 🍪 Vérification de la présence du token dans les cookies
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = request.cookies?.accessToken;

    if (!accessToken) {
      this.logger.warn('JWT Auth Guard - No access token in cookies', {
        path: request.path,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });
      throw new UnauthorizedException({
        message: 'Access token not found in cookies',
        error: 'NO_TOKEN',
        statusCode: 401,
      });
    }

    // ✅ Utiliser l'authentification JWT standard de Passport
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): TUser {
    const request = context.switchToHttp().getRequest<Request>();
    const requestContext = {
      path: request.path,
      method: request.method,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    };

    // 🔍 Gestion des erreurs d'authentification
    if (err || !user) {
      const infoMessage = this.extractInfoMessage(info);

      this.logger.warn('JWT authentication failed', {
        ...requestContext,
        error: err?.message || 'Unknown error',
        hasUser: !!user,
        info: infoMessage,
      });

      // 🔄 Token expiré - suggérer le refresh
      if (infoMessage === 'jwt expired') {
        throw new UnauthorizedException({
          message: 'Access token has expired. Please refresh your token.',
          error: 'TOKEN_EXPIRED',
          statusCode: 401,
          action: 'REFRESH_TOKEN',
        });
      }

      // 🔑 Token invalide/malformé
      if (
        infoMessage.includes('invalid') ||
        infoMessage.includes('malformed')
      ) {
        throw new UnauthorizedException({
          message: 'Invalid access token format.',
          error: 'INVALID_TOKEN',
          statusCode: 401,
          action: 'LOGIN_REQUIRED',
        });
      }

      // 🚫 Token manquant
      if (infoMessage.includes('No auth token')) {
        throw new UnauthorizedException({
          message: 'Authentication required.',
          error: 'NO_TOKEN',
          statusCode: 401,
          action: 'LOGIN_REQUIRED',
        });
      }

      // ❌ Autres erreurs d'authentification
      throw (
        err ||
        new UnauthorizedException({
          message: 'Authentication failed. Please login again.',
          error: 'AUTHENTICATION_FAILED',
          statusCode: 401,
          action: 'LOGIN_REQUIRED',
        })
      );
    }

    // ✅ Authentification réussie
    this.logger.debug('JWT authentication successful', {
      ...requestContext,
      userId: user.id,
      userEmail: user.email?.value || user.email,
      userRole: user.role,
    });

    return user as TUser;
  }

  /**
   * 🔍 Extraire le message d'info de Passport de façon sécurisée
   */
  private extractInfoMessage(info: any): string {
    if (typeof info === 'string') {
      return info;
    }

    if (typeof info === 'object' && info !== null && 'message' in info) {
      return typeof info.message === 'string' ? info.message : 'Unknown info';
    }

    return 'No info available';
  }
}
