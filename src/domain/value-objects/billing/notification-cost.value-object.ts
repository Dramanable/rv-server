import { DomainError } from '../../exceptions/domain.exceptions';

export class NotificationCost {
  private constructor(
    private readonly amount: number,
    private readonly currency: 'EUR' | 'USD',
  ) {
    this.validate();
  }

  static create(amount: number, currency: 'EUR' | 'USD'): NotificationCost {
    return new NotificationCost(amount, currency);
  }

  static zero(currency: 'EUR' | 'USD' = 'EUR'): NotificationCost {
    return new NotificationCost(0, currency);
  }

  static fromEmailCount(count: number, unitPrice = 0.02): NotificationCost {
    const amount = Math.round(count * unitPrice * 1000) / 1000; // Arrondir à 3 décimales
    return new NotificationCost(amount, 'EUR');
  }

  static fromSMSCount(count: number, unitPrice = 0.08): NotificationCost {
    const amount = Math.round(count * unitPrice * 1000) / 1000; // Arrondir à 3 décimales
    return new NotificationCost(amount, 'EUR');
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new DomainError('Notification cost cannot be negative');
    }

    if (!['EUR', 'USD'].includes(this.currency)) {
      throw new DomainError('Currency must be EUR or USD');
    }

    // Validation précision (3 décimales max pour calculs intermédiaires)
    if (Math.round(this.amount * 1000) !== this.amount * 1000) {
      throw new DomainError('Cost must have maximum 3 decimal places');
    }
  }

  add(other: NotificationCost): NotificationCost {
    if (this.currency !== other.currency) {
      throw new DomainError('Cannot add costs with different currencies');
    }
    const resultAmount = Math.round((this.amount + other.amount) * 1000) / 1000; // Arrondir à 3 décimales
    return new NotificationCost(resultAmount, this.currency);
  }

  subtract(other: NotificationCost): NotificationCost {
    if (this.currency !== other.currency) {
      throw new DomainError('Cannot subtract costs with different currencies');
    }
    const resultAmount = Math.round((this.amount - other.amount) * 1000) / 1000; // Arrondir à 3 décimales
    if (resultAmount < 0) {
      throw new DomainError('Subtraction result cannot be negative');
    }
    return new NotificationCost(resultAmount, this.currency);
  }

  multiply(factor: number): NotificationCost {
    if (factor < 0) {
      throw new DomainError('Factor cannot be negative');
    }
    const resultAmount = Math.round(this.amount * factor * 1000) / 1000; // Arrondir à 3 décimales
    return new NotificationCost(resultAmount, this.currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
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
    return this.amount === other.amount && this.currency === other.currency;
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
