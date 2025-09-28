import { PermissionJSON } from '@domain/entities/permission.entity';
import { IPermissionRepository } from '@domain/repositories/permission.repository';

/**
 * List Permissions Use Case
 * Clean Architecture - Application Layer - Use Case
 */

export interface ListPermissionsRequest {
  readonly pagination?: {
    readonly page: number;
    readonly limit: number;
  };
  readonly sorting?: {
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
  };
  readonly filters?: {
    readonly search?: string;
    readonly category?: string;
    readonly isActive?: boolean;
    readonly isSystemPermission?: boolean;
  };
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

export interface ListPermissionsResponse {
  readonly permissions: PermissionJSON[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export class ListPermissionsUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(
    request: ListPermissionsRequest,
  ): Promise<ListPermissionsResponse> {
    // Valeurs par défaut pour pagination et tri
    const page = request.pagination?.page || 1;
    const limit = request.pagination?.limit || 10;
    const sortBy = request.sorting?.sortBy || 'createdAt';
    const sortOrder = request.sorting?.sortOrder || 'desc';

    // Construire les filtres
    const filters: any = {};

    if (request.filters?.search) {
      filters.search = request.filters.search;
    }

    if (request.filters?.category !== undefined) {
      filters.category = request.filters.category;
    }

    if (request.filters?.isActive !== undefined) {
      filters.isActive = request.filters.isActive;
    }

    if (request.filters?.isSystemPermission !== undefined) {
      filters.isSystemPermission = request.filters.isSystemPermission;
    }

    // Récupérer les permissions avec pagination
    const offset = (page - 1) * limit;
    const permissions = await this.permissionRepository.findAll(filters, {
      offset,
      limit,
      sortBy,
      sortOrder,
    });

    // Compter le total
    const totalCount = await this.permissionRepository.count(filters);

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      permissions: permissions.map((p) => p.toJSON()),
      meta: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    };
  }
}
