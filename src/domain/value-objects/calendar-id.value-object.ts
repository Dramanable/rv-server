import { v4 as uuidv4 } from 'uuid';
import { ValueObjectValidationError } from '../exceptions/domain.exceptions';

export class CalendarId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new ValueObjectValidationError(
        'CALENDAR_ID_EMPTY',
        'CalendarId cannot be empty',
        { value },
      );
    }
    this.validateFormat(value);
  }

  private validateFormat(value: string): void {
    // Validation UUID v4
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new ValueObjectValidationError(
        'CALENDAR_ID_INVALID_FORMAT',
        'CalendarId must be a valid UUID v4',
        { value },
      );
    }
  }

  static generate(): CalendarId {
    return new CalendarId(uuidv4());
  }

  static create(value: string): CalendarId {
    return new CalendarId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CalendarId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
