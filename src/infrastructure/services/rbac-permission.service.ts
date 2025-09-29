/**
 * 🛡️ RBAC Permission Service - Real Implementation
 *
 * Service de permissions basé sur les rôles et le système RBAC.
 * Applique les règles métier strictes      this.logger.error(
        `Permission denied for user ${userId}`,
        new Error(errorMessage),
        {
          userId,
          permission,
          context,
        },
      );

      throw new PermissionServiceError(`Permission denied: ${permission}`, { userId, permission, context });
    }rchie des permissions.
 *
 * CLEAN ARCHITECTURE :
 * - Implémente l'interface définie dans Application
 * - Utilise les entités Domain pour la logique métier
 * - Applique les permissions granulaires selon contexte business
 */

import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { IPermissionService } from '@application/ports/permission.service.interface';
import { RoleAssignment } from '@domain/entities/role-assignment.entity';
import { IBusinessContextRepository } from '@domain/repositories/business-context.repository.interface';
import { IRoleAssignmentRepository } from '@domain/repositories/role-assignment.repository.interface';
import { UserRepository } from '@domain/repositories/user.repository.interface';
import { Injectable } from '@nestjs/common';
import { InfrastructureException } from '@shared/exceptions/shared.exceptions';
import {
  Permission,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  RoleUtils,
  UserRole,
} from '@shared/enums/user-role.enum';
import { PermissionServiceError } from '@infrastructure/exceptions/infrastructure.exceptions';

/**
 * 🎯 Business Context for Permission Checks
 */
export interface BusinessPermissionContext {
  businessId?: string;
  locationId?: string;
  departmentId?: string;
  userId?: string;
  resourceOwnerId?: string;
}

@Injectable()
export class RbacPermissionService implements IPermissionService {
  constructor(
    private readonly roleAssignmentRepository: IRoleAssignmentRepository,
    private readonly businessContextRepository: IBusinessContextRepository,
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  /**
   * ✅ Vérifier si un utilisateur a une permission spécifique
   */
  async hasPermission(
    userId: string,
    permission: Permission | string,
    context?: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      this.logger.info('Checking user permission', {
        userId,
        permission,
        context,
      });

      // 1. Obtenir les rôles de l'utilisateur
      const userRoles = await this.getUserRoles(userId, context);

      // 2. Vérifier si l'un des rôles a cette permission
      for (const roleAssignment of userRoles) {
        if (
          await this.roleHasPermission(
            roleAssignment.getRole(),
            permission,
            context,
          )
        ) {
          this.logger.info('Permission granted', {
            userId,
            permission,
            grantingRole: roleAssignment.getRole(),
            businessContext: roleAssignment.getContext(),
          });
          return true;
        }
      }

      this.logger.warn('Permission denied', {
        userId,
        permission,
        userRoles: userRoles.map((ra) => ra.getRole()),
        context,
      });

      return false;
    } catch (error) {
      this.logger.error('Error checking permission', error as Error, {
        userId,
        permission,
        context,
      });
      return false; // Fail closed - deny by default
    }
  }

