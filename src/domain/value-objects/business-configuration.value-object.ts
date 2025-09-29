/**
 * ⚙️ Business Configuration Value Object
 *
 * Configuration globale et centralisée pour chaque business :
 * - Timezone (fuseau horaire)
 * - Currency (devise)
 * - Locale (langue et région)
 * - Autres paramètres techniques
 */

import { DomainValidationError } from '@domain/exceptions/domain.exceptions';
import { Currency } from './currency.value-object';
import { Timezone } from './timezone.value-object';

export interface BusinessConfigurationData {
  readonly timezone: string;
  readonly currency: string;
  readonly locale: string;
  readonly dateFormat?: string;
  readonly timeFormat?: string;
  readonly numberFormat?: string;
  readonly firstDayOfWeek?: number; // 0=Sunday, 1=Monday
  readonly businessWeekDays?: number[]; // [1,2,3,4,5] for Mon-Fri
}

export class BusinessConfiguration {
  private readonly _timezone: Timezone;
  private readonly _currency: Currency;
  private readonly _locale: string;
  private readonly _dateFormat: string;
  private readonly _timeFormat: string;
  private readonly _numberFormat: string;
  private readonly _firstDayOfWeek: number;
  private readonly _businessWeekDays: number[];

  private constructor(data: BusinessConfigurationData) {
    this.validateLocale(data.locale);

    this._timezone = Timezone.create(data.timezone);
    this._currency = Currency.create(data.currency);
    this._locale = data.locale;
    this._dateFormat =
      data.dateFormat || this.getDefaultDateFormat(data.locale);
    this._timeFormat =
      data.timeFormat || this.getDefaultTimeFormat(data.locale);
    this._numberFormat =
      data.numberFormat || this.getDefaultNumberFormat(data.locale);
    this._firstDayOfWeek = this.validateFirstDayOfWeek(
      data.firstDayOfWeek ?? 1,
    );
    this._businessWeekDays = this.validateBusinessWeekDays(
      data.businessWeekDays ?? [1, 2, 3, 4, 5],
    );
  }

  private validateLocale(locale: string): void {
    if (!locale || locale.trim().length === 0) {
      throw new DomainValidationError(
        'LOCALE_EMPTY',
        'Locale cannot be empty',
        { locale },
      );
    }

    // Format: language-COUNTRY (e.g., fr-FR, en-US, de-DE)
    const localePattern = /^[a-z]{2}(-[A-Z]{2})?$/;
    if (!localePattern.test(locale)) {
      throw new DomainValidationError(
        'LOCALE_INVALID_FORMAT',
        'Locale must be in format: xx or xx-XX (e.g., fr, fr-FR, en-US)',
        { locale, examples: ['fr', 'fr-FR', 'en-US', 'de-DE'] },
      );
    }

    if (!this.isSupportedLocale(locale)) {
      throw new DomainValidationError(
        'LOCALE_NOT_SUPPORTED',
        'Locale is not supported',
        { locale, supported: this.getSupportedLocales().slice(0, 10) },
      );
    }
  }

  private validateFirstDayOfWeek(day: number): number {
    if (day < 0 || day > 6) {
      throw new DomainValidationError(
        'FIRST_DAY_OF_WEEK_INVALID',
        'First day of week must be between 0 (Sunday) and 6 (Saturday)',
        { day, range: '0-6' },
      );
    }
    return day;
  }

  private validateBusinessWeekDays(days: number[]): number[] {
    if (!Array.isArray(days) || days.length === 0) {
      throw new DomainValidationError(
        'BUSINESS_WEEK_DAYS_EMPTY',
        'Business week days cannot be empty',
        { days },
      );
    }

    const validDays = days.filter((day) => day >= 0 && day <= 6);
    if (validDays.length !== days.length) {
      throw new DomainValidationError(
        'BUSINESS_WEEK_DAYS_INVALID',
        'All business week days must be between 0 (Sunday) and 6 (Saturday)',
        { days, validRange: '0-6' },
      );
    }

    // Remove duplicates and sort
    return [...new Set(validDays)].sort();
  }

  private isSupportedLocale(locale: string): boolean {
    return this.getSupportedLocales().includes(locale);
  }

