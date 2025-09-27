/**
 * 🛡️ ROLE-BASED GUARD - Multi-Tenant Role Authorization
 *
 * Guard simple focalisé sur la vérification des rôles uniquement.
 * Les permissions métier complexes sont gérées dans les Use Cases.
 *
 * PHILOSOPHIE :
 * - Simple et focalisé sur les rôles uniquement
 * - Multi-tenant : vérifie que l'utilisateur appartient au bon business context
 * - Hiérarchie des rôles respectée automatiquement
 * - Pas de logique métier complexe (c'est pour les use cases)
 * - Performance optimisée pour les vérifications fréquentes
 */

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";

/**
 * Interface pour utilisateur authentifié avec contexte métier
 */
interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  businessId: string;
  isActive: boolean;
  isVerified: boolean;
}

/**
 * Interface pour requête avec utilisateur et contexte métier
 */
interface AuthenticatedRequest {
  user?: AuthenticatedUser;
  params?: {
    businessId?: string;
    [key: string]: any;
  };
  headers?: {
    [key: string]: any;
  };
}

@Injectable()
export class RoleBasedGuard implements CanActivate {
  private readonly logger = new Logger(RoleBasedGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const classRef = context.getClass();

    // 1️⃣ Récupérer les rôles requis depuis les métadonnées
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [handler, classRef],
    );

    // 2️⃣ Si aucun rôle spécifié, autoriser l'accès (endpoint public)
    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug("No roles required - public endpoint");
      return true;
    }

    // 3️⃣ Vérifier que l'utilisateur est authentifié
    if (!request.user) {
      this.logger.warn("Access denied: User not authenticated");
      throw new UnauthorizedException("Authentication required");
    }

    const user = request.user;

    // 4️⃣ Vérifier que l'utilisateur est actif et vérifié
    if (!user.isActive) {
      this.logger.warn(`Access denied: User ${user.id} is not active`);
      throw new ForbiddenException("User account is not active");
    }

    if (!user.isVerified) {
      this.logger.warn(`Access denied: User ${user.id} is not verified`);
      throw new ForbiddenException("User account is not verified");
    }

    // 5️⃣ Vérifier le contexte multi-tenant
    const requestedBusinessId = request.params?.businessId;
    if (requestedBusinessId && requestedBusinessId !== user.businessId) {
      // Exception : Super Admin et Platform Admin peuvent accéder à tous les business
      if (!this.isPlatformAdmin(user.role)) {
        this.logger.warn(
          `Access denied: User ${user.id} from business ${user.businessId} ` +
            `trying to access business ${requestedBusinessId}`,
        );
        throw new ForbiddenException(
          "Access denied: insufficient permissions for this business context",
        );
      }
    }

    // 6️⃣ Vérifier le rôle avec support de hiérarchie
    if (!this.hasRequiredRole(user.role, requiredRoles)) {
      this.logger.warn(
        `Access denied: User ${user.id} with role ${user.role} ` +
          `does not have required roles: ${requiredRoles.join(", ")}`,
      );
      throw new ForbiddenException(
        `Insufficient role permissions. Required roles: ${requiredRoles.join(", ")}`,
      );
    }

    // 7️⃣ Autoriser l'accès
    this.logger.debug(
      `Access granted: User ${user.id} with role ${user.role} ` +
        `in business ${user.businessId}`,
    );
    return true;
  }

  /**
   * Vérifie si l'utilisateur a un des rôles requis (avec hiérarchie)
   */
  private hasRequiredRole(
    userRole: UserRole,
    requiredRoles: UserRole[],
  ): boolean {
    // Vérification directe
    if (requiredRoles.includes(userRole)) {
      return true;
    }

    // Vérification hiérarchique : rôles supérieurs ont accès aux rôles inférieurs
    return (
      this.getRoleHierarchyLevel(userRole) >=
      this.getMinRequiredLevel(requiredRoles)
    );
  }

  /**
   * Retourne le niveau hiérarchique d'un rôle (plus haut = plus de pouvoir)
   */
  private getRoleHierarchyLevel(role: UserRole): number {
    const hierarchy = {
      // Platform Level (100+)
      [UserRole.SUPER_ADMIN]: 100,
      [UserRole.PLATFORM_ADMIN]: 90,

      // Business Level (80+)
      [UserRole.BUSINESS_OWNER]: 80,
      [UserRole.BUSINESS_ADMIN]: 70,

      // Management Level (60+)
      [UserRole.LOCATION_MANAGER]: 60,
      [UserRole.DEPARTMENT_HEAD]: 55,

      // Professional Level (40+)
      [UserRole.SENIOR_PRACTITIONER]: 40,
      [UserRole.PRACTITIONER]: 35,
      [UserRole.JUNIOR_PRACTITIONER]: 30,

      // Support Level (20+)
      [UserRole.SCHEDULER]: 25,
      [UserRole.RECEPTIONIST]: 20,
      [UserRole.ASSISTANT]: 15,

      // Client Level (10+)
      [UserRole.VIP_CLIENT]: 15,
      [UserRole.CORPORATE_CLIENT]: 12,
      [UserRole.REGULAR_CLIENT]: 10,
      [UserRole.GUEST_CLIENT]: 5,
    };

    return hierarchy[role] || 0;
  }

  /**
   * Retourne le niveau minimum requis parmi les rôles demandés
   */
  private getMinRequiredLevel(requiredRoles: UserRole[]): number {
    if (requiredRoles.length === 0) return 0;

    return Math.min(
      ...requiredRoles.map((role) => this.getRoleHierarchyLevel(role)),
    );
  }

  /**
   * Vérifie si l'utilisateur est un admin plateforme
   */
  private isPlatformAdmin(role: UserRole): boolean {
    return [UserRole.SUPER_ADMIN, UserRole.PLATFORM_ADMIN].includes(role);
  }
}
