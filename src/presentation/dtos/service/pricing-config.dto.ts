/**
 * 💰 DTOs pour le système de pricing flexible
 * Support de tous les types de pricing et visibilité
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

// 🎯 Enums pour validation
export enum PricingType {
  FREE = 'FREE',
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
  HIDDEN = 'HIDDEN',
  ON_DEMAND = 'ON_DEMAND',
}

export enum PricingVisibility {
  PUBLIC = 'PUBLIC',
  AUTHENTICATED = 'AUTHENTICATED',
  PRIVATE = 'PRIVATE',
  HIDDEN = 'HIDDEN',
}

// 💰 Money DTO
export class MoneyDto {
  @ApiProperty({
    example: 5000,
    description: 'Amount in cents (e.g., 5000 = 50.00 EUR)',
  })
  @IsString()
  readonly amount!: string;

  @ApiProperty({ example: 'EUR', description: 'ISO currency code' })
  @IsString()
  readonly currency!: string;
}

// 📋 Pricing Rule DTO
export class PricingRuleDto {
  @ApiProperty({
    example: 'DURATION_MULTIPLIER',
    description: 'Type of pricing rule',
  })
  @IsString()
  readonly type!: string;

  @ApiProperty({
    example: { multiplier: 1.5 },
    description: 'Rule configuration',
  })
  @IsObject()
  readonly config!: Record<string, any>;

  @ApiPropertyOptional({
    example: 'Prix majoré pour séances longues',
    description: 'Rule description',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;
}

// 🎯 PricingConfig DTO principal
export class PricingConfigDto {
  @ApiProperty({
    enum: PricingType,
    example: PricingType.FIXED,
    description: 'Type de pricing du service',
  })
  @IsEnum(PricingType)
  readonly type!: PricingType;

  @ApiProperty({
    enum: PricingVisibility,
    example: PricingVisibility.PUBLIC,
    description: 'Visibilité du prix',
  })
  @IsEnum(PricingVisibility)
  readonly visibility!: PricingVisibility;

  @ApiPropertyOptional({
    type: MoneyDto,
    description: 'Prix de base (requis pour FIXED et VARIABLE)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  readonly basePrice?: MoneyDto;

  @ApiPropertyOptional({
    type: [PricingRuleDto],
    description: 'Règles de calcul pour pricing VARIABLE',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingRuleDto)
  readonly rules?: PricingRuleDto[];

  @ApiPropertyOptional({
    example: 'Prix sur devis selon complexité',
    description: 'Description pour pricing ON_DEMAND ou HIDDEN',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;
}

// 📦 Service Package DTO
export class ServicePackageDto {
  @ApiProperty({ example: 'Forfait découverte', description: 'Nom du forfait' })
  @IsString()
  readonly name!: string;

  @ApiPropertyOptional({
    example: '3 séances à tarif préférentiel',
    description: 'Description du forfait',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({ example: 3, description: 'Nombre de séances incluses' })
  @IsString()
  readonly sessionsIncluded!: string;

  @ApiProperty({
    type: MoneyDto,
    description: 'Prix du forfait',
  })
  @ValidateNested()
  @Type(() => MoneyDto)
  readonly packagePrice!: MoneyDto;

  @ApiPropertyOptional({ example: 30, description: 'Validité en jours' })
  @IsOptional()
  @IsString()
  readonly validityDays?: string;
}

// 🎯 Factory methods pour tests et exemples
export class PricingConfigDtoFactory {
  static free(): PricingConfigDto {
    return {
      type: PricingType.FREE,
      visibility: PricingVisibility.PUBLIC,
    };
  }

  static fixed(amount: string, currency = 'EUR'): PricingConfigDto {
    return {
      type: PricingType.FIXED,
      visibility: PricingVisibility.PUBLIC,
      basePrice: { amount, currency },
    };
  }

  static variable(
    baseAmount: string,
    rules: PricingRuleDto[],
    currency = 'EUR',
  ): PricingConfigDto {
    return {
      type: PricingType.VARIABLE,
      visibility: PricingVisibility.PUBLIC,
      basePrice: { amount: baseAmount, currency },
      rules,
    };
  }

  static hidden(amount: string, currency = 'EUR'): PricingConfigDto {
    return {
      type: PricingType.HIDDEN,
      visibility: PricingVisibility.HIDDEN,
      basePrice: { amount, currency },
    };
  }

  static onDemand(description?: string): PricingConfigDto {
    return {
      type: PricingType.ON_DEMAND,
      visibility: PricingVisibility.PUBLIC,
      description,
    };
  }
}
