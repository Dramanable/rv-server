import { ServiceRepository } from '../../../domain/repositories/service.repository.interface';
import { Logger } from '../../ports/logger.port';
import { I18nService } from '../../ports/i18n.port';
import { ApplicationValidationError } from '../../exceptions/application.exceptions';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import {
  Service,
  ServiceCategory,
} from '../../../domain/entities/service.entity';

export interface ListServicesRequest {
  readonly requestingUserId: string;
  readonly businessId: string;
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
  };
  readonly sorting: {
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
  };
  readonly filters: {
    readonly name?: string;
    readonly category?: ServiceCategory;
    readonly isActive?: boolean;
    readonly minPrice?: number;
    readonly maxPrice?: number;
    readonly duration?: number;
    readonly allowOnlineBooking?: boolean;
  };
}

export interface ListServicesResponse {
  readonly data: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly businessId: string;
    readonly category: string;
    readonly pricing: {
      readonly basePrice: {
        readonly amount: number;
        readonly currency: string;
      };
      readonly discountPrice?: {
        readonly amount: number;
        readonly currency: string;
      };
    };
    readonly scheduling: {
      readonly duration: number;
      readonly allowOnlineBooking: boolean;
      readonly requiresApproval: boolean;
    };
    readonly imageUrl?: string;
    readonly assignedStaffIds: readonly string[];
    readonly status: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  }>;
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export class ListServicesUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: ListServicesRequest): Promise<ListServicesResponse> {
    try {
      // Validation des paramètres requis
      this.validateRequest(request);

      const { requestingUserId, businessId, pagination, sorting, filters } =
        request;

      this.logger.info('Attempting to list services', {
        businessId,
        requestingUserId,
        page: pagination.page,
        limit: pagination.limit,
      });

      // Créer BusinessId value object
      const businessIdVO = BusinessId.create(businessId);

      // Calculer l'offset pour la pagination
      const offset = (pagination.page - 1) * pagination.limit;

      // Préparer les critères de recherche
      const searchCriteria = {
        businessId: businessIdVO,
        ...filters,
        limit: pagination.limit,
        offset,
      };

      // Récupérer les services avec pagination
      const { services, total } =
        await this.serviceRepository.search(searchCriteria);

      // Calculer les métadonnées de pagination
      const totalPages = Math.ceil(total / pagination.limit);
      const hasNextPage = pagination.page < totalPages;
      const hasPrevPage = pagination.page > 1;

      this.logger.info('Services listed successfully', {
        businessId,
        requestingUserId,
        totalFound: total,
        page: pagination.page,
        limit: pagination.limit,
      });

      // Mapper vers response
      return {
        data: services.map((service) => this.mapServiceToResponse(service)),
        meta: {
          currentPage: pagination.page,
          totalPages,
          totalItems: total,
          itemsPerPage: pagination.limit,
          hasNextPage,
          hasPrevPage,
        },
      };
    } catch (error) {
      if (error instanceof ApplicationValidationError) {
        throw error;
      }

      this.logger.error(
        'Error listing services',
        error instanceof Error ? error : new Error(String(error)),
        {
          businessId: request.businessId,
          requestingUserId: request.requestingUserId,
        },
      );

      throw error;
    }
  }

  private validateRequest(request: ListServicesRequest): void {
    if (!request.requestingUserId || request.requestingUserId.trim() === '') {
      throw new ApplicationValidationError(
        'requestingUserId',
        request.requestingUserId,
        'Requesting user ID is required and cannot be empty',
      );
    }

    if (!request.businessId || request.businessId.trim() === '') {
      throw new ApplicationValidationError(
        'businessId',
        request.businessId,
        'Business ID is required and cannot be empty',
      );
    }

    if (request.pagination.page < 1) {
      throw new ApplicationValidationError(
        'page',
        request.pagination.page,
        'Page number must be greater than 0',
      );
    }

    if (request.pagination.limit < 1 || request.pagination.limit > 100) {
      throw new ApplicationValidationError(
        'limit',
        request.pagination.limit,
        'Limit must be between 1 and 100',
      );
    }
  }

  private mapServiceToResponse(
    service: Service,
  ): ListServicesResponse['data'][0] {
    return {
      id: service.id.getValue(),
      name: service.name,
      description: service.description,
      businessId: service.businessId.getValue(),
      category: service.category,
      pricing: {
        basePrice: {
          amount: service.pricing.basePrice.getAmount(),
          currency: service.pricing.basePrice.getCurrency(),
        },
        discountPrice: service.pricing.discountPrice
          ? {
              amount: service.pricing.discountPrice.getAmount(),
              currency: service.pricing.discountPrice.getCurrency(),
            }
          : undefined,
      },
      scheduling: {
        duration: service.scheduling.duration,
        allowOnlineBooking: service.scheduling.allowOnlineBooking,
        requiresApproval: service.scheduling.requiresApproval,
      },
      imageUrl: service.imageUrl?.getUrl(),
      assignedStaffIds: service.assignedStaffIds.map((id) => id.getValue()),
      status: service.status,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
