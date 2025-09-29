/**
 * 🔄 Business Configuration Mapper - Infrastructure Layer
 *
 * Maps between domain BusinessConfiguration value object and database fields
 * Follows Clean Architecture separation of concerns
 */

import { BusinessConfiguration } from '@domain/value-objects/business-configuration.value-object';
import { Timezone } from '@domain/value-objects/timezone.value-object';
import { Currency } from '@domain/value-objects/currency.value-object';
import { DomainValidationError } from '@domain/exceptions/domain.exceptions';
import { BusinessOrmEntity } from '../entities/business-orm.entity';

export class BusinessConfigurationMapper {
  /**
   * Map domain BusinessConfiguration to ORM fields
   */
  static toOrm(
    config: BusinessConfiguration,
    ormEntity: BusinessOrmEntity,
  ): void {
    ormEntity.configuration_timezone = config.getTimezone().getValue();
    ormEntity.configuration_currency = config.getCurrency().getCode();
    ormEntity.configuration_locale = config.getLocale();
    ormEntity.configuration_first_day_of_week = config.getFirstDayOfWeek();
    ormEntity.configuration_business_week_days = config.getBusinessWeekDays();
    ormEntity.configuration_updated_at = new Date();
  }

  /**
   * Map ORM fields to domain BusinessConfiguration
   */
  static toDomain(ormEntity: BusinessOrmEntity): BusinessConfiguration {
    try {
      return BusinessConfiguration.create({
        timezone: ormEntity.configuration_timezone,
        currency: ormEntity.configuration_currency,
        locale: ormEntity.configuration_locale,
        firstDayOfWeek: ormEntity.configuration_first_day_of_week,
        businessWeekDays: ormEntity.configuration_business_week_days,
      });
    } catch (error) {
      if (error instanceof DomainValidationError) {
        throw error;
      }

      throw new DomainValidationError(
        'configuration',
        'database_configuration',
        `Invalid business configuration in database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Create default configuration for new businesses
   */
  static createDefaultOrm(): Partial<BusinessOrmEntity> {
    const defaultConfig = BusinessConfiguration.createDefault();

    return {
      configuration_timezone: defaultConfig.getTimezone().getValue(),
      configuration_currency: defaultConfig.getCurrency().getCode(),
      configuration_locale: defaultConfig.getLocale(),
      configuration_first_day_of_week: defaultConfig.getFirstDayOfWeek(),
      configuration_business_week_days: defaultConfig.getBusinessWeekDays(),
      configuration_updated_at: new Date(),
    };
  }

  /**
   * Update only changed configuration fields in ORM entity
   */
  static updateOrm(
    currentConfig: BusinessConfiguration,
    newConfig: BusinessConfiguration,
    ormEntity: BusinessOrmEntity,
  ): { hasChanges: boolean; changedFields: string[] } {
    const changedFields: string[] = [];

    // Check timezone
    if (
      currentConfig.getTimezone().getValue() !==
      newConfig.getTimezone().getValue()
    ) {
      ormEntity.configuration_timezone = newConfig.getTimezone().getValue();
      changedFields.push('timezone');
    }

    // Check currency
    if (
      currentConfig.getCurrency().getCode() !==
      newConfig.getCurrency().getCode()
    ) {
      ormEntity.configuration_currency = newConfig.getCurrency().getCode();
      changedFields.push('currency');
    }

    // Check locale
    if (currentConfig.getLocale() !== newConfig.getLocale()) {
      ormEntity.configuration_locale = newConfig.getLocale();
      changedFields.push('locale');
    }

    // Check first day of week
    if (currentConfig.getFirstDayOfWeek() !== newConfig.getFirstDayOfWeek()) {
      ormEntity.configuration_first_day_of_week = newConfig.getFirstDayOfWeek();
      changedFields.push('firstDayOfWeek');
    }

    // Check business week days
    const currentWeekDays = currentConfig.getBusinessWeekDays();
    const newWeekDays = newConfig.getBusinessWeekDays();
    if (
      currentWeekDays.length !== newWeekDays.length ||
      !currentWeekDays.every((day, index) => day === newWeekDays[index])
    ) {
      ormEntity.configuration_business_week_days = newWeekDays;
      changedFields.push('businessWeekDays');
    }

    // Update timestamp if there are changes
    if (changedFields.length > 0) {
      ormEntity.configuration_updated_at = new Date();
    }

    return {
      hasChanges: changedFields.length > 0,
      changedFields,
    };
  }

  /**
   * Validate ORM configuration fields
   */
  static validateOrmConfiguration(ormEntity: BusinessOrmEntity): void {
    const errors: string[] = [];

    // Validate timezone
    if (
      !ormEntity.configuration_timezone ||
      typeof ormEntity.configuration_timezone !== 'string'
    ) {
      errors.push('Invalid timezone configuration');
    }

    // Validate currency
    if (
      !ormEntity.configuration_currency ||
      typeof ormEntity.configuration_currency !== 'string' ||
      ormEntity.configuration_currency.length !== 3
    ) {
      errors.push('Invalid currency configuration');
    }

    // Validate locale
    if (
      !ormEntity.configuration_locale ||
      typeof ormEntity.configuration_locale !== 'string' ||
      !/^[a-z]{2}-[A-Z]{2}$/.test(ormEntity.configuration_locale)
    ) {
      errors.push('Invalid locale configuration');
    }

    // Validate first day of week
    if (
      typeof ormEntity.configuration_first_day_of_week !== 'number' ||
      ormEntity.configuration_first_day_of_week < 0 ||
      ormEntity.configuration_first_day_of_week > 6
    ) {
      errors.push('Invalid first day of week configuration');
    }

    // Validate business week days
    if (
      !Array.isArray(ormEntity.configuration_business_week_days) ||
      ormEntity.configuration_business_week_days.length === 0 ||
      ormEntity.configuration_business_week_days.some(
        (day) => day < 0 || day > 6,
      )
    ) {
      errors.push('Invalid business week days configuration');
    }

    if (errors.length > 0) {
      throw new DomainValidationError(
        'configuration',
        'orm_validation',
        `ORM configuration validation failed: ${errors.join(', ')}`,
      );
    }
  }
}
