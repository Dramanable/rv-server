/**
 * 🎯 USE CASE - UpdatePermission
 * Clean Architecture - Application Layer
 * Use case pour mettre à jour une permission existante
 */

import type { Permission } from '@domain/entities/permission.entity';
import {
  PermissionNotFoundError,
  SystemPermissionModificationError,
} from '@domain/exceptions/permission.exceptions';
import type { IPermissionRepository } from '@domain/repositories/permission.repository';

export interface UpdatePermissionRequest {
  readonly permissionId: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly isActive?: boolean;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

export interface UpdatePermissionResponse {
  readonly permission: Permission;
}

/**
 * Use case pour mettre à jour une permission existante
 */
export class UpdatePermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(
    request: UpdatePermissionRequest,
  ): Promise<UpdatePermissionResponse> {
    // 1. Récupérer la permission existante
    const existingPermission = await this.permissionRepository.findById(
      request.permissionId,
    );

    if (!existingPermission) {
      throw new PermissionNotFoundError(request.permissionId);
    }

    // 2. Vérifier que ce n'est pas une permission système si on veut la désactiver
    if (existingPermission.isSystemPermission() && request.isActive === false) {
      throw new SystemPermissionModificationError(
        existingPermission.getName(),
        'deactivation',
      );
    }

    // 3. Mettre à jour la permission
    existingPermission.update({
      displayName: request.displayName,
      description: request.description,
      isActive: request.isActive,
    });

    // 4. Sauvegarder
    const updatedPermission =
      await this.permissionRepository.save(existingPermission);

    return {
      permission: updatedPermission,
    };
  }
}
