import { DomainException } from "./domain.exception";

/**
 * 🚨 Base exception for CalendarType domain errors
 */
export abstract class CalendarTypeException extends DomainException {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, code, context);
  }
}

/**
 * ✋ CalendarType validation error
 */
export class CalendarTypeValidationError extends CalendarTypeException {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "CALENDAR_TYPE_VALIDATION_ERROR", context);
  }
}

/**
 * 🔍 CalendarType not found error
 */
export class CalendarTypeNotFoundError extends CalendarTypeException {
  constructor(id: string, context?: Record<string, any>) {
    super(`CalendarType with id ${id} not found`, "CALENDAR_TYPE_NOT_FOUND", {
      ...context,
      calendarTypeId: id,
    });
  }
}

/**
 * ⚔️ CalendarType already exists error
 */
export class CalendarTypeAlreadyExistsError extends CalendarTypeException {
  constructor(value: string, message: string, context?: Record<string, any>) {
    super(message, "CALENDAR_TYPE_ALREADY_EXISTS", { ...context, value });
  }
}

/**
 * ⚔️ CalendarType code conflict error
 */
export class CalendarTypeCodeConflictError extends CalendarTypeException {
  constructor(code: string, businessId: string, context?: Record<string, any>) {
    super(
      `CalendarType with code ${code} already exists in business ${businessId}`,
      "CALENDAR_TYPE_CODE_CONFLICT",
      { ...context, code, businessId },
    );
  }
}

/**
 * 🗓️ Calendar validation error
 */
export class CalendarValidationError extends CalendarTypeException {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "CALENDAR_VALIDATION_ERROR", context);
  }
}

/**
 * 🔒 CalendarType built-in modification error
 */
export class CalendarTypeBuiltInModificationError extends CalendarTypeException {
  constructor(id: string, context?: Record<string, any>) {
    super(
      `Cannot modify built-in CalendarType ${id}`,
      "CALENDAR_TYPE_BUILTIN_MODIFICATION_ERROR",
      { ...context, calendarTypeId: id },
    );
  }
}
