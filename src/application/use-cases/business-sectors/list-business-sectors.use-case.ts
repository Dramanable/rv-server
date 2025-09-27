/**
 * @fileoverview Liste des secteurs d'activité - Use Case
 * Use case pour récupérer la liste des secteurs d'activité avec pagination et filtres
 *
 * @author Amadou Sall
 * @version 1.0.0
 * @since 2024
 */

import { ForbiddenError } from '@application/exceptions/auth.exceptions';
import { BusinessSectorOperationError } from '@application/exceptions/business-sector.exceptions';
import {
  BusinessSectorListResult,
  BusinessSectorQueryOptions,
  IBusinessSectorRepository,
} from '@application/ports/business-sector.repository.interface';
import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { IPermissionService } from '@application/ports/permission.service.interface';

/**
 * 📋 Requête pour lister les secteurs d'activité
 */
export interface ListBusinessSectorsRequest {
  readonly requestingUserId: string;
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly isActive?: boolean;
  readonly sortBy?: 'name' | 'code' | 'createdAt';
  readonly sortOrder?: 'ASC' | 'DESC';
}

/**
 * 📋 Réponse de liste des secteurs d'activité
 */
export interface ListBusinessSectorsResponse {
  readonly businessSectors: BusinessSectorListResult;
}

/**
 * 📋 Use Case - Lister les Secteurs d'Activité
 *
 * Permet aux super-administrateurs de récupérer la liste complète
 * des secteurs d'activité avec pagination et filtres.
 *
 * Règles métier :
 * - Seuls les PLATFORM_ADMIN peuvent lister les secteurs
 * - Support de la pagination (défaut : page=1, limit=20)
 * - Support des filtres (recherche, statut actif/inactif)
 * - Support du tri (par nom, code, date de création)
 * - Limite maximale de 100 éléments par page
 */
export class ListBusinessSectorsUseCase {
  constructor(
    private readonly businessSectorRepository: IBusinessSectorRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: ListBusinessSectorsRequest,
  ): Promise<ListBusinessSectorsResponse> {
    const context = {
      userId: request.requestingUserId,
      operation: 'list_business_sectors',
    };

    this.logger.info('Listing business sectors', context);

    try {
      // 🚨 Vérification des permissions
      await this.validatePermissions(request.requestingUserId);

      // ✅ Validation de la requête
      this.validateRequest(request);

      // 📋 Construction des options de requête
      const queryOptions = this.buildQueryOptions(request);

      // 🔍 Récupération des secteurs d'activité
      const result = await this.businessSectorRepository.findAll(queryOptions);

      this.logger.info(
        `Successfully listed ${result.data.length} business sectors`,
        {
          ...context,
          count: result.data.length,
          totalItems: result.meta.totalItems,
        },
      );

      return {
        businessSectors: result,
      };
    } catch (error) {
      this.logger.error(
        'Failed to list business sectors',
        error as Error,
        context,
      );
      throw error;
    }
  }

  /**
   * 🚨 Valider les permissions de l'utilisateur
   */
  private async validatePermissions(userId: string): Promise<void> {
    // Vérifier que l'utilisateur est super-admin
    const isSuperAdmin = await this.permissionService.isSuperAdmin(userId);

    if (!isSuperAdmin) {
      const message = this.i18n.translate('permissions.super_admin_required');
      this.logger.error(
        'Access denied: user tried to list business sectors',
        new Error(message),
        { userId, operation: 'list_business_sectors' },
      );
      throw new ForbiddenError(message);
    }
  }

  /**
   * ✅ Valider la requête
   */
  private validateRequest(request: ListBusinessSectorsRequest): void {
    const { page = 1, limit = 20, sortBy, sortOrder } = request;

    // Validation de la pagination
    if (page < 1) {
      throw new BusinessSectorOperationError(
        'list',
        'validation',
        undefined,
        this.i18n.translate('validation.page_must_be_positive'),
      );
    }

    if (limit > 100) {
      throw new BusinessSectorOperationError(
        'list',
        'validation',
        undefined,
        this.i18n.translate('validation.limit_max_100'),
      );
    }

    // Validation du tri
    if (sortBy && !['name', 'code', 'createdAt'].includes(sortBy)) {
      throw new BusinessSectorOperationError(
        'list',
        'validation',
        undefined,
        this.i18n.translate('validation.invalid_sort_field'),
      );
    }

    if (sortOrder && !['ASC', 'DESC'].includes(sortOrder)) {
      throw new BusinessSectorOperationError(
        'list',
        'validation',
        undefined,
        this.i18n.translate('validation.invalid_sort_order'),
      );
    }
  }

  /**
   * 🔧 Construire les options de requête
   */
  private buildQueryOptions(
    request: ListBusinessSectorsRequest,
  ): BusinessSectorQueryOptions {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = request;

    return {
      pagination: {
        page,
        limit,
      },
      sort: {
        field: sortBy,
        direction: sortOrder,
      },
      filters: {
        search,
        isActive,
      },
    };
  }
}
