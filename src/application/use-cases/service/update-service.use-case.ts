import {
  Service,
  ServiceCategory,
  ServiceStatus,
} from '../../../domain/entities/service.entity';
import { ServiceRepository } from '../../../domain/repositories/service.repository.interface';
import { ServiceNotFoundError } from '../../../domain/exceptions/service.exceptions';
import { ApplicationValidationError } from '../../../application/exceptions/application.exceptions';
import { ServiceId } from '../../../domain/value-objects/service-id.value-object';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import { UserId } from '../../../domain/value-objects/user-id.value-object';
import { Money } from '../../../domain/value-objects/money.value-object';
import { Logger } from '../../ports/logger.port';
import { I18nService } from '../../ports/i18n.port';

export interface UpdateServiceRequest {
  readonly serviceId: string;
  readonly requestingUserId: string;
  readonly updates: {
    readonly name?: string;
    readonly description?: string;
    readonly category?: ServiceCategory;
    readonly pricing?: {
      readonly basePrice?: number;
      readonly currency?: string;
    };
    readonly scheduling?: {
      readonly duration?: number;
      readonly allowOnlineBooking?: boolean;
      readonly requiresApproval?: boolean;
    };
    readonly assignedStaffIds?: readonly string[];
    readonly status?: ServiceStatus;
  };
}

