/**
 * 🧪 Tests for BusinessConfiguration Value Object
 *
 * Test-Driven Development approach for business configuration logic
 */

import { DomainValidationError } from '@domain/exceptions/domain.exceptions';
import { BusinessConfiguration } from '@domain/value-objects/business-configuration.value-object';

describe('BusinessConfiguration Value Object', () => {
  describe('Creation and Validation', () => {
    it('should create a valid business configuration', () => {
      const config = BusinessConfiguration.create({
        timezone: 'Europe/Paris',
        currency: 'EUR',
        locale: 'fr-FR',
      });

      expect(config.getTimezone().getValue()).toBe('Europe/Paris');
      expect(config.getCurrency().getCode()).toBe('EUR');
      expect(config.getLocale()).toBe('fr-FR');
    });

    it('should create default configuration', () => {
      const config = BusinessConfiguration.createDefault();

      expect(config.getTimezone().getValue()).toBe('Europe/Paris');
      expect(config.getCurrency().getCode()).toBe('EUR');
      expect(config.getLocale()).toBe('fr-FR');
      expect(config.getFirstDayOfWeek()).toBe(1); // Monday
      expect(config.getBusinessWeekDays()).toEqual([1, 2, 3, 4, 5]); // Mon-Fri
    });

    it('should create configuration for specific country', () => {
      const frConfig = BusinessConfiguration.createForCountry('FR');
      const usConfig = BusinessConfiguration.createForCountry('US');
      const gbConfig = BusinessConfiguration.createForCountry('GB');

      expect(frConfig.getTimezone().getValue()).toBe('Europe/Paris');
      expect(frConfig.getCurrency().getCode()).toBe('EUR');
      expect(frConfig.getLocale()).toBe('fr-FR');

      expect(usConfig.getTimezone().getValue()).toBe('America/New_York');
      expect(usConfig.getCurrency().getCode()).toBe('USD');
      expect(usConfig.getLocale()).toBe('en-US');
      expect(usConfig.getFirstDayOfWeek()).toBe(0); // Sunday

      expect(gbConfig.getTimezone().getValue()).toBe('Europe/London');
      expect(gbConfig.getCurrency().getCode()).toBe('GBP');
      expect(gbConfig.getLocale()).toBe('en-GB');
    });

    it('should throw error for invalid locale format', () => {
      expect(() =>
        BusinessConfiguration.create({
          timezone: 'Europe/Paris',
          currency: 'EUR',
          locale: 'invalid',
        }),
      ).toThrow(DomainValidationError);

      expect(() =>
        BusinessConfiguration.create({
          timezone: 'Europe/Paris',
          currency: 'EUR',
          locale: 'fr-fr-FR',
        }),
      ).toThrow(DomainValidationError);
    });

    it('should throw error for unsupported locale', () => {
      expect(() =>
        BusinessConfiguration.create({
          timezone: 'Europe/Paris',
          currency: 'EUR',
          locale: 'xx-XX',
        }),
      ).toThrow(DomainValidationError);
    });

    it('should throw error for invalid first day of week', () => {
      expect(() =>
        BusinessConfiguration.create({
          timezone: 'Europe/Paris',
          currency: 'EUR',
          locale: 'fr-FR',
          firstDayOfWeek: -1,
        }),
      ).toThrow(DomainValidationError);

      expect(() =>
        BusinessConfiguration.create({
          timezone: 'Europe/Paris',
          currency: 'EUR',
          locale: 'fr-FR',
          firstDayOfWeek: 7,
        }),
      ).toThrow(DomainValidationError);
    });

    it('should throw error for invalid business week days', () => {
      expect(() =>
        BusinessConfiguration.create({
          timezone: 'Europe/Paris',
          currency: 'EUR',
          locale: 'fr-FR',
          businessWeekDays: [],
        }),
      ).toThrow(DomainValidationError);

      expect(() =>
        BusinessConfiguration.create({
          timezone: 'Europe/Paris',
          currency: 'EUR',
          locale: 'fr-FR',
          businessWeekDays: [1, 2, 7],
        }),
      ).toThrow(DomainValidationError);
    });
  });

  describe('Business Logic', () => {
    let config: BusinessConfiguration;

    beforeEach(() => {
      config = BusinessConfiguration.create({
        timezone: 'Europe/Paris',
        currency: 'EUR',
        locale: 'fr-FR',
        businessWeekDays: [1, 2, 3, 4, 5], // Mon-Fri
      });
    });

    it('should identify business days correctly', () => {
      expect(config.isBusinessDay(0)).toBe(false); // Sunday
      expect(config.isBusinessDay(1)).toBe(true); // Monday
      expect(config.isBusinessDay(2)).toBe(true); // Tuesday
      expect(config.isBusinessDay(3)).toBe(true); // Wednesday
      expect(config.isBusinessDay(4)).toBe(true); // Thursday
      expect(config.isBusinessDay(5)).toBe(true); // Friday
      expect(config.isBusinessDay(6)).toBe(false); // Saturday
    });

    it('should extract language and country codes', () => {
      expect(config.getLanguageCode()).toBe('fr');
      expect(config.getCountryCode()).toBe('FR');
    });

    it('should handle locale without country code', () => {
      const simpleConfig = BusinessConfiguration.create({
        timezone: 'Europe/Paris',
        currency: 'EUR',
        locale: 'fr',
      });

      expect(simpleConfig.getLanguageCode()).toBe('fr');
      expect(simpleConfig.getCountryCode()).toBeUndefined();
    });
  });

  describe('Formatting', () => {
    let config: BusinessConfiguration;
    let testDate: Date;

    beforeEach(() => {
      config = BusinessConfiguration.create({
        timezone: 'Europe/Paris',
        currency: 'EUR',
        locale: 'fr-FR',
      });
      testDate = new Date('2024-03-15T14:30:00Z');
    });

    it('should format date correctly', () => {
      const formatted = config.formatDate(testDate);
      expect(formatted).toMatch(/15\/03\/2024|15\.03\.2024|15-03-2024/); // Flexible date format
    });

    it('should format time correctly', () => {
      const formatted = config.formatTime(testDate);
      expect(formatted).toMatch(/\d{2}:\d{2}/); // HH:MM format
    });

    it('should format date and time together', () => {
      const formatted = config.formatDateTime(testDate);
      expect(formatted).toContain('15');
      expect(formatted).toContain('03');
      expect(formatted).toContain('2024');
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('should format numbers correctly', () => {
      const formatted = config.formatNumber(1234.56);
      expect(formatted).toMatch(/1.*234/); // Should handle thousands separator
    });

    it('should format currency correctly', () => {
      const formatted = config.formatCurrency(1234.56);
      expect(formatted).toMatch(/€/);
      expect(formatted).toMatch(/1.*234.*56/);
    });
  });

  describe('Configuration Updates', () => {
    let originalConfig: BusinessConfiguration;

    beforeEach(() => {
      originalConfig = BusinessConfiguration.create({
        timezone: 'Europe/Paris',
        currency: 'EUR',
        locale: 'fr-FR',
      });
    });

    it('should update timezone', () => {
      const updatedConfig = originalConfig.updateTimezone('America/New_York');

      expect(updatedConfig.getTimezone().getValue()).toBe('America/New_York');
      expect(updatedConfig.getCurrency().getCode()).toBe('EUR'); // Unchanged
      expect(updatedConfig.getLocale()).toBe('fr-FR'); // Unchanged
    });

    it('should update currency', () => {
      const updatedConfig = originalConfig.updateCurrency('USD');

      expect(updatedConfig.getCurrency().getCode()).toBe('USD');
      expect(updatedConfig.getTimezone().getValue()).toBe('Europe/Paris'); // Unchanged
      expect(updatedConfig.getLocale()).toBe('fr-FR'); // Unchanged
    });

    it('should update locale and related formats', () => {
      const updatedConfig = originalConfig.updateLocale('en-US');

      expect(updatedConfig.getLocale()).toBe('en-US');
      expect(updatedConfig.getDateFormat()).toMatch(/MM\/DD\/YYYY/);
      expect(updatedConfig.getTimeFormat()).toMatch(/h:mm A/);
    });
  });

  describe('Comparison', () => {
    it('should compare configurations correctly', () => {
      const config1 = BusinessConfiguration.create({
        timezone: 'Europe/Paris',
        currency: 'EUR',
        locale: 'fr-FR',
      });

      const config2 = BusinessConfiguration.create({
        timezone: 'Europe/Paris',
        currency: 'EUR',
        locale: 'fr-FR',
      });

      const config3 = BusinessConfiguration.create({
        timezone: 'America/New_York',
        currency: 'USD',
        locale: 'en-US',
      });

      expect(config1.equals(config2)).toBe(true);
      expect(config1.equals(config3)).toBe(false);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const config = BusinessConfiguration.create({
        timezone: 'Europe/Paris',
        currency: 'EUR',
        locale: 'fr-FR',
        firstDayOfWeek: 1,
        businessWeekDays: [1, 2, 3, 4, 5],
      });

      const json = config.toJSON();

      expect(json.timezone).toBe('Europe/Paris');
      expect(json.currency).toBe('EUR');
      expect(json.locale).toBe('fr-FR');
      expect(json.firstDayOfWeek).toBe(1);
      expect(json.businessWeekDays).toEqual([1, 2, 3, 4, 5]);
    });

    it('should have meaningful toString representation', () => {
      const config = BusinessConfiguration.create({
        timezone: 'Europe/Paris',
        currency: 'EUR',
        locale: 'fr-FR',
      });

      const str = config.toString();
      expect(str).toContain('Europe/Paris');
      expect(str).toContain('EUR');
      expect(str).toContain('fr-FR');
    });
  });
});
