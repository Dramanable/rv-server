/**
 * 👥 Role Assignments Service - Gestion des Assignations de Rôles
 *
 * Service pour la gestion des assignations de rôles
 * dans le système RV Project
 *
 * @version 1.0.0
 */

import { RVProjectClient } from '../client';

// Enums
export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export enum AssignmentType {
  PERMANENT = 'PERMANENT',
  TEMPORARY = 'TEMPORARY',
  PROJECT_BASED = 'PROJECT_BASED',
  EMERGENCY = 'EMERGENCY',
}

// Interfaces
export interface RoleAssignment {
  readonly id: string;
  readonly userId: string;
  readonly roleId: string;
  readonly businessId: string;
  readonly assignedBy: string;
  readonly status: AssignmentStatus;
  readonly type: AssignmentType;
  readonly startDate: string;
  readonly endDate?: string;
  readonly reason?: string;
  readonly notes?: string;
  readonly isInherited: boolean;
  readonly priority: number;
  readonly effectivePermissions: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;

  // Données utilisateur associées
  readonly user?: {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly phone?: string;
    readonly avatar?: string;
  };

  // Données de rôle associées
  readonly role?: {
    readonly id: string;
    readonly name: string;
    readonly code: string;
    readonly level: string;
    readonly permissions: readonly string[];
  };

  // Données business associées
  readonly business?: {
    readonly id: string;
    readonly name: string;
    readonly sectorName?: string;
  };

  // Données de l'assignateur
  readonly assigner?: {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
  };
}

export interface CreateRoleAssignmentDto {
  readonly userId: string;
  readonly roleId: string;
  readonly businessId: string;
  readonly type?: AssignmentType;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly reason?: string;
  readonly notes?: string;
  readonly priority?: number;
}

export interface UpdateRoleAssignmentDto {
  readonly status?: AssignmentStatus;
  readonly type?: AssignmentType;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly reason?: string;
  readonly notes?: string;
  readonly priority?: number;
}

export interface ListRoleAssignmentsDto {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?:
    | 'createdAt'
    | 'startDate'
    | 'endDate'
    | 'priority'
    | 'userName'
    | 'roleName';
  readonly sortOrder?: 'asc' | 'desc';
  readonly search?: string;
  readonly userId?: string;
  readonly roleId?: string;
  readonly businessId?: string;
  readonly assignedBy?: string;
  readonly status?: AssignmentStatus;
  readonly type?: AssignmentType;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly isExpired?: boolean;
  readonly isActive?: boolean;
}