export interface UpdateServiceResponse {
  readonly id: string;
  readonly businessId: string;
  readonly name: string;
  readonly description: string;
  readonly category: ServiceCategory;
  readonly pricing: {
    readonly basePrice: {
      readonly amount: number;
      readonly currency: string;
    };
  };
  readonly scheduling: {
    readonly duration: number;
    readonly allowOnlineBooking: boolean;
    readonly requiresApproval: boolean;
  };
  readonly assignedStaffIds: readonly string[];
  readonly status: ServiceStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class UpdateServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: UpdateServiceRequest): Promise<UpdateServiceResponse> {
    try {
      this.logger.info(`Attempting to update service`, {
        serviceId: request.serviceId,
        requestingUserId: request.requestingUserId,
      });

      // 1. Validation des paramètres requis
      if (!request.serviceId || request.serviceId.trim().length === 0) {
        throw new ApplicationValidationError(
          'serviceId',
          request.serviceId,
          'Service ID is required and cannot be empty',
        );
      }

      if (
        !request.requestingUserId ||
        request.requestingUserId.trim().length === 0
      ) {
        throw new ApplicationValidationError(
          'requestingUserId',
          request.requestingUserId,
          'Requesting user ID is required and cannot be empty',
        );
      }

      // 2. Convertir l'ID string en ServiceId
      const serviceId = ServiceId.create(request.serviceId);

      // 3. Récupérer le service existant
      const existingService = await this.serviceRepository.findById(serviceId);
      if (!existingService) {
        throw new ServiceNotFoundError(
          this.i18n.translate('service.errors.not_found', {
            id: request.serviceId,
          }),
        );
      }

      // 4. Validation des business rules
      if (request.updates.name !== undefined) {
        if (request.updates.name.trim().length < 2) {
          throw new ApplicationValidationError(
            'name',
            request.updates.name,
            'Service name must be at least 2 characters long',
          );
        }

        // Vérifier l'unicité du nom dans le business (si le nom change)
        if (request.updates.name !== existingService.name) {
          const existingByName = await this.serviceRepository.findByName(
            existingService.businessId,
            request.updates.name,
          );
          if (existingByName && !existingByName.id.equals(existingService.id)) {
            throw new ApplicationValidationError(
              'name',
              request.updates.name,
              'A service with this name already exists in this business',
            );
          }
        }
      }

      if (
        request.updates.pricing?.basePrice !== undefined &&
        request.updates.pricing.basePrice < 0
      ) {
        throw new ApplicationValidationError(
          'basePrice',
          request.updates.pricing.basePrice,
          'Service price cannot be negative',
        );
      }

      if (
        request.updates.scheduling?.duration !== undefined &&
        request.updates.scheduling.duration <= 0
      ) {
        throw new ApplicationValidationError(
          'duration',
          request.updates.scheduling.duration,
          'Service duration must be greater than 0',
        );
      }

      // 3. Appliquer les mises à jour directement sur l'instance existante

      // Mise à jour des informations de base (name, description, category)
      if (
        request.updates.name ||
        request.updates.description ||
        request.updates.category
      ) {
        existingService.updateBasicInfo({
          name: request.updates.name,
          description: request.updates.description,
          category: request.updates.category,
        });
      }

      if (
        request.updates.pricing &&
        (request.updates.pricing.basePrice || request.updates.pricing.currency)
      ) {
        existingService.updatePricing({
          basePrice: request.updates.pricing.basePrice
            ? Money.create(
                request.updates.pricing.basePrice,
                request.updates.pricing.currency ??
                  existingService.pricing.basePrice.getCurrency(),
              )
            : existingService.pricing.basePrice,
        });
      }

      if (request.updates.scheduling) {
        existingService.updateScheduling({
          ...(request.updates.scheduling.duration !== undefined && {
            duration: request.updates.scheduling.duration,
          }),
          ...(request.updates.scheduling.allowOnlineBooking !== undefined && {
            allowOnlineBooking: request.updates.scheduling.allowOnlineBooking,
          }),
          ...(request.updates.scheduling.requiresApproval !== undefined && {
            requiresApproval: request.updates.scheduling.requiresApproval,
          }),
        });
      }

      // Gestion des staff assignments
      if (request.updates.assignedStaffIds) {
        // Supprimer tous les staff actuels
        const currentStaffIds = [...existingService.assignedStaffIds];
        currentStaffIds.forEach((staffId) => {
          existingService.unassignStaff(staffId);
        });

        // Assigner les nouveaux staff
        request.updates.assignedStaffIds.forEach((staffIdString: string) => {
          const staffId = UserId.create(staffIdString);
          existingService.assignStaff(staffId);
        });
      }

      // Appliquer le statut si spécifié
      if (request.updates.status !== undefined) {
        if (request.updates.status === ServiceStatus.ACTIVE) {
          existingService.activate();
        } else if (request.updates.status === ServiceStatus.INACTIVE) {
          existingService.deactivate();
        }
      }

      // 4. Sauvegarder la mise à jour
      await this.serviceRepository.save(existingService);

      // Déterminer les champs mis à jour (seulement les champs de base pour le log)
      const updatedFields: string[] = [];
      if (request.updates.name) updatedFields.push('name');
      if (request.updates.description) updatedFields.push('description');
      if (request.updates.category) updatedFields.push('category');

      this.logger.info(`Service updated successfully`, {
        serviceId: existingService.id.toString(),
        requestingUserId: request.requestingUserId,
        updatedFields,
      });

      // 5. Retourner la réponse
      return {
        id: existingService.id.toString(),
        businessId: existingService.businessId.toString(),
        name: existingService.name,
        description: existingService.description,
        category: existingService.category,
        pricing: {
          basePrice: {
            amount: existingService.pricing.basePrice.getAmount(),
            currency: existingService.pricing.basePrice.getCurrency(),
          },
        },
        scheduling: {
          duration: existingService.scheduling.duration,
          allowOnlineBooking: existingService.scheduling.allowOnlineBooking,
          requiresApproval: existingService.scheduling.requiresApproval,
        },
        assignedStaffIds: existingService.assignedStaffIds.map((id: UserId) =>
          id.toString(),
        ),
        status: existingService.status,
        createdAt: existingService.createdAt,
        updatedAt: existingService.updatedAt,
      };
    } catch (error) {
      this.logger.error(
        `Error updating service`,
        error instanceof Error ? error : new Error(String(error)),
        {
          serviceId: request.serviceId,
          requestingUserId: request.requestingUserId,
        },
      );
      throw error;
    }
  }
}
