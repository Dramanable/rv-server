/**
 * 🎭 RV Project Frontend SDK - Service de Gestion des Rôles
 *
 * Gestion des rôles utilisateur et hiérarchie des permissions
 */

import { RVProjectClient } from '../client';
import { PaginatedResponse } from '../types';

export enum RoleType {
  SYSTEM = 'SYSTEM',
  BUSINESS = 'BUSINESS',
  SERVICE = 'SERVICE',
  CUSTOM = 'CUSTOM',
}

export enum RoleLevel {
  PLATFORM = 'PLATFORM',
  BUSINESS = 'BUSINESS',
  DEPARTMENT = 'DEPARTMENT',
  SERVICE = 'SERVICE',
}

export interface Role {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly type: RoleType;
  readonly level: RoleLevel;
  readonly businessId?: string;
  readonly parentRoleId?: string;
  readonly isActive: boolean;
  readonly isSystem: boolean;
  readonly permissions: string[];
  readonly userCount?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserRole {
  readonly id: string;
  readonly userId: string;
  readonly roleId: string;
  readonly role: Role;
  readonly businessId?: string;
  readonly assignedBy: string;
  readonly assignedAt: string;
  readonly expiresAt?: string;
  readonly isActive: boolean;
  readonly createdAt: string;
}

export interface CreateRoleRequest {
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly type: RoleType;
  readonly level: RoleLevel;
  readonly businessId?: string;
  readonly parentRoleId?: string;
  readonly permissions?: string[];
}

export interface UpdateRoleRequest {
  readonly name?: string;
  readonly description?: string;
  readonly isActive?: boolean;
  readonly permissions?: string[];
}

export interface AssignRoleRequest {
  readonly userId: string;
  readonly roleId: string;
  readonly businessId?: string;
  readonly expiresAt?: string;
}

export interface ListRolesRequest {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
  readonly type?: RoleType;
  readonly level?: RoleLevel;
  readonly businessId?: string;
  readonly isActive?: boolean;
  readonly isSystem?: boolean;
  readonly search?: string;
}

export interface ListUserRolesRequest {
  readonly userId: string;
  readonly businessId?: string;
  readonly includeExpired?: boolean;
  readonly includeInactive?: boolean;
}

export class RoleService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister tous les rôles
   */
  async list(request: ListRolesRequest = {}): Promise<PaginatedResponse<Role>> {
    const response = await this.client.post<PaginatedResponse<Role>>(
      '/api/v1/roles/list',
      request,
    );
    return response.data;
  }

  /**
   * 📄 Obtenir un rôle par ID
   */
  async getById(id: string): Promise<Role> {
    const response = await this.client.get<Role>(`/api/v1/roles/${id}`);
    return response.data;
  }

  /**
   * 🔍 Obtenir un rôle par code
   */
  async getByCode(code: string, businessId?: string): Promise<Role> {
    const query = businessId ? `?businessId=${businessId}` : '';
    const response = await this.client.get<Role>(
      `/api/v1/roles/code/${code}${query}`,
    );
    return response.data;
  }

  /**
   * ➕ Créer un nouveau rôle
   */
  async create(request: CreateRoleRequest): Promise<Role> {
    const response = await this.client.post<Role>('/api/v1/roles', request);
    return response.data;
  }

  /**
   * ✏️ Mettre à jour un rôle
   */
  async update(id: string, updates: UpdateRoleRequest): Promise<Role> {
    const response = await this.client.put<Role>(
      `/api/v1/roles/${id}`,
      updates,
    );
    return response.data;
  }

  /**
   * 🗑️ Supprimer un rôle
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/roles/${id}`);
  }

  /**
   * 👤 Obtenir les rôles d'un utilisateur
   */
  async getUserRoles(request: ListUserRolesRequest): Promise<UserRole[]> {
    const response = await this.client.post<UserRole[]>(
      '/api/v1/roles/user-roles',
      request,
    );
    return response.data;
  }

  /**
   * ✅ Assigner un rôle à un utilisateur
   */
  async assignToUser(request: AssignRoleRequest): Promise<UserRole> {
    const response = await this.client.post<UserRole>(
      '/api/v1/roles/assign',
      request,
    );
    return response.data;
  }

  /**
   * ❌ Révoquer un rôle d'un utilisateur
   */
  async revokeFromUser(userRoleId: string): Promise<void> {
    await this.client.delete(`/api/v1/roles/user-roles/${userRoleId}`);
  }

