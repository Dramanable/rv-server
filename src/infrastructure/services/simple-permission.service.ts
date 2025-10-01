/**
 * 🛡️ SIMPLE Permission Service - Version Simplifiée
 *
 * Service de permissions ultra-simplifié pour éviter la confusion
 * du système RBAC complexe actuel.
 *
 * RÈGLES SIMPLES :
 * - SUPER_ADMIN et PLATFORM_ADMIN peuvent tout faire
 * - BUSINESS_OWNER peut gérer les prospects de son business
 * - Les autres rôles ont des permissions limitées
 */

import { Injectable } from "@nestjs/common";
import { Logger } from "@application/ports/logger.port";
import { I18nService } from "@application/ports/i18n.port";
import { ISimplePermissionService } from "@application/ports/simple-permission.port";
import { UserRole } from "@shared/enums/user-role.enum";
import { Permission } from "@shared/enums/permission.enum";
import { PermissionServiceError } from "@infrastructure/exceptions/infrastructure.exceptions";

@Injectable()
export class SimplePermissionService implements ISimplePermissionService {
  constructor(
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly userRepository: any, // À corriger avec le bon type
  ) {}

  /**
   * ✅ Vérifier si un utilisateur a une permission spécifique
   * LOGIQUE SIMPLE : Basée uniquement sur le rôle utilisateur
   */
  async hasPermission(
    userId: string,
    userRole: UserRole,
    action: string,
    resource: string,
    businessId?: string | null,
  ): Promise<boolean> {
    try {
      console.log("🔥 SIMPLE PERMISSIONS - Checking permission", {
        userId,
        userRole,
        action,
        resource,
        businessId,
      });

      // RÈGLES SIMPLES par rôle
      switch (userRole) {
        case UserRole.SUPER_ADMIN:
        case UserRole.PLATFORM_ADMIN:
          console.log("🔥 SIMPLE PERMISSIONS - SUPER/PLATFORM ADMIN - GRANTED");
          return true; // Peut tout faire

        case UserRole.BUSINESS_OWNER:
          // Peut gérer les prospects de son business
          if (
            (resource === "PROSPECT" && action === "READ_PROSPECT") ||
            action === "LIST_PROSPECTS"
          ) {
            console.log(
              "🔥 SIMPLE PERMISSIONS - BUSINESS_OWNER prospect permission - GRANTED",
            );
            return true;
          }
          break;

        default:
          console.log("🔥 SIMPLE PERMISSIONS - Other role - DENIED", {
            userRole,
          });
          return false;
      }

      console.log("🔥 SIMPLE PERMISSIONS - Permission denied", {
        userId,
        userRole,
        action,
      });
      return false;
    } catch (error) {
      console.error("🔥 SIMPLE PERMISSIONS - Error", error);
      this.logger.error("Error checking permission", error as Error, {
        userId,
        action,
        businessId,
      });
      return false; // Fail closed
    }
  }

  /**
   * 🎭 Vérifier si un rôle peut agir sur un autre rôle
   * SIMPLE : Basé sur une hiérarchie fixe
   */
  async canActOnRole(
    actorUserId: string,
    targetRole: UserRole,
    context?: Record<string, unknown>,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(actorUserId);
    if (!user) return false;

    const actorRole = user.getRole();

    // Super admins peuvent tout
    if (
      actorRole === UserRole.SUPER_ADMIN ||
      actorRole === UserRole.PLATFORM_ADMIN
    ) {
      return true;
    }

    return false;
  }

  /**
   * 🚨 Requérir une permission (throw si manquante)
   */
  async requirePermission(
    userId: string,
    permission: Permission | string,
    context?: Record<string, unknown>,
  ): Promise<void> {
    // Get user to extract role
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new PermissionServiceError(`User ${userId} not found`);
    }

    const hasPermission = await this.hasPermission(
      userId,
      user.role,
      permission,
      "resource",
      context?.businessId as string,
    );

    if (!hasPermission) {
      const errorMessage = this.i18n.translate("permission.denied", {
        permission,
        userId,
      });

      this.logger.error(
        `Permission denied for user ${userId}`,
        new Error(errorMessage),
        { userId, permission, context },
      );

      throw new PermissionServiceError(`Permission denied: ${permission}`, {
        userId,
        permission,
        context,
      });
    }
  }

  /**
   * 📋 Obtenir toutes les permissions d'un utilisateur
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) return [];

    const userRole = user.getRole();

    // Super admins ont toutes les permissions
    if (
      userRole === UserRole.SUPER_ADMIN ||
      userRole === UserRole.PLATFORM_ADMIN
    ) {
      return Object.values(Permission);
    }

    // Business Admin a les permissions de base
    if (userRole === UserRole.BUSINESS_ADMIN) {
      return [
        Permission.CREATE_PROSPECT,
        Permission.READ_PROSPECT,
        Permission.LIST_PROSPECTS,
        Permission.MANAGE_PROSPECTS,
      ];
    }

    return [];
  }

  /**
   * 🎭 Obtenir le rôle d'un utilisateur
   */
  async getUserRole(userId: string): Promise<UserRole> {
    const user = await this.userRepository.findById(userId);
    return user ? user.getRole() : UserRole.GUEST_CLIENT;
  }

  /**
   * 🔍 Vérifier si un utilisateur a un rôle spécifique
   */
  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    return userRole === role;
  }

  /**
   * 🏢 Vérifier les permissions dans un contexte métier spécifique
   * SIMPLE : Ignore le contexte pour l'instant
   */
  async hasBusinessPermission(
    userId: string,
    permission: Permission | string,
    businessContext: {
      businessId?: string;
      locationId?: string;
      departmentId?: string;
    },
  ): Promise<boolean> {
    // Get user to extract role
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return false;
    }

    // Pour l'instant, même logique que hasPermission
    return this.hasPermission(
      userId,
      user.role,
      permission,
      "resource",
      businessContext.businessId,
    );
  }

  /**
   * 👥 Vérifier si un utilisateur peut gérer un autre utilisateur
   */
  async canManageUser(
    actorUserId: string,
    targetUserId: string,
  ): Promise<boolean> {
    if (actorUserId === targetUserId) return false; // Pas de self-management

    const actorUser = await this.userRepository.findById(actorUserId);
    if (!actorUser) return false;

    const actorRole = actorUser.getRole();

    // Super admins peuvent gérer tout le monde
    return (
      actorRole === UserRole.SUPER_ADMIN ||
      actorRole === UserRole.PLATFORM_ADMIN
    );
  }
}
