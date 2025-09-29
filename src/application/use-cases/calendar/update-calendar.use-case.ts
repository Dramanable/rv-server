/**
 * ✏️ UPDATE CALENDAR USE CASE
 * ✅ Clean Architecture - Application Layer
 * ✅ SOLID principles
 * ✅ Business logic for calendar updates
 */

import type { BusinessRepository } from '../../../domain/repositories/business.repository.interface';
import type { CalendarRepository } from '../../../domain/repositories/calendar.repository.interface';
import type { I18nService } from '../../ports/i18n.port';
import type { Logger } from '../../ports/logger.port';

import { Calendar } from '../../../domain/entities/calendar.entity';
import { CalendarId } from '../../../domain/value-objects/calendar-id.value-object';
import { WorkingHours } from '../../../domain/value-objects/working-hours.value-object';
import { ResourceNotFoundError } from '../../exceptions/application.exceptions';
import {
  CalendarNotFoundError,
  CalendarPermissionError,
  InvalidCalendarDataError,
} from '../../exceptions/calendar.exceptions';

export interface UpdateCalendarRequest {
  readonly requestingUserId: string;
  readonly calendarId: string;
  readonly name?: string;
  readonly description?: string;
  readonly settings?: {
    readonly timeZone?: string;
    readonly workingHours?: Record<string, { start: string; end: string }>;
    readonly slotDuration?: number;
    readonly bufferTime?: number;
    readonly maxAdvanceBooking?: number;
    readonly minAdvanceBooking?: number;
    readonly allowWeekendBooking?: boolean;
    readonly autoConfirm?: boolean;
  };
  readonly availability?: {
    readonly isAvailable?: boolean;
    readonly availabilityRules?: any[];
    readonly exceptions?: any[];
  };
}

export interface UpdateCalendarResponse {
  readonly calendar: Calendar;
  readonly message: string;
}

export class UpdateCalendarUseCase {
  constructor(
    private readonly calendarRepository: CalendarRepository,
    private readonly businessRepository: BusinessRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: UpdateCalendarRequest,
  ): Promise<UpdateCalendarResponse> {
    this.logger.info('Updating calendar', {
      calendarId: request.calendarId,
      requestingUserId: request.requestingUserId,
    });

    // 1. Validation des paramètres
    this.validateRequest(request);

    // 2. Récupération du calendrier existant
    const calendarId = CalendarId.create(request.calendarId);
    const existingCalendar = await this.calendarRepository.findById(calendarId);

    if (!existingCalendar) {
      this.logger.error('Calendar not found for update', {
        calendarId: request.calendarId,
      } as any);
      throw new CalendarNotFoundError(request.calendarId);
    }

    // 3. Vérification des permissions
    await this.validatePermissions(request.requestingUserId, existingCalendar);

    // 4. Mise à jour du calendrier
    const updatedCalendar = await this.updateCalendar(
      existingCalendar,
      request,
    );

    // 5. Sauvegarde

    this.logger.info('Calendar updated successfully', {
      calendarId: updatedCalendar.id.getValue(),
      requestingUserId: request.requestingUserId,
    });

    return {
      calendar: updatedCalendar,
      message: this.i18n.t('calendar.updated_successfully'),
    };
  }

  private validateRequest(request: UpdateCalendarRequest): void {
    if (!request.calendarId || !request.requestingUserId) {
      throw new InvalidCalendarDataError(
        'request',
        this.i18n.t('calendar.invalid_update_request'),
      );
    }

    // Validation des horaires de travail si fournis
    if (request.settings?.workingHours) {
      this.validateWorkingHours(request.settings.workingHours);
    }

    // Validation des paramètres de réservation
    if (request.settings?.slotDuration && request.settings.slotDuration < 15) {
      throw new InvalidCalendarDataError(
        'slotDuration',
        this.i18n.t('calendar.invalid_slot_duration'),
      );
    }

    // if (
    //   request.settings?.advanceBookingLimit &&
    //   request.settings.advanceBookingLimit < 1
    // ) {
    //   throw new InvalidCalendarDataError(
    //     'advanceBookingLimit',
    //     this.i18n.t('calendar.invalid_advance_booking')
    //   );
    // }
  }

  private validateWorkingHours(
    workingHours: Record<string, { start: string; end: string }>,
  ): void {
    const validDays = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    for (const [day, hours] of Object.entries(workingHours)) {
      if (!validDays.includes(day)) {
        throw new InvalidCalendarDataError(
          'workingHours',
          this.i18n.t('calendar.invalid_day', { day }),
        );
      }

      // Validation format horaire (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(hours.start) || !timeRegex.test(hours.end)) {
        throw new InvalidCalendarDataError(
          'workingHours',
          this.i18n.t('calendar.invalid_time_format', { day }),
        );
      }

      // Validation cohérence horaires
      if (hours.start >= hours.end) {
        throw new InvalidCalendarDataError(
          'workingHours',
          this.i18n.t('calendar.invalid_time_range', { day }),
        );
      }
    }
  }

  private async validatePermissions(
    requestingUserId: string,
    calendar: Calendar,
  ): Promise<void> {
    // Récupérer le business associé pour vérifier les permissions
    const business = await this.businessRepository.findById(
      calendar.businessId,
    );

    if (!business) {
      throw new ResourceNotFoundError(
        'Business',
        calendar.businessId.getValue(),
        { message: this.i18n.t('business.not_found') },
      );
    }

    // Vérifier si l'utilisateur est le propriétaire du business ou a les permissions
    const isOwner = business.getOwnerId() === requestingUserId;
    // TODO: Ajouter vérification des rôles/permissions pour les employés autorisés

    if (!isOwner) {
      this.logger.warn('Unauthorized calendar update attempt', {
        requestingUserId,
        calendarId: calendar.id.getValue(),
        businessId: business.id.getValue(),
      });
      throw new CalendarPermissionError(
        calendar.id.getValue(),
        requestingUserId,
        'update',
      );
    }
  }

  private async updateCalendar(
    existingCalendar: Calendar,
    request: UpdateCalendarRequest,
  ): Promise<Calendar> {
    // Utiliser la méthode update de l'entité Calendar pour maintenir l'intégrité métier
    const updateData: any = {};

    if (request.name !== undefined) {
      updateData.name = request.name;
    }

    if (request.description !== undefined) {
      updateData.description = request.description;
    }

    if (request.settings) {
      updateData.settings = {
        ...existingCalendar.settings,
        ...request.settings,
      };
    }

    if (request.availability) {
      updateData.availability = {
        ...existingCalendar.availability,
        ...request.availability,
      };
    }

    // Pour l'instant, appliquer les modifications directement via le repository
    // TODO: Ajouter une méthode update à l'entité Calendar pour la logique métier

    // Appliquer les modifications via des méthodes spécialisées de l'entité
    if (request.settings?.workingHours) {
      Object.entries(request.settings.workingHours).forEach(([day, hours]) => {
        const dayIndex = this.getDayIndex(day);
        if (dayIndex !== -1) {
          const workingHours = WorkingHours.createWithLunchBreak(
            dayIndex,
            hours.start,
            hours.end,
          );
          existingCalendar.updateWorkingHours(dayIndex, workingHours);
        }
      });
    }

    return existingCalendar;
  }

  private getDayIndex(day: string): number {
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    return dayMap[day.toLowerCase()] ?? -1;
  }
}
