import { DomainError } from '../../exceptions/domain.exceptions';

export class NotificationCost {
  private constructor(
    private readonly amount: number,
    private readonly currency: string,
    private readonly emailCount: number = 0,
    private readonly smsCount: number = 0,
  ) {
    this.validate();
  }

  static create(amount: number, currency: string): NotificationCost {
    return new NotificationCost(amount, currency, 0, 0);
  }

  static zero(currency: string = 'EUR'): NotificationCost {
    return new NotificationCost(0, currency, 0, 0);
  }

  static fromEmailCount(
    count: number,
    unitPrice = 0.02,
    currency = 'EUR',
  ): NotificationCost {
    const amount = Math.round(count * unitPrice * 1000) / 1000; // Arrondir à 3 décimales
    return new NotificationCost(amount, currency, count, 0);
  }

  static fromSMSCount(
    count: number,
    unitPrice = 0.08,
    currency = 'EUR',
  ): NotificationCost {
    const amount = Math.round(count * unitPrice * 1000) / 1000; // Arrondir à 3 décimales
    return new NotificationCost(amount, currency, 0, count);
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new DomainError('Notification cost cannot be negative');
    }

    // Validation format devise ISO 4217 (3 lettres majuscules)
    if (!this.currency || !/^[A-Z]{3}$/.test(this.currency)) {
      throw new DomainError(
        'Currency must be a valid 3-letter ISO currency code (e.g., EUR, USD, GBP, CAD, JPY)',
      );
    }

    // Validation précision (3 décimales max pour calculs intermédiaires)
    if (Math.round(this.amount * 1000) !== this.amount * 1000) {
      throw new DomainError('Cost must have maximum 3 decimal places');
    }

    // Validation compteurs
    if (this.emailCount < 0 || this.smsCount < 0) {
      throw new DomainError('Notification counts cannot be negative');
    }
  }

  add(other: NotificationCost): NotificationCost {
    if (this.currency !== other.currency) {
      throw new DomainError('Cannot add costs with different currencies');
    }
    const resultAmount = Math.round((this.amount + other.amount) * 1000) / 1000; // Arrondir à 3 décimales
    const resultEmailCount = this.emailCount + other.emailCount;
    const resultSmsCount = this.smsCount + other.smsCount;
    return new NotificationCost(
      resultAmount,
      this.currency,
      resultEmailCount,
      resultSmsCount,
    );
  }

  subtract(other: NotificationCost): NotificationCost {
    if (this.currency !== other.currency) {
      throw new DomainError('Cannot subtract costs with different currencies');
    }
    const resultAmount = Math.round((this.amount - other.amount) * 1000) / 1000; // Arrondir à 3 décimales
    if (resultAmount < 0) {
      throw new DomainError('Subtraction result cannot be negative');
    }
    const resultEmailCount = Math.max(0, this.emailCount - other.emailCount);
    const resultSmsCount = Math.max(0, this.smsCount - other.smsCount);
    return new NotificationCost(
      resultAmount,
      this.currency,
      resultEmailCount,
      resultSmsCount,
    );
  }

  multiply(factor: number): NotificationCost {
    if (factor < 0) {
      throw new DomainError('Factor cannot be negative');
    }
    const resultAmount = Math.round(this.amount * factor * 1000) / 1000; // Arrondir à 3 décimales
    const resultEmailCount = Math.round(this.emailCount * factor);
    const resultSmsCount = Math.round(this.smsCount * factor);
    return new NotificationCost(
      resultAmount,
      this.currency,
      resultEmailCount,
      resultSmsCount,
    );
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  getEmailCount(): number {
    return this.emailCount;
  }

  getSmsCount(): number {
    return this.smsCount;
  }

  getFormattedAmount(): string {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(this.amount);
  }

  equals(other: NotificationCost): boolean {
    return (
      this.amount === other.amount &&
      this.currency === other.currency &&
      this.emailCount === other.emailCount &&
      this.smsCount === other.smsCount
    );
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  toJSON(): any {
    return {
      amount: this.amount,
      currency: this.currency,
      formattedAmount: this.getFormattedAmount(),
    };
  }

  toString(): string {
    return this.getFormattedAmount();
  }
}
