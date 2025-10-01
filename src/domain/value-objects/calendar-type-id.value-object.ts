import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { ValueObjectValidationError } from "../exceptions/domain.exceptions";

/**
 * 🆔 CalendarType ID Value Object
 *
 * Represents a unique identifier for a CalendarType entity.
 * Ensures type safety and encapsulates UUID validation logic.
 */
export class CalendarTypeId {
  private constructor(private readonly value: string) {
    if (!CalendarTypeId.isValid(value)) {
      throw new ValueObjectValidationError(
        "CALENDAR_TYPE_ID_INVALID",
        `Invalid CalendarTypeId: ${value}`,
        { value },
      );
    }
  }

  /**
   * Create a new CalendarTypeId from string
   */
  static fromString(value: string): CalendarTypeId {
    return new CalendarTypeId(value);
  }

  /**
   * Generate a new random CalendarTypeId
   */
  static generate(): CalendarTypeId {
    return new CalendarTypeId(uuidv4());
  }

  /**
   * Get the string value of the ID
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Check if a string is a valid CalendarTypeId
   */
  static isValid(value: string): boolean {
    return typeof value === "string" && uuidValidate(value);
  }

  /**
   * Compare with another CalendarTypeId
   */
  equals(other: CalendarTypeId): boolean {
    return this.value === other.value;
  }

  /**
   * String representation
   */
  toString(): string {
    return this.value;
  }
}
