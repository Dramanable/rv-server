/**
 * 📅 GET AVAILABLE SLOTS USE CASE - VERSION SIMPLIFIÉE
 * ✅ Clean Architecture - Application Layer
 * ✅ Compatible avec les DTOs Doctolib-inspired
 * ✅ Pattern Requ    if (!request.calendarId?.trim()) {
      throw new ApplicationValidationError('calendarId', request.calendarId, 'calendar_id_required');
    }

    if (!request.referenceDate) {
      throw new ApplicationValidationError('referenceDate', request.referenceDate, 'reference_date_required');
    }

    // Validation de la durée si fournie
    if (request.duration !== undefined) {
      if (request.duration < 15 || request.duration > 480) {
        throw new ApplicationValidationError('duration', request.duration, 'duration_invalid');
      }
    } */

import type { AppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import type { CalendarRepository } from '../../../domain/repositories/calendar.repository.interface';
import type { ServiceRepository } from '../../../domain/repositories/service.repository.interface';
import type { StaffRepository } from '../../../domain/repositories/staff.repository.interface';
import {
  ApplicationValidationError,
  ResourceNotFoundError,
} from '../../exceptions/application.exceptions';
import { ViewMode } from '../../../presentation/dtos/appointment.dto';
import type { I18nService } from '../../ports/i18n.port';
import type { Logger } from '../../ports/logger.port';

import { CalendarId } from '../../../domain/value-objects/calendar-id.value-object';
import { ServiceId } from '../../../domain/value-objects/service-id.value-object';
import { UserId } from '../../../domain/value-objects/user-id.value-object';

export interface GetAvailableSlotsRequest {
  readonly businessId: string;
  readonly serviceId: string;
  readonly calendarId: string;
  readonly staffId?: string;
  readonly viewMode: ViewMode;
  readonly referenceDate: Date;
  readonly duration?: number;
  readonly includeUnavailableReasons?: boolean;
  readonly timeZone?: string;
  readonly requestingUserId: string;
}

export interface SlotDetails {
  readonly startTime: Date;
  readonly endTime: Date;
  readonly isAvailable: boolean;
  readonly price?: number;
  readonly staffName?: string;
  readonly staffId?: string;
  readonly unavailableReason?: string;
}

export interface DaySlots {
  readonly date: string;
  readonly dayOfWeek: number;
  readonly slots: SlotDetails[];
}

export interface GetAvailableSlotsResponse {
  readonly viewMode: ViewMode;
  readonly currentPeriod: string;
  readonly availableSlots: DaySlots[];
  readonly navigation: {
    readonly hasPrevious: boolean;
    readonly hasNext: boolean;
    readonly previousDate: Date;
    readonly nextDate: Date;
  };
  readonly metadata: {
    readonly totalSlots: number;
    readonly availableSlots: number;
    readonly bookedSlots: number;
    readonly utilizationRate: number;
  };
}

export class GetAvailableSlotsUseCase {
  constructor(
    private readonly calendarRepository: CalendarRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly staffRepository: StaffRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: GetAvailableSlotsRequest,
  ): Promise<GetAvailableSlotsResponse> {
    this.logger.info(
      this.i18n.translate('operations.availability.fetching_slots'),
      {
        businessId: request.businessId,
        serviceId: request.serviceId,
        calendarId: request.calendarId,
        viewMode: request.viewMode,
        referenceDate: request.referenceDate.toISOString(),
      },
    );

    try {
      // 1. Validation de la requête
      await this.validateRequest(request);

      // 2. Récupération des entités nécessaires
      const entities = await this.loadRequiredEntities(request);

      // 3. Calcul de la période à afficher
      const period = this.calculatePeriod(
        request.viewMode,
        request.referenceDate,
      );

      // 4. Génération des créneaux disponibles
      const slotsData = await this.generateAvailableSlots(
        request,
        entities,
        period,
      );

      // 5. Construction de la réponse
      const response: GetAvailableSlotsResponse = {
        viewMode: request.viewMode,
        currentPeriod: this.formatPeriodLabel(period, request.viewMode),
        availableSlots: slotsData.dailySlots,
        navigation: {
          hasPrevious: this.canNavigatePrevious(period, request.viewMode),
          hasNext: this.canNavigateNext(period, request.viewMode),
          previousDate: this.getPreviousPeriodDate(period, request.viewMode),
          nextDate: this.getNextPeriodDate(period, request.viewMode),
        },
        metadata: {
          totalSlots: slotsData.totalSlots,
          availableSlots: slotsData.availableCount,
          bookedSlots: slotsData.bookedCount,
          utilizationRate: this.calculateUtilizationRate(
            slotsData.bookedCount,
            slotsData.totalSlots,
          ),
        },
      };

      this.logger.info(
        this.i18n.translate('operations.availability.slots_fetched'),
        {
          businessId: request.businessId,
          totalSlots: response.metadata.totalSlots,
          availableSlots: response.metadata.availableSlots,
          utilizationRate: response.metadata.utilizationRate,
        },
      );

      return response;
    } catch (error) {
      this.logger.error(
        this.i18n.translate('operations.availability.fetch_failed'),
        error instanceof Error ? error : new Error(String(error)),
        {
          businessId: request.businessId,
          serviceId: request.serviceId,
          calendarId: request.calendarId,
        },
      );
      throw error;
    }
  }

  private async validateRequest(
    request: GetAvailableSlotsRequest,
  ): Promise<void> {
    if (!request.businessId?.trim()) {
      throw new ApplicationValidationError(
        'businessId',
        request.businessId,
        'business_id_required',
      );
    }

    if (!request.serviceId?.trim()) {
      throw new ApplicationValidationError(
        'serviceId',
        request.serviceId,
        'service_id_required',
      );
    }

    if (!request.calendarId?.trim()) {
      throw new ApplicationValidationError(
        'calendarId',
        request.calendarId,
        'calendar_id_required',
      );
    }

    if (!request.referenceDate) {
      throw new ApplicationValidationError(
        'referenceDate',
        request.referenceDate,
        'reference_date_required',
      );
    }

    // Validation de la durée si fournie
    if (request.duration !== undefined) {
      if (request.duration < 15 || request.duration > 480) {
        throw new ApplicationValidationError(
          'duration',
          request.duration,
          'invalid_duration',
        );
      }
    }
  }

  private async loadRequiredEntities(request: GetAvailableSlotsRequest) {
    const serviceId = ServiceId.create(request.serviceId);
    const calendarId = CalendarId.create(request.calendarId);

    // Charger en parallèle pour optimiser
    const [service, calendar, staff] = await Promise.all([
      this.serviceRepository.findById(serviceId),
      this.calendarRepository.findById(calendarId),
      request.staffId
        ? this.staffRepository.findById(UserId.create(request.staffId))
        : Promise.resolve(null),
    ]);

    if (!service) {
      throw new ResourceNotFoundError('Service', request.serviceId);
    }

    if (!calendar) {
      throw new ResourceNotFoundError('Calendar', request.calendarId);
    }

    if (request.staffId && !staff) {
      throw new ResourceNotFoundError('Staff', request.staffId);
    }

    return { service, calendar, staff };
  }

  private calculatePeriod(viewMode: ViewMode, referenceDate: Date) {
    const startDate = new Date(referenceDate);
    let endDate: Date;

    switch (viewMode) {
      case ViewMode.DAY:
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;

      case ViewMode.WEEK: {
        // Début de la semaine (lundi)
        const dayOfWeek = startDate.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(startDate.getDate() - mondayOffset);
        startDate.setHours(0, 0, 0, 0);

        // Fin de la semaine (dimanche)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      case ViewMode.NEXT_WEEK: {
        // Début de la semaine suivante
        const nextWeekStart = new Date(referenceDate);
        const currentDayOfWeek = nextWeekStart.getDay();
        const daysUntilNextMonday =
          currentDayOfWeek === 0 ? 1 : 8 - currentDayOfWeek;
        nextWeekStart.setDate(nextWeekStart.getDate() + daysUntilNextMonday);
        nextWeekStart.setHours(0, 0, 0, 0);

        // Fin de la semaine suivante
        endDate = new Date(nextWeekStart);
        endDate.setDate(nextWeekStart.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        startDate.setTime(nextWeekStart.getTime());
        break;
      }
    }

    return { startDate, endDate };
  }

  private async generateAvailableSlots(
    request: GetAvailableSlotsRequest,
    entities: any,
    period: { startDate: Date; endDate: Date },
  ) {
    const { service, calendar, staff } = entities;
    const duration = request.duration || service.getDefaultDuration();

    // Récupérer les rendez-vous existants sur la période
    const existingAppointments =
      await this.appointmentRepository.findByCalendarId(
        CalendarId.create(request.calendarId),
        period.startDate,
        period.endDate,
      );

    const dailySlots: DaySlots[] = [];
    let totalSlots = 0;
    let availableCount = 0;
    let bookedCount = 0;

    // Générer les créneaux pour chaque jour de la période
    const currentDate = new Date(period.startDate);
    while (currentDate <= period.endDate) {
      const daySlots = await this.generateSlotsForDay(
        currentDate,
        service,
        calendar,
        staff,
        duration,
        existingAppointments,
        request.includeUnavailableReasons,
      );

      if (daySlots.slots.length > 0) {
        dailySlots.push(daySlots);
        totalSlots += daySlots.slots.length;
        availableCount += daySlots.slots.filter(
          (slot) => slot.isAvailable,
        ).length;
        bookedCount += daySlots.slots.filter(
          (slot) => !slot.isAvailable,
        ).length;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      dailySlots,
      totalSlots,
      availableCount,
      bookedCount,
    };
  }

  private async generateSlotsForDay(
    date: Date,
    service: any,
    _calendar: any,
    staff: any,
    _duration: number,
    existingAppointments: any[],
    includeUnavailable = false,
  ): Promise<DaySlots> {
    const dayOfWeek = date.getDay();

    // TODO: Vérifier les horaires d'ouverture du calendrier pour ce jour
    // const workingHours = calendar.getWorkingHoursForDay(dayOfWeek);

    // Pour l'instant, horaires par défaut 9h-18h
    const workingHours = {
      start: { hour: 9, minute: 0 },
      end: { hour: 18, minute: 0 },
    };

    const slots: SlotDetails[] = [];

    // Générer des créneaux de 30 minutes par défaut
    const slotDuration = 30;
    const startTime = new Date(date);
    startTime.setHours(
      workingHours.start.hour,
      workingHours.start.minute,
      0,
      0,
    );

    const endOfDay = new Date(date);
    endOfDay.setHours(workingHours.end.hour, workingHours.end.minute, 0, 0);

    const currentSlot = new Date(startTime);

    while (currentSlot < endOfDay) {
      const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60000);

      // Vérifier si le créneau est libre
      const isOccupied = existingAppointments.some((appointment: any) => {
        const appointmentStart = appointment.timeSlot.getStartTime();
        const appointmentEnd = appointment.timeSlot.getEndTime();

        return (
          (currentSlot >= appointmentStart && currentSlot < appointmentEnd) ||
          (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
          (currentSlot <= appointmentStart && slotEnd >= appointmentEnd)
        );
      });

      const isAvailable = !isOccupied && currentSlot > new Date();

      if (isAvailable || includeUnavailable) {
        slots.push({
          startTime: new Date(currentSlot),
          endTime: new Date(slotEnd),
          isAvailable,
          price: service.getBasePrice()?.getAmount(),
          staffName: staff
            ? `${staff.getProfile().firstName} ${staff.getProfile().lastName}`
            : undefined,
          staffId: staff?.getId().getValue(),
          unavailableReason: !isAvailable
            ? isOccupied
              ? 'Créneau occupé'
              : 'Créneau passé'
            : undefined,
        });
      }

      currentSlot.setTime(currentSlot.getTime() + slotDuration * 60000);
    }

    return {
      date: date.toISOString().split('T')[0],
      dayOfWeek,
      slots,
    };
  }

  private formatPeriodLabel(
    period: { startDate: Date; endDate: Date },
    viewMode: ViewMode,
  ): string {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };

    switch (viewMode) {
      case ViewMode.DAY:
        return period.startDate.toLocaleDateString('fr-FR', options);

      case ViewMode.WEEK: {
        const startFormatted = period.startDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
        });
        const endFormatted = period.endDate.toLocaleDateString(
          'fr-FR',
          options,
        );
        return `Semaine du ${startFormatted} au ${endFormatted}`;
      }

      case ViewMode.NEXT_WEEK: {
        const nextStartFormatted = period.startDate.toLocaleDateString(
          'fr-FR',
          {
            day: 'numeric',
            month: 'long',
          },
        );
        const nextEndFormatted = period.endDate.toLocaleDateString(
          'fr-FR',
          options,
        );
        return `Semaine suivante du ${nextStartFormatted} au ${nextEndFormatted}`;
      }

      default:
        return '';
    }
  }

  private canNavigatePrevious(
    period: { startDate: Date; endDate: Date },
    _viewMode: ViewMode,
  ): boolean {
    // Ne pas permettre de naviguer vers le passé
    const now = new Date();
    return period.startDate > now;
  }

  private canNavigateNext(
    period: { startDate: Date; endDate: Date },
    _viewMode: ViewMode,
  ): boolean {
    // Permettre de naviguer jusqu'à 3 mois dans le futur
    const maxFutureDate = new Date();
    maxFutureDate.setMonth(maxFutureDate.getMonth() + 3);
    return period.endDate < maxFutureDate;
  }

  private getPreviousPeriodDate(
    period: { startDate: Date; endDate: Date },
    viewMode: ViewMode,
  ): Date {
    const previousDate = new Date(period.startDate);

    switch (viewMode) {
      case ViewMode.DAY:
        previousDate.setDate(previousDate.getDate() - 1);
        break;
      case ViewMode.WEEK:
      case ViewMode.NEXT_WEEK:
        previousDate.setDate(previousDate.getDate() - 7);
        break;
    }

    return previousDate;
  }

  private getNextPeriodDate(
    period: { startDate: Date; endDate: Date },
    viewMode: ViewMode,
  ): Date {
    const nextDate = new Date(period.startDate);

    switch (viewMode) {
      case ViewMode.DAY:
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case ViewMode.WEEK:
      case ViewMode.NEXT_WEEK:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
    }

    return nextDate;
  }

  private calculateUtilizationRate(
    bookedSlots: number,
    totalSlots: number,
  ): number {
    if (totalSlots === 0) return 0;
    return Math.round((bookedSlots / totalSlots) * 100 * 100) / 100; // 2 décimales
  }
}
