/**
 * 🎭 APPLICATION USE CASE - Assign Role
 *
 * Use case pour assigner un rôle à un utilisateur dans un contexte métier spécifique.
 * Respecte les règles métier de validation des assignations de rôles.
 */

import { InsufficientPermissionsError } from '@application/exceptions/auth.exceptions';
import { IPermissionService } from '@application/ports/permission.service.interface';
import {
  RoleAssignment,
  RoleAssignmentContext,
} from '@domain/entities/role-assignment.entity';
import { IBusinessContextRepository } from '@domain/repositories/business-context.repository.interface';
import { IRoleAssignmentRepository } from '@domain/repositories/role-assignment.repository.interface';
import { UserRole } from '@shared/enums/user-role.enum';

export interface AssignRoleRequest {
  readonly userId: string;
  readonly role: UserRole;
  readonly context: RoleAssignmentContext;
  readonly assignedBy: string;
  readonly expiresAt?: Date;
  readonly notes?: string;
  readonly correlationId: string;
}

export interface AssignRoleResponse {
  readonly success: boolean;
  readonly roleAssignmentId?: string;
  readonly error?: string;
  readonly roleAssignment?: {
    readonly id: string;
    readonly userId: string;
    readonly role: UserRole;
    readonly context: RoleAssignmentContext;
    readonly assignedBy: string;
    readonly assignedAt: Date;
    readonly expiresAt?: Date;
    readonly isActive: boolean;
  };
}

export class AssignRoleUseCase {
  constructor(
    private readonly roleAssignmentRepository: IRoleAssignmentRepository,
    private readonly businessContextRepository: IBusinessContextRepository,
    private readonly permissionService: IPermissionService,
  ) {}

  async execute(request: AssignRoleRequest): Promise<AssignRoleResponse> {
    try {
      // 🛡️ SÉCURITÉ CRITIQUE : Vérifier les permissions AVANT toute opération
      await this.permissionService.requirePermission(
        request.assignedBy,
        'ASSIGN_ROLES',
        {
          businessId: request.context.businessId,
          userId: request.userId,
        },
      );

      // 🎭 Vérifier que l'assigneur peut agir sur ce niveau de rôle
      const canActOnRole = await this.permissionService.canActOnRole(
        request.assignedBy,
        request.role,
        { businessId: request.context.businessId },
      );

      if (!canActOnRole) {
        throw new InsufficientPermissionsError(
          `Cannot assign role ${request.role}: insufficient role hierarchy permissions`,
        );
      }

      // 🏢 1. Vérifier que le contexte métier existe
      const businessContext = await this.businessContextRepository.findById(
        request.context.businessId,
      );

      if (!businessContext) {
        return {
          success: false,
          error: 'Business context not found',
        };
      }

      // 🔍 2. Valider que le contexte est valide (location/department existent)
      if (!businessContext.isValidContext(request.context)) {
        if (request.context.departmentId && request.context.locationId) {
          return {
            success: false,
            error: 'Department not found in business context',
          };
        }
        if (request.context.locationId) {
          return {
            success: false,
            error: 'Location not found in business context',
          };
        }
        return {
          success: false,
          error: 'Invalid business context',
        };
      }

      // � 3. Vérifier qu'il n'y a pas de duplication
      const hasExistingRole =
        await this.roleAssignmentRepository.hasRoleInContext(
          request.userId,
          request.role,
          request.context,
        );

      if (hasExistingRole) {
        return {
          success: false,
          error: 'User already has this role in the specified context',
        };
      }

      // ✅ 4. Créer et sauvegarder la nouvelle assignation
      const roleAssignment = RoleAssignment.create({
        userId: request.userId,
        role: request.role,
        context: request.context,
        assignedBy: request.assignedBy,
        expiresAt: request.expiresAt,
        notes: request.notes,
      });

      const savedRoleAssignment =
        await this.roleAssignmentRepository.save(roleAssignment);

      return {
        success: true,
        roleAssignmentId: savedRoleAssignment.getId(),
        roleAssignment: {
          id: savedRoleAssignment.getId(),
          userId: savedRoleAssignment.getUserId(),
          role: savedRoleAssignment.getRole(),
          context: savedRoleAssignment.getContext(),
          assignedBy: savedRoleAssignment.getAssignedBy(),
          assignedAt: savedRoleAssignment.getAssignedAt(),
          expiresAt: savedRoleAssignment.getExpiresAt(),
          isActive: savedRoleAssignment.isActive(),
        },
      };
    } catch (error) {
      // � Propager les erreurs de permissions
      if (error instanceof InsufficientPermissionsError) {
        throw error;
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
