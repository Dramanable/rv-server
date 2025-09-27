import {
  BookAppointmentRequest,
  BookAppointmentResponse,
} from '../../application/use-cases/appointments/book-appointment.use-case';
import {
  CancelAppointmentRequest,
  CancelAppointmentResponse,
} from '../../application/use-cases/appointments/cancel-appointment.use-case';
import { GetAvailableSlotsRequest } from '../../application/use-cases/appointments/get-available-slots-simple.use-case';
import {
  ListAppointmentsRequest,
  ListAppointmentsResponse,
} from '../../application/use-cases/appointments/list-appointments.use-case';
import { UpdateAppointmentRequest } from '../../application/use-cases/appointments/update-appointment.use-case';
import {
  Appointment,
  ClientInfo,
} from '../../domain/entities/appointment.entity';
import {
  AppointmentResponseDto,
  AvailableSlotResponseDto,
  BookAppointmentDto,
  BookAppointmentResponseDto,
  CancelAppointmentDto,
  CancelAppointmentResponseDto,
  ClientInfoWithBookedByResponseDto,
  GetAvailableSlotsDto,
  ListAppointmentsDto,
  ListAppointmentsResponseDto,
  UpdateAppointmentDto,
} from '../dtos/appointments';

export class AppointmentMapper {
  /**
   * Converts BookAppointmentDto to BookAppointmentRequest
   */
  static toBookAppointmentRequest(
    dto: BookAppointmentDto,
    requestingUserId: string,
  ): BookAppointmentRequest {
    return {
      businessId: dto.businessId,
      calendarId: dto.calendarId,
      serviceId: dto.serviceId,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      clientInfo: {
        firstName: dto.clientInfo.firstName,
        lastName: dto.clientInfo.lastName,
        email: dto.clientInfo.email,
        phone: dto.clientInfo.phone,
        isNewClient: dto.clientInfo.isNewClient ?? false,
        bookedBy: dto.clientInfo.bookedBy
          ? {
              firstName: dto.clientInfo.bookedBy.firstName,
              lastName: dto.clientInfo.bookedBy.lastName,
              email: dto.clientInfo.bookedBy.email,
              relationship: dto.clientInfo.bookedBy.relationship as any,
              relationshipDescription:
                dto.clientInfo.bookedBy.relationshipDescription,
            }
          : undefined,
      },
      title: dto.title,
      description: dto.description,
      source: 'ONLINE' as const,
      staffId: dto.assignedStaffId,
    };
  }

  /**
   * Converts BookAppointmentResponse to BookAppointmentResponseDto
   */
  static toBookAppointmentResponseDto(
    response: BookAppointmentResponse,
  ): BookAppointmentResponseDto {
    const appointmentData: AppointmentResponseDto = {
      id: response.appointmentId,
      businessId: '', // Not available in use case response
      calendarId: '', // Not available in use case response
      serviceId: '', // Not available in use case response
      timeSlot: {
        startTime: response.appointmentDetails.startTime.toISOString(),
        endTime: response.appointmentDetails.endTime.toISOString(),
        durationInMinutes: response.appointmentDetails.duration,
      },
      clientInfo: {
        firstName: response.clientInfo.fullName.split(' ')[0] || '',
        lastName:
          response.clientInfo.fullName.split(' ').slice(1).join(' ') || '',
        email: response.clientInfo.email,
        phone: response.clientInfo.phone,
        isNewClient: true, // Default
        bookedBy: undefined,
      },
      status: response.status as any,
      assignedStaffId: undefined,
      title: response.message,
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: appointmentData,
      meta: {
        confirmationCode: response.confirmationNumber,
        notificationSent: response.notifications.confirmationEmailSent,
      },
    };
  }

  /**
   * Converts GetAvailableSlotsDto to GetAvailableSlotsRequest
   */
  static toGetAvailableSlotsRequest(
    dto: GetAvailableSlotsDto,
    requestingUserId: string,
  ): GetAvailableSlotsRequest {
    return {
      businessId: dto.businessId,
      serviceId: dto.serviceId,
      calendarId: '', // Default calendar
      staffId: undefined,
      viewMode: 'DAY' as any, // Default
      referenceDate: new Date(dto.date),
      duration: undefined,
      includeUnavailableReasons: false,
      timeZone: 'UTC',
      requestingUserId,
    };
  }

  /**
   * Converts AvailableSlot domain object to AvailableSlotResponseDto
   */
  static toAvailableSlotResponseDto(slot: any): AvailableSlotResponseDto {
    return {
      slot: {
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        durationInMinutes: slot.durationMinutes || 30,
      },
      availableStaffId: slot.availableStaffId,
      isPreferred: slot.isPreferred || false,
    };
  }

