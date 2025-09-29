/**
 * 📅 STATISTICS PERIOD VALUE OBJECT - Tests TDD
 *
 * Tests pour le Value Object StatisticsPeriod avec gestion des périodes.
 */

import {
  StatisticsPeriod,
  PeriodType,
} from '../../../../domain/value-objects/statistics-period.value-object';
import { DomainValidationError } from '../../../../domain/exceptions/domain.exceptions';

describe('StatisticsPeriod Value Object', () => {
  describe('Factory Method - createMonth', () => {
    it('should create valid monthly period', () => {
      // Arrange
      const year = 2024;
      const month = 6; // June

      // Act
      const period = StatisticsPeriod.createMonth(year, month);

      // Assert
      expect(period.type).toBe(PeriodType.MONTH);
      expect(period.year).toBe(2024);
      expect(period.month).toBe(6);
      expect(period.getStartDate()).toEqual(new Date(2024, 5, 1)); // June 1st
      expect(period.getEndDate()).toEqual(new Date(2024, 6, 0)); // June 30th
    });

    it('should throw error for invalid year', () => {
      // Act & Assert
      expect(() => StatisticsPeriod.createMonth(1999, 6)).toThrow(
        DomainValidationError,
      );
      expect(() => StatisticsPeriod.createMonth(1999, 6)).toThrow(
        'Year must be between 2000 and',
      );
    });

    it('should throw error for invalid month', () => {
      // Act & Assert
      expect(() => StatisticsPeriod.createMonth(2024, 13)).toThrow(
        DomainValidationError,
      );
      expect(() => StatisticsPeriod.createMonth(2024, 13)).toThrow(
        'Month must be between 1 and 12',
      );
    });
  });

  describe('Factory Method - createWeek', () => {
    it('should create valid weekly period from Monday', () => {
      // Arrange
      const weekStart = '2024-01-15'; // Monday

      // Act
      const period = StatisticsPeriod.createWeek(weekStart);

      // Assert
      expect(period.type).toBe(PeriodType.WEEK);
      expect(period.year).toBe(2024);
      expect(period.weekStart).toEqual(new Date('2024-01-15T00:00:00.000Z'));
      expect(period.weekEnd).toEqual(new Date('2024-01-21T00:00:00.000Z')); // Sunday
    });

    it('should throw error for invalid date format', () => {
      // Act & Assert
      expect(() => StatisticsPeriod.createWeek('invalid-date')).toThrow(
        DomainValidationError,
      );
      expect(() => StatisticsPeriod.createWeek('invalid-date')).toThrow(
        'Invalid week start date format',
      );
    });
  });

  describe('Factory Method - createQuarter', () => {
    it('should create valid Q2 period', () => {
      // Arrange
      const year = 2024;
      const quarter = 2; // Q2

      // Act
      const period = StatisticsPeriod.createQuarter(year, quarter);

      // Assert
      expect(period.type).toBe(PeriodType.QUARTER);
      expect(period.year).toBe(2024);
      expect(period.quarter).toBe(2);
      expect(period.getStartDate()).toEqual(new Date(2024, 3, 1)); // April 1st
      expect(period.getEndDate()).toEqual(new Date(2024, 6, 0)); // June 30th
    });

    it('should create valid Q1 period', () => {
      // Arrange
      const year = 2024;
      const quarter = 1; // Q1

      // Act
      const period = StatisticsPeriod.createQuarter(year, quarter);

      // Assert
      expect(period.type).toBe(PeriodType.QUARTER);
      expect(period.getStartDate()).toEqual(new Date(2024, 0, 1)); // January 1st
      expect(period.getEndDate()).toEqual(new Date(2024, 3, 0)); // March 31st
    });

    it('should throw error for invalid quarter', () => {
      // Act & Assert
      expect(() => StatisticsPeriod.createQuarter(2024, 5)).toThrow(
        DomainValidationError,
      );
      expect(() => StatisticsPeriod.createQuarter(2024, 5)).toThrow(
        'Quarter must be between 1 and 4',
      );
    });
  });

  describe('Factory Method - createYear', () => {
    it('should create valid yearly period', () => {
      // Arrange
      const year = 2024;

      // Act
      const period = StatisticsPeriod.createYear(year);

      // Assert
      expect(period.type).toBe(PeriodType.YEAR);
      expect(period.year).toBe(2024);
      expect(period.getStartDate()).toEqual(new Date(2024, 0, 1)); // January 1st
      expect(period.getEndDate()).toEqual(new Date(2024, 11, 31)); // December 31st
    });

    it('should throw error for invalid year', () => {
      // Act & Assert
      expect(() => StatisticsPeriod.createYear(1999)).toThrow(
        DomainValidationError,
      );
      expect(() => StatisticsPeriod.createYear(1999)).toThrow(
        'Year must be between 2000 and',
      );
    });
  });

  describe('Factory Method - createCurrent', () => {
    it('should create current month period', () => {
      // Arrange
      const now = new Date();
      const expectedMonth = now.getMonth() + 1;
      const expectedYear = now.getFullYear();

      // Act
      const period = StatisticsPeriod.createCurrent(PeriodType.MONTH);

      // Assert
      expect(period.type).toBe(PeriodType.MONTH);
      expect(period.year).toBe(expectedYear);
      expect(period.month).toBe(expectedMonth);
    });

    it('should create current year period', () => {
      // Arrange
      const expectedYear = new Date().getFullYear();

      // Act
      const period = StatisticsPeriod.createCurrent(PeriodType.YEAR);

      // Assert
      expect(period.type).toBe(PeriodType.YEAR);
      expect(period.year).toBe(expectedYear);
    });

    it('should create current quarter period', () => {
      // Arrange
      const now = new Date();
      const expectedQuarter = Math.ceil((now.getMonth() + 1) / 3);

      // Act
      const period = StatisticsPeriod.createCurrent(PeriodType.QUARTER);

      // Assert
      expect(period.type).toBe(PeriodType.QUARTER);
      expect(period.quarter).toBe(expectedQuarter);
    });

    it('should create current week period', () => {
      // Act
      const period = StatisticsPeriod.createCurrent(PeriodType.WEEK);

      // Assert
      expect(period.type).toBe(PeriodType.WEEK);
      expect(period.weekStart).toBeDefined();
      expect(period.weekEnd).toBeDefined();
    });
  });

  describe('Business Logic - Period Analysis', () => {
    it('should identify if period is in the past', () => {
      // Arrange
      const pastPeriod = StatisticsPeriod.createMonth(2020, 1);

      // Act & Assert
      expect(pastPeriod.isPast()).toBe(true);
    });

    it('should identify current period correctly', () => {
      // Arrange
      const currentPeriod = StatisticsPeriod.createCurrent(PeriodType.MONTH);

      // Act & Assert
      expect(currentPeriod.isCurrent()).toBe(true);
    });
  });

  describe('Display Methods', () => {
    it('should format month display name correctly', () => {
      // Arrange
      const period = StatisticsPeriod.createMonth(2024, 6);

      // Act
      const displayName = period.getDisplayName();

      // Assert
      expect(displayName).toBe('Juin 2024');
    });

    it('should format quarter display name correctly', () => {
      // Arrange
      const period = StatisticsPeriod.createQuarter(2024, 2);

      // Act
      const displayName = period.getDisplayName();

      // Assert
      expect(displayName).toBe('T2 2024');
    });

    it('should format year display name correctly', () => {
      // Arrange
      const period = StatisticsPeriod.createYear(2024);

      // Act
      const displayName = period.getDisplayName();

      // Assert
      expect(displayName).toBe('Année 2024');
    });

    it('should format week display name correctly', () => {
      // Arrange
      const period = StatisticsPeriod.createWeek('2024-01-15');

      // Act
      const displayName = period.getDisplayName();

      // Assert
      expect(displayName).toContain('Semaine du');
      expect(displayName).toContain('1/15/2024'); // Format US
      expect(displayName).toContain('1/21/2024'); // Format US
    });
  });

  describe('Data Serialization', () => {
    it('should serialize month period correctly', () => {
      // Arrange
      const period = StatisticsPeriod.createMonth(2024, 6);

      // Act
      const data = period.toData();

      // Assert
      expect(data.type).toBe(PeriodType.MONTH);
      expect(data.year).toBe(2024);
      expect(data.month).toBe(6);
      expect(data.quarter).toBeUndefined();
      expect(data.weekStart).toBeUndefined();
      expect(data.weekEnd).toBeUndefined();
    });

    it('should serialize week period correctly', () => {
      // Arrange
      const period = StatisticsPeriod.createWeek('2024-01-15');

      // Act
      const data = period.toData();

      // Assert
      expect(data.type).toBe(PeriodType.WEEK);
      expect(data.year).toBe(2024);
      expect(data.weekStart).toBe('2024-01-15');
      expect(data.weekEnd).toBe('2024-01-21');
      expect(data.month).toBeUndefined();
      expect(data.quarter).toBeUndefined();
    });
  });

  describe('Equality', () => {
    it('should be equal for same month periods', () => {
      // Arrange
      const period1 = StatisticsPeriod.createMonth(2024, 6);
      const period2 = StatisticsPeriod.createMonth(2024, 6);

      // Act & Assert
      expect(period1.equals(period2)).toBe(true);
    });

    it('should not be equal for different months', () => {
      // Arrange
      const period1 = StatisticsPeriod.createMonth(2024, 6);
      const period2 = StatisticsPeriod.createMonth(2024, 7);

      // Act & Assert
      expect(period1.equals(period2)).toBe(false);
    });

    it('should be equal for same week periods', () => {
      // Arrange
      const period1 = StatisticsPeriod.createWeek('2024-01-15');
      const period2 = StatisticsPeriod.createWeek('2024-01-15');

      // Act & Assert
      expect(period1.equals(period2)).toBe(true);
    });

    it('should not be equal for different period types', () => {
      // Arrange
      const monthPeriod = StatisticsPeriod.createMonth(2024, 6);
      const yearPeriod = StatisticsPeriod.createYear(2024);

      // Act & Assert
      expect(monthPeriod.equals(yearPeriod)).toBe(false);
    });
  });
});
