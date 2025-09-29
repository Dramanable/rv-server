import { v4 as uuidv4 } from 'uuid';
import { ValueObjectValidationError } from '../exceptions/domain.exceptions';

export class ServiceTypeId {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new ValueObjectValidationError(
        'SERVICE_TYPE_ID_EMPTY',
        'ServiceTypeId cannot be empty',
        { value },
      );
    }

    // Basic UUID validation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new ValueObjectValidationError(
        'SERVICE_TYPE_ID_INVALID_FORMAT',
        `Invalid ServiceTypeId format: ${value}`,
        { value },
      );
    }
  }

  static generate(): ServiceTypeId {
    return new ServiceTypeId(uuidv4());
  }

  static fromString(value: string): ServiceTypeId {
    return new ServiceTypeId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ServiceTypeId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
