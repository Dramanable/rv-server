/**
 * 📅 Create Calendar Use Case - Clean Architecture + SOLID
 * 
 * Création d'un calendr    const context: AppContext = AppContextFactory.create()
      .operation('CreateCalendar')
      .requestingUser(request.requestingUserId)
      .build();

    this.logger.info(
      this.i18n.t('operations.calendar.create_attempt'),
      context as unknown as Record<string, unknown>,
    );alidation métier et permissions
 */

import { Inject, Injectable } from '@nestjs/common';
import { Calendar, CalendarType } from '../../../domain/entities/calendar.entity';
import type { CalendarRepository } from '../../../domain/repositories/calendar.repository.interface';
import type { BusinessRepository } from '../../../domain/repositories/business.repository.interface';
import type { Logger } from '../../../application/ports/logger.port';
import type { I18nService } from '../../../application/ports/i18n.port';
import { AppContext, AppContextFactory } from '../../../shared/context/app-context';
import { UserRole, Permission } from '../../../shared/enums/user-role.enum';
import { User } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../application/ports/user.repository.interface';
import { 
  InsufficientPermissionsError, 
  CalendarValidationError,
  BusinessNotFoundError 
} from '../../../application/exceptions/application.exceptions';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import { Address } from '../../../domain/value-objects/address.value-object';
import { WorkingHours } from '../../../domain/value-objects/working-hours.value-object';

export interface CreateCalendarRequest {
  readonly requestingUserId: string;
  readonly businessId: string;
  readonly name: string;
  readonly description?: string;
  readonly type: CalendarType;
  readonly address: {
    readonly street: string;
    readonly city: string;
    readonly state: string;
    readonly zipCode: string;
    readonly country: string;
  };
  readonly workingHours: {
    readonly monday?: { start: string; end: string };
    readonly tuesday?: { start: string; end: string };
    readonly wednesday?: { start: string; end: string };
    readonly thursday?: { start: string; end: string };
    readonly friday?: { start: string; end: string };
    readonly saturday?: { start: string; end: string };
    readonly sunday?: { start: string; end: string };
  };
  readonly settings?: {
    readonly timezone?: string;
    readonly slotDuration?: number; // en minutes
    readonly bufferTime?: number; // en minutes
    readonly maxAdvanceBooking?: number; // en jours
    readonly minAdvanceBooking?: number; // en heures
    readonly allowWeekendBooking?: boolean;
    readonly autoConfirm?: boolean;
    readonly color?: string;
  };
  readonly isActive?: boolean;
}

export interface CreateCalendarResponse {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly type: CalendarType;
  readonly businessId: string;
  readonly address: {
    readonly street: string;
    readonly city: string;
    readonly state: string;
    readonly zipCode: string;
    readonly country: string;
  };
  readonly isActive: boolean;
  readonly createdAt: Date;
}

