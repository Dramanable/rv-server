import {
  RequiredValueError,
  InvalidFormatError,
  ValueTooLongError,
} from '../exceptions/value-object.exceptions';

export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new RequiredValueError('email');
    }

    const trimmedValue = value.trim().toLowerCase();

    if (!Email.EMAIL_REGEX.test(trimmedValue)) {
      throw new InvalidFormatError('email', trimmedValue, 'user@domain.com');
    }

    if (trimmedValue.length > 254) {
      throw new ValueTooLongError('email', 254, trimmedValue.length);
    }
  }

  static create(value: string): Email {
    return new Email(value.trim().toLowerCase());
  }

  getValue(): string {
    return this.value;
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }

  getLocalPart(): string {
    return this.value.split('@')[0];
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
