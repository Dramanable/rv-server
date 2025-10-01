import { Permission } from "@domain/entities/permission.entity";
import { PermissionAlreadyExistsError } from "@domain/exceptions/permission.exceptions";
import { IPermissionRepository } from "@domain/repositories/permission.repository";
import { generateId } from "@shared/utils/id.utils";

/**
 * Create Permission Use Case
 * Clean Architecture - Application Layer - Use Case
 */

export interface CreatePermissionRequest {
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly category: string;
  readonly isSystemPermission: boolean;
  readonly requestingUserId: string;
  readonly correlationId: string;
}

export interface CreatePermissionResponse {
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

export class CreatePermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(
    request: CreatePermissionRequest,
  ): Promise<CreatePermissionResponse> {
    // 1. Vérifier que le nom de permission n'existe pas déjà
    const existingPermission = await this.permissionRepository.existsByName(
      request.name,
    );

    if (existingPermission) {
      throw new PermissionAlreadyExistsError(request.name);
    }

    // 2. Créer la nouvelle permission
    const permission = Permission.create({
      id: generateId(),
      name: request.name,
      displayName: request.displayName,
      description: request.description,
      category: request.category,
      isSystemPermission: request.isSystemPermission,
    });

    // 3. Sauvegarder en base de données
    const savedPermission = await this.permissionRepository.save(permission);

    // 4. Retourner la réponse
    return savedPermission.toJSON();
  }
}
