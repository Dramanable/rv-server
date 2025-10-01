/**
 * 🔄 Business Configuration Presentation Mapper
 *
 * Maps between domain BusinessConfiguration and API DTOs
 * Presentation layer mapping for clean API responses
 */

import { BusinessConfiguration } from "@domain/value-objects/business-configuration.value-object";
import { BusinessConfigurationResponseDto } from "@presentation/dtos/business-configuration.dto";

export class BusinessConfigurationMapper {
  /**
   * Map domain BusinessConfiguration to API response DTO
   */
  static toResponseDto(
    businessId: string,
    configuration: BusinessConfiguration,
    lastUpdated: Date,
  ): BusinessConfigurationResponseDto {
    return {
      configuration: {
        timezone: configuration.getTimezone().getValue(),
        currency: configuration.getCurrency().getCode(),
        locale: configuration.getLocale(),
        firstDayOfWeek: configuration.getFirstDayOfWeek(),
        businessWeekDays: configuration.getBusinessWeekDays(),
      },
      lastUpdated: lastUpdated.toISOString(),
      message: "Business configuration retrieved successfully",
    };
  }

  /**
   * Create default configuration response
   */
  static createDefaultResponseDto(
    businessId: string,
  ): BusinessConfigurationResponseDto {
    const defaultConfig = BusinessConfiguration.createDefault();

    return {
      configuration: {
        timezone: defaultConfig.getTimezone().getValue(),
        currency: defaultConfig.getCurrency().getCode(),
        locale: defaultConfig.getLocale(),
        firstDayOfWeek: defaultConfig.getFirstDayOfWeek(),
        businessWeekDays: defaultConfig.getBusinessWeekDays(),
      },
      lastUpdated: new Date().toISOString(),
      message: "Default configuration loaded",
    };
  }
}