  /**
   * Converts ListAppointmentsDto to ListAppointmentsRequest
   */
  static toListAppointmentsRequest(
    dto: ListAppointmentsDto,
    requestingUserId: string,
  ): ListAppointmentsRequest {
    return {
      requestingUserId,
      pagination: {
        page: dto.page || 1,
        limit: dto.limit || 10,
      },
      sorting: {
        sortBy: dto.sortBy || 'createdAt',
        sortOrder: dto.sortOrder || 'desc',
      },
      filters: {
        search: dto.search,
        businessId: dto.businessId,
        status: dto.status,
        fromDate: undefined, // dto doesn't have these
        toDate: undefined,
      },
    };
  }

  /**
   * Converts ListAppointmentsResponse to ListAppointmentsResponseDto
   */
  static toListAppointmentsResponseDto(
    response: ListAppointmentsResponse,
  ): ListAppointmentsResponseDto {
    return {
      success: true,
      data: response.appointments.map((appointment) =>
        this.toAppointmentResponseDto(appointment),
      ),
      meta: {
        currentPage: response.meta.currentPage,
        totalPages: response.meta.totalPages,
        totalItems: response.meta.totalItems,
        itemsPerPage: response.meta.itemsPerPage,
        hasNextPage: response.meta.hasNextPage,
        hasPrevPage: response.meta.hasPrevPage,
      },
    };
  }

  /**
   * Converts UpdateAppointmentDto to UpdateAppointmentRequest
   */
  static toUpdateAppointmentRequest(
    dto: UpdateAppointmentDto,
    appointmentId: string,
    requestingUserId: string,
  ): UpdateAppointmentRequest {
    return {
      appointmentId,
      requestingUserId,
      startTime: dto.startTime ? new Date(dto.startTime) : undefined,
      endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      title: dto.title,
      description: dto.description,
    };
  }

  /**
   * Converts CancelAppointmentDto to CancelAppointmentRequest
   */
  static toCancelAppointmentRequest(
    dto: CancelAppointmentDto,
    appointmentId: string,
    requestingUserId: string,
  ): CancelAppointmentRequest {
    return {
      appointmentId,
      requestingUserId,
      reason: dto.cancellationReason || 'No reason provided',
      notifyClient: dto.notifyClient ?? true,
    };
  }

  /**
   * Converts CancelAppointmentResponse to CancelAppointmentResponseDto
   */
  static toCancelAppointmentResponseDto(
    response: CancelAppointmentResponse,
    appointment: Appointment,
  ): CancelAppointmentResponseDto {
    return {
      success: true,
      data: AppointmentMapper.toAppointmentResponseDto(appointment),
      meta: {
        operation: 'CANCEL',
        cancellationReason: response.message,
        notificationSent: true,
        rebookingOffered: false,
      },
    };
  }

  /**
   * Converts domain Appointment to response DTO
   */
  static toAppointmentResponseDto(
    appointment: Appointment,
  ): AppointmentResponseDto {
    // Force TypeScript to recognize the domain entity methods
    const appt = appointment as any;
    const clientInfo = appt.getClientInfo();

    return {
      id: appt.getId().getValue(),
      businessId: appt.getBusinessId().getValue(),
      calendarId: appt.getCalendarId().getValue(),
      serviceId: appt.getServiceId().getValue(),
      timeSlot: {
        startTime: appt.timeSlot.getStartTime().toISOString(),
        endTime: appt.timeSlot.getEndTime().toISOString(),
        durationInMinutes: 30, // Default for now
      },
      clientInfo: {
        firstName: clientInfo.firstName,
        lastName: clientInfo.lastName,
        email: clientInfo.email.getValue(),
        phone: clientInfo.phone?.getValue(),
        isNewClient: clientInfo.isNewClient,
        bookedBy: clientInfo.bookedBy
          ? {
              firstName: clientInfo.bookedBy.firstName,
              lastName: clientInfo.bookedBy.lastName,
              email: clientInfo.bookedBy.email.getValue(),
              phone: undefined, // Not available in domain
              relationship: clientInfo.bookedBy.relationship,
              relationshipDescription:
                clientInfo.bookedBy.relationshipDescription,
            }
          : undefined,
      },
      status: appt.getStatus(),
      assignedStaffId: appt.getAssignedStaffId()?.getValue(),
      title: appt.getTitle() || 'Appointment',
      description: appt.getDescription() || '',
      createdAt: appt.getCreatedAt().toISOString(),
      updatedAt: appt.getUpdatedAt().toISOString(),
    };
  }

  /**
   * Converts domain ClientInfo to response DTO
   */
  static toClientInfoResponseDto(
    clientInfo: ClientInfo,
  ): ClientInfoWithBookedByResponseDto {
    return {
      firstName: clientInfo.firstName,
      lastName: clientInfo.lastName,
      email: clientInfo.email.getValue(),
      phone: clientInfo.phone?.getValue(),
      isNewClient: false, // Basic ClientInfo doesn't have this field
      bookedBy: undefined, // Basic ClientInfo doesn't support bookedBy
    };
  }
}
