/**
 * 🔐 RV Project Frontend SDK - Service de Gestion des Permissions
 * 
 * Gestion des permissions et contrôle d'accès granulaire
 */

import { RVProjectClient } from '../client';
import { PaginatedResponse } from '../types';

export enum PermissionScope {
  GLOBAL = 'GLOBAL',
  BUSINESS = 'BUSINESS',
  SERVICE = 'SERVICE',
  APPOINTMENT = 'APPOINTMENT',
  USER = 'USER'
}

export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MANAGE = 'MANAGE',
  ASSIGN = 'ASSIGN',
  REVOKE = 'REVOKE'
}

export interface Permission {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly scope: PermissionScope;
  readonly action: PermissionAction;
  readonly resource: string;
  readonly isActive: boolean;
  readonly isSystem: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserPermission {
  readonly id: string;
  readonly userId: string;
  readonly permissionId: string;
  readonly permission: Permission;
  readonly businessId?: string;
  readonly resourceId?: string;
  readonly grantedBy: string;
  readonly grantedAt: string;
  readonly expiresAt?: string;
  readonly isActive: boolean;
  readonly createdAt: string;
}

export interface ListPermissionsRequest {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
  readonly scope?: PermissionScope;
  readonly action?: PermissionAction;
  readonly resource?: string;
  readonly isActive?: boolean;
  readonly isSystem?: boolean;
  readonly search?: string;
}

export interface AssignPermissionRequest {
  readonly userId: string;
  readonly permissionId: string;
  readonly businessId?: string;
  readonly resourceId?: string;
  readonly expiresAt?: string;
}

export class PermissionService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister toutes les permissions disponibles
   */
  async list(request: ListPermissionsRequest = {}): Promise<PaginatedResponse<Permission>> {
    const response = await this.client.post<PaginatedResponse<Permission>>(
      '/api/v1/permissions/list',
      request
    );
    return response.data;
  }

  /**
   * 📄 Obtenir une permission par ID
   */
  async getById(id: string): Promise<Permission> {
    const response = await this.client.get<Permission>(`/api/v1/permissions/${id}`);
    return response.data;
  }

  /**
   * 🔍 Obtenir une permission par code
   */
  async getByCode(code: string): Promise<Permission> {
    const response = await this.client.get<Permission>(`/api/v1/permissions/code/${code}`);
    return response.data;
  }

  /**
   * ➕ Créer une nouvelle permission
   */
  async create(permission: {
    name: string;
    code: string;
    description?: string;
    scope: PermissionScope;
    action: PermissionAction;
    resource: string;
  }): Promise<Permission> {
    const response = await this.client.post<Permission>('/api/v1/permissions', permission);
    return response.data;
  }

  /**
   * ✏️ Mettre à jour une permission
   */
  async update(id: string, updates: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<Permission> {
    const response = await this.client.put<Permission>(`/api/v1/permissions/${id}`, updates);
    return response.data;
  }

  /**
   * 🗑️ Supprimer une permission
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/permissions/${id}`);
  }

  /**
   * 👤 Lister les permissions d'un utilisateur
   */
  async getUserPermissions(userId: string, businessId?: string): Promise<UserPermission[]> {
    const query = new URLSearchParams();
    if (businessId) query.set('businessId', businessId);
    
    const response = await this.client.get<UserPermission[]>(
      `/api/v1/permissions/user/${userId}?${query}`
    );
    return response.data;
  }

  /**
   * ✅ Assigner une permission à un utilisateur
   */
  async assignToUser(request: AssignPermissionRequest): Promise<UserPermission> {
    const response = await this.client.post<UserPermission>(
      '/api/v1/permissions/assign',
      request
    );
    return response.data;
  }

  /**
   * ❌ Révoquer une permission d'un utilisateur
   */
  async revokeFromUser(userPermissionId: string): Promise<void> {
    await this.client.delete(`/api/v1/permissions/user-permissions/${userPermissionId}`);
  }

  /**
   * 🔍 Vérifier si un utilisateur a une permission
   */
  async checkUserPermission(
    userId: string,
    permissionCode: string,
    businessId?: string,
    resourceId?: string
  ): Promise<{ hasPermission: boolean; reason?: string }> {
    const body: any = { userId, permissionCode };
    if (businessId) body.businessId = businessId;
    if (resourceId) body.resourceId = resourceId;

    const response = await this.client.post<{ hasPermission: boolean; reason?: string }>(
      '/api/v1/permissions/check',
      body
    );
    return response.data;
  }

  /**
   * 📊 Obtenir les statistiques des permissions
   */
  async getStats(): Promise<{
    totalPermissions: number;
    activePermissions: number;
    systemPermissions: number;
    userPermissions: number;
    byScope: Record<PermissionScope, number>;
    byAction: Record<PermissionAction, number>;
  }> {
    const response = await this.client.get<{
      totalPermissions: number;
      activePermissions: number;
      systemPermissions: number;
      userPermissions: number;
      byScope: Record<PermissionScope, number>;
      byAction: Record<PermissionAction, number>;
    }>('/api/v1/permissions/stats');
    return response.data;
  }

  /**
   * 🔒 Vérifications de permissions communes
   */
  async canManageUsers(userId: string, businessId?: string): Promise<boolean> {
    const result = await this.checkUserPermission(userId, 'MANAGE_USERS', businessId);
    return result.hasPermission;
  }

  async canManageServices(userId: string, businessId?: string): Promise<boolean> {
    const result = await this.checkUserPermission(userId, 'MANAGE_SERVICES', businessId);
    return result.hasPermission;
  }

  async canManageAppointments(userId: string, businessId?: string): Promise<boolean> {
    const result = await this.checkUserPermission(userId, 'MANAGE_APPOINTMENTS', businessId);
    return result.hasPermission;
  }

  async canViewReports(userId: string, businessId?: string): Promise<boolean> {
    const result = await this.checkUserPermission(userId, 'VIEW_REPORTS', businessId);
    return result.hasPermission;
  }

  async canManageBusiness(userId: string, businessId?: string): Promise<boolean> {
    const result = await this.checkUserPermission(userId, 'MANAGE_BUSINESS', businessId);
    return result.hasPermission;
  }

  /**
   * 🛡️ Méthodes utilitaires pour les permissions
   */
  static formatPermissionName(permission: Permission): string {
    return `${permission.scope}:${permission.action}:${permission.resource}`;
  }

  static isPermissionExpired(userPermission: UserPermission): boolean {
    if (!userPermission.expiresAt) return false;
    return new Date(userPermission.expiresAt) < new Date();
  }

  static getPermissionsByResource(permissions: Permission[], resource: string): Permission[] {
    return permissions.filter(p => p.resource === resource);
  }

  static getPermissionsByScope(permissions: Permission[], scope: PermissionScope): Permission[] {
    return permissions.filter(p => p.scope === scope);
  }
}

export default PermissionService;