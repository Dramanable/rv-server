/**
 * 🗑️ Delete Service Use Case - Application Layer
 *
 * Cas d'usage pour la suppression d'un service
 * Couche Application - Orchestration métier
 *
 * ✅ CLEAN ARCHITECTURE COMPLIANCE:
 * - Pas de dépendance vers les couches Infrastructure/Presentation
 * - Utilise uniquement les ports (interfaces)
 * - Validation des règles métier
 * - Gestion centralisée des erreurs
 * - Logging et audit trail
 */

import { Service } from '../../../domain/entities/service.entity';
import { ServiceNotFoundError } from '../../../domain/exceptions/service.exceptions';
import { ServiceRepository } from '../../../domain/repositories/service.repository.interface';
import { ServiceId } from '../../../domain/value-objects/service-id.value-object';
import {
  ApplicationValidationError,
  InsufficientPermissionsError,
} from '../../exceptions/application.exceptions';
import { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';
import { IPermissionService } from '../../ports/permission.service.interface';

export interface DeleteServiceRequest {
  readonly serviceId: string;
  readonly requestingUserId: string;
}

export interface DeleteServiceResponse {
  readonly success: boolean;
  readonly serviceId: string;
  readonly message?: string;
}

export class DeleteServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: DeleteServiceRequest): Promise<DeleteServiceResponse> {
    try {
      this.logger.info('Attempting to delete service', {
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

      // 4. Vérification des permissions AVANT toute opération métier
      try {
        await this.permissionService.requirePermission(
          request.requestingUserId,
          'MANAGE_SERVICES',
          {
            businessId: existingService.businessId.getValue(),
            resourceId: request.serviceId,
          },
        );
      } catch (error) {
        this.logger.error(
          'Permission denied for service deletion',
          error instanceof Error ? error : new Error(String(error)),
          {
            requestingUserId: request.requestingUserId,
            serviceId: request.serviceId,
            businessId: existingService.businessId.getValue(),
            requiredPermission: 'MANAGE_SERVICES',
          },
        );

        if (error instanceof InsufficientPermissionsError) {
          throw error;
        }

        throw new InsufficientPermissionsError(
          request.requestingUserId,
          'MANAGE_SERVICES',
          request.serviceId,
        );
      }

      // 5. Validation des règles métier
      await this.validateBusinessRules(existingService, request.serviceId);

      // 6. Supprimer le service
      await this.serviceRepository.delete(serviceId);

      this.logger.info('Service deleted successfully', {
        serviceId: request.serviceId,
        requestingUserId: request.requestingUserId,
        serviceName: existingService.name,
      });

      // 7. Retourner la réponse
      return {
        success: true,
        serviceId: request.serviceId,
        message: 'Service deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        'Error deleting service',
        error instanceof Error ? error : new Error(String(error)),
        {
          serviceId: request.serviceId,
          requestingUserId: request.requestingUserId,
        },
      );
      throw error;
    }
  }

  /**
   * Valide les règles métier avant suppression
   */
  private async validateBusinessRules(
    service: Service,
    serviceId: string,
  ): Promise<void> {
    // Vérifier si le service peut être supprimé selon les règles métier
    if (!service.canBeDeleted()) {
      throw new ApplicationValidationError(
        'service',
        serviceId,
        'Cannot delete active service. Please deactivate it first.',
      );
    }

    // Autres règles métier peuvent être ajoutées ici
    // - Vérifier si le service fait partie d'un package
    // - Vérifier les rendez-vous existants
    // - Etc.
    //
    // NOTE: Les permissions sont maintenant vérifiées via IPermissionService
  }
}
