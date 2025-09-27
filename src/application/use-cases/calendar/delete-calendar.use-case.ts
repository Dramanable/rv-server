/**
 * 🗑️ DELETE CALENDAR USE CASE
 * ✅ Clean Architecture - Application Layer
 * ✅ SOLID principles
 * ✅ Business logic for calendar deletion with safety checks
 */

import type { AppointmentRepository } from "../../../domain/repositories/appointment.repository.interface";
import type { BusinessRepository } from "../../../domain/repositories/business.repository.interface";
import type { CalendarRepository } from "../../../domain/repositories/calendar.repository.interface";
import type { I18nService } from "../../ports/i18n.port";
import type { Logger } from "../../ports/logger.port";

import { CalendarId } from "../../../domain/value-objects/calendar-id.value-object";
import {
  CalendarNotFoundError,
  CalendarPermissionError,
} from "../../exceptions/calendar.exceptions";

export interface DeleteCalendarRequest {
  readonly requestingUserId: string;
  readonly calendarId: string;
  readonly force?: boolean; // Pour forcer la suppression même avec des RDV
}

export interface DeleteCalendarResponse {
  readonly success: boolean;
  readonly message: string;
  readonly warnings?: string[];
}

export class DeleteCalendarUseCase {
  constructor(
    private readonly calendarRepository: CalendarRepository,
    private readonly businessRepository: BusinessRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: DeleteCalendarRequest,
  ): Promise<DeleteCalendarResponse> {
    this.logger.info("Deleting calendar", {
      calendarId: request.calendarId,
      requestingUserId: request.requestingUserId,
      force: request.force || false,
    });

    // 1. Validation des paramètres
    await this.validateRequest(request);

    // 2. Récupération du calendrier
    const calendarId = CalendarId.create(request.calendarId);
    const calendar = await this.calendarRepository.findById(calendarId);

    if (!calendar) {
      this.logger.error("Calendar not found for deletion", {
        calendarId: request.calendarId,
      } as any);
      throw new CalendarNotFoundError(request.calendarId);
    }

    // 3. Vérification des permissions
    await this.validatePermissions(request.requestingUserId, calendar);

    // 4. Vérifications de sécurité
    const safetyChecks = await this.performSafetyChecks(
      calendar,
      request.force || false,
    );

    if (!safetyChecks.canDelete && !request.force) {
      return {
        success: false,
        message: this.i18n.t("calendar.cannot_delete_has_appointments"),
        warnings: safetyChecks.warnings,
      };
    }

    // 5. Suppression
    await this.calendarRepository.delete(calendarId);

    this.logger.info("Calendar deleted successfully", {
      calendarId: request.calendarId,
      requestingUserId: request.requestingUserId,
      warnings: safetyChecks.warnings,
    });

    return {
      success: true,
      message: this.i18n.t("calendar.deleted_successfully"),
      warnings: safetyChecks.warnings,
    };
  }

  private async validateRequest(request: DeleteCalendarRequest): Promise<void> {
    if (!request.calendarId || !request.requestingUserId) {
      throw new Error(this.i18n.t("calendar.invalid_delete_request"));
    }
  }

  private async validatePermissions(
    requestingUserId: string,
    calendar: any,
  ): Promise<void> {
    // Récupérer le business associé pour vérifier les permissions
    const business = await this.businessRepository.findById(
      calendar.businessId,
    );

    if (!business) {
      throw new Error(this.i18n.t("business.not_found"));
    }

    // Vérifier si l'utilisateur est le propriétaire du business
    const isOwner = business.getOwnerId() === requestingUserId;
    // TODO: Ajouter vérification des rôles/permissions pour les employés autorisés

    if (!isOwner) {
      this.logger.warn("Unauthorized calendar deletion attempt", {
        requestingUserId,
        calendarId: calendar.id.getValue(),
        businessId: business.id.getValue(),
      });
      throw new CalendarPermissionError(
        calendar.id.getValue(),
        requestingUserId,
        "delete",
      );
    }
  }

  private async performSafetyChecks(
    calendar: any,
    force: boolean,
  ): Promise<{
    canDelete: boolean;
    warnings: string[];
  }> {
    const warnings: string[] = [];

    // 1. Vérifier s'il y a des rendez-vous futurs
    const futureAppointments =
      await this.appointmentRepository.findByCalendarId(
        calendar.id,
        new Date(), // startDate
        undefined, // endDate (pas de limite)
      );

    if (futureAppointments.length > 0) {
      warnings.push(
        this.i18n.t("calendar.has_future_appointments", {
          count: futureAppointments.length,
        }),
      );

      if (!force) {
        return {
          canDelete: false,
          warnings,
        };
      }
    }

    // 2. Vérifier s'il s'agit du calendrier principal
    if (calendar.type === "BUSINESS") {
      // Compter les autres calendriers du business
      const allCalendars = await this.calendarRepository.findByBusinessId(
        calendar.businessId,
      );
      const otherCalendars = allCalendars.filter(
        (c) => c.id.getValue() !== calendar.id.getValue(),
      );

      if (otherCalendars.length === 0) {
        warnings.push(this.i18n.t("calendar.deleting_last_business_calendar"));
      }
    }

    // 3. Autres vérifications de sécurité
    // TODO: Ajouter d'autres vérifications selon les besoins métier

    return {
      canDelete: true,
      warnings,
    };
  }
}
