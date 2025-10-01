/**
 * 🔐 Permission Service Interface - Clean Architecture Port
 *
 * Interface pour la vérification des permissions utilisateur.
 * Définit le contrat pour les adaptateurs d'infrastructure de sécurité.
 */

import { Permission, UserRole } from "../../shared/enums/user-role.enum";

/**
 * 🔐 Service de Permissions - Interface
 *
 * Gère la vérification des permissions utilisateur selon les rôles
 * et les règles métier définies dans le système.
 */
export interface IPermissionService {
  /**
   * ✅ Vérifier si un utilisateur a une permission spécifique
   */
  hasPermission(
    userId: string,
    permission: Permission | string,
    context?: Record<string, unknown>,
  ): Promise<boolean>;

  /**
   * 🎭 Vérifier si un rôle peut agir sur un autre rôle (hiérarchie)
   */
  canActOnRole(
    actorUserId: string,
    targetRole: UserRole,
    context?: Record<string, unknown>,
  ): Promise<boolean>;

  /**
   * 🚨 Requérir une permission (throw si manquante)
   */
  requirePermission(
    userId: string,
    permission: Permission | string,
    context?: Record<string, unknown>,
  ): Promise<void>;

  /**
   * 📋 Obtenir toutes les permissions d'un utilisateur
   */
  getUserPermissions(userId: string): Promise<Permission[]>;

  /**
   * 🎭 Obtenir le rôle d'un utilisateur
   */
  getUserRole(userId: string): Promise<UserRole>;

  /**
   * 🔍 Vérifier si un utilisateur a un rôle spécifique
   */
  hasRole(userId: string, role: UserRole): Promise<boolean>;

  /**
   * 🏢 Vérifier les permissions dans un contexte métier spécifique
   */
  hasBusinessPermission(
    userId: string,
    permission: Permission | string,
    businessContext: {
      businessId?: string;
      locationId?: string;
      departmentId?: string;
    },
  ): Promise<boolean>;

  /**
   * 👥 Vérifier si un utilisateur peut gérer un autre utilisateur
   */
  canManageUser(actorUserId: string, targetUserId: string): Promise<boolean>;

  /**
   * 🚨 Requérir des permissions de super-admin (PLATFORM_ADMIN uniquement)
   */
  requireSuperAdminPermission(userId: string): Promise<void>;

  /**
   * 🔍 Vérifier si l'utilisateur est super-admin
   */
  isSuperAdmin(userId: string): Promise<boolean>;

  /**
   * 🏢 Vérifier si l'utilisateur a accès à un business spécifique
   */
  hasAccessToBusiness(userId: string, businessId: string): Promise<boolean>;
}
