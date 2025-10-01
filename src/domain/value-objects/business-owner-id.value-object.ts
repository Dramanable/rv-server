/**
 * 🆔 BUSINESS OWNER ID VALUE OBJECT
 * ✅ Clean Architecture - Domain Layer
 */

import { generateId } from "@shared/utils/id.utils";
import { ValueObjectValidationError } from "../exceptions/domain.exceptions";

export class BusinessOwnerId {
  constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim() === "") {
      throw new ValueObjectValidationError(
        "BUSINESS_OWNER_ID_EMPTY",
        "BusinessOwner ID cannot be empty",
        { value },
      );
    }

    // UUID format validation (basic)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new ValueObjectValidationError(
        "BUSINESS_OWNER_ID_INVALID_FORMAT",
        "BusinessOwner ID must be a valid UUID",
        { value },
      );
    }
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: BusinessOwnerId): boolean {
    return this.value === other.value;
  }

  static generate(): BusinessOwnerId {
    return new BusinessOwnerId(generateId());
  }

  static fromString(value: string): BusinessOwnerId {
    return new BusinessOwnerId(value);
  }
}
