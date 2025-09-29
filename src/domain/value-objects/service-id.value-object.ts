import { v4 as uuidv4 } from 'uuid';

import {
  RequiredValueError,
  InvalidFormatError,
} from '../exceptions/value-object.exceptions';

export class ServiceId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new RequiredValueError('service_id');
    }
    this.validateFormat(value);
  }

  private validateFormat(value: string): void {
    // Validation UUID v4
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new InvalidFormatError('service_id', value, 'UUID v4 format');
    }
  }

  static generate(): ServiceId {
    return new ServiceId(uuidv4());
  }

  static create(value: string): ServiceId {
    return new ServiceId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ServiceId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
