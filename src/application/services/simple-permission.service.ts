/**
 * 🔐 SIMPLE PERMISSION SERVICE - Application Layer
 *
 * Service simplifié pour la gestion des permissions utilisateurs.
 * Système à deux niveaux :
 * 1. SUPER_ADMIN peut tout faire (niveau plateforme)
 * 2. Permissions granulaires CRUD par ressource (niveau business)
 */

import { IUserPermissionRepository } from "@domain/repositories/user-permission.repository";
import {
  UserPermission,
  PermissionAction,
  ResourceType,
} from "@domain/entities/user-permission.entity";
import { UserRole } from "@shared/enums/user-role.enum";

export interface ISimplePermissionService {
  /**
   * 🔐 Vérifier si un utilisateur a une permission
   */
  hasPermission(
    userId: string,
    userRole: UserRole,
    action: PermissionAction,
    resource: ResourceType,
    businessId?: string | null,
  ): Promise<boolean>;

  /**
   * ✅ Accorder une permission à un utilisateur
   */
  grantPermission(
    userId: string,
    action: PermissionAction,
    resource: ResourceType,
    grantedBy: string,
    businessId?: string | null,
  ): Promise<UserPermission>;

  /**
   * 🚫 Refuser une permission à un utilisateur
   */
  denyPermission(
    userId: string,
    action: PermissionAction,
    resource: ResourceType,
    grantedBy: string,
    businessId?: string | null,
  ): Promise<UserPermission>;

  /**
   * 📊 Obtenir toutes les permissions d'un utilisateur
   */
  getUserPermissions(userId: string): Promise<UserPermission[]>;

  /**
   * 🗑️ Révoquer une permission
   */
  revokePermission(
    userId: string,
    action: PermissionAction,
    resource: ResourceType,
    businessId?: string | null,
  ): Promise<void>;
}

export class SimplePermissionService implements ISimplePermissionService {
  constructor(
    private readonly userPermissionRepository: IUserPermissionRepository,
  ) {}

  /**
   * 🔐 Vérifier si un utilisateur a une permission
   *
   * RÈGLES :
   * 1. SUPER_ADMIN peut tout faire globalement
   * 2. PLATFORM_ADMIN peut tout faire au niveau plateforme
   * 3. Autres rôles vérifiés via permissions granulaires
   */
  async hasPermission(
    userId: string,
    userRole: UserRole,
    action: PermissionAction,
    resource: ResourceType,
    businessId?: string | null,
  ): Promise<boolean> {
    console.log("🔐 SimplePermissionService.hasPermission:", {
      userId,
      userRole,
      action,
      resource,
      businessId,
    });

    // 🎯 SUPER_ADMIN peut tout faire
    if (userRole === UserRole.SUPER_ADMIN) {
      console.log("✅ SUPER_ADMIN access granted");
      return true;
    }

    // 🎯 PLATFORM_ADMIN peut tout faire au niveau plateforme (businessId null)
    if (userRole === UserRole.PLATFORM_ADMIN && businessId === null) {
      console.log("✅ PLATFORM_ADMIN platform access granted");
      return true;
    }

    // 🔍 Vérifier les permissions granulaires
    const hasGranularPermission =
      await this.userPermissionRepository.hasPermission(
        userId,
        action,
        resource,
        businessId,
      );

    console.log("🔍 Granular permission check:", hasGranularPermission);
    return hasGranularPermission;
  }

  /**
   * ✅ Accorder une permission à un utilisateur
   */
  async grantPermission(
    userId: string,
    action: PermissionAction,
    resource: ResourceType,
    grantedBy: string,
    businessId?: string | null,
  ): Promise<UserPermission> {
    // Vérifier si la permission existe déjà
    const existing =
      await this.userPermissionRepository.findByUserActionResource(
        userId,
        action,
        resource,
        businessId,
      );

    if (existing) {
      // Permission existe, l'accorder si elle était refusée
      if (!existing.isGranted()) {
        existing.grant();
        return this.userPermissionRepository.save(existing);
      }
      return existing;
    }

    // Créer nouvelle permission
    const permission = UserPermission.grant({
      userId,
      action,
      resource,
      businessId,
      grantedBy,
    });

    return this.userPermissionRepository.save(permission);
  }

  /**
   * 🚫 Refuser une permission à un utilisateur
   */
  async denyPermission(
    userId: string,
    action: PermissionAction,
    resource: ResourceType,
    grantedBy: string,
    businessId?: string | null,
  ): Promise<UserPermission> {
    // Vérifier si la permission existe
    const existing =
      await this.userPermissionRepository.findByUserActionResource(
        userId,
        action,
        resource,
        businessId,
      );

    if (existing) {
      // Permission existe, la refuser
      existing.deny();
      return this.userPermissionRepository.save(existing);
    }

    // Créer permission refusée explicitement
    const permission = UserPermission.deny({
      userId,
      action,
      resource,
      businessId,
      grantedBy,
    });

    return this.userPermissionRepository.save(permission);
  }

  /**
   * 📊 Obtenir toutes les permissions d'un utilisateur
   */
  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return this.userPermissionRepository.findByUserId(userId);
  }

  /**
   * 🗑️ Révoquer une permission (la supprimer complètement)
   */
  async revokePermission(
    userId: string,
    action: PermissionAction,
    resource: ResourceType,
    businessId?: string | null,
  ): Promise<void> {
    const permission =
      await this.userPermissionRepository.findByUserActionResource(
        userId,
        action,
        resource,
        businessId,
      );

    if (permission) {
      await this.userPermissionRepository.delete(permission.getId());
    }
  }
}

/**
 * 🏭 Factory pour créer des permissions communes
 */
export class PermissionTemplates {
  /**
   * 🎯 Permissions complètes pour un admin business
   */
  static createBusinessAdminPermissions(
    businessId: string,
    grantedBy: string,
  ): Array<{
    action: PermissionAction;
    resource: ResourceType;
    businessId: string;
    grantedBy: string;
  }> {
    const resources = [
      ResourceType.APPOINTMENT,
      ResourceType.SERVICE,
      ResourceType.STAFF,
      ResourceType.CALENDAR,
      ResourceType.PROSPECT,
    ];

    return resources.map((resource) => ({
      action: PermissionAction.MANAGE,
      resource,
      businessId,
      grantedBy,
    }));
  }

  /**
   * 📖 Permissions lecture seule
   */
  static createReadOnlyPermissions(
    resources: ResourceType[],
    businessId: string | null,
    grantedBy: string,
  ): Array<{
    action: PermissionAction;
    resource: ResourceType;
    businessId: string | null;
    grantedBy: string;
  }> {
    const readActions = [PermissionAction.READ, PermissionAction.LIST];
    const permissions: Array<{
      action: PermissionAction;
      resource: ResourceType;
      businessId: string | null;
      grantedBy: string;
    }> = [];

    resources.forEach((resource) => {
      readActions.forEach((action) => {
        permissions.push({
          action,
          resource,
          businessId,
          grantedBy,
        });
      });
    });

    return permissions;
  }
}
