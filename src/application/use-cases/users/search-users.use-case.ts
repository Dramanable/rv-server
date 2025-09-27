/**
 * 🔍 SEARCH USERS USE CASE - TDD Clean Architecture
 *
 * Use Case pour rechercher et filtrer les utilisateurs avec pagination
 * Réservé aux SUPER_ADMIN uniquement
 */

import type { I18nService } from "../../../application/ports/i18n.port";
import type { Logger } from "../../../application/ports/logger.port";
import type { IPermissionService } from "../../../application/ports/permission.service.interface";
import type { UserRepository } from "../../../domain/repositories/user.repository.interface";
import { UserRole } from "../../../shared/enums/user-role.enum";
import type {
  UserQueryParams,
  UserSortField,
} from "../../../shared/types/user-query.types";
import { AppContextFactory } from "../../../shared/utils/app-context.factory";

/**
 * 📋 Request pour la recherche d'utilisateurs
 */
export interface SearchUsersRequest {
  readonly requestingUserId: string;
  readonly searchTerm?: string;
  readonly roles?: UserRole[];
  readonly isActive?: boolean;
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: "asc" | "desc";
}

/**
 * 📊 Response pour la recherche d'utilisateurs
 */
export interface SearchUsersResponse {
  readonly users: Array<{
    readonly id: string;
    readonly email: string;
    readonly name: string;
    readonly role: UserRole;
    readonly isActive: boolean;
    readonly passwordChangeRequired: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  }>;
  readonly pagination: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
  };
  readonly appliedFilters: {
    readonly searchTerm?: string;
    readonly roles?: UserRole[];
    readonly isActive?: boolean;
    readonly dateRange?: {
      readonly from: Date;
      readonly to: Date;
    };
  };
}

/**
 * 🔍 Use Case pour rechercher des utilisateurs
 */
export class SearchUsersUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly permissionService: IPermissionService,
  ) {}

  async execute(request: SearchUsersRequest): Promise<SearchUsersResponse> {
    const context = AppContextFactory.create()
      .operation("SearchUsers")
      .requestingUser(request.requestingUserId)
      .build();

    this.logger.info(
      this.i18n.t("operations.user.search_attempt"),
      context as unknown as Record<string, unknown>,
    );

    try {
      // 1. 🛡️ PERMISSIONS - Vérifier les droits utilisateur avec IPermissionService
      await this.permissionService.requirePermission(
        request.requestingUserId,
        "MANAGE_USERS",
        {},
      );

      // 2. Normalisation des paramètres de recherche
      const searchParams = this.normalizeSearchParams(request);

      // 3. Recherche dans le repository
      const results = await this.userRepository.search(searchParams);

      // 4. Construction de la réponse
      const response: SearchUsersResponse = {
        users: (results.data || []).map((user) => ({
          id: user.id,
          email: user.email.value,
          name: user.name,
          role: user.role,
          isActive: true, // Default value since User entity doesn't have isActive
          passwordChangeRequired: user.passwordChangeRequired,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt ?? user.createdAt,
        })),
        pagination: {
          currentPage: results.meta?.currentPage || 1,
          totalPages: results.meta?.totalPages || 1,
          totalItems: results.meta?.totalItems || 0,
          itemsPerPage: results.meta?.itemsPerPage || 10,
          hasNextPage: results.meta?.hasNextPage || false,
          hasPreviousPage: results.meta?.hasPreviousPage || false,
        },
        appliedFilters: this.buildAppliedFilters(request),
      };

      this.logger.info(this.i18n.t("operations.user.search_success"), {
        ...context,
        resultCount: response.users.length,
        totalItems: response.pagination.totalItems,
      });

      return response;
    } catch (error) {
      this.logger.error(
        this.i18n.t("operations.user.search_failed"),
        error as Error,
        context as unknown as Record<string, unknown>,
      );
      throw error;
    }
  }

  // ✅ REMOVED - validatePermissions method replaced by IPermissionService.requirePermission

  private normalizeSearchParams(request: SearchUsersRequest): UserQueryParams {
    return {
      page: Math.max(request.page ?? 1, 1),
      limit: Math.min(Math.max(request.limit ?? 20, 1), 100),
      sortBy: (request.sortBy as UserSortField | undefined) ?? "createdAt",
      sortOrder: request.sortOrder === "asc" ? "ASC" : "DESC",
      search: request.searchTerm?.trim()
        ? {
            query: request.searchTerm.trim(),
          }
        : undefined,
      filters: {
        role: request.roles,
        isActive: request.isActive,
        createdAt: this.buildDateFilter(
          request.createdAfter,
          request.createdBefore,
        ),
      },
    };
  }

  private buildDateFilter(after?: Date, before?: Date) {
    if (!after && !before) return undefined;
    return {
      from: after,
      to: before,
    };
  }

  private buildAppliedFilters(request: SearchUsersRequest) {
    const filters = {
      searchTerm: undefined as string | undefined,
      roles: undefined as UserRole[] | undefined,
      isActive: undefined as boolean | undefined,
      dateRange: undefined as { from: Date; to: Date } | undefined,
    };

    if (request.searchTerm?.trim()) {
      filters.searchTerm = request.searchTerm.trim();
    }
    if (request.roles?.length) {
      filters.roles = request.roles;
    }
    if (request.isActive !== undefined) {
      filters.isActive = request.isActive;
    }
    if (request.createdAfter || request.createdBefore) {
      filters.dateRange = {
        from: request.createdAfter!,
        to: request.createdBefore!,
      };
    }

    return filters;
  }
}
