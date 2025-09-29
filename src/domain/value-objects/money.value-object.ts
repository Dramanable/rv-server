import {
  NegativeAmountError,
  NonFiniteAmountError,
  InvalidDecimalPrecisionError,
  InvalidCurrencyError,
  UnsupportedCurrencyError,
  CurrencyMismatchError,
  NegativeResultError,
  InvalidMultiplierError,
  InvalidDivisorError,
} from '@domain/exceptions/money.exceptions';

export class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: string,
  ) {
    this.validateAmount(amount);
    this.validateCurrency(currency);
  }

  private validateAmount(amount: number): void {
    if (amount < 0) {
      throw new NegativeAmountError(amount);
    }

    if (!Number.isFinite(amount)) {
      throw new NonFiniteAmountError(amount);
    }

    // Vérifier que le montant n'a pas plus de 2 décimales
    if (Number((amount % 1).toFixed(2)) !== Number(amount % 1)) {
      throw new InvalidDecimalPrecisionError(amount);
    }
  }

  private validateCurrency(currency: string): void {
    if (!currency || currency.length !== 3) {
      throw new InvalidCurrencyError(
        currency,
        'Currency must be a valid 3-letter ISO code',
      );
    }

    const supportedCurrencies = ['EUR', 'USD', 'GBP', 'CAD', 'CHF', 'JPY'];
    if (!supportedCurrencies.includes(currency.toUpperCase())) {
      throw new UnsupportedCurrencyError(currency, supportedCurrencies);
    }
  }

  static create(amount: number, currency: string): Money {
    return new Money(amount, currency.toUpperCase());
  }

  static zero(currency: string): Money {
    return new Money(0, currency.toUpperCase());
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  // Operations
  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError('add', this.currency, other.currency);
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError(
        'subtract',
        this.currency,
        other.currency,
      );
    }

    const result = this.amount - other.amount;
    if (result < 0) {
      throw new NegativeResultError(
        'subtract',
        this.amount,
        other.amount,
        this.currency,
      );
    }

    return new Money(result, this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new InvalidMultiplierError(factor);
    }
    return new Money(this.amount * factor, this.currency);
  }

  divide(divisor: number): Money {
    if (divisor <= 0) {
      throw new InvalidDivisorError(divisor);
    }
    return new Money(this.amount / divisor, this.currency);
  }

  // Comparisons
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError('compare', this.currency, other.currency);
    }
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError('compare', this.currency, other.currency);
    }
    return this.amount < other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  // Formatting
  format(): string {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(this.amount);
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }

  // Utility methods
  toCents(): number {
    return Math.round(this.amount * 100);
  }

  static fromCents(cents: number, currency: string): Money {
    return new Money(cents / 100, currency);
  }

  // Serialization
  toJSON(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  static fromJSON(data: { amount: number; currency: string }): Money {
    return new Money(data.amount, data.currency);
  }
}