  private getSupportedLocales(): string[] {
    return [
      // French
      'fr',
      'fr-FR',
      'fr-BE',
      'fr-CH',
      'fr-CA',

      // English
      'en',
      'en-US',
      'en-GB',
      'en-CA',
      'en-AU',
      'en-NZ',
      'en-IE',

      // German
      'de',
      'de-DE',
      'de-AT',
      'de-CH',

      // Spanish
      'es',
      'es-ES',
      'es-MX',
      'es-AR',
      'es-CO',
      'es-CL',
      'es-PE',

      // Italian
      'it',
      'it-IT',
      'it-CH',

      // Portuguese
      'pt',
      'pt-PT',
      'pt-BR',

      // Dutch
      'nl',
      'nl-NL',
      'nl-BE',

      // Other European
      'sv',
      'sv-SE',
      'no',
      'nb-NO',
      'da',
      'da-DK',
      'fi',
      'fi-FI',
      'pl',
      'pl-PL',
      'cs',
      'cs-CZ',
      'hu',
      'hu-HU',
      'ro',
      'ro-RO',
      'bg',
      'bg-BG',
      'hr',
      'hr-HR',
      'sk',
      'sk-SK',
      'sl',
      'sl-SI',
      'et',
      'et-EE',
      'lv',
      'lv-LV',
      'lt',
      'lt-LT',

      // Asian
      'ja',
      'ja-JP',
      'ko',
      'ko-KR',
      'zh',
      'zh-CN',
      'zh-TW',
      'zh-HK',
      'th',
      'th-TH',
      'vi',
      'vi-VN',
      'id',
      'id-ID',
      'ms',
      'ms-MY',
      'hi',
      'hi-IN',
      'bn',
      'bn-BD',
      'ta',
      'ta-IN',
      'te',
      'te-IN',

      // Arabic
      'ar',
      'ar-SA',
      'ar-AE',
      'ar-EG',
      'ar-JO',
      'ar-KW',
      'ar-QA',

      // Russian
      'ru',
      'ru-RU',
      'uk',
      'uk-UA',

      // Turkish
      'tr',
      'tr-TR',
    ];
  }

  private getDefaultDateFormat(locale: string): string {
    const formats: Record<string, string> = {
      fr: 'DD/MM/YYYY',
      'fr-FR': 'DD/MM/YYYY',
      en: 'YYYY-MM-DD',
      'en-US': 'MM/DD/YYYY',
      'en-GB': 'DD/MM/YYYY',
      de: 'DD.MM.YYYY',
      'de-DE': 'DD.MM.YYYY',
      es: 'DD/MM/YYYY',
      it: 'DD/MM/YYYY',
      pt: 'DD/MM/YYYY',
      ja: 'YYYY/MM/DD',
      ko: 'YYYY.MM.DD',
      zh: 'YYYY-MM-DD',
    };
    return formats[locale] || formats[locale.split('-')[0]] || 'YYYY-MM-DD';
  }

  private getDefaultTimeFormat(locale: string): string {
    const formats: Record<string, string> = {
      fr: 'HH:mm',
      'en-US': 'h:mm A',
      en: 'HH:mm',
      de: 'HH:mm',
      es: 'HH:mm',
      it: 'HH:mm',
      pt: 'HH:mm',
      ja: 'HH:mm',
      ko: 'HH:mm',
      zh: 'HH:mm',
    };
    return formats[locale] || formats[locale.split('-')[0]] || 'HH:mm';
  }

  private getDefaultNumberFormat(locale: string): string {
    const formats: Record<string, string> = {
      fr: '1 234,56',
      'en-US': '1,234.56',
      en: '1,234.56',
      de: '1.234,56',
      es: '1.234,56',
      it: '1.234,56',
      pt: '1.234,56',
      ja: '1,234.56',
      ko: '1,234.56',
      zh: '1,234.56',
    };
    return formats[locale] || formats[locale.split('-')[0]] || '1,234.56';
  }

  /**
   * Factory methods
   */
  static create(data: BusinessConfigurationData): BusinessConfiguration {
    return new BusinessConfiguration(data);
  }

  static createDefault(): BusinessConfiguration {
    return new BusinessConfiguration({
      timezone: 'Europe/Paris',
      currency: 'EUR',
      locale: 'fr-FR',
      firstDayOfWeek: 1, // Monday
      businessWeekDays: [1, 2, 3, 4, 5], // Mon-Fri
    });
  }

  static createForCountry(countryCode: string): BusinessConfiguration {
    const configurations: Record<string, BusinessConfigurationData> = {
      FR: {
        timezone: 'Europe/Paris',
        currency: 'EUR',
        locale: 'fr-FR',
        firstDayOfWeek: 1,
        businessWeekDays: [1, 2, 3, 4, 5],
      },
      GB: {
        timezone: 'Europe/London',
        currency: 'GBP',
        locale: 'en-GB',
        firstDayOfWeek: 1,
        businessWeekDays: [1, 2, 3, 4, 5],
      },
      US: {
        timezone: 'America/New_York',
        currency: 'USD',
        locale: 'en-US',
        firstDayOfWeek: 0, // Sunday
        businessWeekDays: [1, 2, 3, 4, 5],
      },
      DE: {
        timezone: 'Europe/Berlin',
        currency: 'EUR',
        locale: 'de-DE',
        firstDayOfWeek: 1,
        businessWeekDays: [1, 2, 3, 4, 5],
      },
      ES: {
        timezone: 'Europe/Madrid',
        currency: 'EUR',
        locale: 'es-ES',
        firstDayOfWeek: 1,
        businessWeekDays: [1, 2, 3, 4, 5],
      },
      IT: {
        timezone: 'Europe/Rome',
        currency: 'EUR',
        locale: 'it-IT',
        firstDayOfWeek: 1,
        businessWeekDays: [1, 2, 3, 4, 5],
      },
      JP: {
        timezone: 'Asia/Tokyo',
        currency: 'JPY',
        locale: 'ja-JP',
        firstDayOfWeek: 0, // Sunday
        businessWeekDays: [1, 2, 3, 4, 5],
      },
      CN: {
        timezone: 'Asia/Shanghai',
        currency: 'CNY',
        locale: 'zh-CN',
        firstDayOfWeek: 1,
        businessWeekDays: [1, 2, 3, 4, 5],
      },
    };

    const config = configurations[countryCode.toUpperCase()];
    return config
      ? new BusinessConfiguration(config)
      : BusinessConfiguration.createDefault();
  }