export interface ListRoleAssignmentsResponse {
  readonly data: readonly RoleAssignment[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export interface CreateRoleAssignmentResponse {
  readonly success: boolean;
  readonly data: RoleAssignment;
  readonly message: string;
}

export interface UpdateRoleAssignmentResponse {
  readonly success: boolean;
  readonly data: RoleAssignment;
  readonly message: string;
}

export interface DeleteRoleAssignmentResponse {
  readonly success: boolean;
  readonly message: string;
}

export interface RoleAssignmentStats {
  readonly totalAssignments: number;
  readonly activeAssignments: number;
  readonly pendingAssignments: number;
  readonly expiredAssignments: number;
  readonly revokedAssignments: number;
  readonly assignmentsByType: Record<AssignmentType, number>;
  readonly assignmentsByStatus: Record<AssignmentStatus, number>;
  readonly topRoles: readonly {
    readonly roleId: string;
    readonly roleName: string;
    readonly count: number;
  }[];
  readonly recentAssignments: readonly RoleAssignment[];
}

export interface UserPermissions {
  readonly userId: string;
  readonly businessId?: string;
  readonly effectivePermissions: readonly string[];
  readonly roleAssignments: readonly RoleAssignment[];
  readonly inheritedPermissions: readonly {
    readonly permission: string;
    readonly source: string;
    readonly roleId: string;
    readonly roleName: string;
  }[];
}

/**
 * 👥 Service principal pour la gestion des assignations de rôles
 */
export default class RoleAssignmentsService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister les assignations de rôles avec filtrage avancé
   */
  async list(
    params: ListRoleAssignmentsDto = {},
  ): Promise<ListRoleAssignmentsResponse> {
    const response = await this.client.post(
      '/api/v1/role-assignments/list',
      params,
    );
    return response.data;
  }

  /**
   * 📄 Obtenir une assignation de rôle par ID
   */
  async getById(id: string): Promise<RoleAssignment> {
    const response = await this.client.get(`/api/v1/role-assignments/${id}`);
    return response.data.data;
  }

  /**
   * ➕ Créer une nouvelle assignation de rôle
   */
  async create(
    data: CreateRoleAssignmentDto,
  ): Promise<CreateRoleAssignmentResponse> {
    const response = await this.client.post('/api/v1/role-assignments', data);
    return response.data;
  }

  /**
   * ✏️ Mettre à jour une assignation de rôle
   */
  async update(
    id: string,
    data: UpdateRoleAssignmentDto,
  ): Promise<UpdateRoleAssignmentResponse> {
    const response = await this.client.put(
      `/api/v1/role-assignments/${id}`,
      data,
    );
    return response.data;
  }

  /**
   * 🗑️ Supprimer une assignation de rôle
   */
  async delete(id: string): Promise<DeleteRoleAssignmentResponse> {
    const response = await this.client.delete(`/api/v1/role-assignments/${id}`);
    return response.data;
  }

  /**
   * 👤 Obtenir les assignations d'un utilisateur
   */
  async getUserAssignments(
    userId: string,
    businessId?: string,
  ): Promise<RoleAssignment[]> {
    const params: ListRoleAssignmentsDto = {
      userId,
      limit: 100,
      ...(businessId && { businessId }),
    };
    const response = await this.list(params);
    return [...response.data];
  }

  /**
   * 👔 Obtenir les assignations d'un rôle
   */
  async getRoleAssignments(roleId: string): Promise<RoleAssignment[]> {
    const response = await this.list({ roleId, limit: 100 });
    return [...response.data];
  }

  /**
   * 🏢 Obtenir les assignations d'un business
   */
  async getBusinessAssignments(businessId: string): Promise<RoleAssignment[]> {
    const response = await this.list({ businessId, limit: 100 });
    return [...response.data];
  }

  /**
   * ✅ Obtenir les assignations actives
   */
  async getActiveAssignments(): Promise<RoleAssignment[]> {
    const response = await this.list({
      status: AssignmentStatus.ACTIVE,
      limit: 100,
    });
    return [...response.data];
  }

  /**
   * ⏳ Obtenir les assignations en attente
   */
  async getPendingAssignments(): Promise<RoleAssignment[]> {
    const response = await this.list({
      status: AssignmentStatus.PENDING,
      limit: 100,
    });
    return [...response.data];
  }

  /**
   * ⏰ Obtenir les assignations expirées
   */
  async getExpiredAssignments(): Promise<RoleAssignment[]> {
    const response = await this.list({ isExpired: true, limit: 100 });
    return [...response.data];
  }

  /**
   * 🔄 Activer une assignation
   */
  async activate(
    assignmentId: string,
    reason?: string,
  ): Promise<UpdateRoleAssignmentResponse> {
    const response = await this.client.patch(
      `/api/v1/role-assignments/${assignmentId}/activate`,
      {
        reason,
      },
    );
    return response.data;
  }

  /**
   * ⏸️ Désactiver une assignation
   */
  async deactivate(
    assignmentId: string,
    reason?: string,
  ): Promise<UpdateRoleAssignmentResponse> {
    const response = await this.client.patch(
      `/api/v1/role-assignments/${assignmentId}/deactivate`,
      {
        reason,
      },
    );
    return response.data;
  }

  /**
   * ❌ Révoquer une assignation
   */
  async revoke(
    assignmentId: string,
    reason: string,
  ): Promise<UpdateRoleAssignmentResponse> {
    const response = await this.client.patch(
      `/api/v1/role-assignments/${assignmentId}/revoke`,
      {
        reason,
      },
    );
    return response.data;
  }

  /**
   * ⏰ Prolonger une assignation
   */
  async extend(
    assignmentId: string,
    newEndDate: string,
    reason?: string,
  ): Promise<UpdateRoleAssignmentResponse> {
    const response = await this.client.patch(
      `/api/v1/role-assignments/${assignmentId}/extend`,
      {
        endDate: newEndDate,
        reason,
      },
    );
    return response.data;
  }

  /**
   * 🔄 Transférer une assignation
   */
  async transfer(
    assignmentId: string,
    newUserId: string,
    reason?: string,
  ): Promise<UpdateRoleAssignmentResponse> {
    const response = await this.client.patch(
      `/api/v1/role-assignments/${assignmentId}/transfer`,
      {
        userId: newUserId,
        reason,
      },
    );
    return response.data;
  }

  /**
   * 🔐 Obtenir les permissions effectives d'un utilisateur
   */
  async getUserPermissions(
    userId: string,
    businessId?: string,
  ): Promise<UserPermissions> {
    const queryParams = businessId ? `?businessId=${businessId}` : '';
    const response = await this.client.get(
      `/api/v1/role-assignments/user/${userId}/permissions${queryParams}`,
    );
    return response.data.data;
  }

  /**
   * ✅ Vérifier si un utilisateur a une permission
   */
  async hasPermission(
    userId: string,
    permission: string,
    businessId?: string,
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, businessId);
    return userPermissions.effectivePermissions.includes(permission);
  }

