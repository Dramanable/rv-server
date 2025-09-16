export class Phone {
  private static readonly PHONE_REGEX = /^\+?[\d\s\-\(\)\.]{8,20}$/;

  constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Phone number cannot be empty');
    }

    const cleanValue = this.cleanPhoneNumber(value);

    if (!Phone.PHONE_REGEX.test(cleanValue)) {
      throw new Error('Invalid phone number format');
    }
  }

  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/[\s\-\(\)\.]/g, '');
  }

  static create(value: string): Phone {
    return new Phone(value.trim());
  }

  getValue(): string {
    return this.value;
  }

  getCleanValue(): string {
    return this.cleanPhoneNumber(this.value);
  }

  getInternationalFormat(): string {
    const clean = this.getCleanValue();
    if (clean.startsWith('+')) {
      return clean;
    }
    if (clean.startsWith('0')) {
      return '+33' + clean.substring(1);
    }
    return '+' + clean;
  }

  equals(other: Phone): boolean {
    return this.getCleanValue() === other.getCleanValue();
  }

  toString(): string {
    return this.value;
  }
}
