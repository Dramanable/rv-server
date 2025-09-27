/**
 * 🔐 GET USER EFFECTIVE PERMISSIONS USE CASE - APPLICATION LAYER
 *
 * Récupère les permissions effectives d'un utilisateur dans un contexte métier spécifique.
 * Combine les permissions des rôles assignés avec la hiérarchie et le contexte.
 *
 * RÈGLES MÉTIER :
 * - Permissions calculées en temps réel selon les assignations actives
 * - Prise en compte de l'expiration des rôles
 * - Hiérarchie des contextes (Business > Location > Department)
 * - Permissions cumulatives (hérite des niveaux supérieurs)
 */

import { IPermissionService } from '@application/ports/permission.service.interface';
import { Logger } from '@application/ports/logger.port';
import { I18nService } from '@application/ports/i18n.port';
import { IRoleAssignmentRepository } from '@domain/repositories/role-assignment.repository.interface';
import { IBusinessContextRepository } from '@domain/repositories/business-context.repository.interface';
import { Permission, UserRole } from '@shared/enums/user-role.enum';
import { RoleAssignmentContext } from '@domain/entities/role-assignment.entity';
import { InsufficientPermissionsError } from '@application/exceptions/application.exceptions';

// === REQUEST & RESPONSE DTOs ===

export interface GetUserEffectivePermissionsRequest {
  readonly requestingUserId: string;
  readonly targetUserId: string;
  readonly context: RoleAssignmentContext;
  readonly correlationId: string;
  readonly timestamp: Date;
}

export interface GetUserEffectivePermissionsResponse {
  readonly userId: string;
  readonly context: RoleAssignmentContext;
  readonly effectivePermissions: Permission[];
  readonly assignedRoles: Array<{
    readonly role: UserRole;
    readonly scope: 'BUSINESS' | 'LOCATION' | 'DEPARTMENT';
    readonly assignedAt: Date;
    readonly expiresAt?: Date;
    readonly assignedBy: string;
  }>;
  readonly hierarchyLevel: number;
  readonly canAssignRoles: UserRole[];
  readonly retrievedAt: Date;
}

// === USE CASE IMPLEMENTATION ===

export class GetUserEffectivePermissionsUseCase {
  constructor(
    private readonly roleAssignmentRepository: IRoleAssignmentRepository,
    private readonly businessContextRepository: IBusinessContextRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: GetUserEffectivePermissionsRequest,
  ): Promise<GetUserEffectivePermissionsResponse> {
    this.logger.info('Retrieving user effective permissions', {
      requestingUserId: request.requestingUserId,
      targetUserId: request.targetUserId,
      businessId: request.context.businessId,
      correlationId: request.correlationId,
    });

    try {
      // 🔐 VÉRIFICATION DES PERMISSIONS
      await this.validatePermissions(request);

      // 📋 RÉCUPÉRER LES ASSIGNATIONS DE RÔLES ACTIVES
      const activeAssignments = await this.getActiveRoleAssignments(
        request.targetUserId,
        request.context,
      );

      if (activeAssignments.length === 0) {
        this.logger.warn('No active role assignments found for user', {
          targetUserId: request.targetUserId,
          context: request.context,
          correlationId: request.correlationId,
        });

        return {
          userId: request.targetUserId,
          context: request.context,
          effectivePermissions: [],
          assignedRoles: [],
          hierarchyLevel: 0,
          canAssignRoles: [],
          retrievedAt: new Date(),
        };
      }

      // 🎯 CALCULER LES PERMISSIONS EFFECTIVES
      const effectivePermissions = this.calculateEffectivePermissions(
        activeAssignments,
        request.context,
      );

      // 🏗️ CALCULER LE NIVEAU HIÉRARCHIQUE MAX
      const hierarchyLevel = this.calculateMaxHierarchyLevel(activeAssignments);

      // 🎭 CALCULER LES RÔLES ASSIGNABLES
      const canAssignRoles = this.calculateAssignableRoles(activeAssignments);

      // 📊 PRÉPARER LA RÉPONSE
      const assignedRoles = activeAssignments.map((assignment) => ({
        role: assignment.getRole(),
        scope: assignment.getAssignmentScope(),
        assignedAt: assignment.getAssignedAt(),
        expiresAt: assignment.getExpiresAt(),
        assignedBy: assignment.getAssignedBy(),
      }));

      this.logger.info('User effective permissions retrieved successfully', {
        targetUserId: request.targetUserId,
        effectivePermissionsCount: effectivePermissions.length,
        assignedRolesCount: assignedRoles.length,
        hierarchyLevel,
        correlationId: request.correlationId,
      });

      return {
        userId: request.targetUserId,
        context: request.context,
        effectivePermissions,
        assignedRoles,
        hierarchyLevel,
        canAssignRoles,
        retrievedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        'Failed to retrieve user effective permissions',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          requestingUserId: request.requestingUserId,
          targetUserId: request.targetUserId,
          correlationId: request.correlationId,
        },
      );

      throw error;
    }
  }

  // === MÉTHODES PRIVÉES ===

  private async validatePermissions(
    request: GetUserEffectivePermissionsRequest,
  ): Promise<void> {
    // 🔐 Seuls les managers peuvent voir les permissions des autres utilisateurs
    if (request.requestingUserId !== request.targetUserId) {
      await this.permissionService.requirePermission(
        request.requestingUserId,
        'MANAGE_ALL_STAFF',
        {
          businessId: request.context.businessId,
          locationId: request.context.locationId,
          departmentId: request.context.departmentId,
          correlationId: request.correlationId,
        },
      );
    }
  }

  private async getActiveRoleAssignments(
    userId: string,
    context: RoleAssignmentContext,
  ) {
    // Récupérer toutes les assignations pour l'utilisateur dans le contexte
    const allAssignments =
      await this.roleAssignmentRepository.findByUserId(userId);

    // Filtrer par contexte et activité
    return allAssignments.filter(
      (assignment) =>
        assignment.isActiveAssignment() &&
        !assignment.hasExpired() &&
        assignment.isValidInContext(context),
    );
  }

  private calculateEffectivePermissions(
    assignments: any[],
    context: RoleAssignmentContext,
  ): Permission[] {
    const permissionsSet = new Set<Permission>();

    assignments.forEach((assignment) => {
      const permissions = assignment.getEffectivePermissions();
      permissions.forEach((permission: Permission) => {
        permissionsSet.add(permission);
      });
    });

    return Array.from(permissionsSet).sort();
  }

  private calculateMaxHierarchyLevel(assignments: any[]): number {
    if (assignments.length === 0) {
      return 0;
    }

    // Importer la hiérarchie des rôles
    const { ROLE_HIERARCHY } = require('@shared/enums/user-role.enum');

    return Math.max(
      ...assignments.map((assignment) => ROLE_HIERARCHY[assignment.getRole()]),
    );
  }

  private calculateAssignableRoles(assignments: any[]): UserRole[] {
    if (assignments.length === 0) {
      return [];
    }

    // Obtenir le rôle le plus élevé
    const maxLevel = this.calculateMaxHierarchyLevel(assignments);
    const { ROLE_HIERARCHY } = require('@shared/enums/user-role.enum');

    // Retourner tous les rôles inférieurs
    return Object.entries(ROLE_HIERARCHY)
      .filter(([_, level]) => (level as number) < maxLevel)
      .map(([role, _]) => role as UserRole)
      .sort(
        (a, b) => (ROLE_HIERARCHY[b] as number) - (ROLE_HIERARCHY[a] as number),
      );
  }
}