  /**
   * 👥 Assigner un rôle à plusieurs utilisateurs (bulk)
   */
  async assignToMultipleUsers(
    userIds: string[],
    roleData: Omit<CreateRoleAssignmentDto, 'userId'>,
  ): Promise<CreateRoleAssignmentResponse[]> {
    const assignments = userIds.map((userId) => ({
      ...roleData,
      userId,
    }));

    const response = await this.client.post('/api/v1/role-assignments/bulk', {
      assignments,
    });
    return response.data.data;
  }

  /**
   * 🔄 Révoquer plusieurs assignations en lot (batch revoke)
   */
  async batchRevoke(
    assignmentIds: string[],
    reason: string,
  ): Promise<{
    success: boolean;
    revokedCount: number;
    failed: { id: string; error: string }[];
  }> {
    const response = await this.client.post(
      '/api/v1/role-assignments/batch-revoke',
      {
        assignmentIds,
        reason,
      },
    );
    return response.data;
  }

  /**
   * 📊 Obtenir les statistiques des assignations
   */
  async getStats(): Promise<RoleAssignmentStats> {
    const response = await this.client.get('/api/v1/role-assignments/stats');
    return response.data.data;
  }

  /**
   * 🔍 Rechercher des assignations
   */
  async search(query: string, businessId?: string): Promise<RoleAssignment[]> {
    const params: ListRoleAssignmentsDto = {
      search: query,
      limit: 50,
      ...(businessId && { businessId }),
    };
    const response = await this.list(params);
    return [...response.data];
  }

  /**
   * 📅 Obtenir les assignations pour une période
   */
  async getByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<RoleAssignment[]> {
    const response = await this.list({
      startDate,
      endDate,
      limit: 100,
    });
    return [...response.data];
  }

  /**
   * 👨‍💼 Obtenir les assignations créées par un utilisateur
   */
  async getAssignmentsByAssigner(
    assignerId: string,
  ): Promise<RoleAssignment[]> {
    const response = await this.list({ assignedBy: assignerId, limit: 100 });
    return [...response.data];
  }

  /**
   * 🏷️ Obtenir tous les statuts d'assignation
   */
  static getStatuses(): AssignmentStatus[] {
    return Object.values(AssignmentStatus);
  }

  /**
   * 📝 Obtenir tous les types d'assignation
   */
  static getTypes(): AssignmentType[] {
    return Object.values(AssignmentType);
  }

  /**
   * 🎨 Obtenir la couleur pour un statut
   */
  static getStatusColor(status: AssignmentStatus): string {
    const colors: Record<AssignmentStatus, string> = {
      [AssignmentStatus.ACTIVE]: '#22C55E', // Vert
      [AssignmentStatus.INACTIVE]: '#6B7280', // Gris
      [AssignmentStatus.PENDING]: '#F59E0B', // Orange
      [AssignmentStatus.EXPIRED]: '#EF4444', // Rouge
      [AssignmentStatus.REVOKED]: '#DC2626', // Rouge foncé
    };
    return colors[status] || '#6B7280';
  }

  /**
   * 🎨 Obtenir l'icône pour un statut
   */
  static getStatusIcon(status: AssignmentStatus): string {
    const icons: Record<AssignmentStatus, string> = {
      [AssignmentStatus.ACTIVE]: '✅',
      [AssignmentStatus.INACTIVE]: '⚫',
      [AssignmentStatus.PENDING]: '⏳',
      [AssignmentStatus.EXPIRED]: '⏰',
      [AssignmentStatus.REVOKED]: '❌',
    };
    return icons[status] || '❓';
  }

  /**
   * 🎨 Obtenir la couleur pour un type
   */
  static getTypeColor(type: AssignmentType): string {
    const colors: Record<AssignmentType, string> = {
      [AssignmentType.PERMANENT]: '#3B82F6', // Bleu
      [AssignmentType.TEMPORARY]: '#F59E0B', // Orange
      [AssignmentType.PROJECT_BASED]: '#8B5CF6', // Violet
      [AssignmentType.EMERGENCY]: '#EF4444', // Rouge
    };
    return colors[type] || '#6B7280';
  }