@Injectable()
export class CreateCalendarUseCase {
  constructor(
    @Inject('CalendarRepository')
    private readonly calendarRepository: CalendarRepository,
    @Inject('BusinessRepository')
    private readonly businessRepository: BusinessRepository,
    @Inject('UserRepository')
    private readonly userRepository: IUserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: CreateCalendarRequest): Promise<CreateCalendarResponse> {
    // 1. Context pour traçabilité
    const context: AppContext = AppContextFactory.create()
      .operation('CreateCalendar')
      .requestingUser(request.requestingUserId)
      .businessEntity(request.businessId)
      .build();

    this.logger.info(
      this.i18n.t('operations.calendar.creation_attempt'),
      context as Record<string, unknown>,
    );

    try {
      // 2. Validation des permissions
      await this.validatePermissions(
        request.requestingUserId,
        request.businessId,
        context,
      );

      // 3. Validation des règles métier
      await this.validateBusinessRules(request, context);

      // 4. Création des value objects
      const businessId = BusinessId.create(request.businessId);
      const address = Address.create(
        request.address.street,
        request.address.city,
        request.address.state,
        request.address.zipCode,
        request.address.country,
      );
      const workingHours = WorkingHours.create(request.workingHours);

      // 5. Création de l'entité Calendar
      const calendar = Calendar.create(
        businessId,
        request.name.trim(),
        request.type,
        address,
        workingHours,
        {
          description: request.description?.trim(),
          settings: request.settings,
          isActive: request.isActive ?? true,
        },
      );

      // 6. Persistance
      const savedCalendar = await this.calendarRepository.save(calendar);

      // 7. Réponse typée
      const response: CreateCalendarResponse = {
        id: savedCalendar.id.getValue(),
        name: savedCalendar.name,
        description: savedCalendar.description,
        type: savedCalendar.type,
        businessId: savedCalendar.businessId.getValue(),
        address: {
          street: savedCalendar.address.getStreet(),
          city: savedCalendar.address.getCity(),
          state: savedCalendar.address.getState(),
          zipCode: savedCalendar.address.getZipCode(),
          country: savedCalendar.address.getCountry(),
        },
        isActive: savedCalendar.isActive,
        createdAt: savedCalendar.createdAt,
      };

      this.logger.info(
        this.i18n.t('operations.calendar.creation_success'),
        {
          ...context,
          calendarId: savedCalendar.id.getValue(),
          calendarName: savedCalendar.name,
          calendarType: savedCalendar.type,
        } as Record<string, unknown>,
      );

      return response;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.creation_failed'),
        error as Error,
        context as Record<string, unknown>,
      );
      throw error;
    }
  }

  private async validatePermissions(
    requestingUserId: string,
    businessId: string,
    context: AppContext,
  ): Promise<void> {
    const requestingUser = await this.userRepository.findById(requestingUserId);
    if (!requestingUser) {
      throw new InsufficientPermissionsError(
        'Requesting user not found',
        UserRole.REGULAR_CLIENT,
      );
    }

    // Vérifier que l'entreprise existe
    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new BusinessNotFoundError(`Business with id ${businessId} not found`);
    }

    // Platform admins peuvent créer des calendriers dans n'importe quelle entreprise
    if (requestingUser.role === UserRole.PLATFORM_ADMIN) {
      return;
    }

    // Business owners et admins peuvent créer des calendriers
    const allowedRoles = [
      UserRole.BUSINESS_OWNER,
      UserRole.BUSINESS_ADMIN,
    ];

    if (!allowedRoles.includes(requestingUser.role)) {
      this.logger.warn(this.i18n.t('warnings.permission.denied'), {
        requestingUserId,
        requestingUserRole: requestingUser.role,
        requiredPermissions: 'CREATE_CALENDAR',
        businessId,
      });
      throw new InsufficientPermissionsError(
        Permission.MANAGE_CALENDARS,
        requestingUser.role,
      );
    }
  }

  private async validateBusinessRules(
    request: CreateCalendarRequest,
    context: AppContext,
  ): Promise<void> {
    // Validation du nom
    if (!request.name || request.name.trim().length < 3) {
      throw new CalendarValidationError(
        'Calendar name must be at least 3 characters long',
      );
    }

    if (request.name.trim().length > 100) {
      throw new CalendarValidationError(
        'Calendar name cannot exceed 100 characters',
      );
    }

    // Validation de l'unicité du nom dans l'entreprise
    const existingCalendar = await this.calendarRepository.findByNameAndBusiness(
      request.name.trim(),
      BusinessId.create(request.businessId),
    );

    if (existingCalendar) {
      this.logger.warn(
        this.i18n.t('warnings.calendar.name_already_exists'),
        { 
          ...context, 
          calendarName: request.name,
          businessId: request.businessId,
        },
      );
      throw new CalendarValidationError(
        `Calendar with name "${request.name}" already exists in this business`,
      );
    }

    // Validation du type de calendrier
    if (!Object.values(CalendarType).includes(request.type)) {
      throw new CalendarValidationError(
        `Invalid calendar type: ${request.type}`,
      );
    }

    // Validation de la description si fournie
    if (request.description && request.description.trim().length > 500) {
      throw new CalendarValidationError(
        'Calendar description cannot exceed 500 characters',
      );
    }

    // Validation de l'adresse
    if (!request.address.street || request.address.street.trim().length < 5) {
      throw new CalendarValidationError(
        'Street address must be at least 5 characters long',
      );
    }

    if (!request.address.city || request.address.city.trim().length < 2) {
      throw new CalendarValidationError(
        'City must be at least 2 characters long',
      );
    }

    if (!request.address.zipCode || request.address.zipCode.trim().length < 3) {
      throw new CalendarValidationError(
        'Zip code must be at least 3 characters long',
      );
    }

    if (!request.address.country || request.address.country.trim().length < 2) {
      throw new CalendarValidationError(
        'Country must be at least 2 characters long',
      );
    }

    // Validation des horaires de travail
    const hasAtLeastOneWorkingDay = Object.values(request.workingHours).some(
      hours => hours !== undefined,
    );

    if (!hasAtLeastOneWorkingDay) {
      throw new CalendarValidationError(
        'Calendar must have at least one working day defined',
      );
    }

    // Validation des formats d'horaires
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of days) {
      const hours = request.workingHours[day as keyof typeof request.workingHours];
      if (hours) {
        if (!this.isValidTimeFormat(hours.start) || !this.isValidTimeFormat(hours.end)) {
          throw new CalendarValidationError(
            `Invalid time format for ${day}. Use HH:MM format`,
          );
        }
        
        if (hours.start >= hours.end) {
          throw new CalendarValidationError(
            `Start time must be before end time for ${day}`,
          );
        }
      }
    }

    // Validation des paramètres si fournis
    if (request.settings) {
      const { 
        slotDuration, 
        bufferTime, 
        maxAdvanceBooking, 
        minAdvanceBooking,
        color 
      } = request.settings;

      if (slotDuration !== undefined && (slotDuration < 5 || slotDuration > 480)) {
        throw new CalendarValidationError(
          'Slot duration must be between 5 and 480 minutes',
        );
      }

      if (bufferTime !== undefined && (bufferTime < 0 || bufferTime > 120)) {
        throw new CalendarValidationError(
          'Buffer time must be between 0 and 120 minutes',
        );
      }

      if (maxAdvanceBooking !== undefined && (maxAdvanceBooking < 1 || maxAdvanceBooking > 365)) {
        throw new CalendarValidationError(
          'Max advance booking must be between 1 and 365 days',
        );
      }

      if (minAdvanceBooking !== undefined && (minAdvanceBooking < 0 || minAdvanceBooking > 168)) {
        throw new CalendarValidationError(
          'Min advance booking must be between 0 and 168 hours (1 week)',
        );
      }

      if (color && !this.isValidHexColor(color)) {
        throw new CalendarValidationError(
          'Color must be a valid hex color code',
        );
      }
    }
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  private isValidHexColor(color: string): boolean {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  }
}
