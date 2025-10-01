/**
 * 🛡️ PERMISSIONS GUARD - Protection granulaire basée sur l        // Vérifier chaque permission requise
        for (const permission of permissions) {
          const hasPermission = await this.permissionService.hasPermission(
            user.id,
            permission,
            businessContext,
          );

          if (!hasPermission) {
            throw new ForbiddenException(
              `Missing required permission: ${permission}`,
            );
          }
        }
 *
 * Guard NestJS avancé qui vérifie les permissions granulaires de l'utilisateur
 * en tenant compte du contexte business et de la hiérarchie des rôles.
 *
 * Fonctionne avec le décorateur @RequirePermissions() et prend en charge :
 * - Vérification des permissions granulaires
 * - Contexte business (business_id, location_id, department_id)
 * - Hiérarchie des rôles et assignments
 * - Permissions effectives selon le type d'entreprise
 */

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IPermissionService } from "../../../application/ports/permission.service.interface";
import { User } from "../../../domain/entities/user.entity";
import { Permission, RoleUtils } from "../../../shared/enums/user-role.enum";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";

export interface PermissionContext {
  businessId?: string;
  locationId?: string;
  departmentId?: string;
  resourceOwnerId?: string;
  requireAll?: boolean; // Si true, toutes les permissions sont requises
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: IPermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Récupérer les permissions requises depuis les métadonnées
    const requiredPermissions = this.reflector.getAllAndOverride<{
      permissions: Permission[];
      context?: PermissionContext;
    }>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // Si aucune permission n'est requise, autoriser l'accès
    if (!requiredPermissions || !requiredPermissions.permissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    // Si pas d'utilisateur, refuser l'accès
    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    try {
      // Extraire le contexte business depuis les paramètres de la requête ou body
      const businessContext = this.extractBusinessContext(
        request,
        requiredPermissions.context,
      );

      // Vérifier chaque permission requise
      const { permissions, context: permissionContext } = requiredPermissions;
      const requireAll = permissionContext?.requireAll ?? false;

      if (requireAll) {
        // Toutes les permissions doivent être validées
        for (const permission of permissions) {
          const hasPermission = await this.permissionService.hasPermission(
            user.id,
            permission,
            businessContext,
          );

          if (!hasPermission) {
            throw new ForbiddenException(
              `Missing required permission: ${permission}`,
            );
          }
        }
        return true;
      } else {
        // Au moins une permission doit être validée (OR logic)
        for (const permission of permissions) {
          const hasPermission = await this.permissionService.hasPermission(
            user.id,
            permission,
            businessContext,
          );

          if (hasPermission) {
            return true;
          }
        }

        throw new ForbiddenException(
          `User lacks any of required permissions: ${permissions.join(", ")}`,
        );
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new ForbiddenException(
        `Permission check failed: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Extrait le contexte business depuis la requête HTTP
   */
  private extractBusinessContext(
    request: any,
    contextConfig?: PermissionContext,
  ): any {
    const context: any = {};

    // Priorité : configuration explicite > paramètres > body
    if (contextConfig?.businessId) {
      context.businessId = contextConfig.businessId;
    } else if (request.params?.businessId) {
      context.businessId = request.params.businessId;
    } else if (request.body?.businessId) {
      context.businessId = request.body.businessId;
    }

    if (contextConfig?.locationId) {
      context.locationId = contextConfig.locationId;
    } else if (request.params?.locationId) {
      context.locationId = request.params.locationId;
    } else if (request.body?.locationId) {
      context.locationId = request.body.locationId;
    }

    if (contextConfig?.departmentId) {
      context.departmentId = contextConfig.departmentId;
    } else if (request.params?.departmentId) {
      context.departmentId = request.params.departmentId;
    } else if (request.body?.departmentId) {
      context.departmentId = request.body.departmentId;
    }

    if (contextConfig?.resourceOwnerId) {
      context.resourceOwnerId = contextConfig.resourceOwnerId;
    } else if (request.params?.userId) {
      context.resourceOwnerId = request.params.userId;
    } else if (request.body?.practitionerId) {
      context.resourceOwnerId = request.body.practitionerId;
    } else if (request.body?.staffId) {
      context.resourceOwnerId = request.body.staffId;
    }

    return context;
  }
}

/**
 * 🎭 ROLE HIERARCHY GUARD - Protection basée sur la hiérarchie des rôles
 *
 * Guard complémentaire qui vérifie que l'utilisateur a un niveau hiérarchique
 * suffisant pour effectuer une action sur un autre utilisateur/rôle.
 */
@Injectable()
export class RoleHierarchyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredLevel = this.reflector.getAllAndOverride<number>(
      "hierarchyLevel",
      [context.getHandler(), context.getClass()],
    );

    if (requiredLevel === undefined) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      return false;
    }

    // Obtenir le niveau hiérarchique de l'utilisateur
    const userLevel = RoleUtils.getRoleLevel(user.role);

    // L'utilisateur doit avoir un niveau supérieur ou égal au requis
    return userLevel >= requiredLevel;
  }
}

/**
 * 🏢 BUSINESS CONTEXT GUARD - Protection basée sur le contexte business
 *
 * Guard qui s'assure que l'utilisateur a bien accès au contexte business
 * spécifié dans la requête (business_id, location_id, etc.)
 */
@Injectable()
export class BusinessContextGuard implements CanActivate {
  constructor(private readonly permissionService: IPermissionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      return false;
    }

    // Extraire le businessId depuis les paramètres ou le body
    const businessId = request.params?.businessId || request.body?.businessId;

    if (!businessId) {
      // Si pas de contexte business spécifique, autoriser
      return true;
    }

    try {
      // Vérifier que l'utilisateur a bien des permissions dans ce business
      return await this.permissionService.hasAccessToBusiness(
        user.id,
        businessId,
      );
    } catch (error) {
      return false;
    }
  }
}
