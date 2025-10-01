/**
 * 🎭 DOMAIN REPOSITORY INTERFACE - Role Assignment
 *
 * Interface de repository pour la gestion des assignations de rôles.
 * Définit les contrats pour la persistence des assignations de rôles avec contexte métier.
 *
 * PRINCIPES CLEAN ARCHITECTURE :
 * - Interface dans la couche Domain (port)
 * - Implémentation dans la couche Infrastructure (adapter)
 * - Pas de dépendances techniques dans cette interface
 */

import {
  RoleAssignment,
  RoleAssignmentContext,
} from "@domain/entities/role-assignment.entity";
import { UserRole } from "@shared/enums/user-role.enum";

export interface RoleAssignmentCriteria {
  readonly userId?: string;
  readonly role?: UserRole;
  readonly businessId?: string;
  readonly locationId?: string;
  readonly departmentId?: string;
  readonly isActive?: boolean;
  readonly includeExpired?: boolean;
  readonly assignedBy?: string;
}

export interface RoleAssignmentFilters {
  readonly search?: string;
  readonly roles?: UserRole[];
  readonly businessIds?: string[];
  readonly locationIds?: string[];
  readonly departmentIds?: string[];
  readonly isActive?: boolean;
  readonly expirationStatus?: "active" | "expired" | "expiring_soon";
  readonly assignmentScope?: "BUSINESS" | "LOCATION" | "DEPARTMENT";
}

export interface IRoleAssignmentRepository {
  /**
   * 💾 Sauvegarder une assignation de rôle
   */
  save(roleAssignment: RoleAssignment): Promise<RoleAssignment>;

  /**
   * 🔍 Trouver par ID
   */
  findById(id: string): Promise<RoleAssignment | null>;

  /**
   * 👤 Trouver toutes les assignations d'un utilisateur
   */
  findByUserId(userId: string): Promise<RoleAssignment[]>;

  /**
   * 👤 Trouver les assignations actives d'un utilisateur
   */
  findActiveByUserId(userId: string): Promise<RoleAssignment[]>;

  /**
   * 👤 Trouver les assignations actives d'un utilisateur dans un contexte spécifique
   */
  findActiveByUserIdAndContext(
    userId: string,
    context: RoleAssignmentContext,
  ): Promise<RoleAssignment[]>;

  /**
   * 🏢 Trouver les assignations dans un contexte métier
   */
  findByContext(context: RoleAssignmentContext): Promise<RoleAssignment[]>;

  /**
   * 🔍 Trouver les assignations selon des critères
   */
  findByCriteria(criteria: RoleAssignmentCriteria): Promise<RoleAssignment[]>;

  /**
   * 📋 Lister avec filtres et pagination
   */
  findWithFilters(
    filters: RoleAssignmentFilters,
    pagination?: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
    },
  ): Promise<{
    data: RoleAssignment[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * ✅ Vérifier si un utilisateur a un rôle spécifique dans un contexte
   */
  hasRoleInContext(
    userId: string,
    role: UserRole,
    context: RoleAssignmentContext,
  ): Promise<boolean>;

  /**
   * 🎭 Obtenir le rôle effectif d'un utilisateur dans un contexte
   */
  getEffectiveRole(
    userId: string,
    context: RoleAssignmentContext,
  ): Promise<UserRole | null>;

  /**
   * 📊 Compter les assignations selon des critères
   */
  countByCriteria(criteria: RoleAssignmentCriteria): Promise<number>;

  /**
   * ⏰ Trouver les assignations qui expirent bientôt
   */
  findExpiringSoon(daysAhead: number): Promise<RoleAssignment[]>;

  /**
   * 🗑️ Supprimer une assignation (soft delete)
   */
  delete(id: string): Promise<boolean>;

  /**
   * 🗑️ Supprimer toutes les assignations d'un utilisateur
   */
  deleteByUserId(userId: string): Promise<number>;

  /**
   * 🏢 Supprimer toutes les assignations dans un contexte
   */
  deleteByContext(context: RoleAssignmentContext): Promise<number>;

  /**
   * ♻️ Réactiver une assignation désactivée
   */
  reactivate(id: string): Promise<RoleAssignment | null>;

  /**
   * 📈 Obtenir des statistiques d'assignations
   */
  getAssignmentStats(businessId?: string): Promise<{
    totalAssignments: number;
    activeAssignments: number;
    expiredAssignments: number;
    assignmentsByRole: Record<UserRole, number>;
    assignmentsByScope: Record<string, number>;
  }>;

  /**
   * 👥 Trouver tous les utilisateurs avec un rôle spécifique dans un contexte
   */
  findUsersWithRoleInContext(
    role: UserRole,
    context: RoleAssignmentContext,
  ): Promise<string[]>;

  /**
   * 🔄 Transférer toutes les assignations d'un utilisateur à un autre
   */
  transferAssignments(
    fromUserId: string,
    toUserId: string,
    transferredBy: string,
  ): Promise<RoleAssignment[]>;

  /**
   * 🎯 Vérifier les conflits d'assignation (même rôle, même contexte)
   */
  checkAssignmentConflicts(
    userId: string,
    role: UserRole,
    context: RoleAssignmentContext,
  ): Promise<RoleAssignment[]>;

  /**
   * 📋 Obtenir l'historique des assignations d'un utilisateur
   */
  getAssignmentHistory(
    userId: string,
    includeCurrent?: boolean,
  ): Promise<RoleAssignment[]>;

  /**
   * 🔍 Recherche avancée d'assignations avec texte libre
   */
  searchAssignments(
    searchQuery: string,
    context?: RoleAssignmentContext,
  ): Promise<RoleAssignment[]>;
}
