/**
 * 💱 Currency Value Object
 *
 * Gestion stricte des devises avec validation ISO 4217 et support des principales monnaies.
 */

import { DomainValidationError } from '@domain/exceptions/domain.exceptions';

export interface CurrencyInfo {
  readonly code: string;
  readonly name: string;
  readonly symbol: string;
  readonly decimalPlaces: number;
  readonly regions: string[];
}

export class Currency {
  private constructor(private readonly code: string) {
    this.validateCurrency(code);
  }

  private validateCurrency(code: string): void {
    if (!code || code.trim().length === 0) {
      throw new DomainValidationError(
        'CURRENCY_EMPTY',
        'Currency code cannot be empty',
        { code },
      );
    }

    const normalizedCode = code.toUpperCase().trim();

    if (normalizedCode.length !== 3) {
      throw new DomainValidationError(
        'CURRENCY_INVALID_LENGTH',
        'Currency code must be exactly 3 characters (ISO 4217)',
        { code, expected: 'XXX format' },
      );
    }

    if (!/^[A-Z]{3}$/.test(normalizedCode)) {
      throw new DomainValidationError(
        'CURRENCY_INVALID_FORMAT',
        'Currency code must contain only uppercase letters',
        { code, format: 'ABC' },
      );
    }

    if (!this.isSupportedCurrency(normalizedCode)) {
      throw new DomainValidationError(
        'CURRENCY_NOT_SUPPORTED',
        'Currency is not supported',
        {
          code: normalizedCode,
          supported: this.getSupportedCurrencies().slice(0, 10),
        },
      );
    }
  }

  private isSupportedCurrency(code: string): boolean {
    return this.getSupportedCurrencies().includes(code);
  }

  private getSupportedCurrencies(): string[] {
    return Currency.getAllSupportedCurrenciesStatic();
  }

  private static getAllSupportedCurrenciesStatic(): string[] {
    return [
      // Major currencies
      'USD',
      'EUR',
      'GBP',
      'JPY',
      'CHF',
      'CAD',
      'AUD',
      'NZD',

      // European currencies
      'SEK',
      'NOK',
      'DKK',
      'PLN',
      'CZK',
      'HUF',
      'RON',
      'BGN',
      'HRK',
      'ISK',
      'TRY',
      'RUB',
      'UAH',

      // Asian currencies
      'CNY',
      'HKD',
      'SGD',
      'KRW',
      'THB',
      'MYR',
      'IDR',
      'PHP',
      'VND',
      'INR',
      'PKR',
      'BDT',
      'LKR',
      'NPR',
      'MMK',

      // Middle East & Africa
      'AED',
      'SAR',
      'QAR',
      'KWD',
      'BHD',
      'OMR',
      'JOD',
      'ILS',
      'EGP',
      'ZAR',
      'NGN',
      'KES',
      'GHS',
      'MAD',
      'TND',
      'DZD',

      // Americas
      'MXN',
      'BRL',
      'ARS',
      'CLP',
      'PEN',
      'COP',
      'VES',
      'UYU',
      'PYG',
      'BOB',
      'GTQ',
      'HNL',
      'NIO',
      'CRC',
      'PAB',
      'DOP',
      'JMD',
      'TTD',
      'BBD',
      'XCD',

      // Others
      'XOF',
      'XAF',
      'MGA',
      'MUR',
      'SCR',
      'SZL',
      'LSL',
      'BWP',
      'NAD',
      'ZMW',
      'MWK',
      'TZS',
      'UGX',
      'RWF',
      'ETB',
      'DJF',
      'SOS',
      'SDG',
      'SSP',
      'ERN',
      'LRD',
      'SLL',
      'GMD',
      'GNF',
      'CVE',
      'STP',
      'AOA',
      'MZN',
      'BIF',
      'KMF',
    ];
  }

  /**
   * Factory methods
   */
  static create(code: string): Currency {
    return new Currency(code.toUpperCase().trim());
  }

  static createEuro(): Currency {
    return new Currency('EUR');
  }

  static createUsd(): Currency {
    return new Currency('USD');
  }

