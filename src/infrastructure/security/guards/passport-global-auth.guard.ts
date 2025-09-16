/**
 * 🛡️ PASSPORT GLOBAL AUTH GUARD - Clean Architecture Guard
 *
 * Guard global utilisant les stratégies Passport
 * Remplace le GlobalAuthGuard actuel pour une approche standardisée
 */

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';

/**
 * 🔑 Passport Global Authentication Guard
 *
 * Guard global qui utilise les stratégies Passport :
 * - JWT pour l'authentification par token
 * - Gestion des routes publiques avec @Public()
 * - Intégration propre avec l'écosystème NestJS
 */
@Injectable()
export class PassportGlobalAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Activation du guard avec gestion des routes publiques
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Vérifier si la route est marquée comme publique
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Bypass authentication pour les routes publiques
    }

    // Appliquer l'authentification JWT
    return super.canActivate(context);
  }

  /**
   * Gestion des erreurs d'authentification
   */
  handleRequest<TUser = any>(
    err: unknown,
    user: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _info: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: ExecutionContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _status?: unknown,
  ): TUser {
    // Si erreur ou pas d'utilisateur, rejeter
    if (err) {
      throw err instanceof Error
        ? err
        : new UnauthorizedException('Authentication error');
    }

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    return user as TUser;
  }
}
