/**
 * 🏢 List Business Use Case - Clean Architecture + SOLID
 *
 * ✅ COUCHE APPLICATION PURE - Sans dépendance NestJS
 * ✅ Dependency Inversion Principle respecté
 * ✅ Interface-driven design
 */
import type { IPermissionService } from '@application/ports/permission.service.interface';
import type { I18nService } from '../../../application/ports/i18n.port';
import type { Logger } from '../../../application/ports/logger.port';
import type { BusinessRepository } from '../../../domain/repositories/business.repository.interface';
import {
  AppContext,
  AppContextFactory,
} from '../../../shared/context/app-context';
import { ApplicationValidationError } from '../../exceptions/application.exceptions';

export interface ListBusinessRequest {
  readonly requestingUserId: string;
  readonly page?: number;
  readonly limit?: number;
  readonly offset?: number;
  readonly search?: string;
  readonly sector?: string;
  readonly city?: string;
  readonly isActive?: boolean;
  readonly status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  readonly sortBy?: 'name' | 'createdAt' | 'updatedAt';
  readonly sortOrder?: 'ASC' | 'DESC';
}

export interface ListBusinessResponse {
  readonly businesses: Array<{
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly status: string;
    readonly primaryEmail: string;
    readonly primaryPhone: string;
    readonly logoUrl?: string;
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
}

/**
 * ✅ PURE APPLICATION USE CASE
 * ❌ No NestJS dependencies
 * ✅ Constructor Injection via interfaces only
 */
export class ListBusinessUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: ListBusinessRequest): Promise<ListBusinessResponse> {
    // 1. Context pour traçabilité
    const context: AppContext = AppContextFactory.create()
      .operation('ListBusiness')
      .requestingUser(request.requestingUserId)
      .build();

    this.logger.info(
      this.i18n.t('operations.business.list_attempt'),
      context as any,
    );
    try {
      // 2. Validation des permissions
      await this.validatePermissions(request.requestingUserId, context);

      // 3. Validation des règles métier
      this.validateBusinessRules(request);

      // 4. Paramètres de pagination avec valeurs par défaut
      const page = request.page ?? 1;
      const limit = Math.min(request.limit ?? 20, 100); // Maximum 100 éléments par page
      const offset = (page - 1) * limit;

      // 5. Critères de recherche complets
      const searchCriteria = {
        name: request.search, // Recherche par nom
        sector: request.sector,
        city: request.city,
        isActive: request.isActive,
        limit: limit, // Utiliser la variable limit calculée
        offset: offset, // Utiliser la variable offset calculée
      };

      // 6. Récupération des données avec pagination
      const { businesses, total } =
        await this.businessRepository.search(searchCriteria);

      // 7. Construction de la réponse paginée
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      const response: ListBusinessResponse = {
        businesses: businesses.map((business) => ({
          id: business.id.getValue(),
          name: business.name.getValue(),
          description: business.description,
          status: business.status,
          primaryEmail: business.contactInfo.primaryEmail.getValue(),
          primaryPhone: business.contactInfo.primaryPhone.getValue(),
          logoUrl: business.branding?.logoUrl?.getUrl(),
          createdAt: business.createdAt,
          updatedAt: business.updatedAt,
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPreviousPage,
        },
      };

      this.logger.info(this.i18n.t('operations.business.list_success'), {
        ...context,
        totalBusinesses: total,
        page,
        limit,
      } as Record<string, unknown>);

      return response;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.list_failed'),
        error as Error,
        context as unknown as Record<string, unknown>,
      );
      throw error;
    }
  }

  /**
   * SRP - Validation des permissions utilisateur avec IPermissionService
   */
  private async validatePermissions(
    requestingUserId: string,
    context: AppContext,
  ): Promise<void> {
    this.logger.info('Validating LIST_BUSINESSES permission', {
      requestingUserId,
      correlationId: context.correlationId,
    });

    try {
      await this.permissionService.requirePermission(
        requestingUserId,
        'LIST_BUSINESSES',
        {
          correlationId: context.correlationId,
        },
      );

      this.logger.info('LIST_BUSINESSES permission validated successfully', {
        requestingUserId,
        correlationId: context.correlationId,
      });
    } catch (error) {
      this.logger.error('LIST_BUSINESSES permission denied', error as Error, {
        requestingUserId,
        correlationId: context.correlationId,
      });
      throw error;
    }
  }

  /**
   * SRP - Validation des règles métier pour les paramètres de recherche
   */
  private validateBusinessRules(request: ListBusinessRequest): void {
    // Validation de la pagination
    if (request.page !== undefined && request.page < 1) {
      throw new ApplicationValidationError(
        'page',
        request.page,
        'must_be_greater_than_zero',
      );
    }

    if (
      request.limit !== undefined &&
      (request.limit < 1 || request.limit > 100)
    ) {
      throw new ApplicationValidationError(
        'limit',
        request.limit,
        'must_be_between_1_and_100',
      );
    }

    // Validation du tri
    const validSortFields = ['name', 'createdAt', 'updatedAt'];
    if (request.sortBy && !validSortFields.includes(request.sortBy)) {
      throw new ApplicationValidationError(
        'sortBy',
        request.sortBy,
        'invalid_sort_field',
      );
    }

    const validSortOrders = ['ASC', 'DESC'];
    if (request.sortOrder && !validSortOrders.includes(request.sortOrder)) {
      throw new ApplicationValidationError(
        'sortOrder',
        request.sortOrder,
        'invalid_sort_order',
      );
    }
  }
}
