// 🎯 ListServiceTypesUseCase - Implémentation Clean Architecture
// Pattern TDD : GREEN phase - Implementation minimale qui fait passer les tests

import { ApplicationValidationError } from "@application/exceptions/application.exceptions";
import { I18nService } from "@application/ports/i18n.port";
import { Logger } from "@application/ports/logger.port";
import { ServiceType } from "@domain/entities/service-type.entity";
import { IServiceTypeRepository } from "@domain/repositories/service-type.repository";
import { BusinessId } from "@domain/value-objects/business-id.value-object";

/**
 * 📋 Request interface for listing service types
 */
export interface ListServiceTypesRequest {
  readonly businessId: BusinessId;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly filters?: {
    readonly isActive?: boolean;
    readonly search?: string;
    readonly codes?: string[];
  };
  readonly pagination?: {
    readonly page?: number;
    readonly limit?: number;
  };
  readonly sorting?: {
    readonly sortBy?: "name" | "code" | "createdAt" | "sortOrder";
    readonly sortOrder?: "asc" | "desc";
  };
}

/**
 * 📊 Response interface for listing service types
 */
export interface ListServiceTypesResponse {
  readonly serviceTypes: ServiceType[];
  readonly totalCount: number;
  readonly page?: number;
  readonly limit?: number;
  readonly totalPages?: number;
}

/**
 * 🎯 Use Case: List Service Types
 *
 * Lists all service types for a business with optional filtering
 * Follows Clean Architecture principles and enterprise patterns
 */
export class ListServiceTypesUseCase {
  constructor(
    private readonly serviceTypeRepository: IServiceTypeRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: ListServiceTypesRequest,
  ): Promise<ListServiceTypesResponse> {
    // 🔍 Input validation
    this.validateRequest(request);

    this.logger.info("Listing service types for business", {
      businessId: request.businessId.getValue(),
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
    });

    try {
      // 📊 Retrieve service types from repository
      let serviceTypes = await this.serviceTypeRepository.findByBusinessId(
        request.businessId,
      );

      // Handle null/undefined responses gracefully
      if (!serviceTypes) {
        serviceTypes = [];
      }

      // 🔍 Apply filters if specified
      if (request.filters?.isActive !== undefined) {
        serviceTypes = serviceTypes.filter(
          (st) => st.isActive() === request.filters!.isActive,
        );
      }

      // 📊 Prepare response
      const response: ListServiceTypesResponse = {
        serviceTypes,
        totalCount: serviceTypes.length,
      };

      this.logger.info("Service types listed successfully", {
        businessId: request.businessId.getValue(),
        count: serviceTypes.length,
        correlationId: request.correlationId,
      });

      return response;
    } catch (error) {
      this.logger.error(
        "Failed to list service types",
        error instanceof Error ? error : undefined,
        {
          businessId: request.businessId.getValue(),
          error: error instanceof Error ? error.message : String(error),
          correlationId: request.correlationId,
        },
      );

      // Re-throw the original error
      throw error;
    }
  }

  /**
   * ✅ Validate the request parameters
   */
  private validateRequest(request: ListServiceTypesRequest): void {
    if (
      !request.businessId ||
      typeof request.businessId.getValue !== "function"
    ) {
      throw new ApplicationValidationError(
        "businessId",
        request.businessId,
        "required",
      );
    }

    if (
      !request.requestingUserId ||
      request.requestingUserId.trim().length === 0
    ) {
      throw new ApplicationValidationError(
        "requestingUserId",
        request.requestingUserId,
        "required",
      );
    }

    if (!request.correlationId || request.correlationId.trim().length === 0) {
      throw new ApplicationValidationError(
        "correlationId",
        request.correlationId,
        "required",
      );
    }
  }
}
