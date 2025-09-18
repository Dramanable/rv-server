/**
 * 🛠️ Create Service Use Case - Clean Architecture + SOLID
 *
 * Création d'un service avec validation métier et permissions
 * ✅ AUCUNE dépendance NestJS - Respect de la Clean Architecture
 */
import { Service, ServiceStatus } from '@domain/entities/service.entity';
import { ServiceRepository } from '@domain/repositories/service.repository.interface';
import { BusinessRepository } from '@domain/repositories/business.repository.interface';
import { Logger } from '@application/ports/logger.port';
import { I18nService } from '@application/ports/i18n.port';
import { AppContext, AppContextFactory } from '@shared/context/app-context';
import { UserRole, Permission } from '@shared/enums/user-role.enum';
import { User } from '@domain/entities/user.entity';
import { UserRepository } from '@domain/repositories/user.repository.interface';
import {
  InsufficientPermissionsError,
  ServiceValidationError,
  BusinessNotFoundError,
} from '@application/exceptions/application.exceptions';
import { Money } from '@domain/value-objects/money.value-object';
import { BusinessId } from '@domain/value-objects/business-id.value-object';

export interface CreateServiceRequest {
  readonly requestingUserId: string;
  readonly businessId: string;
  readonly name: string;
  readonly description?: string;
  readonly category?: string;
  readonly duration: number; // en minutes
  readonly price: {
    readonly amount: number;
    readonly currency: string;
  };
  readonly settings?: {
    readonly isOnlineBookingEnabled?: boolean;
    readonly requiresApproval?: boolean;
    readonly maxAdvanceBookingDays?: number;
    readonly minAdvanceBookingHours?: number;
    readonly bufferTimeBefore?: number; // en minutes
    readonly bufferTimeAfter?: number; // en minutes
    readonly isGroupBookingAllowed?: boolean;
    readonly maxGroupSize?: number;
  };
  readonly requirements?: {
    readonly preparation?: string;
    readonly materials?: string[];
    readonly restrictions?: string[];
    readonly cancellationPolicy?: string;
  };
  readonly isActive?: boolean;
}

export interface CreateServiceResponse {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly category?: string;
  readonly duration: number;
  readonly price: {
    readonly amount: number;
    readonly currency: string;
  };
  readonly businessId: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
}

