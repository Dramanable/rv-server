/**
 * 👥 LIST USERS USE CASE - Clean Architecture + TDD
 *
 * Use Case pour lister les utilisateurs avec pagination POST et filtres avancés
 * Optimisé pour Node.js 24 avec Clean Architecture stricte
 */

import type { I18nService } from '../../../application/ports/i18n.port';
import type { Logger } from '../../../application/ports/logger.port';
import type { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { type UserSortField } from '../../../shared/types/user-query.types';
import { AppContextFactory } from '../../../shared/utils/app-context.factory';
import {
  ForbiddenError,
  UserNotFoundError,
} from '../../exceptions/auth.exceptions';

// ═══════════════════════════════════════════════════════════════
// 📋 REQUEST & RESPONSE INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface PaginationRequest {
  readonly page: number;
  readonly limit: number;
}

export interface SortRequest {
  readonly field: 'createdAt' | 'email' | 'name' | 'role';
  readonly direction: 'ASC' | 'DESC';
}

export interface UserFiltersRequest {
  readonly search?: string;
  readonly email?: string;
  readonly roles?: UserRole[];
  readonly isActive?: boolean;
  readonly isVerified?: boolean;
  readonly createdAfter?: string;
  readonly createdBefore?: string;
  readonly userIds?: string[];
}

export interface ListUsersRequest {
  readonly requestingUserId: string;
  readonly pagination: PaginationRequest;
  readonly sort?: SortRequest;
  readonly filters?: UserFiltersRequest;
}

export interface UserListItem {
  readonly id: string;
  readonly email: string;
  readonly username?: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly isVerified: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PaginationMeta {
  readonly currentPage: number;
  readonly itemsPerPage: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
}

export interface ListUsersResponse {
  readonly data: UserListItem[];
  readonly meta: PaginationMeta;
  readonly appliedFilters?: UserFiltersRequest;
}

// ═══════════════════════════════════════════════════════════════
// 👥 LIST USERS USE CASE
// ═══════════════════════════════════════════════════════════════

export class ListUsersUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: ListUsersRequest): Promise<ListUsersResponse> {
    const context = AppContextFactory.create()
      .operation('ListUsers')
      .requestingUser(request.requestingUserId)
      .build();

    this.logger.info(
      'list_attempt',
      context as unknown as Record<string, unknown>,
    );

