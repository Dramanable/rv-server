/**
 * 🎯 GetServiceTypeByIdUseCase - Récupération d'un type de service par ID
 *
 * ✅ Use Case Application Layer - Clean Architecture
 * ⚠️ RESPECTE les interfaces Domain/Application
 * 🔄 Logging, audit et traçabilité OBLIGATOIRES
 * 🌐 Messages d'erreur internationalisés
 */

import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { ServiceTypeNotFoundError } from '@domain/exceptions/service-type.exceptions';
import { IServiceTypeRepository } from '@domain/repositories/service-type.repository';
import { ServiceTypeId } from '@domain/value-objects/service-type-id.value-object';

// ✅ Request/Response Interfaces - Types stricts
export interface GetServiceTypeByIdRequest {
  readonly serviceTypeId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

export interface GetServiceTypeByIdResponse {
  readonly id: string;
  readonly businessId: string;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly isActive: boolean;
  readonly sortOrder: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class GetServiceTypeByIdUseCase {
  constructor(
    private readonly serviceTypeRepository: IServiceTypeRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: GetServiceTypeByIdRequest,
  ): Promise<GetServiceTypeByIdResponse> {
    // ✅ OBLIGATOIRE - Logging début d'opération avec contexte complet
    this.logger.info('Retrieving service type by ID', {
      serviceTypeId: request.serviceTypeId,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
      timestamp: request.timestamp.toISOString(),
    });

    try {
      // ✅ VALIDATION - Conversion en Value Object avec validation UUID
      const serviceTypeId = ServiceTypeId.fromString(request.serviceTypeId);

      // ✅ REPOSITORY CALL - Récupération depuis la persistence
      const serviceType =
        await this.serviceTypeRepository.findById(serviceTypeId);

      // ✅ BUSINESS RULE - Vérification existence
      if (!serviceType) {
        this.logger.error('Service type not found', undefined, {
          serviceTypeId: request.serviceTypeId,
          correlationId: request.correlationId,
          timestamp: request.timestamp.toISOString(),
        });

        throw new ServiceTypeNotFoundError(request.serviceTypeId, {
          correlationId: request.correlationId,
          requestingUserId: request.requestingUserId,
        });
      }

      // ✅ SUCCESS LOGGING - Avec détails de l'entité trouvée
      this.logger.info('Service type retrieved successfully', {
        serviceTypeId: serviceType.getId().getValue(),
        serviceTypeName: serviceType.getName(),
        correlationId: request.correlationId,
        timestamp: new Date().toISOString(),
      });

      // ✅ RESPONSE MAPPING - Conversion Domain → Response
      return {
        id: serviceType.getId().getValue(),
        businessId: serviceType.getBusinessId().getValue(),
        name: serviceType.getName(),
        code: serviceType.getCode(),
        description: serviceType.getDescription(),
        isActive: serviceType.isActive(), // ✅ CORRECT - Utilise isActive() pas getIsActive()
        sortOrder: serviceType.getSortOrder(),
        createdAt: serviceType.getCreatedAt(),
        updatedAt: serviceType.getUpdatedAt(),
      };
    } catch (error) {
      // ✅ ERROR HANDLING - Logging détaillé des erreurs
      if (error instanceof ServiceTypeNotFoundError) {
        // Re-throw les erreurs métier sans les wrapper
        throw error;
      }

      // ✅ ERROR LOGGING - Erreurs techniques/repository
      this.logger.error(
        'Failed to retrieve service type',
        error instanceof Error ? error : undefined,
        {
          serviceTypeId: request.serviceTypeId,
          correlationId: request.correlationId,
          stack: error instanceof Error ? error.stack : undefined,
        },
      );

      // Re-throw pour laisser le caller gérer
      throw error;
    }
  }
}
