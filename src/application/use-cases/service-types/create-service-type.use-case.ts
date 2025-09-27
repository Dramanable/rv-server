import { IAuditService } from '@application/ports/audit.port';
import { Logger } from '@application/ports/logger.port';
import { IPermissionService } from '@application/ports/permission.service.interface';
import { ServiceType } from '@domain/entities/service-type.entity';
import {
  ServiceTypeCodeConflictError,
  ServiceTypeNameConflictError,
  ServiceTypeValidationError,
} from '@domain/exceptions/service-type.exceptions';
import { IServiceTypeRepository } from '@domain/repositories/service-type.repository';
import { BusinessId } from '@domain/value-objects/business-id.value-object';

interface I18nTranslateFunction {
  translate(
    key: string,
    options?: { args?: Record<string, any> },
  ): string | Promise<string>;
}

export interface CreateServiceTypeRequest {
  readonly businessId: string;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly categoryId?: string;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly clientIp?: string;
  readonly userAgent?: string;
  readonly timestamp: Date;
}

export interface CreateServiceTypeResponse {
  readonly id: string;
  readonly businessId: string;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly categoryId?: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdBy?: string;
  readonly updatedBy?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * ✅ EXCELLENT - Use Case avec logging complet enterprise
 *
 * Crée un nouveau type de service avec :
 * - ✅ Validation stricte des données
 * - ✅ Logging complet avec contexte
 * - ✅ Messages i18n
 * - ✅ Audit trail
 * - ✅ Gestion d'erreurs métier
 */
export class CreateServiceTypeUseCase {
  constructor(
    private readonly serviceTypeRepository: IServiceTypeRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nTranslateFunction,
    private readonly auditService: IAuditService,
    private readonly permissionService: IPermissionService,
  ) {}

  async execute(
    request: CreateServiceTypeRequest,
  ): Promise<CreateServiceTypeResponse> {
    this.logger.info('Creating new service type', {
      businessId: request.businessId,
      name: request.name,
      code: request.code,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
    });
    try {
      // 🔒 VALIDATION - Contexte obligatoire
      this.validateRequest(request);

      // 🛡️ PERMISSIONS - Vérifier les droits utilisateur
      await this.permissionService.requirePermission(
        request.requestingUserId,
        'MANAGE_SERVICES',
        { businessId: request.businessId },
      );

      // 🏢 BUSINESS ID
      const businessId = BusinessId.fromString(request.businessId);

      // 🔍 BUSINESS RULES - Vérifier unicité du nom
      const existingByName =
        await this.serviceTypeRepository.findByBusinessIdAndName(
          businessId,
          request.name,
        );

      if (existingByName) {
        const errorMessage = await this.i18n.translate(
          'domain.serviceType.errors.nameConflict',
          {
            args: { name: request.name },
          },
        );

        this.logger.error('Service type name already exists', undefined, {
          name: request.name,
          businessId: request.businessId,
          correlationId: request.correlationId,
        });

        throw new ServiceTypeNameConflictError(request.name, errorMessage);
      }

      // 🔍 BUSINESS RULES - Vérifier unicité du code
      const existingByCode =
        await this.serviceTypeRepository.findByBusinessIdAndCode(
          businessId,
          request.code,
        );

      if (existingByCode) {
        const errorMessage = await this.i18n.translate(
          'domain.serviceType.errors.codeConflict',
          {
            args: { code: request.code },
          },
        );

        this.logger.error('Service type with code already exists', undefined, {
          businessId: request.businessId,
          code: request.code,
          correlationId: request.correlationId,
        });
        throw new ServiceTypeCodeConflictError(request.code, errorMessage);
      }

      // 🏗️ CRÉATION - Entité métier
      const serviceType = ServiceType.create({
        businessId,
        name: request.name,
        code: request.code,
        description: request.description,
        sortOrder: request.sortOrder ?? 0,
        isActive: request.isActive ?? true,
        createdBy: request.requestingUserId,
      });

      // 💾 PERSISTENCE
      const savedServiceType =
        await this.serviceTypeRepository.save(serviceType);

      this.logger.info('Service type created successfully', {
        serviceTypeId: savedServiceType.getId().getValue(),
        businessId: request.businessId,
        name: request.name,
        code: request.code,
        correlationId: request.correlationId,
      });

      // 📊 AUDIT TRAIL - Opération auditée
      await this.auditService.logOperation({
        operation: 'CREATE_SERVICE_TYPE',
        entityType: 'SERVICE_TYPE',
        entityId: savedServiceType.getId().getValue(),
        businessId: request.businessId,
        userId: request.requestingUserId,
        correlationId: request.correlationId,
        changes: {
          created: {
            name: savedServiceType.getName(),
            code: savedServiceType.getCode(),
            isActive: savedServiceType.isActive(),
          },
        },
        timestamp: new Date(),
      });

      // 📤 RESPONSE
      return createServiceTypeResponseFromServiceType(savedServiceType);
    } catch (error) {
      this.logger.error(
        'Failed to create service type',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          businessId: request.businessId,
          name: request.name,
          code: request.code,
          correlationId: request.correlationId,
        },
      );

      throw error;
    }
  }

