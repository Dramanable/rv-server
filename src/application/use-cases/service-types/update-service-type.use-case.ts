// 🎯 UpdateServiceTypeUseCase - Implémentation Clean Architecture
// Pattern TDD : GREEN phase - Implementation minimale qui fait passer les tests

import { ApplicationValidationError } from '@application/exceptions/application.exceptions';
import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { ServiceType } from '@domain/entities/service-type.entity';
import {
  ServiceTypeCodeConflictError,
  ServiceTypeNameConflictError,
  ServiceTypeNotFoundError,
} from '@domain/exceptions/service-type.exceptions';
import { IServiceTypeRepository } from '@domain/repositories/service-type.repository';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { ServiceTypeId } from '@domain/value-objects/service-type-id.value-object';

/**
 * 📝 Request interface for updating service type
 */
export interface UpdateServiceTypeRequest {
  readonly serviceTypeId: ServiceTypeId;
  readonly businessId: BusinessId;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly name?: string;
  readonly code?: string;
  readonly description?: string;
  readonly isActive?: boolean;
  readonly sortOrder?: number;
}

/**
 * 📊 Response interface for updating service type
 */
export interface UpdateServiceTypeResponse {
  readonly serviceType: ServiceType;
}

/**
 * 🎯 Use Case: Update Service Type
 *
 * Updates an existing service type with validation for uniqueness
 * Follows Clean Architecture principles and enterprise patterns
 */
export class UpdateServiceTypeUseCase {
  constructor(
    private readonly serviceTypeRepository: IServiceTypeRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: UpdateServiceTypeRequest,
  ): Promise<UpdateServiceTypeResponse> {
    // 🔍 Input validation
    this.validateRequest(request);

    this.logger.info('Updating service type', {
      serviceTypeId: request.serviceTypeId.getValue(),
      businessId: request.businessId.getValue(),
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
    });

    try {
      // 🔍 Find existing service type
      const existingServiceType = await this.serviceTypeRepository.findById(
        request.serviceTypeId,
      );
      if (!existingServiceType) {
        throw new ServiceTypeNotFoundError(
          this.i18n.translate('serviceType.notFound', {
            id: request.serviceTypeId.getValue(),
          }),
        );
      }

      // 🔍 Validate business rules - code uniqueness
      if (request.code && request.code !== existingServiceType.getCode()) {
        await this.validateCodeUniqueness(
          request.businessId,
          request.code,
          request.serviceTypeId,
        );
      }

      // 🔍 Validate business rules - name uniqueness
      if (request.name && request.name !== existingServiceType.getName()) {
        await this.validateNameUniqueness(
          request.businessId,
          request.name,
          request.serviceTypeId,
        );
      }

      // 🔄 Update service type
      existingServiceType.update({
        name: request.name,
        code: request.code,
        description: request.description,
        isActive: request.isActive,
        sortOrder: request.sortOrder,
        updatedBy: request.requestingUserId,
      });

      // 💾 Save updated service type
      const updatedServiceType =
        await this.serviceTypeRepository.save(existingServiceType);

      this.logger.info('Service type updated successfully', {
        serviceTypeId: request.serviceTypeId.getValue(),
        businessId: request.businessId.getValue(),
        correlationId: request.correlationId,
      });

      return {
        serviceType: updatedServiceType,
      };
    } catch (error) {
      this.logger.error(
        'Failed to update service type',
        error instanceof Error ? error : undefined,
        {
          serviceTypeId: request.serviceTypeId.getValue(),
          correlationId: request.correlationId,
          error: error instanceof Error ? error.message : String(error),
        },
      );

      // Re-throw the original error
      throw error;
    }
  }

  /**
   * ✅ Validate the request parameters
   */
  private validateRequest(request: UpdateServiceTypeRequest): void {
    if (
      !request.serviceTypeId ||
      typeof request.serviceTypeId.getValue !== 'function'
    ) {
      throw new ApplicationValidationError(
        'serviceTypeId',
        request.serviceTypeId,
        'required',
      );
    }

    if (
      !request.businessId ||
      typeof request.businessId.getValue !== 'function'
    ) {
      throw new ApplicationValidationError(
        'businessId',
        request.businessId,
        'required',
      );
    }

    if (
      !request.requestingUserId ||
      request.requestingUserId.trim().length === 0
    ) {
      throw new ApplicationValidationError(
        'requestingUserId',
        request.requestingUserId,
        'required',
      );
    }

    if (!request.correlationId || request.correlationId.trim().length === 0) {
      throw new ApplicationValidationError(
        'correlationId',
        request.correlationId,
        'required',
      );
    }

    // Check that at least one update field is provided
    const hasUpdateFields = !!(
      request.name !== undefined ||
      request.code !== undefined ||
      request.description !== undefined ||
      request.isActive !== undefined ||
      request.sortOrder !== undefined
    );

    if (!hasUpdateFields) {
      throw new ApplicationValidationError(
        'updateFields',
        'none provided',
        'at_least_one_required',
      );
    }
  }

  /**
   * 🔍 Validate code uniqueness within business
   */
  private async validateCodeUniqueness(
    businessId: BusinessId,
    code: string,
    excludeId: ServiceTypeId,
  ): Promise<void> {
    const existsWithCode =
      await this.serviceTypeRepository.existsByBusinessIdAndCode(
        businessId,
        code,
      );

    if (existsWithCode) {
      // Check if it's the same service type (which is allowed)
      const existingWithCode =
        await this.serviceTypeRepository.findByBusinessIdAndCode(
          businessId,
          code,
        );
      if (existingWithCode && !existingWithCode.getId().equals(excludeId)) {
        throw new ServiceTypeCodeConflictError(code, businessId.getValue());
      }
    }
  }

  /**
   * 🔍 Validate name uniqueness within business
   */
  private async validateNameUniqueness(
    businessId: BusinessId,
    name: string,
    excludeId: ServiceTypeId,
  ): Promise<void> {
    const existsWithName =
      await this.serviceTypeRepository.existsByBusinessIdAndName(
        businessId,
        name,
      );

    if (existsWithName) {
      // Check if it's the same service type (which is allowed)
      const existingWithName =
        await this.serviceTypeRepository.findByBusinessIdAndName(
          businessId,
          name,
        );
      if (existingWithName && !existingWithName.getId().equals(excludeId)) {
        throw new ServiceTypeNameConflictError(name, businessId.getValue());
      }
    }
  }
}
