import { AppointmentRepository } from '@domain/repositories/appointment.repository.interface';
import { BusinessRepository } from '@domain/repositories/business.repository.interface';
import { CalendarRepository } from '@domain/repositories/calendar.repository.interface';
import { ServiceRepository } from '@domain/repositories/service.repository.interface';
import { I18nService } from '@shared/types/i18n.interface';
import { ILogger } from '@shared/types/logger.interface';

import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from '@domain/entities/appointment.entity';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { CalendarId } from '@domain/value-objects/calendar-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { ServiceId } from '@domain/value-objects/service-id.value-object';
import { TimeSlot } from '@domain/value-objects/time-slot.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';

import {
  AppointmentConflictError,
  AppointmentInPastError,
  AppointmentValidationError,
  BusinessInactiveError,
  BusinessNotFoundError,
  CalendarInactiveError,
  CalendarNotFoundError,
  MinimumBookingNoticeError,
  ServiceInactiveError,
  ServiceNotBookableOnlineError,
  ServiceNotFoundError,
} from '../../exceptions/appointment.exceptions';

/**
 * 📅 BOOK APPOINTMENT USE CASE
 * ✅ Clean Architecture compliant
 * ✅ SOLID principles
 * ✅ TDD approach
 * ✅ Rich validation and business rules
 */

export interface BookAppointmentRequest {
  readonly businessId: string;
  readonly calendarId: string;
  readonly serviceId: string;
  readonly timeSlot: {
    readonly startTime: Date;
    readonly endTime: Date;
  };
  readonly clientInfo: {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly phone?: string;
    readonly dateOfBirth?: Date;
    readonly notes?: string;
    readonly isNewClient: boolean;
  };
  readonly type: AppointmentType;
  readonly assignedStaffId?: string;
  readonly title?: string;
  readonly description?: string;
  readonly notes?: string;
  readonly requestingUserId: string;
  readonly metadata?: {
    readonly source?: 'ONLINE' | 'PHONE' | 'WALK_IN' | 'ADMIN';
    readonly userAgent?: string;
    readonly ipAddress?: string;
    readonly referralSource?: string;
    readonly tags?: string[];
    readonly customFields?: Record<string, any>;
  };
}

export interface BookAppointmentResponse {
  readonly success: boolean;
  readonly appointment: {
    readonly id: string;
    readonly businessId: string;
    readonly calendarId: string;
    readonly serviceId: string;
    readonly timeSlot: {
      readonly startTime: Date;
      readonly endTime: Date;
    };
    readonly clientInfo: {
      readonly firstName: string;
      readonly lastName: string;
      readonly email: string;
      readonly phone?: string;
      readonly isNewClient: boolean;
    };
    readonly type: AppointmentType;
    readonly status: AppointmentStatus;
    readonly pricing: {
      readonly basePrice: {
        readonly amount: number;
        readonly currency: string;
      };
      readonly totalAmount: {
        readonly amount: number;
        readonly currency: string;
      };
      readonly paymentStatus: string;
    };
    readonly assignedStaffId?: string;
    readonly title?: string;
    readonly description?: string;
    readonly createdAt: Date;
  };
  readonly message: string;
}

