import { ApplicationException } from './application.exceptions';

/**
 * 📅 APPOINTMENT EXCEPTIONS
 * ✅ Clean Architecture compliant
 * ✅ Application layer exceptions for appointment use cases
 */

export class AppointmentException extends ApplicationException {
  constructor(message: string, code: string, context?: any) {
    super(message, code, context);
    this.name = 'AppointmentException';
  }
}

export class BusinessNotFoundError extends AppointmentException {
  constructor(businessId: string) {
    super(`Business with ID ${businessId} not found`, 'BUSINESS_NOT_FOUND', {
      businessId,
    });
    this.name = 'BusinessNotFoundError';
  }
}

export class ServiceNotFoundError extends AppointmentException {
  constructor(serviceId: string) {
    super(`Service with ID ${serviceId} not found`, 'SERVICE_NOT_FOUND', {
      serviceId,
    });
    this.name = 'ServiceNotFoundError';
  }
}

export class CalendarNotFoundError extends AppointmentException {
  constructor(calendarId: string) {
    super(`Calendar with ID ${calendarId} not found`, 'CALENDAR_NOT_FOUND', {
      calendarId,
    });
    this.name = 'CalendarNotFoundError';
  }
}

export class AppointmentNotFoundError extends AppointmentException {
  constructor(appointmentId: string) {
    super(
      `Appointment with ID ${appointmentId} not found`,
      'APPOINTMENT_NOT_FOUND',
      { appointmentId },
    );
    this.name = 'AppointmentNotFoundError';
  }
}

export class AppointmentConflictError extends AppointmentException {
  constructor(
    timeSlot: { startTime: Date; endTime: Date },
    conflictingAppointmentId?: string,
  ) {
    super(
      `Time slot conflict: ${timeSlot.startTime.toISOString()} - ${timeSlot.endTime.toISOString()}`,
      'APPOINTMENT_CONFLICT',
      { timeSlot, conflictingAppointmentId },
    );
    this.name = 'AppointmentConflictError';
  }
}

export class InvalidAppointmentStatusError extends AppointmentException {
  constructor(currentStatus: string, attemptedOperation: string) {
    super(
      `Cannot ${attemptedOperation} appointment with status ${currentStatus}`,
      'INVALID_APPOINTMENT_STATUS',
      { currentStatus, attemptedOperation },
    );
    this.name = 'InvalidAppointmentStatusError';
  }
}

export class AppointmentInPastError extends AppointmentException {
  constructor(appointmentTime: Date) {
    super(
      `Cannot book appointment in the past: ${appointmentTime.toISOString()}`,
      'APPOINTMENT_IN_PAST',
      { appointmentTime },
    );
    this.name = 'AppointmentInPastError';
  }
}

export class MinimumBookingNoticeError extends AppointmentException {
  constructor(minimumHours: number, attemptedTime: Date) {
    super(
      `Minimum booking notice is ${minimumHours} hours. Attempted time: ${attemptedTime.toISOString()}`,
      'MINIMUM_BOOKING_NOTICE',
      { minimumHours, attemptedTime },
    );
    this.name = 'MinimumBookingNoticeError';
  }
}

export class BusinessInactiveError extends AppointmentException {
  constructor(businessId: string) {
    super(
      `Business ${businessId} is inactive and cannot accept appointments`,
      'BUSINESS_INACTIVE',
      { businessId },
    );
    this.name = 'BusinessInactiveError';
  }
}

export class ServiceInactiveError extends AppointmentException {
  constructor(serviceId: string) {
    super(
      `Service ${serviceId} is inactive and unavailable for booking`,
      'SERVICE_INACTIVE',
      { serviceId },
    );
    this.name = 'ServiceInactiveError';
  }
}

export class CalendarInactiveError extends AppointmentException {
  constructor(calendarId: string) {
    super(
      `Calendar ${calendarId} is inactive and unavailable for booking`,
      'CALENDAR_INACTIVE',
      { calendarId },
    );
    this.name = 'CalendarInactiveError';
  }
}

export class AppointmentValidationError extends AppointmentException {
  constructor(field: string, value: any, reason: string) {
    super(
      `Validation error for field '${field}': ${reason}`,
      'APPOINTMENT_VALIDATION_ERROR',
      { field, value, reason },
    );
    this.name = 'AppointmentValidationError';
  }
}

export class AppointmentCapacityExceededError extends AppointmentException {
  constructor(requestedCapacity: number, maxCapacity: number) {
    super(
      `Requested capacity ${requestedCapacity} exceeds maximum capacity ${maxCapacity}`,
      'APPOINTMENT_CAPACITY_EXCEEDED',
      { requestedCapacity, maxCapacity },
    );
    this.name = 'AppointmentCapacityExceededError';
  }
}

export class StaffUnavailableError extends AppointmentException {
  constructor(staffId: string, timeSlot: { startTime: Date; endTime: Date }) {
    super(
      `Staff member ${staffId} is unavailable during ${timeSlot.startTime.toISOString()} - ${timeSlot.endTime.toISOString()}`,
      'STAFF_UNAVAILABLE',
      { staffId, timeSlot },
    );
    this.name = 'StaffUnavailableError';
  }
}
