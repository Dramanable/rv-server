/**
 * 🗓️ Calendar Domain Exceptions
 * 
 * Exceptions spécifiques au domaine Calendar avec support i18n
 */

export class InvalidCalendarDataError extends Error {
  public readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = 'InvalidCalendarDataError';
    this.field = field;
  }
}

export class CalendarNotFoundError extends Error {
  public readonly calendarId: string;

  constructor(calendarId: string) {
    super(`Calendar with ID '${calendarId}' not found`);
    this.name = 'CalendarNotFoundError';
    this.calendarId = calendarId;
  }
}

export class CalendarConflictError extends Error {
  public readonly startTime: Date;
  public readonly endTime: Date;
  public readonly calendarId: string;

  constructor(calendarId: string, startTime: Date, endTime: Date) {
    super(`Calendar conflict detected for calendar '${calendarId}' between ${startTime.toISOString()} and ${endTime.toISOString()}`);
    this.name = 'CalendarConflictError';
    this.calendarId = calendarId;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}

export class InvalidTimeSlotError extends Error {
  public readonly startTime: Date;
  public readonly endTime: Date;

  constructor(startTime: Date, endTime: Date, reason?: string) {
    const message = reason 
      ? `Invalid time slot (${startTime.toISOString()} - ${endTime.toISOString()}): ${reason}`
      : `Invalid time slot: ${startTime.toISOString()} - ${endTime.toISOString()}`;
    super(message);
    this.name = 'InvalidTimeSlotError';
    this.startTime = startTime;
    this.endTime = endTime;
  }
}

export class CalendarPermissionError extends Error {
  public readonly calendarId: string;
  public readonly userId: string;
  public readonly operation: string;

  constructor(calendarId: string, userId: string, operation: string) {
    super(`User '${userId}' not authorized for operation '${operation}' on calendar '${calendarId}'`);
    this.name = 'CalendarPermissionError';
    this.calendarId = calendarId;
    this.userId = userId;
    this.operation = operation;
  }
}