  /**
   * Getters
   */
  getTimezone(): Timezone {
    return this._timezone;
  }

  getCurrency(): Currency {
    return this._currency;
  }

  getLocale(): string {
    return this._locale;
  }

  getDateFormat(): string {
    return this._dateFormat;
  }

  getTimeFormat(): string {
    return this._timeFormat;
  }

  getNumberFormat(): string {
    return this._numberFormat;
  }

  getFirstDayOfWeek(): number {
    return this._firstDayOfWeek;
  }

  getBusinessWeekDays(): number[] {
    return [...this._businessWeekDays];
  }

  /**
   * Business logic
   */
  isBusinessDay(dayOfWeek: number): boolean {
    return this._businessWeekDays.includes(dayOfWeek);
  }

  getLanguageCode(): string {
    return this._locale.split('-')[0];
  }

  getCountryCode(): string | undefined {
    const parts = this._locale.split('-');
    return parts.length > 1 ? parts[1] : undefined;
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: this._timezone.getValue(),
    };

    return new Intl.DateTimeFormat(this._locale, options).format(date);
  }

  formatTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: this._timeFormat.includes('A'),
      timeZone: this._timezone.getValue(),
    };

    return new Intl.DateTimeFormat(this._locale, options).format(date);
  }

  formatDateTime(date: Date): string {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat(this._locale).format(value);
  }

  formatCurrency(amount: number): string {
    return this._currency.formatAmount(amount, this._locale);
  }

  /**
   * Configuration updates
   */
  updateTimezone(timezone: string): BusinessConfiguration {
    return new BusinessConfiguration({
      timezone,
      currency: this._currency.getCode(),
      locale: this._locale,
      dateFormat: this._dateFormat,
      timeFormat: this._timeFormat,
      numberFormat: this._numberFormat,
      firstDayOfWeek: this._firstDayOfWeek,
      businessWeekDays: this._businessWeekDays,
    });
  }

  updateCurrency(currency: string): BusinessConfiguration {
    return new BusinessConfiguration({
      timezone: this._timezone.getValue(),
      currency,
      locale: this._locale,
      dateFormat: this._dateFormat,
      timeFormat: this._timeFormat,
      numberFormat: this._numberFormat,
      firstDayOfWeek: this._firstDayOfWeek,
      businessWeekDays: this._businessWeekDays,
    });
  }

  updateLocale(locale: string): BusinessConfiguration {
    return new BusinessConfiguration({
      timezone: this._timezone.getValue(),
      currency: this._currency.getCode(),
      locale,
      dateFormat: this.getDefaultDateFormat(locale),
      timeFormat: this.getDefaultTimeFormat(locale),
      numberFormat: this.getDefaultNumberFormat(locale),
      firstDayOfWeek: this._firstDayOfWeek,
      businessWeekDays: this._businessWeekDays,
    });
  }

  /**
   * Comparison
   */
  equals(other: BusinessConfiguration): boolean {
    return (
      this._timezone.equals(other._timezone) &&
      this._currency.equals(other._currency) &&
      this._locale === other._locale &&
      this._firstDayOfWeek === other._firstDayOfWeek &&
      JSON.stringify(this._businessWeekDays) ===
        JSON.stringify(other._businessWeekDays)
    );
  }

  /**
   * Serialization
   */
  toJSON(): BusinessConfigurationData {
    return {
      timezone: this._timezone.getValue(),
      currency: this._currency.getCode(),
      locale: this._locale,
      dateFormat: this._dateFormat,
      timeFormat: this._timeFormat,
      numberFormat: this._numberFormat,
      firstDayOfWeek: this._firstDayOfWeek,
      businessWeekDays: this._businessWeekDays,
    };
  }

  toString(): string {
    return `BusinessConfiguration(${this._timezone.getValue()}, ${this._currency.getCode()}, ${this._locale})`;
  }
}