  /**
   * 🎭 Vérifier si un rôle peut agir sur un autre rôle (hiérarchie)
   */
  async canActOnRole(
    actorUserId: string,
    targetRole: UserRole,
    context?: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      // 1. Obtenir les rôles de l'acteur
      const actorRoles = await this.getUserRoles(actorUserId, context);

      // 2. Vérifier si l'un des rôles peut agir sur le rôle cible
      for (const roleAssignment of actorRoles) {
        if (RoleUtils.canActOnRole(roleAssignment.getRole(), targetRole)) {
          this.logger.info('Role action authorized', {
            actorUserId,
            actorRole: roleAssignment.getRole(),
            targetRole,
            context,
          });
          return true;
        }
      }

      this.logger.warn('Role action denied', {
        actorUserId,
        actorRoles: actorRoles.map((ra) => ra.getRole()),
        targetRole,
        context,
      });

      return false;
    } catch (error) {
      this.logger.error('Error checking role hierarchy', error as Error, {
        actorUserId,
        targetRole,
        context,
      });
      return false;
    }
  }

  /**
   * 🚨 Requérir une permission (throw si manquante)
   */
  async requirePermission(
    userId: string,
    permission: Permission | string,
    context?: Record<string, unknown>,
  ): Promise<void> {
    const hasPermission = await this.hasPermission(userId, permission, context);

    if (!hasPermission) {
      const errorMessage = this.i18n.translate('permission.denied', {
        permission,
      });

      this.logger.error(
        'Permission requirement failed',
        new Error(errorMessage),
        {
          userId,
          permission,
          context,
        },
      );

      throw new InfrastructureException(errorMessage, 'RBAC_PERMISSION_DENIED');
    }
  }

  /**
   * 📋 Obtenir toutes les permissions d'un utilisateur
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const userRoles = await this.getUserRoles(userId);
      const allPermissions = new Set<Permission>();

      // Combiner toutes les permissions de tous les rôles
      for (const roleAssignment of userRoles) {
        const rolePermissions = RoleUtils.getRolePermissions(
          roleAssignment.getRole(),
        );
        rolePermissions.forEach((permission) => allPermissions.add(permission));
      }

      this.logger.info('Retrieved user permissions', {
        userId,
        permissionCount: allPermissions.size,
        roles: userRoles.map((ra) => ra.getRole()),
      });

      return Array.from(allPermissions);
    } catch (error) {
      this.logger.error('Error retrieving user permissions', error as Error, {
        userId,
      });
      return [];
    }
  }

  /**
   * 🎭 Obtenir le rôle principal d'un utilisateur
   */
  async getUserRole(userId: string): Promise<UserRole> {
    try {
      const userRoles = await this.getUserRoles(userId);

      if (userRoles.length === 0) {
        return UserRole.GUEST_CLIENT; // Rôle par défaut
      }

      // Retourner le rôle avec le niveau hiérarchique le plus élevé
      const primaryRole = userRoles.reduce((highest, current) => {
        const currentLevel = ROLE_HIERARCHY[current.getRole()] || 0;
        const highestLevel = ROLE_HIERARCHY[highest.getRole()] || 0;
        return currentLevel > highestLevel ? current : highest;
      });

      this.logger.info('Retrieved primary user role', {
        userId,
        primaryRole: primaryRole.getRole(),
        totalRoles: userRoles.length,
      });

      return primaryRole.getRole();
    } catch (error) {
      this.logger.error('Error retrieving user role', error as Error, {
        userId,
      });
      return UserRole.GUEST_CLIENT;
    }
  }

  /**
   * 🔍 Vérifier si un utilisateur a un rôle spécifique
   */
  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const userRoles = await this.getUserRoles(userId);
      const hasRole = userRoles.some((ra) => ra.getRole() === role);

      this.logger.info('Checked user role', {
        userId,
        role,
        hasRole,
      });

      return hasRole;
    } catch (error) {
      this.logger.error('Error checking user role', error as Error, {
        userId,
        role,
      });
      return false;
    }
  }

  /**
   * 🏢 Vérifier les permissions dans un contexte métier spécifique
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
    // 🔍 RÈGLE CRITIQUE : Vérifier les permissions dans le bon contexte business
    return this.hasPermission(userId, permission, businessContext);
  }

  /**
   * 👥 Vérifier si un utilisateur peut gérer un autre utilisateur
   */
  async canManageUser(
    actorUserId: string,
    targetUserId: string,
  ): Promise<boolean> {
    try {
      // 1. ✅ RÈGLE : Pas de self-management non autorisé
      if (actorUserId === targetUserId) {
        return false;
      }

      // 2. Obtenir les rôles des deux utilisateurs
      const actorRoles = await this.getUserRoles(actorUserId);
      const targetRole = await this.getUserRole(targetUserId);

      // 3. Vérifier la hiérarchie des rôles
      for (const roleAssignment of actorRoles) {
        if (RoleUtils.canActOnRole(roleAssignment.getRole(), targetRole)) {
          // 4. ✅ RÈGLE : Vérifier dans le même contexte business
          const targetRoles = await this.getUserRoles(targetUserId);
          const hasCommonContext = this.hasCommonBusinessContext(
            actorRoles,
            targetRoles,
          );

          if (hasCommonContext) {
            this.logger.info('User management authorized', {
              actorUserId,
              targetUserId,
              actorRole: roleAssignment.getRole(),
              targetRole,
            });
            return true;
          }
        }
      }

      this.logger.warn('User management denied', {
        actorUserId,
        targetUserId,
        reason: 'insufficient_hierarchy_or_context',
      });

      return false;
    } catch (error) {
      this.logger.error(
        'Error checking user management permission',
        error as Error,
        {
          actorUserId,
          targetUserId,
        },
      );
      return false;
    }
  }

  /**
   * 🚨 Requérir des permissions de super-admin
   */
  async requireSuperAdminPermission(userId: string): Promise<void> {
    const isSuperAdmin = await this.isSuperAdmin(userId);

    if (!isSuperAdmin) {
      const errorMessage = this.i18n.translate('permission.superAdminRequired');

      this.logger.error(
        'Super admin permission required',
        new Error(errorMessage),
        {
          userId,
        },
      );

      throw new PermissionServiceError('Super admin permission required', {
        userId,
      });
    }
  }

  /**
   * 🔍 Vérifier si l'utilisateur est super-admin
   */
  async isSuperAdmin(userId: string): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    const isSuperAdmin = [
      UserRole.SUPER_ADMIN,
      UserRole.PLATFORM_ADMIN,
    ].includes(userRole);

    this.logger.info('Checked super admin status', {
      userId,
      userRole,
      isSuperAdmin,
    });

    return isSuperAdmin;
  }

  // === MÉTHODES PRIVÉES HELPERS ===

  /**
   * 🔍 Obtenir tous les rôles d'un utilisateur avec contexte
   */
  private async getUserRoles(
    userId: string,
    context?: Record<string, unknown>,
  ): Promise<RoleAssignment[]> {
    const assignments =
      await this.roleAssignmentRepository.findByUserId(userId);

    // Si un contexte business est spécifié, filtrer par ce contexte
    if (context?.businessId) {
      return assignments.filter(
        (assignment) =>
          assignment.getContext().businessId === context.businessId,
      );
    }

    return assignments;
  }

  /**
   * 🎭 Vérifier si un rôle a une permission dans un contexte
   */
  private async roleHasPermission(
    role: UserRole,
    permission: Permission | string,
    context?: Record<string, unknown>,
  ): Promise<boolean> {
    // 1. Vérification base des permissions du rôle
    const basePermissions = ROLE_PERMISSIONS[role] || [];

    if (basePermissions.includes(permission as Permission)) {
      return true;
    }

    // 2. ✅ RÈGLE BUSINESS : Vérifications contextuelles
    return await this.checkContextualPermission(
      role,
      permission as Permission,
      context,
    );
  }

  /**
   * 🏢 Vérifier les permissions contextuelles selon les règles métier
   */
  private async checkContextualPermission(
    role: UserRole,
    permission: Permission,
    context?: Record<string, unknown>,
  ): Promise<boolean> {
    // Exemple de règles métier contextuelles :

    // ✅ RÈGLE : Un STAFF ne peut supprimer un business SAUF s'il est BUSINESS_OWNER
    if (permission === Permission.CONFIGURE_BUSINESS_SETTINGS) {
      return [
        UserRole.SUPER_ADMIN,
        UserRole.PLATFORM_ADMIN,
        UserRole.BUSINESS_OWNER,
      ].includes(role);
    }

    // ✅ RÈGLE : Seuls certains rôles peuvent embaucher/licencier
    if (permission === Permission.FIRE_STAFF) {
      return [
        UserRole.SUPER_ADMIN,
        UserRole.PLATFORM_ADMIN,
        UserRole.BUSINESS_OWNER,
        UserRole.BUSINESS_ADMIN,
      ].includes(role);
    }

    // ✅ RÈGLE : Gestion financière restrictive
    if (permission === Permission.MANAGE_BILLING_SETTINGS) {
      return [
        UserRole.SUPER_ADMIN,
        UserRole.PLATFORM_ADMIN,
        UserRole.BUSINESS_OWNER,
      ].includes(role);
    }

    return false;
  }

  /**
   * 🏢 Vérifier si l'utilisateur a accès à un business spécifique
   */
  async hasAccessToBusiness(
    userId: string,
    businessId: string,
  ): Promise<boolean> {
    try {
      this.logger.info('Checking business access', {
        userId,
        businessId,
        context: 'hasAccessToBusiness',
      });

      // ✅ Super admin a accès à tout
      if (await this.isSuperAdmin(userId)) {
        return true;
      }

      // ✅ Vérifier les assignations de rôles dans ce contexte business
      const assignments = await this.roleAssignmentRepository.findByCriteria({
        userId,
        businessId,
        isActive: true,
      });

      return assignments.length > 0;
    } catch (error) {
      this.logger.error(
        'Failed to check business access',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          userId,
          businessId,
        },
      );
      return false;
    }
  }

  /**
   * 🔄 Vérifier s'il y a un contexte business commun entre acteur et cible
   */
  private hasCommonBusinessContext(
    actorRoles: RoleAssignment[],
    targetRoles: RoleAssignment[],
  ): boolean {
    for (const actorRole of actorRoles) {
      for (const targetRole of targetRoles) {
        if (
          actorRole.getContext().businessId ===
          targetRole.getContext().businessId
        ) {
          return true;
        }
      }
    }
    return false;
  }
}
