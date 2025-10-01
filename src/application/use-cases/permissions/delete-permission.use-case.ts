/**
 * 🎯 USE CASE - DeletePermission
 * Clean Architecture - Application Layer
 * Use case pour supprimer une permission existante
 */

import {
  PermissionNotFoundError,
  SystemPermissionModificationError,
} from "@domain/exceptions/permission.exceptions";
import type { IPermissionRepository } from "@domain/repositories/permission.repository";

export interface DeletePermissionRequest {
  readonly permissionId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

export interface DeletePermissionResponse {
  readonly success: boolean;
  readonly message: string;
}

/**
 * Use case pour supprimer une permission existante
 */
export class DeletePermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(
    request: DeletePermissionRequest,
  ): Promise<DeletePermissionResponse> {
    // 1. Récupérer la permission existante
    const existingPermission = await this.permissionRepository.findById(
      request.permissionId,
    );

    if (!existingPermission) {
      throw new PermissionNotFoundError(request.permissionId);
    }

    // 2. Vérifier qu'elle peut être supprimée (pas système)
    if (!existingPermission.canBeDeleted()) {
      throw new SystemPermissionModificationError(
        existingPermission.getName(),
        "deletion",
      );
    }

    // 3. Supprimer
    await this.permissionRepository.delete(request.permissionId);

    return {
      success: true,
      message: `Permission ${existingPermission.getName()} supprimée avec succès`,
    };
  }
}
