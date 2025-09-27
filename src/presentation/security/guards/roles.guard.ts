/**
 * 🛡️ ROLES GUARD - Protection basée sur les rôles utilisateur
 *
 * Guard NestJS pour vérifier que l'utilisateur authentifié
 * a les rôles requis pour accéder à une route protégée.
 *
 * Utilise le système de rôles défini dans UserRole enum
 * et fonctionne avec le décorateur @Roles()
 */

import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User } from "../../../domain/entities/user.entity";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Récupérer les rôles requis depuis les métadonnées
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si aucun rôle n'est requis, autoriser l'accès
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Récupérer l'utilisateur depuis la requête (mis par JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    // Si pas d'utilisateur, refuser l'accès
    if (!user) {
      return false;
    }

    // Vérifier si l'utilisateur a au moins un des rôles requis
    return requiredRoles.some((role) => user.role === role);
  }
}