export class CreateServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly businessRepository: BusinessRepository,
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: CreateServiceRequest): Promise<CreateServiceResponse> {
    // 1. Context pour traçabilité
    const context: AppContext = AppContextFactory.create()
      .operation('CreateService')
      .requestingUser(request.requestingUserId)
      .metadata('businessId', request.businessId)
      .build();

    this.logger.info(this.i18n.t('operations.service.creation_attempt'), {
      ...context,
    } as Record<string, unknown>);

    try {
      // 2. Validation des permissions
      await this.validatePermissions(
        request.requestingUserId,
        request.businessId,
        context,
      );

      // 3. Validation des règles métier
      await this.validateBusinessRules(request, context);

      // 4. Création de l'entité Service
      const businessId = BusinessId.create(request.businessId);

      const service = Service.create({
        businessId,
        name: request.name.trim(),
        description: request.description?.trim() || '',
        category: request.category as any, // ServiceCategory sera validé plus tard
        basePrice: request.price.amount,
        currency: request.price.currency,
        duration: request.duration,
        allowOnlineBooking: request.settings?.isOnlineBookingEnabled,
        requiresApproval: request.settings?.requiresApproval,
      });

      // 5. Persistance
      await this.serviceRepository.save(service);

      // 6. Réponse typée
      const response: CreateServiceResponse = {
        id: service.id.getValue(),
        name: service.name,
        description: service.description,
        category: service.category,
        duration: service.scheduling.duration,
        price: {
          amount: service.pricing.basePrice.getAmount(),
          currency: service.pricing.basePrice.getCurrency(),
        },
        businessId: service.businessId.getValue(),
        isActive: service.status === ServiceStatus.ACTIVE,
        createdAt: service.createdAt,
      };

      this.logger.info(this.i18n.t('operations.service.creation_success'), {
        ...context,
        serviceId: service.id.getValue(),
        serviceName: service.name,
        servicePrice: service.pricing.basePrice.getAmount(),
      } as Record<string, unknown>);

      return response;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.service.creation_failed'),
        error as Error,
        { ...context } as Record<string, unknown>,
      );
      throw error;
    }
  }

  private async validatePermissions(
    requestingUserId: string,
    businessId: string,
    context: AppContext,
  ): Promise<void> {
    const requestingUser = await this.userRepository.findById(requestingUserId);
    if (!requestingUser) {
      throw new InsufficientPermissionsError(
        'Requesting user not found',
        UserRole.REGULAR_CLIENT,
      );
    }

    // Vérifier que l'entreprise existe
    const business = await this.businessRepository.findById(
      BusinessId.create(businessId),
    );
    if (!business) {
      throw new BusinessNotFoundError(
        `Business with id ${businessId} not found`,
      );
    }

    // Platform admins peuvent créer des services dans n'importe quelle entreprise
    if (requestingUser.role === UserRole.PLATFORM_ADMIN) {
      return;
    }

    // Business owners et admins peuvent créer des services
    const allowedRoles = [UserRole.BUSINESS_OWNER, UserRole.BUSINESS_ADMIN];

    if (!allowedRoles.includes(requestingUser.role)) {
      this.logger.warn(this.i18n.t('warnings.permission.denied'), {
        requestingUserId,
        requestingUserRole: requestingUser.role,
        requiredPermissions: 'CREATE_SERVICE',
        businessId,
      });
      throw new InsufficientPermissionsError(
        requestingUserId,
        'CREATE_SERVICE',
        'service',
      );
    }
  }

  private async validateBusinessRules(
    request: CreateServiceRequest,
    context: AppContext,
  ): Promise<void> {
    // Validation du nom
    if (!request.name || request.name.trim().length < 3) {
      throw new ServiceValidationError(
        'name',
        request.name,
        'Service name must be at least 3 characters long',
      );
    }

    if (request.name.trim().length > 100) {
      throw new ServiceValidationError(
        'name',
        request.name,
        'Service name cannot exceed 100 characters',
      );
    }

    // TODO: Validation de l'unicité du nom dans l'entreprise
    // Méthode findByNameAndBusiness à implémenter dans le repository

    // Validation de la durée
    if (!request.duration || request.duration < 5) {
      throw new ServiceValidationError(
        'duration',
        request.duration,
        'Service duration must be at least 5 minutes',
      );
    }

    if (request.duration > 480) {
      // 8 heures maximum
      throw new ServiceValidationError(
        'duration',
        request.duration,
        'Service duration cannot exceed 480 minutes (8 hours)',
      );
    }

    // Validation du prix
    if (!request.price || request.price.amount < 0) {
      throw new ServiceValidationError(
        'price',
        request.price?.amount,
        'Service price cannot be negative',
      );
    }

    if (request.price.amount > 999999.99) {
      throw new ServiceValidationError(
        'price',
        request.price.amount,
        'Service price cannot exceed 999,999.99',
      );
    }

    // Validation de la devise
    const validCurrencies = ['EUR', 'USD', 'GBP', 'CAD', 'AUD', 'CHF', 'JPY'];
    if (!validCurrencies.includes(request.price.currency)) {
      throw new ServiceValidationError(
        'currency',
        request.price.currency,
        `Invalid currency: ${request.price.currency}. Supported currencies: ${validCurrencies.join(', ')}`,
      );
    }

    // Validation de la description si fournie
    if (request.description && request.description.trim().length > 1000) {
      throw new ServiceValidationError(
        'description',
        request.description,
        'Service description cannot exceed 1000 characters',
      );
    }

    // Validation de la catégorie si fournie
    if (request.category && request.category.trim().length > 50) {
      throw new ServiceValidationError(
        'category',
        request.category,
        'Service category cannot exceed 50 characters',
      );
    }

    // Validation des paramètres si fournis
    if (request.settings) {
      const {
        maxAdvanceBookingDays,
        minAdvanceBookingHours,
        bufferTimeBefore,
        bufferTimeAfter,
        maxGroupSize,
      } = request.settings;

      if (maxAdvanceBookingDays !== undefined && maxAdvanceBookingDays < 1) {
        throw new ServiceValidationError(
          'maxAdvanceBookingDays',
          maxAdvanceBookingDays,
          'Max advance booking days must be at least 1',
        );
      }

      if (minAdvanceBookingHours !== undefined && minAdvanceBookingHours < 0) {
        throw new ServiceValidationError(
          'minAdvanceBookingHours',
          minAdvanceBookingHours,
          'Min advance booking hours cannot be negative',
        );
      }

      if (bufferTimeBefore !== undefined && bufferTimeBefore < 0) {
        throw new ServiceValidationError(
          'bufferTimeBefore',
          bufferTimeBefore,
          'Buffer time before cannot be negative',
        );
      }

      if (bufferTimeAfter !== undefined && bufferTimeAfter < 0) {
        throw new ServiceValidationError(
          'bufferTimeAfter',
          bufferTimeAfter,
          'Buffer time after cannot be negative',
        );
      }

      if (maxGroupSize !== undefined && maxGroupSize < 1) {
        throw new ServiceValidationError(
          'maxGroupSize',
          maxGroupSize,
          'Max group size must be at least 1',
        );
      }

      if (maxGroupSize !== undefined && maxGroupSize > 50) {
        throw new ServiceValidationError(
          'maxGroupSize',
          maxGroupSize,
          'Max group size cannot exceed 50',
        );
      }
    }

    // Validation des exigences si fournies
    if (request.requirements) {
      const { preparation, materials, restrictions, cancellationPolicy } =
        request.requirements;

      if (preparation && preparation.trim().length > 500) {
        throw new ServiceValidationError(
          'preparation',
          preparation,
          'Preparation requirements cannot exceed 500 characters',
        );
      }

      if (materials && materials.length > 20) {
        throw new ServiceValidationError(
          'materials',
          materials.length,
          'Cannot have more than 20 materials',
        );
      }

      if (restrictions && restrictions.length > 10) {
        throw new ServiceValidationError(
          'restrictions',
          restrictions.length,
          'Cannot have more than 10 restrictions',
        );
      }

      if (cancellationPolicy && cancellationPolicy.trim().length > 500) {
        throw new ServiceValidationError(
          'cancellationPolicy',
          cancellationPolicy,
          'Cancellation policy cannot exceed 500 characters',
        );
      }
    }
  }
}
