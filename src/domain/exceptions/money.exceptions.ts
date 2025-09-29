/**
 * 🚨 Money Domain Exceptions
 * Clean Architecture - Domain Layer Exceptions
 *
 * @description Specialized exceptions for Money Value Object business rules
 * @author Clean Architecture Implementation
 * @date 2024
 */

/**
 * Base exception for all Money-related domain errors
 */
export class MoneyDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
    public readonly timestamp: Date = new Date(),
  ) {
    super(message);
    this.name = 'MoneyDomainError';
  }
}

/**
 * Thrown when amount validation fails
 */
export class InvalidAmountError extends MoneyDomainError {
  constructor(amount: number, reason: string) {
    super(`Invalid amount: ${amount}. ${reason}`, 'MONEY_INVALID_AMOUNT', {
      amount,
      reason,
    });
    this.name = 'InvalidAmountError';
  }
}

/**
 * Thrown when amount is negative but shouldn't be
 */
export class NegativeAmountError extends MoneyDomainError {
  constructor(amount: number) {
    super(`Amount cannot be negative: ${amount}`, 'MONEY_NEGATIVE_AMOUNT', {
      amount,
    });
    this.name = 'NegativeAmountError';
  }
}

/**
 * Thrown when amount has too many decimal places
 */
export class InvalidDecimalPrecisionError extends MoneyDomainError {
  constructor(amount: number) {
    super(
      `Amount cannot have more than 2 decimal places: ${amount}`,
      'MONEY_INVALID_DECIMAL_PRECISION',
      { amount, maxDecimalPlaces: 2 },
    );
    this.name = 'InvalidDecimalPrecisionError';
  }
}

/**
 * Thrown when amount is not a finite number
 */
export class NonFiniteAmountError extends MoneyDomainError {
  constructor(amount: number) {
    super(
      `Amount must be a finite number, got: ${amount}`,
      'MONEY_NON_FINITE_AMOUNT',
      { amount, isFinite: Number.isFinite(amount) },
    );
    this.name = 'NonFiniteAmountError';
  }
}

/**
 * Thrown when currency validation fails
 */
export class InvalidCurrencyError extends MoneyDomainError {
  constructor(currency: string, reason: string) {
    super(
      `Invalid currency: ${currency}. ${reason}`,
      'MONEY_INVALID_CURRENCY',
      { currency, reason },
    );
    this.name = 'InvalidCurrencyError';
  }
}

/**
 * Thrown when currency is not supported
 */
export class UnsupportedCurrencyError extends MoneyDomainError {
  constructor(currency: string, supportedCurrencies: string[]) {
    super(
      `Currency ${currency} is not supported. Supported currencies: ${supportedCurrencies.join(', ')}`,
      'MONEY_UNSUPPORTED_CURRENCY',
      { currency, supportedCurrencies },
    );
    this.name = 'UnsupportedCurrencyError';
  }
}

/**
 * Thrown when attempting operations with different currencies
 */
export class CurrencyMismatchError extends MoneyDomainError {
  constructor(operation: string, currency1: string, currency2: string) {
    super(
      `Cannot ${operation} amounts with different currencies: ${currency1} and ${currency2}`,
      'MONEY_CURRENCY_MISMATCH',
      { operation, currency1, currency2 },
    );
    this.name = 'CurrencyMismatchError';
  }
}

/**
 * Thrown when mathematical operation would result in negative amount
 */
export class NegativeResultError extends MoneyDomainError {
  constructor(
    operation: string,
    amount1: number,
    amount2: number,
    currency: string,
  ) {
    super(
      `${operation} operation would result in negative amount: ${amount1} - ${amount2}`,
      'MONEY_NEGATIVE_RESULT',
      { operation, amount1, amount2, currency, result: amount1 - amount2 },
    );
    this.name = 'NegativeResultError';
  }
}

/**
 * Thrown when attempting to multiply by negative number
 */
export class InvalidMultiplierError extends MoneyDomainError {
  constructor(multiplier: number) {
    super(
      `Cannot multiply by negative number: ${multiplier}`,
      'MONEY_INVALID_MULTIPLIER',
      { multiplier },
    );
    this.name = 'InvalidMultiplierError';
  }
}

/**
 * Thrown when attempting to divide by zero or negative number
 */
export class InvalidDivisorError extends MoneyDomainError {
  constructor(divisor: number) {
    super(
      `Cannot divide by zero or negative number: ${divisor}`,
      'MONEY_INVALID_DIVISOR',
      { divisor },
    );
    this.name = 'InvalidDivisorError';
  }
}