  static fromCountryCode(countryCode: string): Currency {
    const countryCurrencies: Record<string, string> = {
      // Europe
      FR: 'EUR',
      DE: 'EUR',
      IT: 'EUR',
      ES: 'EUR',
      NL: 'EUR',
      BE: 'EUR',
      AT: 'EUR',
      PT: 'EUR',
      IE: 'EUR',
      FI: 'EUR',
      GR: 'EUR',
      LU: 'EUR',
      SI: 'EUR',
      SK: 'EUR',
      EE: 'EUR',
      LV: 'EUR',
      LT: 'EUR',
      MT: 'EUR',
      CY: 'EUR',
      GB: 'GBP',
      CH: 'CHF',
      NO: 'NOK',
      SE: 'SEK',
      DK: 'DKK',
      PL: 'PLN',
      CZ: 'CZK',
      HU: 'HUF',
      RO: 'RON',
      BG: 'BGN',
      HR: 'HRK',
      IS: 'ISK',
      TR: 'TRY',
      RU: 'RUB',
      UA: 'UAH',

      // Americas
      US: 'USD',
      CA: 'CAD',
      MX: 'MXN',
      BR: 'BRL',
      AR: 'ARS',
      CL: 'CLP',
      PE: 'PEN',
      CO: 'COP',
      VE: 'VES',
      UY: 'UYU',

      // Asia-Pacific
      JP: 'JPY',
      CN: 'CNY',
      HK: 'HKD',
      SG: 'SGD',
      KR: 'KRW',
      TH: 'THB',
      MY: 'MYR',
      ID: 'IDR',
      PH: 'PHP',
      VN: 'VND',
      IN: 'INR',
      AU: 'AUD',
      NZ: 'NZD',

      // Middle East & Africa
      AE: 'AED',
      SA: 'SAR',
      QA: 'QAR',
      KW: 'KWD',
      BH: 'BHD',
      IL: 'ILS',
      EG: 'EGP',
      ZA: 'ZAR',
      NG: 'NGN',
      KE: 'KES',
      GH: 'GHS',
      MA: 'MAD',
      TN: 'TND',
      DZ: 'DZD',
    };

    const currency = countryCurrencies[countryCode.toUpperCase()];
    return currency ? new Currency(currency) : Currency.createEuro();
  }

  /**
   * Business logic
   */
  getCode(): string {
    return this.code;
  }

  getInfo(): CurrencyInfo {
    const currencyData: Record<string, CurrencyInfo> = {
      EUR: {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        decimalPlaces: 2,
        regions: ['Europe'],
      },
      USD: {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        decimalPlaces: 2,
        regions: ['North America'],
      },
      GBP: {
        code: 'GBP',
        name: 'British Pound Sterling',
        symbol: '£',
        decimalPlaces: 2,
        regions: ['United Kingdom'],
      },
      JPY: {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        decimalPlaces: 0,
        regions: ['Japan'],
      },
      CHF: {
        code: 'CHF',
        name: 'Swiss Franc',
        symbol: 'CHF',
        decimalPlaces: 2,
        regions: ['Switzerland'],
      },
      CAD: {
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'C$',
        decimalPlaces: 2,
        regions: ['Canada'],
      },
      AUD: {
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        decimalPlaces: 2,
        regions: ['Australia'],
      },
      CNY: {
        code: 'CNY',
        name: 'Chinese Yuan',
        symbol: '¥',
        decimalPlaces: 2,
        regions: ['China'],
      },
      INR: {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        decimalPlaces: 2,
        regions: ['India'],
      },
      BRL: {
        code: 'BRL',
        name: 'Brazilian Real',
        symbol: 'R$',
        decimalPlaces: 2,
        regions: ['Brazil'],
      },
    };

    return (
      currencyData[this.code] || {
        code: this.code,
        name: this.code,
        symbol: this.code,
        decimalPlaces: 2,
        regions: ['Unknown'],
      }
    );
  }

  getSymbol(): string {
    return this.getInfo().symbol;
  }

  getName(): string {
    return this.getInfo().name;
  }

  getDecimalPlaces(): number {
    return this.getInfo().decimalPlaces;
  }

  isZeroDecimal(): boolean {
    return this.getDecimalPlaces() === 0;
  }

  /**
   * Formatting
   */
  formatAmount(amount: number, locale = 'en-US'): string {
    const info = this.getInfo();

    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.code,
      minimumFractionDigits: info.decimalPlaces,
      maximumFractionDigits: info.decimalPlaces,
    });

    return formatter.format(amount);
  }

  /**
   * Comparison and conversion
   */
  equals(other: Currency): boolean {
    return this.code === other.code;
  }

  toString(): string {
    return this.code;
  }

  toJSON(): string {
    return this.code;
  }

  /**
   * Validation helpers
   */
  static isValidCurrency(code: string): boolean {
    try {
      new Currency(code);
      return true;
    } catch {
      return false;
    }
  }

  static getMajorCurrencies(): string[] {
    return ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY'];
  }

  static getAllSupportedCurrencies(): string[] {
    return Currency.getAllSupportedCurrenciesStatic();
  }

  /**
   * Business regions
   */
  static getEuropeanCurrencies(): string[] {
    return [
      'EUR',
      'GBP',
      'CHF',
      'SEK',
      'NOK',
      'DKK',
      'PLN',
      'CZK',
      'HUF',
      'RON',
      'BGN',
    ];
  }

  static getAmericanCurrencies(): string[] {
    return ['USD', 'CAD', 'MXN', 'BRL', 'ARS', 'CLP', 'PEN', 'COP'];
  }

  static getAsianCurrencies(): string[] {
    return [
      'JPY',
      'CNY',
      'HKD',
      'SGD',
      'KRW',
      'THB',
      'MYR',
      'IDR',
      'PHP',
      'VND',
      'INR',
    ];
  }
}
