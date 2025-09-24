import type { Logger } from '@application/ports/logger.port';
import type { I18nService } from '@application/ports/i18n.port';
import type { ICalendarTypeRepository } from '@domain/repositories/calendar-type.repository';
import { CalendarType } from '@domain/entities/calendar-type.entity';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { CalendarTypeValidationError } from '@domain/exceptions/calendar-type.exceptions';

import {
  ListCalendarTypesRequest,
  ListCalendarTypesResponse,
} from './calendar-type.types';

/**
 * Use Case pour lister les types de calendrier avec filtres avancés
 * ✅ TDD Clean Architecture
 * ✅ Logging et audit complets
 * ✅ Pagination et tri
 */
export class ListCalendarTypesUseCase {
  constructor(
    private readonly calendarTypeRepository: ICalendarTypeRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: ListCalendarTypesRequest,
  ): Promise<ListCalendarTypesResponse> {
    this.logger.info('Listing calendar types', {
      businessId: request.businessId,
      isActive: request.isActive,
      search: request.search,
      page: request.page,
      limit: request.limit,
      correlationId: request.correlationId ?? 'no-correlation-id',
    });

    try {
      // Validation des paramètres
      await this.validateRequest(request);

      // Paramètres par défaut
      const page = Math.max(1, request.page || 1);
      const limit = Math.min(100, Math.max(1, request.limit || 10));

      // Construire BusinessId si fourni
      const businessId = request.businessId
        ? BusinessId.fromString(request.businessId)
        : undefined;

      // Construire les critères de recherche
      const criteria = {
        businessId: businessId?.getValue(),
        isActive: request.isActive,
        search: request.search,
        page,
        limit,
        sortBy: request.sortBy ?? 'sortOrder',
        sortOrder: request.sortOrder ?? 'asc',
      };

      // Rechercher les types de calendrier avec pagination
      const searchResult = await this.calendarTypeRepository.search(criteria);

      this.logger.info('Calendar types listed successfully', {
        businessId: request.businessId,
        found: searchResult.data.length,
        total: searchResult.total,
        correlationId: request.correlationId ?? 'no-correlation-id',
      });

      return {
        data: searchResult.data,
        meta: {
          currentPage: searchResult.page,
          totalPages: searchResult.totalPages,
          totalItems: searchResult.total,
          itemsPerPage: searchResult.limit,
          hasNextPage: searchResult.page < searchResult.totalPages,
          hasPrevPage: searchResult.page > 1,
        },
      };
    } catch (error) {
      this.logger.error('Failed to list calendar types', error as Error, {
        businessId: request.businessId,
        correlationId: request.correlationId ?? 'no-correlation-id',
      });
      throw error;
    }
  }

  private async validateRequest(
    request: ListCalendarTypesRequest,
  ): Promise<void> {
    const errors: string[] = [];

    // Validation businessId si fourni
    if (request.businessId) {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(request.businessId)) {
        errors.push(
          this.i18n.translate('calendarTypes.validation.businessIdInvalid'),
        );
      }
    }

    // Validation requestingUserId
    if (!request.requestingUserId?.trim()) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.requestingUserRequired'),
      );
    }

    // Validation correlationId
    if (!request.correlationId?.trim()) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.correlationIdRequired'),
      );
    }

    // Validation pagination
    if (request.page !== undefined && request.page < 1) {
      errors.push(this.i18n.translate('calendarTypes.validation.pageMinimum'));
    }

    if (
      request.limit !== undefined &&
      (request.limit < 1 || request.limit > 100)
    ) {
      errors.push(this.i18n.translate('calendarTypes.validation.limitRange'));
    }

    // Validation sortBy
    const validSortFields = [
      'name',
      'code',
      'sortOrder',
      'createdAt',
      'updatedAt',
    ];
    if (request.sortBy && !validSortFields.includes(request.sortBy)) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.sortByInvalid'),
      );
    }

    // Validation sortOrder
    if (request.sortOrder && !['asc', 'desc'].includes(request.sortOrder)) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.sortOrderInvalid'),
      );
    }

    if (errors.length > 0) {
      throw new CalendarTypeValidationError(
        this.i18n.translate('calendarTypes.validation.failed'),
        { errors },
      );
    }
  }
}
