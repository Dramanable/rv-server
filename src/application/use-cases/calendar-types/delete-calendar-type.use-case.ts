import type { IAuditService } from "@application/ports/audit.port";
import type { I18nService } from "@application/ports/i18n.port";
import type { Logger } from "@application/ports/logger.port";
import { CalendarType } from "@domain/entities/calendar-type.entity";
import {
  CalendarTypeBuiltInModificationError,
  CalendarTypeNotFoundError,
  CalendarTypeValidationError,
} from "@domain/exceptions/calendar-type.exceptions";
import type { ICalendarTypeRepository } from "@domain/repositories/calendar-type.repository";
import { CalendarTypeId } from "@domain/value-objects/calendar-type-id.value-object";

import {
  DeleteCalendarTypeRequest,
  DeleteCalendarTypeResponse,
} from "./calendar-type.types";

/**
 * Use Case pour supprimer un type de calendrier existant
 * ✅ TDD Clean Architecture
 * ✅ Logging et audit complets
 * ✅ Validation et contraintes métier
 */
export class DeleteCalendarTypeUseCase {
  constructor(
    private readonly calendarTypeRepository: ICalendarTypeRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly auditService: IAuditService,
  ) {}

  async execute(
    request: DeleteCalendarTypeRequest,
  ): Promise<DeleteCalendarTypeResponse> {
    this.logger.info("Deleting calendar type", {
      calendarTypeId: request.calendarTypeId,
      correlationId: request.correlationId ?? "no-correlation-id",
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

      // Validation des règles métier pour la suppression
      await this.validateDeletion(existingCalendarType);

      // Capture des données pour audit avant suppression
      const deletedData = {
        id: existingCalendarType.getId().getValue(),
        businessId: existingCalendarType.getBusinessId().getValue(),
        name: existingCalendarType.getName(),
        code: existingCalendarType.getCode(),
        description: existingCalendarType.getDescription(),
        icon: existingCalendarType.getIcon(),
        color: existingCalendarType.getColor(),
        sortOrder: existingCalendarType.getSortOrder(),
        isActive: existingCalendarType.isActive(),
        isBuiltIn: existingCalendarType.isBuiltIn(),
        createdBy: existingCalendarType.getCreatedBy(),
        updatedBy: existingCalendarType.getUpdatedBy(),
        createdAt: existingCalendarType.getCreatedAt(),
        updatedAt: existingCalendarType.getUpdatedAt(),
      };

      // Suppression
      await this.calendarTypeRepository.delete(calendarTypeId);

      // Audit trail
      await this.auditService.logOperation({
        operation: "DELETE_CALENDAR_TYPE",
        entityType: "CALENDAR_TYPE",
        entityId: existingCalendarType.getId().getValue(),
        businessId: existingCalendarType.getBusinessId().getValue(),
        userId: request.requestingUserId,
        correlationId: request.correlationId ?? "no-correlation-id",
        changes: {
          deleted: deletedData,
        },
        timestamp: new Date(),
      });

      this.logger.info("Calendar type deleted successfully", {
        calendarTypeId: request.calendarTypeId,
        calendarTypeName: existingCalendarType.getName(),
        correlationId: request.correlationId ?? "no-correlation-id",
      });

      return {
        success: true,
        message: this.i18n.translate("calendarTypes.deleted.success"),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      this.logger.error(
        "Failed to delete calendar type",
        error instanceof Error ? error : new Error(errorMessage),
        {
          calendarTypeId: request.calendarTypeId,
          correlationId: request.correlationId ?? "no-correlation-id",
        },
      );

      throw error;
    }
  }

  private async validateRequest(
    request: DeleteCalendarTypeRequest,
  ): Promise<void> {
    const errors: string[] = [];

    // Validation calendarTypeId (obligatoire)
    if (!request.calendarTypeId?.trim()) {
      errors.push(this.i18n.translate("calendarTypes.validation.idRequired"));
    } else {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(request.calendarTypeId)) {
        errors.push(this.i18n.translate("calendarTypes.validation.idInvalid"));
      }
    }

    // Validation requestingUserId
    if (!request.requestingUserId?.trim()) {
      errors.push(
        this.i18n.translate("calendarTypes.validation.requestingUserRequired"),
      );
    } else {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(request.requestingUserId)) {
        errors.push(
          this.i18n.translate("calendarTypes.validation.requestingUserInvalid"),
        );
      }
    }

    // Validation correlationId
    if (!request.correlationId?.trim()) {
      errors.push(
        this.i18n.translate("calendarTypes.validation.correlationIdRequired"),
      );
    }

    if (errors.length > 0) {
      throw new CalendarTypeValidationError(
        this.i18n.translate("calendarTypes.validation.failed"),
        { errors },
      );
    }
  }

  private async validateDeletion(calendarType: CalendarType): Promise<void> {
    // Règle métier : Impossible de supprimer les types de calendrier built-in
    if (calendarType.isBuiltIn()) {
      throw new CalendarTypeBuiltInModificationError(
        calendarType.getId().getValue(),
      );
    }

    // TODO: Ajouter d'autres validations selon les règles métier
    // Par exemple :
    // - Vérifier qu'aucun calendrier n'utilise ce type
    // - Vérifier qu'aucun rendez-vous n'est planifié avec ce type
    // - Autres contraintes de référence selon le domaine

    // Pour l'instant, nous permettons la suppression si ce n'est pas built-in
    // Ces validations supplémentaires seront ajoutées selon les besoins métier
  }
}
