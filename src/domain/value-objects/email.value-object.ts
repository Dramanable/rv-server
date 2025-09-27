export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    const trimmedValue = value.trim().toLowerCase();

    if (!Email.EMAIL_REGEX.test(trimmedValue)) {
      throw new Error('Invalid email format');
    }

    if (trimmedValue.length > 254) {
      throw new Error('Email is too long');
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
