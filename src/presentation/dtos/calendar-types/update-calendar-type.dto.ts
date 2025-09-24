import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  Length,
  IsHexColor,
  Matches,
  IsBoolean,
  IsInt,
  IsUUID,
  Min,
} from 'class-validator';

/**
 * DTO pour la mise à jour d'un type de calendrier
 * ✅ Tous les champs sont optionnels pour permettre des mises à jour partielles
 * ✅ Validation identique à CreateCalendarTypeDto
 * ✅ Documentation Swagger complète
 */
export class UpdateCalendarTypeDto {
  @ApiProperty({
    description: 'ID of the business owning this calendar type',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  readonly businessId!: string;

  @ApiPropertyOptional({
    description: 'Name of the calendar type',
    example: 'Consultation Médicale Spécialisée',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  readonly name?: string;

  @ApiPropertyOptional({
    description: 'Unique code for the calendar type (uppercase)',
    example: 'CONSULTATION_SPEC',
    minLength: 2,
    maxLength: 20,
    pattern: '^[A-Z0-9_]+$',
  })
  @IsOptional()
  @IsString()
  @Length(2, 20)
  @Matches(/^[A-Z0-9_]+$/, {
    message:
      'Code must contain only uppercase letters, numbers and underscores',
  })
  readonly code?: string;

  @ApiPropertyOptional({
    description: 'Description of the calendar type',
    example:
      'Calendrier pour les consultations médicales spécialisées avec suivi approfondi',
    minLength: 10,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Color associated with the calendar type (hex format)',
    example: '#2196F3',
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  @IsOptional()
  @IsString()
  @IsHexColor()
  readonly color?: string;

  @ApiPropertyOptional({
    description: 'Icon identifier for the calendar type',
    example: 'specialized-calendar',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  readonly icon?: string;

  @ApiPropertyOptional({
    description: 'Sort order for display purposes',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the calendar type is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
