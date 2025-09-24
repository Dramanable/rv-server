import type { Logger } from '@application/ports/logger.port';
import type { I18nService } from '@application/ports/i18n.port';
import type { IAuditService } from '@application/ports/audit.port';
import type { ICalendarTypeRepository } from '@domain/repositories/calendar-type.repository';
import { CalendarType } from '@domain/entities/calendar-type.entity';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import {
  CalendarTypeValidationError,
  CalendarTypeAlreadyExistsError,
} from '@domain/exceptions/calendar-type.exceptions';
import { ApplicationValidationError } from '@application/exceptions/application.exceptions';

import type {
  CreateCalendarTypeRequest,
  CreateCalendarTypeResponse,
} from './calendar-type.types';

/**
 * Use Case pour créer un nouveau type de calendrier
 * Suit les principes TDD et Clean Architecture avec logging complet
 */
export class CreateCalendarTypeUseCase {
  constructor(
    private readonly calendarTypeRepository: ICalendarTypeRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly auditService: IAuditService,
  ) {}

  async execute(
    request: CreateCalendarTypeRequest,
  ): Promise<CreateCalendarTypeResponse> {
    this.logger.info('Creating calendar type', {
      businessId: request.businessId,
      name: request.name,
      code: request.code,
      correlationId: request.correlationId,
    });

    try {
      // 1. Validation de base ET unicité en une seule étape
      await this.validateRequest(request);

      // 4. Création de l'entité métier
      const calendarType = CalendarType.create({
        businessId: BusinessId.fromString(request.businessId),
        name: request.name,
        code: request.code,
        description: request.description || '',
        icon: request.icon || 'calendar',
        color: request.color || '#000000',
        sortOrder: request.sortOrder,
        isActive: request.isActive,
        createdBy: request.requestingUserId,
      });

      // 4. Persistance
      const savedCalendarType =
        await this.calendarTypeRepository.save(calendarType);

      // 5. Audit trail
      await this.auditService.logOperation({
        operation: 'CREATE_CALENDAR_TYPE',
        entityType: 'CALENDAR_TYPE',
        entityId: savedCalendarType.getId().getValue(),
        businessId: request.businessId,
        userId: request.requestingUserId,
        correlationId: request.correlationId || 'no-correlation-id',
        changes: {
          created: {
            id: savedCalendarType.getId().getValue(),
            businessId: savedCalendarType.getBusinessId().getValue(),
            name: savedCalendarType.getName(),
            code: savedCalendarType.getCode(),
            description: savedCalendarType.getDescription(),
            color: savedCalendarType.getColor(),
            sortOrder: savedCalendarType.getSortOrder(),
            isActive: savedCalendarType.isActive(),
          },
        },
        timestamp: request.timestamp,
      });

      this.logger.info('Calendar type created successfully', {
        calendarTypeId: savedCalendarType.getId().getValue(),
        businessId: request.businessId,
        calendarTypeName: savedCalendarType.getName(),
        correlationId: request.correlationId,
      });

      return {
        calendarType: savedCalendarType,
        success: true,
        message: this.i18n.translate('calendarTypes.created.success'),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      this.logger.error(
        'Failed to create calendar type',
        error instanceof Error ? error : new Error(errorMessage),
        {
          businessId: request.businessId,
          calendarTypeName: request.name,
          correlationId: request.correlationId,
        },
      );

      // Re-lancer l'erreur pour qu'elle soit gérée par la couche présentation
      throw error;
    }
  }

  private async validateRequest(
    request: CreateCalendarTypeRequest,
  ): Promise<void> {
    const errors: string[] = [];

    if (!request.businessId?.trim()) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.businessIdRequired'),
      );
    }

    if (!request.name?.trim()) {
      errors.push(this.i18n.translate('calendarTypes.validation.nameRequired'));
    }

    if (!request.code?.trim()) {
      errors.push(this.i18n.translate('calendarTypes.validation.codeRequired'));
    }

    if (!request.description?.trim()) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.descriptionRequired'),
      );
    }

    if (!request.color?.trim()) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.colorRequired'),
      );
    }

    if (!request.requestingUserId?.trim()) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.requestingUserRequired'),
      );
    }

    if (!request.correlationId?.trim()) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.correlationIdRequired'),
      );
    }

    // Validation du format UUID pour businessId
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (request.businessId && !uuidRegex.test(request.businessId)) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.businessIdInvalid'),
      );
    }

    if (request.requestingUserId && !uuidRegex.test(request.requestingUserId)) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.requestingUserInvalid'),
      );
    }

    // Validation des longueurs
    if (
      request.name &&
      (request.name.trim().length < 2 || request.name.trim().length > 100)
    ) {
      errors.push(this.i18n.translate('calendarTypes.validation.nameLength'));
    }

    if (
      request.code &&
      (request.code.trim().length < 2 || request.code.trim().length > 20)
    ) {
      errors.push(this.i18n.translate('calendarTypes.validation.codeLength'));
    }

    if (request.description && request.description.length > 500) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.descriptionLength'),
      );
    }

    if (
      request.icon &&
      (request.icon.trim().length < 1 || request.icon.trim().length > 50)
    ) {
      errors.push(this.i18n.translate('calendarTypes.validation.iconLength'));
    }

    if (request.sortOrder !== undefined && request.sortOrder < 1) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.sortOrderMinimum'),
      );
    }

    // Si des erreurs de validation de base existent, les lancer maintenant
    if (errors.length > 0) {
      throw new CalendarTypeValidationError(
        this.i18n.translate('calendarTypes.validation.failed'),
        { errors },
      );
    }

    // Validation de l'unicité du code (uniquement si les données de base sont valides)
    const existsByCode =
      await this.calendarTypeRepository.existsByBusinessIdAndCode(
        request.businessId,
        request.code.trim().toUpperCase(),
      );

    if (existsByCode) {
      throw new CalendarTypeAlreadyExistsError(
        request.code,
        this.i18n.translate('calendarTypes.validation.codeAlreadyExists', {
          code: request.code,
        }),
      );
    }

    // Validation de l'unicité du nom (uniquement si les données de base sont valides)
    const existsByName =
      await this.calendarTypeRepository.existsByBusinessIdAndName(
        request.businessId,
        request.name.trim(),
      );

    if (existsByName) {
      throw new CalendarTypeAlreadyExistsError(
        request.name,
        this.i18n.translate('calendarTypes.validation.nameAlreadyExists', {
          name: request.name,
        }),
      );
    }
  }
}
