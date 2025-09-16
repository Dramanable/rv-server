/**
 * 🛡️ JWT AUTH GUARD - NestJS Passport Guard
 *
 * Guard JWT pour protéger les routes avec authentification par token
 * Respecte les principes Clean Architecture
 */

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * 🔑 JWT Authentication Guard
 *
 * Utilise la stratégie JWT de Passport pour valider les tokens
 * Gère les routes publiques avec le décorateur @Public()
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Détermine si la route peut être activée
   * Vérifie si la route est publique avant d'appliquer l'authentification
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

    // Appliquer l'authentification JWT pour les routes protégées
    return super.canActivate(context);
  }
}
