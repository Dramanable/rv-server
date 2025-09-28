import { IPermissionRepository } from '@domain/repositories/permission.repository';
import { PermissionJSON } from '@domain/entities/permission.entity';
import { PermissionNotFoundError } from '@domain/exceptions/permission.exceptions';

/**
 * Get Permission By ID Use Case
 * Clean Architecture - Application Layer - Use Case
 */

export interface GetPermissionByIdRequest {
  readonly permissionId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
}

export interface GetPermissionByIdResponse {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly category: string;
  readonly isSystemPermission: boolean;
  readonly isActive: boolean;
  readonly canBeDeleted: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class GetPermissionByIdUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(
    request: GetPermissionByIdRequest,
  ): Promise<GetPermissionByIdResponse> {
    // 1. Récupérer la permission par ID
    const permission = await this.permissionRepository.findById(
      request.permissionId,
    );

    // 2. Vérifier si la permission existe
    if (!permission) {
      throw new PermissionNotFoundError(request.permissionId, 'id');
    }

    // 3. Retourner la permission au format JSON
    return permission.toJSON();
  }
}
