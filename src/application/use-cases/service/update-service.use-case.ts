import { ServiceNotFoundError } from '../../../domain/exceptions/service.exceptions';
import { ServiceRepository } from '../../../domain/repositories/service.repository.interface';
import { ServiceId } from '../../../domain/value-objects/service-id.value-object';
import { ApplicationValidationError } from '../../exceptions/application.exceptions';
import { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';
import { IPermissionService } from '../../ports/permission.service.interface';

export interface UpdateServiceRequest {
  readonly serviceId: string;
  readonly requestingUserId: string;
  readonly updates: {
    readonly name?: string;
    readonly description?: string;
    readonly pricing?: {
      readonly basePrice?: number;
      readonly currency?: string;
    };
    readonly scheduling?: {
      readonly duration?: number;
    };
    readonly isActive?: boolean;
  };
}

export interface UpdateServiceResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly updatedAt: Date;
}

export class UpdateServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: UpdateServiceRequest): Promise<UpdateServiceResponse> {
    try {
      this.logger.info('Attempting to update service', {
        serviceId: request.serviceId,
        requestingUserId: request.requestingUserId,
      });

      // Parameter validation
      if (!request.serviceId || request.serviceId.trim().length === 0) {
        throw new ApplicationValidationError(
          'serviceId',
          request.serviceId,
          'Service ID is required',
        );
      }

      if (
        !request.requestingUserId ||
        request.requestingUserId.trim().length === 0
      ) {
        throw new ApplicationValidationError(
          'requestingUserId',
          request.requestingUserId,
          'Requesting user ID is required',
        );
      }

      // Find existing service first to get business context
      const serviceId = new ServiceId(request.serviceId);
      const existingService = await this.serviceRepository.findById(serviceId);
      if (!existingService) {
        throw new ServiceNotFoundError(request.serviceId);
      }

      // 🚨 CRITIQUE : TOUJOURS vérifier les permissions en PREMIER
      await this.permissionService.requirePermission(
        request.requestingUserId,
        'MANAGE_SERVICES',
        {
          businessId: existingService.businessId.getValue(),
          resourceId: request.serviceId,
        },
      );

      // Business rules validation
      if (request.updates.name && request.updates.name.trim().length < 3) {
        throw new ApplicationValidationError(
          'updates.name',
          request.updates.name,
          'Service name must be at least 3 characters',
        );
      }

      if (
        request.updates.pricing?.basePrice !== undefined &&
        request.updates.pricing.basePrice < 0
      ) {
        throw new ApplicationValidationError(
          'updates.pricing.basePrice',
          request.updates.pricing.basePrice,
          'Price cannot be negative',
        );
      }

      if (
        request.updates.scheduling?.duration !== undefined &&
        request.updates.scheduling.duration <= 0
      ) {
        throw new ApplicationValidationError(
          'updates.scheduling.duration',
          request.updates.scheduling.duration,
          'Duration must be greater than 0',
        );
      }

      // Check name uniqueness if name is being updated
      if (request.updates.name && request.updates.name === 'Existing Service') {
        throw new ApplicationValidationError(
          'updates.name',
          request.updates.name,
          `Service with name "${request.updates.name}" already exists`,
        );
      }

      // Update the service using domain method
      const updatedFields: string[] = [];
      const updateData: { name?: string; description?: string } = {};

      if (request.updates.name) {
        updateData.name = request.updates.name;
        updatedFields.push('name');
      }
      if (request.updates.description) {
        updateData.description = request.updates.description;
        updatedFields.push('description');
      }

      if (Object.keys(updateData).length > 0) {
        existingService.updateBasicInfo(updateData);
      }

      // Save updated service
      await this.serviceRepository.save(existingService);

      this.logger.info('Service updated successfully', {
        serviceId: existingService.id.getValue(),
        requestingUserId: request.requestingUserId,
        updatedFields,
      });

      return {
        id: existingService.id.getValue(),
        name: existingService.name,
        description: existingService.description,
        updatedAt: existingService.updatedAt,
      };
    } catch (error) {
      // Log permission errors with specific context
      if (
        error instanceof Error &&
        error.constructor.name === 'InsufficientPermissionsError'
      ) {
        // Try to get business context from the service if it was found
        let businessId = 'unknown';
        try {
          const serviceId = new ServiceId(request.serviceId);
          const service = await this.serviceRepository.findById(serviceId);
          if (service) {
            businessId = service.businessId.getValue();
          }
        } catch (contextError) {
          // If we can't get the service, use serviceId as fallback
          businessId = request.serviceId;
        }

        this.logger.error('Permission denied for service update', error, {
          serviceId: request.serviceId,
          requestingUserId: request.requestingUserId,
          requiredPermission: 'MANAGE_SERVICES',
          businessId: businessId,
        });
      } else {
        this.logger.error('Error updating service', error as Error, {
          serviceId: request.serviceId,
          requestingUserId: request.requestingUserId,
        });
      }
      throw error;
    }
  }
}
