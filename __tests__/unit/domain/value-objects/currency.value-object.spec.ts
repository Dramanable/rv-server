/**
 * 🧪 Tests for Currency Value Object
 *
 * Test-Driven Development approach for currency validation and business logic
 */

import { DomainValidationError } from '@domain/exceptions/domain.exceptions';
import { Currency } from '@domain/value-objects/currency.value-object';

describe('Currency Value Object', () => {
  describe('Creation and Validation', () => {
    it('should create a valid currency', () => {
      const currency = Currency.create('EUR');

      expect(currency.getCode()).toBe('EUR');
      expect(currency.getName()).toBe('Euro');
      expect(currency.getSymbol()).toBe('€');
    });

    it('should create USD currency', () => {
      const currency = Currency.createUsd();

      expect(currency.getCode()).toBe('USD');
      expect(currency.getName()).toBe('US Dollar');
      expect(currency.getSymbol()).toBe('$');
    });

    it('should normalize currency code to uppercase', () => {
      const currency = Currency.create('eur');

      expect(currency.getCode()).toBe('EUR');
    });

    it('should throw error for empty currency', () => {
      expect(() => Currency.create('')).toThrow(DomainValidationError);
      expect(() => Currency.create('  ')).toThrow(DomainValidationError);
    });

    it('should throw error for invalid currency length', () => {
      expect(() => Currency.create('EU')).toThrow(DomainValidationError);
      expect(() => Currency.create('EURO')).toThrow(DomainValidationError);
    });

    it('should throw error for invalid currency format', () => {
      expect(() => Currency.create('E12')).toThrow(DomainValidationError);
      expect(() => Currency.create('€UR')).toThrow(DomainValidationError);
    });

    it('should throw error for unsupported currency', () => {
      expect(() => Currency.create('XYZ')).toThrow(DomainValidationError);
    });
  });

  describe('Factory Methods', () => {
    it('should create currency from country code', () => {
      const frCurrency = Currency.fromCountryCode('FR');
      const usCurrency = Currency.fromCountryCode('US');
      const gbCurrency = Currency.fromCountryCode('GB');

      expect(frCurrency.getCode()).toBe('EUR');
      expect(usCurrency.getCode()).toBe('USD');
      expect(gbCurrency.getCode()).toBe('GBP');
    });

    it('should fallback to EUR for unknown country', () => {
      const unknownCurrency = Currency.fromCountryCode('XX');

      expect(unknownCurrency.getCode()).toBe('EUR');
    });
  });

  describe('Currency Information', () => {
    it('should provide correct currency info for EUR', () => {
      const currency = Currency.create('EUR');
      const info = currency.getInfo();

      expect(info.code).toBe('EUR');
      expect(info.name).toBe('Euro');
      expect(info.symbol).toBe('€');
      expect(info.decimalPlaces).toBe(2);
      expect(info.regions).toContain('Europe');
    });

    it('should provide correct currency info for JPY', () => {
      const currency = Currency.create('JPY');
      const info = currency.getInfo();

      expect(info.code).toBe('JPY');
      expect(info.name).toBe('Japanese Yen');
      expect(info.symbol).toBe('¥');
      expect(info.decimalPlaces).toBe(0);
    });

    it('should identify zero decimal currencies', () => {
      const jpyCurrency = Currency.create('JPY');
      const eurCurrency = Currency.create('EUR');

      expect(jpyCurrency.isZeroDecimal()).toBe(true);
      expect(eurCurrency.isZeroDecimal()).toBe(false);
    });
  });

  describe('Formatting', () => {
    it('should format amount correctly for EUR', () => {
      const currency = Currency.create('EUR');

      const formatted = currency.formatAmount(1234.56);
      expect(formatted).toMatch(/€/);
      expect(formatted).toMatch(/1.*234.*56/);
    });

    it('should format amount correctly for JPY (no decimals)', () => {
      const currency = Currency.create('JPY');

      const formatted = currency.formatAmount(1234);
      expect(formatted).toMatch(/¥/);
      expect(formatted).toMatch(/1.*234/);
      expect(formatted).not.toMatch(/\./);
    });

    it('should format amount with custom locale', () => {
      const currency = Currency.create('USD');

      const usFormatted = currency.formatAmount(1234.56, 'en-US');
      const frFormatted = currency.formatAmount(1234.56, 'fr-FR');

      expect(usFormatted).toMatch(/\$1,234\.56/);
      expect(frFormatted).toMatch(/1\s234,56.*\$/);
    });
  });

  describe('Business Logic', () => {
    it('should compare currencies correctly', () => {
      const eur1 = Currency.create('EUR');
      const eur2 = Currency.create('EUR');
      const usd = Currency.create('USD');

      expect(eur1.equals(eur2)).toBe(true);
      expect(eur1.equals(usd)).toBe(false);
    });
  });

  describe('Static Methods', () => {
    it('should validate currency correctly', () => {
      expect(Currency.isValidCurrency('EUR')).toBe(true);
      expect(Currency.isValidCurrency('USD')).toBe(true);
      expect(Currency.isValidCurrency('eur')).toBe(true); // Should normalize
      expect(Currency.isValidCurrency('XYZ')).toBe(false);
      expect(Currency.isValidCurrency('EU')).toBe(false);
    });

    it('should return major currencies', () => {
      const major = Currency.getMajorCurrencies();

      expect(Array.isArray(major)).toBe(true);
      expect(major).toContain('EUR');
      expect(major).toContain('USD');
      expect(major).toContain('GBP');
      expect(major).toContain('JPY');
    });

    it('should return regional currencies', () => {
      const european = Currency.getEuropeanCurrencies();
      const american = Currency.getAmericanCurrencies();
      const asian = Currency.getAsianCurrencies();

      expect(european).toContain('EUR');
      expect(european).toContain('GBP');
      expect(american).toContain('USD');
      expect(american).toContain('CAD');
      expect(asian).toContain('JPY');
      expect(asian).toContain('CNY');
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const currency = Currency.create('EUR');

      expect(currency.toJSON()).toBe('EUR');
      expect(currency.toString()).toBe('EUR');
    });
  });
});
