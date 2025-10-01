/**
 * 🛡️ SIMPLE Permission Service pour Tests - Version Ultra-Simplifiée
 * ✅ Permettre toutes les permissions pour ADMIN et SUPER_ADMIN
 */

import { Injectable } from '@nestjs/common';
import { Logger } from '@application/ports/logger.port';
import { I18nService } from '@application/ports/i18n.port';
import { IPermissionService } from '@application/ports/permission.service.interface';
import { UserRole } from '@shared/enums/user-role.enum';
import { Permission } from '@shared/enums/user-role.enum';

@Injectable()
export class TestPermissionService implements IPermissionService {
  constructor(
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  /**
   * ✅ Version ultra-simplifiée : Toujours true pour tests
   */
  async hasPermission(
    userId: string,
    permission: Permission | string,
    context?: Record<string, unknown>,
  ): Promise<boolean> {
    this.logger.info('TEST PERMISSIONS - Allowing all permissions', {
      userId,
      permission,
      context,
    });

    // Pour les tests, on autorise tout sauf pour les utilisateurs anonymes
    if (userId && userId !== 'anonymous') {
      return true;
    }

    return false;
  }

  async requirePermission(
    userId: string,
    permission: Permission | string,
    context?: Record<string, unknown>,
  ): Promise<void> {
    const hasPermission = await this.hasPermission(userId, permission, context);

    if (!hasPermission) {
      const errorMessage = `Permission denied: ${permission}`;
      this.logger.error(errorMessage, new Error(errorMessage), {
        userId,
        permission,
        context,
      });
      throw new Error(errorMessage);
    }
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    // Pour les tests, retourner toutes les permissions
    return Object.values(Permission);
  }

  async canActOnRole(
    actorUserId: string,
    targetRole: UserRole,
    context?: Record<string, unknown>,
  ): Promise<boolean> {
    return true; // Simplifier pour les tests
  }

  async getUserRole(userId: string): Promise<UserRole> {
    return UserRole.SUPER_ADMIN; // Par défaut SUPER_ADMIN pour les tests
  }

  async requireSuperAdminPermission(userId: string): Promise<void> {
    // Pour les tests, on autorise tout
    return Promise.resolve();
  }

  async isSuperAdmin(userId: string): Promise<boolean> {
    // Pour les tests, considérer tous les utilisateurs authentifiés comme super admin
    return !!(userId && userId !== 'anonymous');
  }

  async hasAccessToBusiness(
    userId: string,
    businessId: string,
  ): Promise<boolean> {
    // Pour les tests, autoriser l'accès à tous les business
    return true;
  }

  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    return true; // Simplifier pour les tests
  }

  async hasBusinessPermission(
    userId: string,
    permission: Permission | string,
    businessContext: {
      businessId?: string;
      locationId?: string;
      departmentId?: string;
    },
  ): Promise<boolean> {
    return this.hasPermission(userId, permission, businessContext);
  }

  async canManageUser(
    actorUserId: string,
    targetUserId: string,
  ): Promise<boolean> {
    return actorUserId !== targetUserId; // Pas de self-management
  }
}
