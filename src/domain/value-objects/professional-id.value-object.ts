/**
 * 🆔 PROFESSIONAL ID VALUE OBJECT
 * ✅ Clean Architecture - Domain Layer
 */

import { generateId } from '@shared/utils/id.utils';
import { ValueObjectValidationError } from '../exceptions/domain.exceptions';

export class ProfessionalId {
  constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim() === '') {
      throw new ValueObjectValidationError(
        'PROFESSIONAL_ID_EMPTY',
        'Professional ID cannot be empty',
        { value },
      );
    }

    // UUID format validation (basic)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new ValueObjectValidationError(
        'PROFESSIONAL_ID_INVALID_FORMAT',
        'Professional ID must be a valid UUID',
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

  equals(other: ProfessionalId): boolean {
    return this.value === other.value;
  }

  static generate(): ProfessionalId {
    return new ProfessionalId(generateId());
  }

  static fromString(value: string): ProfessionalId {
    return new ProfessionalId(value);
  }
}
