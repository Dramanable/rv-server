import type { IAuditService } from '@application/ports/audit.port';
import type { I18nService } from '@application/ports/i18n.port';
import type { Logger } from '@application/ports/logger.port';
import { CalendarType } from '@domain/entities/calendar-type.entity';
import {
  CalendarTypeAlreadyExistsError,
  CalendarTypeNotFoundError,
  CalendarTypeValidationError,
} from '@domain/exceptions/calendar-type.exceptions';
import type { ICalendarTypeRepository } from '@domain/repositories/calendar-type.repository';
import { CalendarTypeId } from '@domain/value-objects/calendar-type-id.value-object';

import {
  UpdateCalendarTypeRequest,
  UpdateCalendarTypeResponse,
} from './calendar-type.types';

/**
 * Use Case pour mettre à jour un type de calendrier existant
 * ✅ TDD Clean Architecture
 * ✅ Logging et audit complets
 * ✅ Validation et gestion d'erreurs
 */
export class UpdateCalendarTypeUseCase {
  constructor(
    private readonly calendarTypeRepository: ICalendarTypeRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly auditService: IAuditService,
  ) {}

  async execute(
    request: UpdateCalendarTypeRequest,
  ): Promise<UpdateCalendarTypeResponse> {
    this.logger.info('Updating calendar type', {
      calendarTypeId: request.calendarTypeId,
      correlationId: request.correlationId ?? 'no-correlation-id',
    });

    try {
      // Validation des données
      await this.validateRequest(request);

      // Récupération du calendar type existant
      const calendarTypeId = CalendarTypeId.fromString(request.calendarTypeId);
      const existingCalendarType =
        await this.calendarTypeRepository.findById(calendarTypeId);

      if (!existingCalendarType) {
        throw new CalendarTypeNotFoundError(request.calendarTypeId);
      }

      // Validation de l'unicité si le nom change
      await this.validateUniqueness(request, existingCalendarType);

      // Capture de l'état avant modification pour audit
      const beforeState = {
        id: existingCalendarType.getId().getValue(),
        businessId: existingCalendarType.getBusinessId().getValue(),
        name: existingCalendarType.getName(),
        code: existingCalendarType.getCode(),
        description: existingCalendarType.getDescription(),
        icon: existingCalendarType.getIcon(),
        color: existingCalendarType.getColor(),
        sortOrder: existingCalendarType.getSortOrder(),
        isActive: existingCalendarType.isActive(),
      };

      // Mise à jour des propriétés
      existingCalendarType.update({
        name: request.name,
        description: request.description,
        icon: request.icon,
        color: request.color,
        sortOrder: request.sortOrder,
        isActive: request.isActive,
        updatedBy: request.requestingUserId,
      });

      // Sauvegarde
      const updatedCalendarType =
        await this.calendarTypeRepository.save(existingCalendarType);

      // Capture de l'état après modification pour audit
      const afterState = {
        id: updatedCalendarType.getId().getValue(),
        businessId: updatedCalendarType.getBusinessId().getValue(),
        name: updatedCalendarType.getName(),
        code: updatedCalendarType.getCode(),
        description: updatedCalendarType.getDescription(),
        icon: updatedCalendarType.getIcon(),
        color: updatedCalendarType.getColor(),
        sortOrder: updatedCalendarType.getSortOrder(),
        isActive: updatedCalendarType.isActive(),
      };

      // Audit trail
      await this.auditService.logOperation({
        operation: 'UPDATE_CALENDAR_TYPE',
        entityType: 'CALENDAR_TYPE',
        entityId: updatedCalendarType.getId().getValue(),
        businessId: updatedCalendarType.getBusinessId().getValue(),
        userId: request.requestingUserId,
        correlationId: request.correlationId ?? 'no-correlation-id',
        changes: {
          updated: {
            before: beforeState,
            after: afterState,
          },
        },
        timestamp: new Date(),
      });

      this.logger.info('Calendar type updated successfully', {
        calendarTypeId: request.calendarTypeId,
        calendarTypeName: updatedCalendarType.getName(),
        correlationId: request.correlationId ?? 'no-correlation-id',
      });

      return {
        calendarType: updatedCalendarType,
        success: true,
        message: this.i18n.translate('calendarTypes.updated.success'),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      this.logger.error(
        'Failed to update calendar type',
        error instanceof Error ? error : new Error(errorMessage),
        {
          calendarTypeId: request.calendarTypeId,
          correlationId: request.correlationId ?? 'no-correlation-id',
        },
      );

      throw error;
    }
  }

  private async validateRequest(
    request: UpdateCalendarTypeRequest,
  ): Promise<void> {
    const errors: string[] = [];

    // Validation calendarTypeId (obligatoire)
    if (!request.calendarTypeId?.trim()) {
      errors.push(this.i18n.translate('calendarTypes.validation.idRequired'));
    } else {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(request.calendarTypeId)) {
        errors.push(this.i18n.translate('calendarTypes.validation.idInvalid'));
      }
    }

    // Validation requestingUserId
    if (!request.requestingUserId?.trim()) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.requestingUserRequired'),
      );
    } else {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(request.requestingUserId)) {
        errors.push(
          this.i18n.translate('calendarTypes.validation.requestingUserInvalid'),
        );
      }
    }

    // Validation correlationId
    if (!request.correlationId?.trim()) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.correlationIdRequired'),
      );
    }

    // Validation des champs optionnels si fournis
    if (request.name !== undefined) {
      if (
        !request.name.trim() ||
        request.name.trim().length < 2 ||
        request.name.trim().length > 100
      ) {
        errors.push(this.i18n.translate('calendarTypes.validation.nameLength'));
      }
    }

    if (request.description !== undefined && request.description.length > 500) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.descriptionLength'),
      );
    }

    if (request.icon !== undefined) {
      if (request.icon.trim().length < 1 || request.icon.trim().length > 50) {
        errors.push(this.i18n.translate('calendarTypes.validation.iconLength'));
      }
    }

    if (request.sortOrder !== undefined && request.sortOrder < 1) {
      errors.push(
        this.i18n.translate('calendarTypes.validation.sortOrderMinimum'),
      );
    }

    if (errors.length > 0) {
      throw new CalendarTypeValidationError(
        this.i18n.translate('calendarTypes.validation.failed'),
        { errors },
      );
    }
  }

  private async validateUniqueness(
    request: UpdateCalendarTypeRequest,
    existingCalendarType: CalendarType,
  ): Promise<void> {
    const businessId = existingCalendarType.getBusinessId(); // Déjà un BusinessId

    // Vérifier l'unicité du nom si modifié
    if (
      request.name &&
      request.name.trim() !== existingCalendarType.getName()
    ) {
      const existsByName =
        await this.calendarTypeRepository.existsByBusinessIdAndName(
          businessId,
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
}
