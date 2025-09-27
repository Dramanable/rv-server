/**
 * 📅 DOMAIN EXCEPTIONS - Appointment
 * Exceptions spécifiques au domaine des rendez-vous
 */

import { DomainException } from "./domain.exception";

export class AppointmentException extends DomainException {
  constructor(
    message: string,
    code: string,
    metadata?: Record<string, unknown>,
  ) {
    super(message, code, metadata);
  }
}

export class AppointmentValidationError extends AppointmentException {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, "APPOINTMENT_VALIDATION_ERROR", metadata);
  }
}

export class AppointmentNotFoundError extends AppointmentException {
  constructor(appointmentId: string, metadata?: Record<string, unknown>) {
    super(
      `Appointment with id ${appointmentId} not found`,
      "APPOINTMENT_NOT_FOUND",
      { appointmentId, ...metadata },
    );
  }
}

export class AppointmentConflictError extends AppointmentException {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, "APPOINTMENT_CONFLICT", metadata);
  }
}

export class AppointmentStatusError extends AppointmentException {
  constructor(
    currentStatus: string,
    attemptedAction: string,
    metadata?: Record<string, unknown>,
  ) {
    super(
      `Cannot ${attemptedAction} appointment with status ${currentStatus}`,
      "APPOINTMENT_STATUS_ERROR",
      { currentStatus, attemptedAction, ...metadata },
    );
  }
}

export class AppointmentBookingError extends AppointmentException {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, "APPOINTMENT_BOOKING_ERROR", metadata);
  }
}
