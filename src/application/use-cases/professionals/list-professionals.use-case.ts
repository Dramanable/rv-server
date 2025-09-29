import { IAuditService } from '@application/ports/audit.port';
import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { ApplicationValidationError } from '@application/exceptions/application.exceptions';
import { ProfessionalValidationError } from '@domain/exceptions/professional.exceptions';
import { IProfessionalRepository } from '@domain/repositories/professional.repository';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import {
  ListProfessionalsRequest,
  ListProfessionalsResponse,
} from './list-professionals.types';

export class ListProfessionalsUseCase {
  constructor(
    private readonly professionalRepository: IProfessionalRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly auditService: IAuditService,
  ) {}

  /**
   * ✅ STRICT VALIDATION according to Copilot instructions
   */
  private validateRequest(request: ListProfessionalsRequest): void {
    if (!request.businessId) {
      throw new ProfessionalValidationError(
        this.i18n.translate('professional.validation.businessIdRequired'),
        { businessId: request.businessId },
      );
    }

    if (!request.requestingUserId) {
      throw new ProfessionalValidationError(
        this.i18n.translate('professional.validation.contextRequired'),
        { requestingUserId: request.requestingUserId },
      );
    }

    if (request.pagination.page < 1) {
      throw new ProfessionalValidationError(
        this.i18n.translate('professional.validation.pageInvalid'),
        { page: request.pagination.page },
      );
    }

    if (request.pagination.limit < 1 || request.pagination.limit > 100) {
      throw new ProfessionalValidationError(
        this.i18n.translate('professional.validation.limitInvalid'),
        { limit: request.pagination.limit },
      );
    }
  }

  async execute(
    request: ListProfessionalsRequest,
  ): Promise<ListProfessionalsResponse> {
    this.logger.info('Listing professionals', {
      businessId: request.businessId,
      correlationId: request.correlationId,
      requestingUserId: request.requestingUserId,
      filters: request.filters,
      pagination: request.pagination,
    });

    try {
      // Validate required context fields
      if (!request.businessId || !request.businessId.trim()) {
        throw new ProfessionalValidationError(
          this.i18n.translate('professional.validation.businessIdRequired'),
          { businessId: request.businessId },
        );
      }

      if (!request.requestingUserId || !request.requestingUserId.trim()) {
        throw new ProfessionalValidationError(
          this.i18n.translate('professional.validation.context'),
          { requestingUserId: request.requestingUserId },
        );
      }

      // Validate pagination parameters
      if (
        request.pagination?.page !== undefined &&
        request.pagination.page < 1
      ) {
        throw new ProfessionalValidationError(
          this.i18n.translate('professional.validation.page'),
          { page: request.pagination.page },
        );
      }

      if (
        request.pagination?.limit !== undefined &&
        (request.pagination.limit < 1 || request.pagination.limit > 100)
      ) {
        throw new ProfessionalValidationError(
          this.i18n.translate('professional.validation.limit'),
          { limit: request.pagination.limit },
        );
      }

      // Parse business ID for validation
      let businessId: BusinessId;
      try {
        businessId = BusinessId.fromString(request.businessId);
      } catch (error) {
        throw new ProfessionalValidationError(
          this.i18n.translate('professional.validation.businessIdRequired'),
          { businessId: request.businessId },
        );
      }

      // Get professionals from repository
      const { professionals, total } =
        await this.professionalRepository.findByBusinessId(request.businessId, {
          pagination: {
            page: request.pagination?.page ?? 1,
            limit: request.pagination?.limit ?? 10,
          },
          sorting: {
            sortBy: request.sorting?.sortBy ?? 'createdAt',
            sortOrder: request.sorting?.sortOrder ?? 'desc',
          },
          search: request.filters?.search,
          filters: {
            isActive: request.filters?.isActive,
            specialization: request.filters?.specialization,
          },
        });

      const safeCount = professionals?.length ?? 0;
      const totalPages = Math.ceil(total / (request.pagination?.limit ?? 10));
      const currentPage = request.pagination?.page ?? 1;

      this.logger.info('Successfully listed professionals', {
        businessId: request.businessId,
        correlationId: request.correlationId,
        count: safeCount,
      });

      // Log operation for audit
      await this.auditService.logOperation({
        operation: 'LIST_PROFESSIONALS',
        entityType: 'PROFESSIONAL',
        entityId: businessId.getValue(),
        userId: request.requestingUserId,
        correlationId: request.correlationId,
        changes: {
          created: {
            count: safeCount,
            totalItems: total,
            filters: request.filters,
            pagination: request.pagination,
          },
        },
        timestamp: new Date(),
      });

      // Return response with proper pagination metadata
      return {
        data: professionals || [],
        meta: {
          currentPage,
          totalPages,
          totalItems: total,
          itemsPerPage: request.pagination?.limit ?? 10,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        'Failed to list professionals',
        error instanceof Error ? error : new Error(errorMessage),
        {
          correlationId: request.correlationId,
          businessId: request.businessId,
        },
      );

      // Re-throw known errors
      if (error instanceof ProfessionalValidationError) {
        throw error;
      }

      // For other errors, throw a generic error message
      throw new ApplicationValidationError(
        'unknown',
        'unexpected_error',
        error instanceof Error ? error.message : 'Unknown error occurred',
      );
    }
  }
}