export class BookAppointmentUseCase {
  private static readonly MINIMUM_BOOKING_NOTICE_HOURS = 2;

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly businessRepository: BusinessRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly calendarRepository: CalendarRepository,
    private readonly logger: ILogger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: BookAppointmentRequest,
  ): Promise<BookAppointmentResponse> {
    this.logger.log('Booking appointment', {
      businessId: request.businessId,
      serviceId: request.serviceId,
      calendarId: request.calendarId,
      clientEmail: request.clientInfo.email,
      timeSlot: request.timeSlot,
      requestingUserId: request.requestingUserId,
    });

    try {
      // 1. Validation initiale
      this.validateRequest(request);

      // 2. Validation des entités
      const service = await this.validateService(request.serviceId);

      // 3. Validation des règles métier
      await this.validateBusinessRules(request, service);

      // 4. Vérification des conflits
      await this.validateTimeSlotAvailability(request);

      // 5. Création du rendez-vous
      const appointment = this.createAppointment(request, service);

      // 6. Sauvegarde
      await this.appointmentRepository.save(appointment);

      // 7. Log de succès
      const logMessage = request.clientInfo.isNewClient
        ? `Appointment booked successfully for new client: ${request.clientInfo.email}`
        : `Appointment booked successfully for client: ${request.clientInfo.email}`;

      this.logger.log(logMessage, {
        appointmentId: appointment.id.getValue(),
        businessId: request.businessId,
        serviceId: request.serviceId,
      });

      return {
        success: true,
        appointment: this.mapToResponse(appointment),
        message: this.i18n.t('appointment.booking.success'),
      };
    } catch (error) {
      this.logger.error('Failed to book appointment', {
        error: error instanceof Error ? error.message : String(error),
        request,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private validateRequest(request: BookAppointmentRequest): void {
    if (!request.businessId) {
      throw new AppointmentValidationError(
        'businessId',
        request.businessId,
        'Business ID is required',
      );
    }

    if (!request.calendarId) {
      throw new AppointmentValidationError(
        'calendarId',
        request.calendarId,
        'Calendar ID is required',
      );
    }

    if (!request.serviceId) {
      throw new AppointmentValidationError(
        'serviceId',
        request.serviceId,
        'Service ID is required',
      );
    }

    if (!request.timeSlot?.startTime || !request.timeSlot?.endTime) {
      throw new AppointmentValidationError(
        'timeSlot',
        request.timeSlot,
        'Valid time slot is required',
      );
    }

    if (
      !request.clientInfo?.firstName ||
      !request.clientInfo?.lastName ||
      !request.clientInfo?.email
    ) {
      throw new AppointmentValidationError(
        'clientInfo',
        request.clientInfo,
        'Client information is incomplete',
      );
    }

    if (!request.requestingUserId) {
      throw new AppointmentValidationError(
        'requestingUserId',
        request.requestingUserId,
        'Requesting user ID is required',
      );
    }
  }

  private async validateBusiness(businessId: string) {
    const business = await this.businessRepository.findById(
      BusinessId.create(businessId),
    );

    if (!business) {
      throw new BusinessNotFoundError(businessId);
    }

    if (!business.isActive()) {
      throw new BusinessInactiveError(businessId);
    }

    return business;
  }

  private async validateService(serviceId: string) {
    const service = await this.serviceRepository.findById(
      ServiceId.create(serviceId),
    );

    if (!service) {
      throw new ServiceNotFoundError(serviceId);
    }

    if (!service.isActive()) {
      throw new ServiceInactiveError(serviceId);
    }

    if (!service.isBookable()) {
      this.logger.error('Service does not allow online booking', {
        serviceId,
        allowOnlineBooking: false,
      });
      throw new ServiceNotBookableOnlineError(serviceId);
    }

    return service;
  }

  private async validateCalendar(calendarId: string) {
    const calendar = await this.calendarRepository.findById(
      CalendarId.create(calendarId),
    );

    if (!calendar) {
      throw new CalendarNotFoundError(calendarId);
    }

    if (!calendar.isActive()) {
      throw new CalendarInactiveError(calendarId);
    }

    return calendar;
  }

  private async validateBusinessRules(
    request: BookAppointmentRequest,
    service: any,
  ): Promise<void> {
    const now = new Date();
    const appointmentStart = new Date(request.timeSlot.startTime);
    const minimumNoticeTime = new Date(
      now.getTime() +
        BookAppointmentUseCase.MINIMUM_BOOKING_NOTICE_HOURS * 60 * 60 * 1000,
    );

    // Vérifier que le rendez-vous est dans le futur
    if (appointmentStart <= now) {
      throw new AppointmentInPastError(appointmentStart);
    }

    // Vérifier le préavis minimum
    if (appointmentStart < minimumNoticeTime) {
      throw new MinimumBookingNoticeError(
        BookAppointmentUseCase.MINIMUM_BOOKING_NOTICE_HOURS,
        appointmentStart,
      );
    }

    // Vérifier que la durée correspond au service
    const appointmentDuration =
      (request.timeSlot.endTime.getTime() -
        request.timeSlot.startTime.getTime()) /
      (1000 * 60);
    const serviceDuration = service.getDuration();

    if (Math.abs(appointmentDuration - serviceDuration) > 5) {
      // Tolérance de 5 minutes
      throw new AppointmentValidationError(
        'duration',
        appointmentDuration,
        `Appointment duration (${appointmentDuration}min) does not match service duration (${serviceDuration}min)`,
      );
    }
  }

  private async validateTimeSlotAvailability(
    request: BookAppointmentRequest,
  ): Promise<void> {
    const conflictingAppointments =
      await this.appointmentRepository.findConflictingAppointments(
        CalendarId.create(request.calendarId),
        new Date(request.timeSlot.startTime),
        new Date(request.timeSlot.endTime),
      );

    if (conflictingAppointments.length > 0) {
      const conflictingId = conflictingAppointments[0].id.getValue();
      throw new AppointmentConflictError(request.timeSlot, conflictingId);
    }
  }

  private createAppointment(
    request: BookAppointmentRequest,
    service: any,
  ): Appointment {
    const timeSlot = TimeSlot.create(
      new Date(request.timeSlot.startTime),
      new Date(request.timeSlot.endTime),
    );

    const clientEmail = Email.create(request.clientInfo.email);
    const clientPhone = request.clientInfo.phone
      ? Phone.create(request.clientInfo.phone)
      : undefined;

    const clientInfo = {
      firstName: request.clientInfo.firstName,
      lastName: request.clientInfo.lastName,
      email: clientEmail,
      phone: clientPhone,
      dateOfBirth: request.clientInfo.dateOfBirth,
      notes: request.clientInfo.notes,
      isNewClient: request.clientInfo.isNewClient,
    };

    const pricing = {
      basePrice: service.getPrice(),
      totalAmount: service.getPrice(),
      paymentStatus: 'PENDING' as const,
    };

    return Appointment.create({
      businessId: BusinessId.create(request.businessId),
      calendarId: CalendarId.create(request.calendarId),
      serviceId: ServiceId.create(request.serviceId),
      timeSlot,
      clientInfo,
      type: request.type,
      pricing,
      assignedStaffId: request.assignedStaffId
        ? UserId.create(request.assignedStaffId)
        : undefined,
      title: request.title,
      description: request.description,
      metadata: request.metadata
        ? {
            source: request.metadata.source || 'ONLINE',
            userAgent: request.metadata.userAgent,
            ipAddress: request.metadata.ipAddress,
            referralSource: request.metadata.referralSource,
            tags: request.metadata.tags,
            customFields: request.metadata.customFields,
          }
        : undefined,
    });
  }

  private mapToResponse(
    appointment: Appointment,
  ): BookAppointmentResponse['appointment'] {
    return {
      id: appointment.id.getValue(),
      businessId: appointment.businessId.getValue(),
      calendarId: appointment.calendarId.getValue(),
      serviceId: appointment.serviceId.getValue(),
      timeSlot: {
        startTime: appointment.timeSlot.getStartTime(),
        endTime: appointment.timeSlot.getEndTime(),
      },
      clientInfo: {
        firstName: appointment.clientInfo.firstName,
        lastName: appointment.clientInfo.lastName,
        email: appointment.clientInfo.email.getValue(),
        phone: appointment.clientInfo.phone?.getValue(),
        isNewClient: appointment.clientInfo.isNewClient,
      },
      type: appointment.type,
      status: appointment.status,
      pricing: {
        basePrice: {
          amount: appointment.pricing.basePrice.getAmount(),
          currency: appointment.pricing.basePrice.getCurrency(),
        },
        totalAmount: {
          amount: appointment.pricing.totalAmount.getAmount(),
          currency: appointment.pricing.totalAmount.getCurrency(),
        },
        paymentStatus: appointment.pricing.paymentStatus,
      },
      assignedStaffId: appointment.assignedStaffId?.getValue(),
      title: appointment.title,
      description: appointment.description,
      createdAt: appointment.createdAt,
    };
  }
}
