/**
 * 🆔 CLIENT ID VALUE OBJECT
 * ✅ Clean Architecture - Domain Layer
 */

import { generateId } from "@shared/utils/id.utils";
import {
  InvalidFormatError,
  RequiredValueError,
} from "../exceptions/value-object.exceptions";

export class ClientId {
  constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim() === "") {
      throw new RequiredValueError("client_id");
    }

    // UUID format validation (basic)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new InvalidFormatError("client_id", value, "UUID format");
    }
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: ClientId): boolean {
    return this.value === other.value;
  }

  static generate(): ClientId {
    return new ClientId(generateId());
  }

  static fromString(value: string): ClientId {
    return new ClientId(value);
  }
}
