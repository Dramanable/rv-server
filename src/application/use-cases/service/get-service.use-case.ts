import { ServiceRepository } from '../../../domain/repositories/service.repository.interface';
import { Logger } from '../../ports/logger.port';
import { I18nService } from '../../ports/i18n.port';
import {
  ServiceNotFoundError,
  ApplicationValidationError,
} from '../../exceptions/application.exceptions';
import { ServiceId } from '../../../domain/value-objects/service-id.value-object';
import { Service } from '../../../domain/entities/service.entity';

export interface GetServiceRequest {
  readonly serviceId: string;
  readonly requestingUserId: string;
}

export interface GetServiceResponse {
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
    readonly packages?: ReadonlyArray<{
      readonly name: string;
      readonly sessions: number;
      readonly price: {
        readonly amount: number;
        readonly currency: string;
      };
      readonly validityDays: number;
    }>;
  };
  readonly scheduling: {
    readonly duration: number;
    readonly bufferTimeBefore?: number;
    readonly bufferTimeAfter?: number;
    readonly allowOnlineBooking: boolean;
    readonly requiresApproval: boolean;
    readonly advanceBookingLimit?: number;
    readonly cancellationDeadline?: number;
  };
  readonly requirements?: {
    readonly preparationInstructions?: string;
    readonly contraindications?: readonly string[];
    readonly requiredDocuments?: readonly string[];
    readonly minimumAge?: number;
    readonly maximumAge?: number;
    readonly specialRequirements?: string;
  };
  readonly imageUrl?: string;
  readonly assignedStaffIds: readonly string[];
  readonly status: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class GetServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: GetServiceRequest): Promise<GetServiceResponse> {
    try {
      // Validation des paramètres requis
      this.validateRequest(request);

      const { serviceId, requestingUserId } = request;

      this.logger.info('Attempting to retrieve service', {
        serviceId,
        requestingUserId,
      });

      // Créer ServiceId value object
      const serviceIdVO = ServiceId.create(serviceId);

      // Récupérer le service
      const service = await this.serviceRepository.findById(serviceIdVO);

      if (!service) {
        this.logger.warn('Service not found', {
          serviceId,
          requestingUserId,
        });

        throw new ServiceNotFoundError(serviceId, 'id', {
          requestingUserId,
        });
      }

      this.logger.info('Service retrieved successfully', {
        serviceId,
        requestingUserId,
      });

      // Mapper vers response
      return this.mapServiceToResponse(service);
    } catch (error) {
      if (
        error instanceof ServiceNotFoundError ||
        error instanceof ApplicationValidationError
      ) {
        throw error;
      }

      this.logger.error(
        'Error retrieving service',
        error instanceof Error ? error : new Error(String(error)),
        {
          serviceId: request.serviceId,
          requestingUserId: request.requestingUserId,
        },
      );

      throw error;
    }
  }

  private validateRequest(request: GetServiceRequest): void {
    if (!request.serviceId || request.serviceId.trim() === '') {
      throw new ApplicationValidationError(
        'serviceId',
        request.serviceId,
        'Service ID is required and cannot be empty',
      );
    }

    if (!request.requestingUserId || request.requestingUserId.trim() === '') {
      throw new ApplicationValidationError(
        'requestingUserId',
        request.requestingUserId,
        'Requesting user ID is required and cannot be empty',
      );
    }
  }

  private mapServiceToResponse(service: Service): GetServiceResponse {
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
        packages: service.pricing.packages?.map((pkg) => ({
          name: pkg.name,
          sessions: pkg.sessions,
          price: {
            amount: pkg.price.getAmount(),
            currency: pkg.price.getCurrency(),
          },
          validityDays: pkg.validityDays,
        })),
      },
      scheduling: {
        duration: service.scheduling.duration,
        bufferTimeBefore: service.scheduling.bufferTimeBefore,
        bufferTimeAfter: service.scheduling.bufferTimeAfter,
        allowOnlineBooking: service.scheduling.allowOnlineBooking,
        requiresApproval: service.scheduling.requiresApproval,
        advanceBookingLimit: service.scheduling.advanceBookingLimit,
        cancellationDeadline: service.scheduling.cancellationDeadline,
      },
      requirements: service.requirements
        ? {
            preparationInstructions:
              service.requirements.preparationInstructions,
            contraindications: service.requirements.contraindications,
            requiredDocuments: service.requirements.requiredDocuments,
            minimumAge: service.requirements.minimumAge,
            maximumAge: service.requirements.maximumAge,
            specialRequirements: service.requirements.specialRequirements,
          }
        : undefined,
      imageUrl: service.imageUrl?.getUrl(),
      assignedStaffIds: service.assignedStaffIds.map((id) => id.getValue()),
      status: service.status,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