  /**
   * 🔒 Ajouter des permissions à un rôle
   */
  async addPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    const response = await this.client.post<Role>(
      `/api/v1/roles/${roleId}/permissions`,
      { permissionIds },
    );
    return response.data;
  }

  /**
   * 🚫 Supprimer des permissions d'un rôle
   */
  async removePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const response = await this.client.post<Role>(
      `/api/v1/roles/${roleId}/permissions/remove`,
      { permissionIds },
    );
    return response.data;
  }

  /**
   * 🏢 Obtenir les rôles disponibles pour un business
   */
  async getBusinessRoles(businessId: string): Promise<Role[]> {
    const response = await this.client.get<Role[]>(
      `/api/v1/roles/business/${businessId}`,
    );
    return response.data;
  }

  /**
   * 🌟 Obtenir les rôles système
   */
  async getSystemRoles(): Promise<Role[]> {
    const response = await this.client.get<Role[]>('/api/v1/roles/system');
    return response.data;
  }

  /**
   * 📊 Obtenir les statistiques des rôles
   */
  async getStats(businessId?: string): Promise<{
    totalRoles: number;
    activeRoles: number;
    systemRoles: number;
    businessRoles: number;
    byType: Record<RoleType, number>;
    byLevel: Record<RoleLevel, number>;
    totalUserRoles: number;
    mostAssignedRole: { role: Role; count: number } | null;
  }> {
    const query = businessId ? `?businessId=${businessId}` : '';
    const response = await this.client.get<{
      totalRoles: number;
      activeRoles: number;
      systemRoles: number;
      businessRoles: number;
      byType: Record<RoleType, number>;
      byLevel: Record<RoleLevel, number>;
      totalUserRoles: number;
      mostAssignedRole: { role: Role; count: number } | null;
    }>(`/api/v1/roles/stats${query}`);
    return response.data;
  }

  /**
   * 🔗 Obtenir la hiérarchie des rôles
   */
  async getRoleHierarchy(businessId?: string): Promise<
    {
      id: string;
      role: Role;
      children: Array<{
        id: string;
        role: Role;
        children: any[];
      }>;
    }[]
  > {
    const query = businessId ? `?businessId=${businessId}` : '';
    const response = await this.client.get<
      {
        id: string;
        role: Role;
        children: Array<{
          id: string;
          role: Role;
          children: any[];
        }>;
      }[]
    >(`/api/v1/roles/hierarchy${query}`);
    return response.data;
  }

  /**
   * 🔄 Cloner un rôle
   */
  async clone(roleId: string, newName: string, newCode: string): Promise<Role> {
    const response = await this.client.post<Role>(
      `/api/v1/roles/${roleId}/clone`,
      {
        name: newName,
        code: newCode,
      },
    );
    return response.data;
  }

  /**
   * 🏷️ Obtenir les rôles par type
   */
  async getRolesByType(type: RoleType, businessId?: string): Promise<Role[]> {
    const requestData: ListRolesRequest = businessId
      ? { type, businessId, limit: 100 }
      : { type, limit: 100 };

    const response = await this.list(requestData);
    return [...response.data];
  }

  /**
   * 📋 Obtenir les rôles recommandés pour un utilisateur
   */
  async getRecommendedRoles(
    userId: string,
    businessId?: string,
    userSkills?: string[],
  ): Promise<
    {
      role: Role;
      matchScore: number;
      reasons: string[];
    }[]
  > {
    const body: any = { userId };
    if (businessId) body.businessId = businessId;
    if (userSkills) body.userSkills = userSkills;

    const response = await this.client.post<
      {
        role: Role;
        matchScore: number;
        reasons: string[];
      }[]
    >('/api/v1/roles/recommendations', body);
    return response.data;
  }

  /**
   * 🛡️ Méthodes utilitaires pour les rôles
   */
  static formatRoleName(role: Role): string {
    return role.businessId ? `${role.name} (${role.businessId})` : role.name;
  }

  static isRoleExpired(userRole: UserRole): boolean {
    if (!userRole.expiresAt) return false;
    return new Date(userRole.expiresAt) < new Date();
  }

  static getRolesByLevel(roles: Role[], level: RoleLevel): Role[] {
    return roles.filter((role) => role.level === level);
  }

  static hasPermission(role: Role, permissionCode: string): boolean {
    return role.permissions.includes(permissionCode);
  }

  static canManageRole(currentUserRole: Role, targetRole: Role): boolean {
    // Règles de base : on peut gérer les rôles de niveau inférieur ou égal
    const levelHierarchy: Record<RoleLevel, number> = {
      [RoleLevel.PLATFORM]: 4,
      [RoleLevel.BUSINESS]: 3,
      [RoleLevel.DEPARTMENT]: 2,
      [RoleLevel.SERVICE]: 1,
    };

    return (
      levelHierarchy[currentUserRole.level] >= levelHierarchy[targetRole.level]
    );
  }

  static sortRolesByHierarchy(roles: Role[]): Role[] {
    const levelOrder: Record<RoleLevel, number> = {
      [RoleLevel.PLATFORM]: 4,
      [RoleLevel.BUSINESS]: 3,
      [RoleLevel.DEPARTMENT]: 2,
      [RoleLevel.SERVICE]: 1,
    };

    return roles.sort((a, b) => {
      const levelDiff = levelOrder[b.level] - levelOrder[a.level];
      if (levelDiff !== 0) return levelDiff;
      return a.name.localeCompare(b.name);
    });
  }

  static getEffectivePermissions(userRoles: UserRole[]): string[] {
    const permissions = new Set<string>();

    userRoles
      .filter(
        (userRole) =>
          userRole.isActive &&
          !this.isRoleExpired(userRole) &&
          userRole.role.isActive,
      )
      .forEach((userRole) => {
        userRole.role.permissions.forEach((permission) => {
          permissions.add(permission);
        });
      });

    return Array.from(permissions);
  }
}

export default RoleService;
