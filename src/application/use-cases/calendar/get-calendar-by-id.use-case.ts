/**
 * 📅 Get Calendar By ID Use Case - Clean Architecture + SOLID
 *
 * ✅ COUCHE APPLICATION PURE - Sans dépendance NestJS
 * ✅ Dependency Inversion Principle respecté
 * ✅ Interface-driven design
 */
import {
  ApplicationValidationError,
  InsufficientPermissionsError,
  ResourceNotFoundError,
} from '../../../application/exceptions/application.exceptions';
import type { I18nService } from '../../../application/ports/i18n.port';
import type { Logger } from '../../../application/ports/logger.port';
import {
  Calendar,
  CalendarStatus,
} from '../../../domain/entities/calendar.entity';
import { CalendarType } from '../../../domain/entities/calendar-type.entity';
import type { CalendarRepository } from '../../../domain/repositories/calendar.repository.interface';
import type { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { CalendarId } from '../../../domain/value-objects/calendar-id.value-object';
import {
  AppContext,
  AppContextFactory,
} from '../../../shared/context/app-context';
import { UserRole } from '../../../shared/enums/user-role.enum';

export interface GetCalendarByIdRequest {
  readonly requestingUserId: string;
  readonly calendarId: string;
}

export interface CalendarDetailsResponse {
  readonly id: string;
  readonly businessId: string;
  readonly type: CalendarType;
  readonly name: string;
  readonly description: string;
  readonly ownerId?: string;
  readonly status: CalendarStatus;
  readonly settings: {
    readonly timezone: string;
    readonly defaultSlotDuration: number;
    readonly minimumNotice: number;
    readonly maximumAdvanceBooking: number;
    readonly allowMultipleBookings: boolean;
    readonly autoConfirmBookings: boolean;
    readonly bufferTimeBetweenSlots: number;
  };
  readonly availability: {
    readonly workingHours: Array<{
      readonly dayOfWeek: number;
      readonly isWorking: boolean;
      readonly periods: Array<{
        readonly startTime: string;
        readonly endTime: string;
      }>;
    }>;
    readonly specialDates: Array<{
      readonly date: string;
      readonly isAvailable: boolean;
      readonly reason?: string;
    }>;
    readonly holidays: Array<{
      readonly name: string;
      readonly date: string;
    }>;
    readonly maintenancePeriods: Array<{
      readonly startDate: string;
      readonly endDate: string;
      readonly reason: string;
    }>;
  };
  readonly bookingRulesCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * ✅ PURE APPLICATION USE CASE
 * ❌ No NestJS dependencies
 * ✅ Constructor Injection via interfaces only
 */
export class GetCalendarByIdUseCase {
  constructor(
    private readonly calendarRepository: CalendarRepository,
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: GetCalendarByIdRequest,
  ): Promise<CalendarDetailsResponse> {
    // 1. Context pour traçabilité
    const context: AppContext = AppContextFactory.create()
      .operation('GetCalendarById')
      .requestingUser(request.requestingUserId)
      .metadata('calendarId', request.calendarId)
      .build();

    this.logger.info(
      this.i18n.t('operations.calendar.get_attempt'),
      context as any,
    );

    try {
      // 2. Validation des paramètres
      this.validateRequestParameters(request);

      // 3. Récupération du calendrier
      const calendarId = CalendarId.create(request.calendarId);
      const calendar = await this.calendarRepository.findById(calendarId);

      if (!calendar) {
        throw new ResourceNotFoundError('Calendar', request.calendarId);
      }

      // 4. Validation des permissions
      await this.validatePermissions(
        request.requestingUserId,
        calendar,
        context,
      );

      // 5. Mapping vers response détaillée
      const response = this.mapToCalendarDetailsResponse(calendar);

      this.logger.info(this.i18n.t('operations.calendar.get_success'), {
        ...(context as any),
        calendarName: calendar.name,
        calendarType: calendar.type,
      });

      return response;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.get_failed', {
          error: (error as Error).message,
        }),
        context as any,
      );
      throw error;
    }
  }

  private validateRequestParameters(request: GetCalendarByIdRequest): void {
    if (!request.calendarId || request.calendarId.trim().length === 0) {
      throw new ApplicationValidationError(
        'calendarId',
        request.calendarId,
        'Calendar ID is required',
      );
    }

    if (
      !request.requestingUserId ||
      request.requestingUserId.trim().length === 0
    ) {
      throw new ApplicationValidationError(
        'requestingUserId',
        request.requestingUserId,
        'Requesting user ID is required',
      );
    }
  }

  private async validatePermissions(
    requestingUserId: string,
    calendar: Calendar,
    context: AppContext,
  ): Promise<void> {
    const requestingUser = await this.userRepository.findById(requestingUserId);
    if (!requestingUser) {
      throw new InsufficientPermissionsError(
        requestingUserId,
        'VIEW_CALENDAR',
        'calendar',
      );
    }

    // Règles de permission :
    // 1. Admins platform peuvent voir tous les calendriers
    // 2. Business owners/admins peuvent voir les calendriers de leur business
    // 3. Staff peuvent voir leurs propres calendriers et ceux de leur business (selon rôle)
    // 4. Clients ne peuvent pas voir les détails des calendriers

    const isAdmin = [UserRole.PLATFORM_ADMIN].includes(requestingUser.role);
    if (isAdmin) {
      return; // Accès complet
    }

    const isBusinessOwner = [
      UserRole.BUSINESS_OWNER,
      UserRole.BUSINESS_ADMIN,
    ].includes(requestingUser.role);

    const isManager = [
      UserRole.LOCATION_MANAGER,
      UserRole.DEPARTMENT_HEAD,
    ].includes(requestingUser.role);

    const isStaff = [
      UserRole.SENIOR_PRACTITIONER,
      UserRole.PRACTITIONER,
      UserRole.RECEPTIONIST,
    ].includes(requestingUser.role);

    // Pour les propriétaires/admins d'entreprise
    if (isBusinessOwner) {
      // TODO: Vérifier que le calendrier appartient à leur business
      // Cette logique nécessitera une méthode pour récupérer le business de l'utilisateur
      return;
    }

    // Pour les managers
    if (isManager) {
      // TODO: Vérifier que le calendrier appartient à leur lieu/département
      return;
    }

    // Pour le staff
    if (isStaff) {
      // Peuvent voir leur propre calendrier ou les calendriers de leur business (selon règles)
      if (calendar.ownerId?.getValue() === requestingUserId) {
        return; // Leur propre calendrier
      }
      // TODO: Vérifier les règles d'accès aux autres calendriers du business
    }

    // Par défaut, refuser l'accès
    this.logger.warn(this.i18n.t('warnings.permission.denied'), {
      requestingUserId,
      requestingUserRole: requestingUser.role,
      calendarId: calendar.id.getValue(),
      calendarOwnerId: calendar.ownerId?.getValue(),
    });

    throw new InsufficientPermissionsError(
      requestingUserId,
      'VIEW_CALENDAR',
      'calendar',
      { calendarId: calendar.id.getValue() },
    );
  }

  private mapToCalendarDetailsResponse(
    calendar: Calendar,
  ): CalendarDetailsResponse {
    const settings = calendar.settings;
    const availability = calendar.availability;

    return {
      id: calendar.id.getValue(),
      businessId: calendar.businessId.getValue(),
      type: calendar.type,
      name: calendar.name,
      description: calendar.description,
      ownerId: calendar.ownerId?.getValue(),
      status: calendar.status,
      settings: {
        timezone: settings.timezone,
        defaultSlotDuration: settings.defaultSlotDuration,
        minimumNotice: settings.minimumNotice,
        maximumAdvanceBooking: settings.maximumAdvanceBooking,
        allowMultipleBookings: settings.allowMultipleBookings,
        autoConfirmBookings: settings.autoConfirmBookings,
        bufferTimeBetweenSlots: settings.bufferTimeBetweenSlots,
      },
      availability: {
        workingHours: availability.workingHours.map((wh) => ({
          dayOfWeek: wh.getDayOfWeek(),
          isWorking: wh.isWorking(),
          periods: wh.getAvailableTimeRanges().map((period) => ({
            startTime: period.start,
            endTime: period.end,
          })),
        })),
        specialDates: availability.specialDates.map((sd) => ({
          date: sd.date.toISOString().split('T')[0], // YYYY-MM-DD format
          isAvailable: sd.isAvailable,
          reason: sd.reason,
        })),
        holidays: availability.holidays.map((holiday) => ({
          name: holiday.name,
          date: holiday.date.toISOString().split('T')[0],
        })),
        maintenancePeriods: availability.maintenancePeriods.map((mp) => ({
          startDate: mp.startDate.toISOString(),
          endDate: mp.endDate.toISOString(),
          reason: mp.reason,
        })),
      },
      bookingRulesCount: calendar.bookingRules.length,
      createdAt: calendar.createdAt,
      updatedAt: calendar.updatedAt,
    };
  }
}
