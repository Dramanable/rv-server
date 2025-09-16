/**
 * 🛡️ PASSPORT JWT GUARD - Guard Passport.js JWT avec Clean Architecture
 *
 * Guard d'authentification utilisant Passport.js et JWT Strategy
 * Alternative au GlobalAuthGuard, plus simple et standard
 */

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Vérifier si l'endpoint est public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // 🍪 Vérification de la présence du cookie JWT
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = request.cookies?.access_token as string | undefined;

    if (!accessToken) {
      throw new UnauthorizedException('Access token not found in cookies');
    }

    // Utiliser l'authentification JWT standard de Passport
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    _status?: any,
  ): TUser {
    const request = context.switchToHttp().getRequest<Request>();
    const path: string = request.url || 'Unknown path';

    // 🔍 Logging pour debug
    if (err || !user) {
      // Type guard pour info avec message
      const infoMessage =
        typeof info === 'object' &&
        info !== null &&
        'message' in info &&
        typeof (info as { message: unknown }).message === 'string'
          ? (info as { message: string }).message
          : 'No info';

      console.error('JWT Auth Guard - Authentication failed:', {
        error:
          err instanceof Error ? err.message : String(err || 'Unknown error'),
        hasUser: !!user,
        info: infoMessage,
        path,
      });

      // 🔄 Gestion spécifique des tokens expirés
      if (infoMessage === 'jwt expired') {
        throw new UnauthorizedException({
          error: 'TOKEN_EXPIRED',
          message:
            'Access token has expired. Please use refresh token or login again.',
          statusCode: 401,
        });
      }

      // 🔑 Gestion des tokens invalides
      if (
        infoMessage.includes('invalid') ||
        infoMessage.includes('malformed')
      ) {
        throw new UnauthorizedException({
          error: 'INVALID_TOKEN',
          message: 'Invalid access token format.',
          statusCode: 401,
        });
      }

      // ❌ Autres erreurs d'authentification
      throw (
        err ||
        new UnauthorizedException({
          error: 'AUTHENTICATION_FAILED',
          message: 'Authentication failed. Please login again.',
          statusCode: 401,
        })
      );
    }

    return user as TUser;
  }
}
