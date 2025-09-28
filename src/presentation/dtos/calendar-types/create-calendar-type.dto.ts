import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsHexColor,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

/**
 * DTO pour la création d'un type de calendrier
 * ✅ Validation complète avec class-validator
 * ✅ Documentation Swagger intégrée
 * ✅ Standards entreprise respectés
 */
export class CreateCalendarTypeDto {
  @ApiProperty({
    description: 'Business ID where the calendar type will be created',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    {
      message: 'Business ID must be a valid UUID v4',
    },
  )
  readonly businessId!: string;

  @ApiProperty({
    description: 'Name of the calendar type',
    example: 'Consultation Médicale',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  readonly name!: string;

  @ApiProperty({
    description: 'Unique code for the calendar type (uppercase)',
    example: 'CONSULTATION',
    minLength: 2,
    maxLength: 20,
    pattern: '^[A-Z0-9_]+$',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  @Matches(/^[A-Z0-9_]+$/, {
    message:
      'Code must contain only uppercase letters, numbers and underscores',
  })
  readonly code!: string;

  @ApiProperty({
    description: 'Description of the calendar type',
    example: 'Calendrier pour les consultations médicales et suivis patients',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 500)
  readonly description!: string;

  @ApiProperty({
    description: 'Color associated with the calendar type (hex format)',
    example: '#4CAF50',
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  readonly color!: string;

  @ApiPropertyOptional({
    description: 'Icon identifier for the calendar type',
    example: 'medical-calendar',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  readonly icon?: string;

  @ApiPropertyOptional({
    description: 'Sort order for displaying calendar types',
    example: 1,
    minimum: 0,
    maximum: 999,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  readonly sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the calendar type is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
