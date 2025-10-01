/**
 * 🔐 USER PERMISSION REPOSITORY INTERFACE - Domain Layer
 *
 * Interface pour la persistence des permissions utilisateurs.
 * Définit le contrat pour la couche infrastructure.
 */

import {
  UserPermission,
  PermissionAction,
  ResourceType,
} from "../entities/user-permission.entity";

export interface IUserPermissionRepository {
  /**
   * 💾 Sauvegarder une permission utilisateur
   */
  save(userPermission: UserPermission): Promise<UserPermission>;

  /**
   * 🔍 Trouver les permissions d'un utilisateur
   */
  findByUserId(userId: string): Promise<UserPermission[]>;

  /**
   * 🔍 Trouver les permissions d'un utilisateur pour une ressource
   */
  findByUserIdAndResource(
    userId: string,
    resource: ResourceType,
  ): Promise<UserPermission[]>;

  /**
   * 🔍 Trouver les permissions d'un utilisateur dans un contexte business
   */
  findByUserIdAndBusinessId(
    userId: string,
    businessId: string,
  ): Promise<UserPermission[]>;

  /**
   * 🔍 Vérifier si un utilisateur a une permission spécifique
   */
  hasPermission(
    userId: string,
    action: PermissionAction,
    resource: ResourceType,
    businessId?: string | null,
  ): Promise<boolean>;

  /**
   * 🔍 Trouver une permission spécifique
   */
  findByUserActionResource(
    userId: string,
    action: PermissionAction,
    resource: ResourceType,
    businessId?: string | null,
  ): Promise<UserPermission | null>;

  /**
   * 🗑️ Supprimer une permission
   */
  delete(id: string): Promise<void>;

  /**
   * 🗑️ Supprimer toutes les permissions d'un utilisateur
   */
  deleteByUserId(userId: string): Promise<void>;

  /**
   * 📊 Compter les permissions accordées à un utilisateur
   */
  countByUserId(userId: string): Promise<number>;
}