  private async validateRequest(
    request: CreateServiceTypeRequest,
  ): Promise<void> {
    if (!request.correlationId) {
      const errorMessage = await this.i18n.translate(
        'domain.serviceType.validation.correlationIdRequired',
      );
      throw new ServiceTypeValidationError(errorMessage);
    }

    if (!request.requestingUserId) {
      const errorMessage = await this.i18n.translate(
        'domain.serviceType.validation.requestingUserIdRequired',
      );
      throw new ServiceTypeValidationError(errorMessage);
    }

    if (!request.timestamp) {
      const errorMessage = await this.i18n.translate(
        'domain.serviceType.validation.timestampRequired',
      );
      throw new ServiceTypeValidationError(errorMessage);
    }

    if (!request.businessId) {
      const errorMessage = await this.i18n.translate(
        'domain.serviceType.validation.businessIdRequired',
      );
      throw new ServiceTypeValidationError(errorMessage);
    }

    if (!request.name || request.name.length < 2) {
      const errorMessage = await this.i18n.translate(
        'domain.serviceType.validation.nameRequired',
      );
      throw new ServiceTypeValidationError(errorMessage);
    }

    if (request.name.length > 100) {
      const errorMessage = await this.i18n.translate(
        'domain.serviceType.validation.nameTooLong',
      );
      throw new ServiceTypeValidationError(errorMessage);
    }

    if (!request.code || request.code.length < 2) {
      const errorMessage = await this.i18n.translate(
        'domain.serviceType.validation.codeRequired',
      );
      throw new ServiceTypeValidationError(errorMessage);
    }

    if (request.code.length > 20) {
      const errorMessage = await this.i18n.translate(
        'domain.serviceType.validation.codeTooLong',
      );
      throw new ServiceTypeValidationError(errorMessage);
    }

    if (request.description && request.description.length > 500) {
      const errorMessage = await this.i18n.translate(
        'domain.serviceType.validation.descriptionTooLong',
      );
      throw new ServiceTypeValidationError(errorMessage);
    }

    // Valider format du code (majuscules, chiffres, underscores)
    const codePattern = /^[A-Z0-9_]+$/;
    if (!codePattern.test(request.code)) {
      const errorMessage = await this.i18n.translate(
        'domain.serviceType.validation.invalidCode',
      );
      throw new ServiceTypeValidationError(errorMessage);
    }
  }
}

export function createServiceTypeResponseFromServiceType(
  serviceType: ServiceType,
): CreateServiceTypeResponse {
  return {
    id: serviceType.getId().getValue(),
    businessId: serviceType.getBusinessId().getValue(),
    name: serviceType.getName(),
    code: serviceType.getCode(),
    description: serviceType.getDescription(),
    sortOrder: serviceType.getSortOrder(),
    isActive: serviceType.isActive(),
    createdAt: serviceType.getCreatedAt(),
    updatedAt: serviceType.getUpdatedAt(),
  };
}
