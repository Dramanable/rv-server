/**
 * 🌍 Business Configuration DTOs
 *
 * DTOs pour la gestion de la configuration business (timezone, currency, locale)
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

// =============== UPDATE CONFIGURATION ===============

export class UpdateBusinessConfigurationDto {
  @ApiPropertyOptional({
    description: "Business timezone (IANA timezone)",
    example: "Europe/Paris",
  })
  @IsOptional()
  @IsString()
  readonly timezone?: string;

  @ApiPropertyOptional({
    description: "Business currency (ISO 4217 code)",
    example: "EUR",
  })
  @IsOptional()
  @IsString()
  @Length(3, 3, { message: "Currency must be a 3-letter ISO code" })
  readonly currency?: string;

  @ApiPropertyOptional({
    description: "Business locale (language-COUNTRY)",
    example: "fr-FR",
  })
  @IsOptional()
  @IsString()
  readonly locale?: string;

  @ApiPropertyOptional({
    description: "First day of the week (0=Sunday, 1=Monday)",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  readonly firstDayOfWeek?: number;

  @ApiPropertyOptional({
    description: "Business working days (0=Sunday, 1=Monday, ...)",
    example: [1, 2, 3, 4, 5],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  readonly businessWeekDays?: number[];

  @ApiPropertyOptional({
    description: "Date format preference",
    example: "DD/MM/YYYY",
  })
  @IsOptional()
  @IsString()
  readonly dateFormat?: string;

  @ApiPropertyOptional({
    description: "Time format preference",
    example: "HH:mm",
  })
  @IsOptional()
  @IsString()
  readonly timeFormat?: string;

  @ApiPropertyOptional({
    description: "Number format preference",
    example: "1 234,56",
  })
  @IsOptional()
  @IsString()
  readonly numberFormat?: string;
}

// =============== RESPONSE DTOs ===============

export class BusinessConfigurationResponseDto {
  @ApiProperty({
    description: "Business configuration details",
    example: {
      timezone: "Europe/Paris",
      currency: "EUR",
      locale: "fr-FR",
      firstDayOfWeek: 1,
      businessWeekDays: [1, 2, 3, 4, 5],
    },
  })
  readonly configuration!: {
    readonly timezone: string;
    readonly currency: string;
    readonly locale: string;
    readonly firstDayOfWeek: number;
    readonly businessWeekDays: number[];
  };

  @ApiProperty({
    description: "Last updated timestamp",
    example: "2024-01-15T10:30:00.000Z",
  })
  readonly lastUpdated!: string;

  @ApiProperty({
    description: "Success message",
    example: "Business configuration retrieved successfully",
  })
  readonly message!: string;
}

// Legacy response format for backward compatibility
export class BusinessConfigurationLegacyResponseDto {
  @ApiProperty({
    description: "Business timezone",
    example: "Europe/Paris",
  })
  readonly timezone!: string;

  @ApiProperty({
    description: "Timezone display name",
    example: "Europe/Paris (CET/CEST)",
  })
  readonly timezoneDisplayName!: string;

  @ApiProperty({
    description: "Currency code",
    example: "EUR",
  })
  readonly currency!: string;

  @ApiProperty({
    description: "Currency info",
    example: {
      code: "EUR",
      name: "Euro",
      symbol: "€",
      decimalPlaces: 2,
      regions: ["Europe"],
    },
  })
  readonly currencyInfo!: {
    readonly code: string;
    readonly name: string;
    readonly symbol: string;
    readonly decimalPlaces: number;
    readonly regions: string[];
  };

  @ApiProperty({
    description: "Business locale",
    example: "fr-FR",
  })
  readonly locale!: string;

  @ApiProperty({
    description: "Date format",
    example: "DD/MM/YYYY",
  })
  readonly dateFormat!: string;

  @ApiProperty({
    description: "Time format",
    example: "HH:mm",
  })
  readonly timeFormat!: string;

  @ApiProperty({
    description: "Number format",
    example: "1 234,56",
  })
  readonly numberFormat!: string;

  @ApiProperty({
    description: "First day of the week",
    example: 1,
  })
  readonly firstDayOfWeek!: number;

  @ApiProperty({
    description: "Business working days",
    example: [1, 2, 3, 4, 5],
    type: [Number],
  })
  readonly businessWeekDays!: number[];

  @ApiProperty({
    description: "Language code extracted from locale",
    example: "fr",
  })
  readonly languageCode!: string;

  @ApiPropertyOptional({
    description: "Country code extracted from locale",
    example: "FR",
  })
  readonly countryCode?: string;
}

// =============== QUICK SETUP DTOs ===============

export class QuickSetupConfigurationDto {
  @ApiProperty({
    description:
      "Country code to automatically configure timezone/currency/locale",
    example: "FR",
  })
  @IsString()
  @Length(2, 2, { message: "Country code must be 2 letters" })
  readonly countryCode!: string;

  @ApiPropertyOptional({
    description: "Override timezone",
    example: "Europe/Paris",
  })
  @IsOptional()
  @IsString()
  readonly timezone?: string;

  @ApiPropertyOptional({
    description: "Override currency",
    example: "EUR",
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  readonly currency?: string;

  @ApiPropertyOptional({
    description: "Override locale",
    example: "fr-FR",
  })
  @IsOptional()
  @IsString()
  readonly locale?: string;
}

// =============== AVAILABLE OPTIONS DTOs ===============

export class SupportedTimezonesResponseDto {
  @ApiProperty({
    description: "List of supported timezones",
    example: ["Europe/Paris", "Europe/London", "America/New_York"],
    type: [String],
  })
  readonly timezones!: string[];
}

export class SupportedCurrenciesResponseDto {
  @ApiProperty({
    description: "List of supported currencies with details",
    example: [
      {
        code: "EUR",
        name: "Euro",
        symbol: "€",
        regions: ["Europe"],
      },
    ],
  })
  readonly currencies!: Array<{
    readonly code: string;
    readonly name: string;
    readonly symbol: string;
    readonly regions: string[];
  }>;
}

export class SupportedLocalesResponseDto {
  @ApiProperty({
    description: "List of supported locales",
    example: ["fr-FR", "en-US", "de-DE"],
    type: [String],
  })
  readonly locales!: string[];
}

// =============== PRESETS DTOs ===============

export class ConfigurationPresetsResponseDto {
  @ApiProperty({
    description: "Available configuration presets by country",
    example: {
      FR: {
        timezone: "Europe/Paris",
        currency: "EUR",
        locale: "fr-FR",
        name: "France",
      },
    },
  })
  readonly presets!: Record<
    string,
    {
      readonly timezone: string;
      readonly currency: string;
      readonly locale: string;
      readonly name: string;
    }
  >;
}

// =============== VALIDATION RESPONSE ===============

export class ValidateConfigurationDto {
  @ApiProperty({
    description: "Timezone to validate",
    example: "Europe/Paris",
  })
  @IsString()
  readonly timezone!: string;

  @ApiProperty({
    description: "Currency to validate",
    example: "EUR",
  })
  @IsString()
  @Length(3, 3)
  readonly currency!: string;

  @ApiProperty({
    description: "Locale to validate",
    example: "fr-FR",
  })
  @IsString()
  readonly locale!: string;
}

export class ConfigurationValidationResponseDto {
  @ApiProperty({
    description: "Whether the configuration is valid",
    example: true,
  })
  readonly isValid!: boolean;

  @ApiProperty({
    description: "Validation errors if any",
    example: [],
    type: [String],
  })
  readonly errors!: string[];

  @ApiPropertyOptional({
    description: "Suggestions for invalid values",
    example: {
      timezone: ["Europe/Paris", "Europe/London"],
      currency: ["EUR", "USD"],
      locale: ["fr-FR", "en-US"],
    },
  })
  readonly suggestions?: {
    readonly timezone?: string[];
    readonly currency?: string[];
    readonly locale?: string[];
  };
}

// =============== TYPE ALIASES ===============

// Alias for backward compatibility and cleaner imports
export type UpdateBusinessConfigurationRequestDto =
  UpdateBusinessConfigurationDto;

// Common error response for API consistency
export class ErrorResponseDto {
  @ApiProperty({
    description: "Error message",
    example: "Invalid configuration data",
  })
  readonly message!: string;

  @ApiProperty({
    description: "Error code",
    example: "VALIDATION_ERROR",
  })
  readonly code!: string;

  @ApiPropertyOptional({
    description: "Detailed validation errors",
    example: [
      {
        field: "timezone",
        value: "Invalid/Timezone",
        message: "Invalid timezone format",
      },
    ],
  })
  readonly details?: Array<{
    readonly field: string;
    readonly value: string;
    readonly message: string;
  }>;
}
