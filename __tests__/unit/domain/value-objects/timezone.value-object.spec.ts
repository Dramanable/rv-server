/**
 * 🧪 Tests for Timezone Value Object
 *
 * Test-Driven Development approach for timezone validation and business logic
 */

import { DomainValidationError } from '@domain/exceptions/domain.exceptions';
import { Timezone } from '@domain/value-objects/timezone.value-object';

describe('Timezone Value Object', () => {
  describe('Creation and Validation', () => {
    it('should create a valid timezone', () => {
      const timezone = Timezone.create('Europe/Paris');

      expect(timezone.getValue()).toBe('Europe/Paris');
      expect(timezone.getDisplayName()).toBe('Europe/Paris (CET/CEST)');
    });

    it('should create UTC timezone', () => {
      const timezone = Timezone.createUtc();

      expect(timezone.getValue()).toBe('UTC');
      expect(timezone.isUtc()).toBe(true);
    });

    it('should throw error for empty timezone', () => {
      expect(() => Timezone.create('')).toThrow(DomainValidationError);
      expect(() => Timezone.create('  ')).toThrow(DomainValidationError);
    });

    it('should throw error for invalid timezone format', () => {
      expect(() => Timezone.create('InvalidTimezone')).toThrow(
        DomainValidationError,
      );
      expect(() => Timezone.create('123/456')).toThrow(DomainValidationError);
      expect(() => Timezone.create('europe/paris')).toThrow(
        DomainValidationError,
      );
    });

    it('should throw error for unsupported timezone', () => {
      expect(() => Timezone.create('Mars/Colony')).toThrow(
        DomainValidationError,
      );
    });

    it('should accept valid UTC offsets', () => {
      const timezone1 = Timezone.create('+02:00');
      const timezone2 = Timezone.create('-05:00');
      const timezone3 = Timezone.create('UTC+01:00');

      expect(timezone1.getValue()).toBe('+02:00');
      expect(timezone2.getValue()).toBe('-05:00');
      expect(timezone3.getValue()).toBe('UTC+01:00');
    });
  });

  describe('Factory Methods', () => {
    it('should create timezone from country code', () => {
      const frTimezone = Timezone.fromUserLocation('FR');
      const usTimezone = Timezone.fromUserLocation('US');
      const jpTimezone = Timezone.fromUserLocation('JP');

      expect(frTimezone.getValue()).toBe('Europe/Paris');
      expect(usTimezone.getValue()).toBe('America/New_York');
      expect(jpTimezone.getValue()).toBe('Asia/Tokyo');
    });

    it('should fallback to default for unknown country', () => {
      const unknownTimezone = Timezone.fromUserLocation('XX');

      expect(unknownTimezone.getValue()).toBe('Europe/Paris');
    });
  });

  describe('Business Logic', () => {
    it('should get correct offset for known timezones', () => {
      const parisTimezone = Timezone.create('Europe/Paris');
      const londonTimezone = Timezone.create('Europe/London');
      const utcTimezone = Timezone.createUtc();

      expect(parisTimezone.getOffset()).toBe('+01:00');
      expect(londonTimezone.getOffset()).toBe('+00:00');
      expect(utcTimezone.getOffset()).toBe('+00:00');
    });

    it('should identify UTC timezone correctly', () => {
      const utc1 = Timezone.create('UTC');
      const utc2 = Timezone.create('+00:00');
      const nonUtc = Timezone.create('Europe/Paris');

      expect(utc1.isUtc()).toBe(true);
      expect(utc2.isUtc()).toBe(true);
      expect(nonUtc.isUtc()).toBe(false);
    });

    it('should compare timezones correctly', () => {
      const tz1 = Timezone.create('Europe/Paris');
      const tz2 = Timezone.create('Europe/Paris');
      const tz3 = Timezone.create('Europe/London');

      expect(tz1.equals(tz2)).toBe(true);
      expect(tz1.equals(tz3)).toBe(false);
    });
  });

  describe('Static Methods', () => {
    it('should validate timezone correctly', () => {
      expect(Timezone.isValidTimezone('Europe/Paris')).toBe(true);
      expect(Timezone.isValidTimezone('UTC')).toBe(true);
      expect(Timezone.isValidTimezone('+02:00')).toBe(true);
      expect(Timezone.isValidTimezone('InvalidTimezone')).toBe(false);
    });

    it('should return list of supported timezones', () => {
      const supported = Timezone.getSupportedTimezones();

      expect(Array.isArray(supported)).toBe(true);
      expect(supported.length).toBeGreaterThan(0);
      expect(supported).toContain('Europe/Paris');
      expect(supported).toContain('UTC');
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const timezone = Timezone.create('Europe/Paris');

      expect(timezone.toJSON()).toBe('Europe/Paris');
      expect(timezone.toString()).toBe('Europe/Paris');
    });
  });
});
