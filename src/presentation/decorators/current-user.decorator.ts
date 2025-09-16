import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * ✅ Custom decorator pour extraire l'utilisateur authentifié du JWT
 *
 * Utilisation:
 * ```typescript
 * async endpoint(@CurrentUser() currentUser: JwtPayload | User) {
 *   // currentUser contient les informations du JWT ou l'entité User
 * }
 * ```
 */
export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest<Request>();

    // L'utilisateur est attaché à la requête par le JwtAuthGuard
    const user = request.user;

    if (!user) {
      throw new Error(
        'User not found in request. Make sure @UseGuards(JwtAuthGuard) is applied.',
      );
    }

    return user;
  },
);

/**
 * ✅ Decorator pour extraire uniquement l'ID de l'utilisateur authentifié
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as any;

    if (!user) {
      throw new Error(
        'User ID not found in request. Make sure @UseGuards(JwtAuthGuard) is applied.',
      );
    }

    // Support pour différents formats d'utilisateur
    // Si c'est un JWT payload
    if (user.sub) {
      return user.sub;
    }

    // Si c'est une entité User du domaine
    if (user.id) {
      return user.id;
    }

    // Fallback
    throw new Error('Unable to extract user ID from request user object');
  },
);

/**
 * ✅ Decorator pour extraire l'email de l'utilisateur authentifié
 */
export const CurrentUserEmail = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as any;

    if (!user) {
      throw new Error(
        'User email not found in request. Make sure @UseGuards(JwtAuthGuard) is applied.',
      );
    }

    // Support pour différents formats d'utilisateur
    if (user.email) {
      return user.email;
    }

    // Fallback
    throw new Error('Unable to extract user email from request user object');
  },
);
