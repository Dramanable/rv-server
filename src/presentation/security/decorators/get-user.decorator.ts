/**
 * 👤 GET USER DECORATOR - Presentation Layer Security Decorator
 *
 * Décorateur pour extraire les informations utilisateur de la requête
 * Couche présentation/sécurité - extraction de l'utilisateur authentifié
 */

import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { User } from "../../../domain/entities/user.entity";

/**
 * 👤 Décorateur @GetUser()
 *
 * Extrait l'utilisateur authentifié de la requête (req.user)
 * L'utilisateur est injecté par le JwtAuthGuard après validation du token
 *
 * @example
 * ```typescript
 * @Controller('users')
 * export class UserController {
 *   @Get('profile')
 *   @UseGuards(JwtAuthGuard)
 *   async getProfile(@GetUser() user: User) {
 *     // L'utilisateur authentifié est automatiquement injecté
 *     return { id: user.id, email: user.email };
 *   }
 * }
 * ```
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<Request>();

    // L'utilisateur est attaché à la requête par le JwtAuthGuard
    const user = (request as any).user;

    if (!user) {
      throw new Error(
        "User not found in request. Make sure JwtAuthGuard is applied.",
      );
    }

    // Si un champ spécifique est demandé, le retourner
    if (data) {
      return user[data];
    }

    // Retourner l'utilisateur complet
    return user;
  },
);
