import { v4 as uuidv4 } from 'uuid';
import { ValueObjectValidationError } from '../exceptions/domain.exceptions';

export class BusinessId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new ValueObjectValidationError(
        'BUSINESS_ID_EMPTY',
        'BusinessId cannot be empty',
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
        'BUSINESS_ID_INVALID_FORMAT',
        'BusinessId must be a valid UUID v4',
        { value },
      );
    }
  }

  static generate(): BusinessId {
    return new BusinessId(uuidv4());
  }

  static create(value: string): BusinessId {
    return new BusinessId(value);
  }

  static fromString(value: string): BusinessId {
    return new BusinessId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: BusinessId): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  toString(): string {
    return this.value;
  }
}