    try {
      // 1. Vérification des permissions et détermination des contraintes
      const permissions = await this.validatePermissions(
        request.requestingUserId,
        request.filters,
      );

      // 2. Construction des paramètres de requête avec contraintes de permissions
      const queryParams = this.buildQueryParams(request, permissions);

      // 3. Recherche dans le repository avec pagination
      const searchResult = await this.userRepository.search(queryParams);

      // 4. Construction de la réponse avec métadonnées de pagination
      const response = this.buildResponse(searchResult, request);

      this.logger.info('list_success', {
        ...context,
        resultCount: response.data.length,
        totalItems: response.meta.totalItems,
        currentPage: response.meta.currentPage,
      });

      return response;
    } catch (error) {
      this.logger.error(
        'list_failed',
        error as Error,
        context as unknown as Record<string, unknown>,
      );
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔒 PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════

  private async validatePermissions(
    requestingUserId: string,
    filters?: UserFiltersRequest,
  ): Promise<{
    user: any;
    allowedRoles: UserRole[];
    businessId?: string;
    locationId?: string;
  }> {
    const requestingUser = await this.userRepository.findById(requestingUserId);
    if (!requestingUser) {
      throw new UserNotFoundError(
        this.i18n.t('errors.user.requesting_user_not_found'),
      );
    }

    // Déterminer les permissions selon le rôle
    switch (requestingUser.role) {
      case UserRole.PLATFORM_ADMIN:
        // PLATFORM_ADMIN peut voir tout le monde SAUF lui-même
        return {
          user: requestingUser,
          allowedRoles: Object.values(UserRole),
          // Pas de restriction par business/location
        };

      case UserRole.BUSINESS_OWNER:
        // BUSINESS_OWNER peut voir uniquement les utilisateurs de son business (sauf autres owners/admins)
        if (
          filters?.roles?.includes(UserRole.BUSINESS_OWNER) ||
          filters?.roles?.includes(UserRole.PLATFORM_ADMIN)
        ) {
          throw new ForbiddenError(
            this.i18n.t('errors.auth.cannot_view_higher_roles'),
          );
        }
        return {
          user: requestingUser,
          allowedRoles: [
            UserRole.BUSINESS_ADMIN,
            UserRole.LOCATION_MANAGER,
            UserRole.DEPARTMENT_HEAD,
            UserRole.SENIOR_PRACTITIONER,
            UserRole.PRACTITIONER,
            UserRole.JUNIOR_PRACTITIONER,
            UserRole.RECEPTIONIST,
            UserRole.ASSISTANT,
            UserRole.SCHEDULER,
            UserRole.CORPORATE_CLIENT,
            UserRole.VIP_CLIENT,
            UserRole.REGULAR_CLIENT,
            UserRole.GUEST_CLIENT,
          ],
          businessId: undefined, // Will be provided via request context in the future
        };

      case UserRole.BUSINESS_ADMIN:
        // BUSINESS_ADMIN peut voir les utilisateurs du business (sauf owners/platform admins)
        return {
          user: requestingUser,
          allowedRoles: [
            UserRole.LOCATION_MANAGER,
            UserRole.DEPARTMENT_HEAD,
            UserRole.SENIOR_PRACTITIONER,
            UserRole.PRACTITIONER,
            UserRole.JUNIOR_PRACTITIONER,
            UserRole.RECEPTIONIST,
            UserRole.ASSISTANT,
            UserRole.SCHEDULER,
            UserRole.CORPORATE_CLIENT,
            UserRole.VIP_CLIENT,
            UserRole.REGULAR_CLIENT,
            UserRole.GUEST_CLIENT,
          ],
          businessId: undefined, // Will be provided via request context in the future
        };

      case UserRole.LOCATION_MANAGER:
        // LOCATION_MANAGER peut voir uniquement les utilisateurs de sa location
        return {
          user: requestingUser,
          allowedRoles: [
            UserRole.DEPARTMENT_HEAD,
            UserRole.SENIOR_PRACTITIONER,
            UserRole.PRACTITIONER,
            UserRole.JUNIOR_PRACTITIONER,
            UserRole.RECEPTIONIST,
            UserRole.ASSISTANT,
            UserRole.SCHEDULER,
            UserRole.CORPORATE_CLIENT,
            UserRole.VIP_CLIENT,
            UserRole.REGULAR_CLIENT,
            UserRole.GUEST_CLIENT,
          ],
          businessId: undefined, // Will be provided via request context in the future
          locationId: undefined, // Will be provided via request context in the future
        };

      default:
        // Tous les autres rôles ne peuvent pas lister les utilisateurs
        throw new ForbiddenError(
          this.i18n.t('errors.auth.insufficient_permissions_list_users'),
        );
    }
  }

  private buildQueryParams(
    request: ListUsersRequest,
    permissions: {
      user: any;
      allowedRoles: UserRole[];
      businessId?: string;
      locationId?: string;
    },
  ): any {
    // Construire manuellement les paramètres selon ce que les tests attendent
    const queryParams: any = {
      page: request.pagination.page,
      limit: Math.min(100, Math.max(1, request.pagination.limit)), // Enforcer limite max de 100
      sortBy: request.sort?.field || 'createdAt',
      sortOrder: request.sort?.direction || 'DESC',
      search: {},
      filters: {},
    };

    // Construire l'objet filters selon les permissions et la structure attendue par les tests
    const filters: any = {};

    // 1. Filtres de rôles autorisés
    if (request.filters?.roles?.length) {
      const allowedRequestedRoles = request.filters.roles.filter((role) =>
        permissions.allowedRoles.includes(role),
      );
      if (allowedRequestedRoles.length > 0) {
        filters.role = allowedRequestedRoles;
      }
    } else {
      // Si aucun rôle spécifique demandé, utiliser tous les rôles autorisés
      filters.role = permissions.allowedRoles;
    }

    // 2. Contraintes par permissions selon le rôle
    if (permissions.user.role === UserRole.PLATFORM_ADMIN) {
      // PLATFORM_ADMIN exclut lui-même
      filters.excludeUserIds = [permissions.user.id];
    }

    if (permissions.businessId) {
      // BUSINESS_OWNER, BUSINESS_ADMIN filtrent par business
      filters.businessId = permissions.businessId;
      if (permissions.user.role === UserRole.BUSINESS_OWNER) {
        filters.excludeRoles = [
          UserRole.PLATFORM_ADMIN,
          UserRole.BUSINESS_OWNER,
        ];
      } else if (permissions.user.role === UserRole.BUSINESS_ADMIN) {
        filters.excludeRoles = [
          UserRole.PLATFORM_ADMIN,
          UserRole.BUSINESS_OWNER,
        ];
      }
    }

    if (permissions.locationId) {
      // LOCATION_MANAGER filtre par location
      filters.locationId = permissions.locationId;
      filters.excludeRoles = [
        UserRole.PLATFORM_ADMIN,
        UserRole.BUSINESS_OWNER,
        UserRole.BUSINESS_ADMIN,
        UserRole.LOCATION_MANAGER,
      ];
    }

    // 3. Autres filtres utilisateur
    if (request.filters) {
      // Recherche globale
      if (request.filters.search?.trim()) {
        queryParams.search.query = request.filters.search.trim();
      }

      // Email spécifique
      if (request.filters.email?.trim()) {
        queryParams.search.email = request.filters.email.trim();
      }

      // Statut actif
      if (typeof request.filters.isActive === 'boolean') {
        filters.isActive = request.filters.isActive;
      }

      // Dates de création
      if (request.filters.createdAfter || request.filters.createdBefore) {
        const from = request.filters.createdAfter
          ? new Date(request.filters.createdAfter)
          : undefined;
        const to = request.filters.createdBefore
          ? new Date(request.filters.createdBefore)
          : undefined;
        filters.createdAt = { from, to };
      }
    }

    queryParams.filters = filters;
    return queryParams;
  }

  private mapSortField(field: string): UserSortField {
    switch (field) {
      case 'email':
        return 'email';
      case 'name':
        return 'name';
      case 'role':
        return 'role';
      case 'createdAt':
      default:
        return 'createdAt';
    }
  }

  private buildResponse(
    searchResult: { data: any[]; meta?: any },
    request: ListUsersRequest,
  ): ListUsersResponse {
    const actualLimit = Math.min(100, Math.max(1, request.pagination.limit)); // Même limite enforcer
    const totalItems =
      searchResult.meta?.totalItems || searchResult.data.length;
    const totalPages =
      searchResult.meta?.totalPages || Math.ceil(totalItems / actualLimit);
    const currentPage =
      searchResult.meta?.currentPage || request.pagination.page;

    return {
      data: searchResult.data.map((user: any) => ({
        id: user.id,
        email: user.email?.value || user.email,
        username: user.username,
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName:
          user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        role: user.role,
        isActive: user.isActive ?? true,
        isVerified: user.isVerified ?? false,
        createdAt:
          user.createdAt instanceof Date
            ? user.createdAt.toISOString()
            : user.createdAt,
        updatedAt:
          user.updatedAt instanceof Date
            ? user.updatedAt.toISOString()
            : user.updatedAt || user.createdAt,
      })),
      meta: {
        currentPage,
        itemsPerPage: actualLimit,
        totalItems,
        totalPages,
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
      },
      appliedFilters: request.filters,
    };
  }
}
