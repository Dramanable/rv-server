/**
 * 🛡️ Mock Permission Service - Infrastructure
 *
 * Service de permissions simplifié pour les tests et développement
 */

import type { IPermissionService } from '../../application/ports/permission.service.interface';
import type { Logger } from '../../application/ports/logger.port';
import { UserRole, Permission } from '../../shared/enums/user-role.enum';

export class MockPermissionService implements IPermissionService {
  constructor(private readonly logger: Logger) {}

  async hasPermission(
    userId: string,
    permission: Permission | string,
    context?: Record<string, unknown>,
  ): Promise<boolean> {
    this.logger.debug('Permission check requested', {
      userId,
      permission,
      context,
      result: true, // Mock - toujours autorisé pour les tests
      operation: 'hasPermission',
    });

    // Mock : toujours vrai pour permettre les tests
    return true;
  }

  async canActOnRole(
    actorUserId: string,
    targetRole: UserRole,
    context?: Record<string, unknown>,
  ): Promise<boolean> {
    this.logger.debug('Role action permission check requested', {
      actorUserId,
      targetRole,
      context,
      result: true, // Mock - toujours autorisé pour les tests
      operation: 'canActOnRole',
    });

    // Mock : toujours vrai pour permettre les tests
    return true;
  }

  async requirePermission(
    userId: string,
    permission: Permission | string,
    context?: Record<string, unknown>,
  ): Promise<void> {
    this.logger.debug('Permission required', {
      userId,
      permission,
      context,
      operation: 'requirePermission',
    });

    // Mock : ne lance pas d'erreur pour les tests
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    this.logger.debug('User permissions requested', {
      userId,
      permissions: Object.values(Permission),
      operation: 'getUserPermissions',
    });

    // Mock : retourner toutes les permissions pour les tests
    return Object.values(Permission);
  }

  async getUserRole(userId: string): Promise<UserRole> {
    this.logger.debug('User role requested', {
      userId,
      role: UserRole.PLATFORM_ADMIN, // Mock - toujours super admin pour les tests
      operation: 'getUserRole',
    });

    // Mock : toujours super admin pour les tests
    return UserRole.PLATFORM_ADMIN;
  }

  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    this.logger.debug('Role check requested', {
      userId,
      role,
      result: true, // Mock - toujours autorisé pour les tests
      operation: 'hasRole',
    });

    // Mock : toujours vrai pour permettre les tests
    return true;
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
    this.logger.debug('Business permission check requested', {
      userId,
      permission,
      businessContext,
      result: true, // Mock - toujours autorisé pour les tests
      operation: 'hasBusinessPermission',
    });

    // Mock : toujours vrai pour permettre les tests
    return true;
  }

  async canManageUser(
    actorUserId: string,
    targetUserId: string,
  ): Promise<boolean> {
    this.logger.debug('User management permission check requested', {
      actorUserId,
      targetUserId,
      result: true, // Mock - toujours autorisé pour les tests
      operation: 'canManageUser',
    });

    // Mock : toujours vrai pour permettre les tests
    return true;
  }

  async requireSuperAdminPermission(userId: string): Promise<void> {
    this.logger.debug('Super admin permission required', {
      userId,
      operation: 'requireSuperAdminPermission',
    });

    // Mock : ne lance pas d'erreur pour les tests
  }

  async isSuperAdmin(userId: string): Promise<boolean> {
    this.logger.debug('Super admin check requested', {
      userId,
      result: true, // Mock - toujours super admin pour les tests
      operation: 'isSuperAdmin',
    });

    // Mock : toujours vrai pour permettre les tests
    return true;
  }
}