  /**
   * 🎨 Obtenir l'icône pour un type
   */
  static getTypeIcon(type: AssignmentType): string {
    const icons: Record<AssignmentType, string> = {
      [AssignmentType.PERMANENT]: '🏛️',
      [AssignmentType.TEMPORARY]: '⏰',
      [AssignmentType.PROJECT_BASED]: '🎯',
      [AssignmentType.EMERGENCY]: '🚨',
    };
    return icons[type] || '❓';
  }

  /**
   * ✅ Valider les données d'assignation
   */
  static validateAssignmentData(
    data: CreateRoleAssignmentDto | UpdateRoleAssignmentDto,
  ): string[] {
    const errors: string[] = [];

    if ('startDate' in data && data.startDate) {
      const startDate = new Date(data.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push('Date de début invalide');
      }
    }

    if ('endDate' in data && data.endDate) {
      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        errors.push('Date de fin invalide');
      }

      if ('startDate' in data && data.startDate) {
        const startDate = new Date(data.startDate);
        if (endDate <= startDate) {
          errors.push(
            'La date de fin doit être postérieure à la date de début',
          );
        }
      }
    }

    if ('priority' in data && data.priority !== undefined) {
      if (data.priority < 1 || data.priority > 10) {
        errors.push('La priorité doit être entre 1 et 10');
      }
    }

    return errors;
  }

  /**
   * 🔧 Utilitaires pour les assignations de rôles
   */
  static readonly utils = {
    /**
     * Vérifier si une assignation est active
     */
    isActive: (assignment: RoleAssignment): boolean => {
      if (assignment.status !== AssignmentStatus.ACTIVE) {
        return false;
      }

      const now = new Date();
      const startDate = new Date(assignment.startDate);

      if (startDate > now) {
        return false;
      }

      if (assignment.endDate) {
        const endDate = new Date(assignment.endDate);
        if (endDate < now) {
          return false;
        }
      }

      return true;
    },

    /**
     * Vérifier si une assignation est expirée
     */
    isExpired: (assignment: RoleAssignment): boolean => {
      if (!assignment.endDate) {
        return false;
      }

      const now = new Date();
      const endDate = new Date(assignment.endDate);
      return endDate < now;
    },

    /**
     * Calculer le nombre de jours restants
     */
    getDaysRemaining: (assignment: RoleAssignment): number | null => {
      if (!assignment.endDate) {
        return null;
      }

      const now = new Date();
      const endDate = new Date(assignment.endDate);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return Math.max(0, diffDays);
    },

    /**
     * Calculer la durée de l'assignation
     */
    getDuration: (assignment: RoleAssignment): string => {
      const startDate = new Date(assignment.startDate);
      const endDate = assignment.endDate
        ? new Date(assignment.endDate)
        : new Date();

      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} mois`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `${years} an${years > 1 ? 's' : ''}`;
      }
    },

    /**
     * Formater la période d'assignation
     */
    formatPeriod: (assignment: RoleAssignment): string => {
      const startDate = new Date(assignment.startDate).toLocaleDateString();
      if (!assignment.endDate) {
        return `Depuis le ${startDate}`;
      }
      const endDate = new Date(assignment.endDate).toLocaleDateString();
      return `Du ${startDate} au ${endDate}`;
    },

    /**
     * Obtenir le nom de l'utilisateur
     */
    getUserName: (assignment: RoleAssignment): string => {
      if (!assignment.user) return 'Utilisateur indisponible';
      return `${assignment.user.firstName} ${assignment.user.lastName}`;
    },

    /**
     * Obtenir le nom du rôle
     */
    getRoleName: (assignment: RoleAssignment): string => {
      return assignment.role?.name || 'Rôle indisponible';
    },

    /**
     * Obtenir le nom du business
     */
    getBusinessName: (assignment: RoleAssignment): string => {
      return assignment.business?.name || 'Business indisponible';
    },

    /**
     * Vérifier si l'assignation nécessite une attention
     */
    needsAttention: (assignment: RoleAssignment): boolean => {
      if (assignment.status === AssignmentStatus.PENDING) {
        return true;
      }

      if (assignment.endDate) {
        const daysRemaining =
          RoleAssignmentsService.utils.getDaysRemaining(assignment);
        return daysRemaining !== null && daysRemaining <= 7;
      }

      return false;
    },

    /**
     * Obtenir les permissions uniques d'une liste d'assignations
     */
    getUniquePermissions: (assignments: RoleAssignment[]): string[] => {
      const permissions = new Set<string>();
      assignments.forEach((assignment) => {
        assignment.effectivePermissions.forEach((permission) => {
          permissions.add(permission);
        });
      });
      return Array.from(permissions).sort();
    },
  };
}
