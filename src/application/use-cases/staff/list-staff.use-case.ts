/**
 * 💼 ListStaffUseCase - Cas d'usage de listage du personnel avec recherche avancée
 *
 * Couche Application - Orchestration métier pour recherche de personnel
 * Aucune dépendance vers les frameworks (NestJS, TypeORM, etc.)
 */

import { Staff } from '../../../domain/entities/staff.entity';
import { StaffRepository } from '../../../domain/repositories/staff.repository.interface';
import { Permission } from '../../../shared/enums/permission.enum';
import { ApplicationValidationError } from '../../exceptions/application.exceptions';
import { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';
import { IPermissionService } from '../../ports/permission.service.interface';

export interface ListStaffRequest {
  readonly requestingUserId: string;
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
  };
  readonly sorting: {
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
  };
  readonly filters: {
    readonly search?: string;
    readonly role?: string;
    readonly isActive?: boolean;
    readonly businessId?: string;
  };
}

export interface ListStaffResponse {
  readonly data: {
    readonly id: string;
    readonly businessId: string;
    readonly profile: {
      readonly firstName: string;
      readonly lastName: string;
      readonly specialization?: string;
    };
    readonly role: string;
    readonly email: string;
    readonly status: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  }[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export class ListStaffUseCase {
  private static readonly VALID_SORT_FIELDS = [
    'createdAt',
    'firstName',
    'lastName',
    'role',
    'email',
  ];
  private static readonly MAX_PAGE_LIMIT = 100;

  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly permissionService: IPermissionService,
  ) {}

  async execute(request: ListStaffRequest): Promise<ListStaffResponse> {
    try {
      // 1. Validation des paramètres
      this.validateParameters(request);

      // 2. Vérifier les permissions avec IPermissionService
      await this.permissionService.requirePermission(
        request.requestingUserId,
        Permission.VIEW_STAFF,
        {
          action: 'list',
          resource: 'staff',
          businessId: request.filters.businessId,
        },
      );

      // 3. Log de l'opération
      this.logger.info('Attempting to list staff', {
        requestingUserId: request.requestingUserId,
        page: request.pagination.page,
        limit: request.pagination.limit,
        filters: request.filters,
      });

      // 3. Préparation des critères de recherche
      const searchCriteria = this.buildSearchCriteria(request);

      // 4. Recherche dans le repository
      const { staff, total } =
        await this.staffRepository.search(searchCriteria);

      // 5. Calcul des métadonnées de pagination
      const meta = this.calculatePaginationMeta(request.pagination, total);

      // 6. Mappage vers le format de réponse
      const mappedStaff = staff.map((staffMember) =>
        this.mapStaffToResponse(staffMember),
      );

      // 7. Log du succès
      this.logger.info('Staff list retrieved successfully', {
        requestingUserId: request.requestingUserId,
        totalItems: total,
        returnedItems: mappedStaff.length,
      });

      return {
        data: mappedStaff,
        meta,
      };
    } catch (error) {
      this.logger.error('Error listing staff', error as Error, {
        requestingUserId: request.requestingUserId,
      });
      throw error;
    }
  }

  private validateParameters(request: ListStaffRequest): void {
    this.validateRequestingUser(request.requestingUserId);
    this.validatePagination(request.pagination);
    this.validateSorting(request.sorting);
  }

  private validateRequestingUser(requestingUserId: string): void {
    if (!requestingUserId || requestingUserId.trim() === '') {
      throw new ApplicationValidationError(
        'requestingUserId',
        requestingUserId,
        'Requesting user ID is required',
      );
    }
  }

  private validatePagination(pagination: {
    page: number;
    limit: number;
  }): void {
    if (pagination.page < 1) {
      throw new ApplicationValidationError(
        'page',
        pagination.page.toString(),
        'Page must be greater than 0',
      );
    }

    if (pagination.limit > ListStaffUseCase.MAX_PAGE_LIMIT) {
      throw new ApplicationValidationError(
        'limit',
        pagination.limit.toString(),
        `Limit cannot exceed ${ListStaffUseCase.MAX_PAGE_LIMIT}`,
      );
    }
  }

  private validateSorting(sorting: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }): void {
    if (!ListStaffUseCase.VALID_SORT_FIELDS.includes(sorting.sortBy)) {
      throw new ApplicationValidationError(
        'sortBy',
        sorting.sortBy,
        `Sort field must be one of: ${ListStaffUseCase.VALID_SORT_FIELDS.join(', ')}`,
      );
    }
  }

  private buildSearchCriteria(request: ListStaffRequest): any {
    const offset = (request.pagination.page - 1) * request.pagination.limit;

    return {
      ...(request.filters.search && { name: request.filters.search }),
      ...(request.filters.role && { role: request.filters.role }),
      ...(request.filters.isActive !== undefined && {
        isActive: request.filters.isActive,
      }),
      ...(request.filters.businessId && {
        businessId: request.filters.businessId,
      }),
      limit: request.pagination.limit,
      offset,
    };
  }

  private calculatePaginationMeta(
    pagination: { page: number; limit: number },
    total: number,
  ): ListStaffResponse['meta'] {
    const totalPages = Math.ceil(total / pagination.limit);

    return {
      currentPage: pagination.page,
      totalPages,
      totalItems: total,
      itemsPerPage: pagination.limit,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1,
    };
  }

  private mapStaffToResponse(staff: Staff): ListStaffResponse['data'][0] {
    return {
      id: staff.id.getValue(),
      businessId: staff.businessId.getValue(),
      profile: {
        firstName: staff.profile.firstName,
        lastName: staff.profile.lastName,
        specialization: staff.profile.specialization,
      },
      role: staff.role,
      email: staff.email.getValue(),
      status: staff.status,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    };
  }
}
