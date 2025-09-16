/**
 * 🔌 APPLICATION PORT - User Repository
 *
 * Interface pour la persistance des utilisateurs avec pagination et filtres
 * Clean Architecture : Application ne dépend PAS de l'infrastructure
 */

import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
import { UserRole } from '../../shared/enums/user-role.enum';
import { PaginatedResult } from '../../shared/types/pagination.types';
import { UserQueryParams } from '../../shared/types/user-query.types';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepository {
  /**
   * Sauvegarde un utilisateur
   */
  save(user: User): Promise<User>;

  /**
   * Trouve un utilisateur par ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Trouve un utilisateur par email
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Trouve un utilisateur par nom d'utilisateur
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Supprime un utilisateur par ID
   */
  delete(id: string): Promise<void>;

  /**
   * Trouve tous les utilisateurs avec pagination et filtres
   */
  findAll(params?: UserQueryParams): Promise<PaginatedResult<User>>;

  /**
   * Recherche utilisateurs avec critères avancés
   */
  search(params: UserQueryParams): Promise<PaginatedResult<User>>;

  /**
   * Trouve les utilisateurs par rôle avec pagination
   */
  findByRole(
    role: UserRole,
    params?: UserQueryParams,
  ): Promise<PaginatedResult<User>>;

  /**
   * Supprime un utilisateur
   */
  delete(id: string): Promise<void>;

  /**
   * Vérifie si un email existe déjà
   */
  emailExists(email: Email): Promise<boolean>;

  /**
   * Vérifie si un nom d'utilisateur existe déjà
   */
  existsByUsername(username: string): Promise<boolean>;

  /**
   * Met à jour le mot de passe d'un utilisateur
   */
  updatePassword(id: string, passwordHash: string): Promise<void>;

  /**
   * Met à jour le statut actif d'un utilisateur
   */
  updateActiveStatus(id: string, isActive: boolean): Promise<void>;

  /**
   * Compte le nombre de super admins
   */
  countSuperAdmins(): Promise<number>;

  /**
   * Compte le total d'utilisateurs
   */
  count(): Promise<number>;

  /**
   * Compte avec filtres
   */
  countWithFilters(params: UserQueryParams): Promise<number>;

  /**
   * Met à jour un utilisateur
   */
  update(user: User): Promise<User>;

  /**
   * Met à jour en lot (pour les opérations admin)
   */
  updateBatch(users: User[]): Promise<User[]>;

  /**
   * Supprime en lot (pour les opérations admin)
   */
  deleteBatch(ids: string[]): Promise<void>;

  /**
   * Exporte les utilisateurs (pour backup/analytics)
   */
  export(params?: UserQueryParams): Promise<User[]>;
}
