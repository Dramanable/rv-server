import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsDecimal,
  Length,
  Min,
  IsUUID,
  IsJSON,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

/**
 * 🎯 CreateProspectDto - DTO pour créer un nouveau prospect
 *
 * Validation complète des données métier pour la création d'un prospect
 * dans le contexte de l'organisation interne SaaS.
 */
export class CreateProspectDto {
  @ApiProperty({
    description: "Nom de l'entreprise prospect",
    example: 'TechCorp Solutions',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @Length(2, 200)
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      throw new Error('Business name must be a string');
    }
    return value.trim();
  })
  readonly businessName!: string;

  @ApiProperty({
    description: 'Nom du contact principal',
    example: 'Jean Dupont',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      throw new Error('Contact name must be a string');
    }
    return value.trim();
  })
  readonly contactName!: string;

  @ApiProperty({
    description: 'Adresse email du contact',
    example: 'jean.dupont@techcorp.com',
  })
  @IsEmail()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      throw new Error('Email must be a string');
    }
    return value.toLowerCase().trim();
  })
  readonly email!: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone',
    example: '+33 1 23 45 67 89',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  readonly phone?: string;

  @ApiPropertyOptional({
    description: "Description de l'entreprise ou notes",
    example: 'Entreprise spécialisée dans les solutions IT pour PME',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({
    description: "Taille de l'entreprise",
    enum: ['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'],
    example: 'MEDIUM',
  })
  @IsEnum(['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'])
  readonly businessSize!: string;

  @ApiPropertyOptional({
    description: "Nombre estimé d'employés",
    example: 25,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly estimatedStaffCount?: number;

  @ApiPropertyOptional({
    description: 'Valeur estimée du deal',
    example: 5000.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'estimatedValue must be a valid number with up to 2 decimal places',
    },
  )
  @Min(0)
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value);
    return value;
  })
  @Type(() => Number)
  readonly estimatedValue?: number;

  @ApiPropertyOptional({
    description: 'Devise pour la valeur estimée',
    example: 'EUR',
    enum: ['EUR', 'USD', 'GBP'],
  })
  @IsOptional()
  @IsEnum(['EUR', 'USD', 'GBP'])
  readonly estimatedValueCurrency?: string;

  @ApiPropertyOptional({
    description: 'Statut du prospect dans le pipeline',
    enum: [
      'LEAD',
      'CONTACTED',
      'QUALIFIED',
      'PROPOSAL',
      'NEGOTIATION',
      'CLOSED_WON',
      'CLOSED_LOST',
    ],
    example: 'LEAD',
  })
  @IsOptional()
  @IsEnum([
    'LEAD',
    'CONTACTED',
    'QUALIFIED',
    'PROPOSAL',
    'NEGOTIATION',
    'CLOSED_WON',
    'CLOSED_LOST',
  ])
  readonly status?: string;

  @ApiPropertyOptional({
    description: "Source d'acquisition du prospect",
    example: 'WEBSITE',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  readonly source?: string;

  @ApiPropertyOptional({
    description: 'ID du commercial assigné',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  readonly assignedSalesRep?: string;

  @ApiPropertyOptional({
    description: 'Date du dernier contact',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  readonly lastContactDate?: string;

  @ApiPropertyOptional({
    description: 'Notes sur le prospect',
    example: 'Client potentiel très intéressé par nos solutions RH',
  })
  @IsOptional()
  @IsString()
  readonly notes?: string;

  @ApiPropertyOptional({
    description: 'Configuration de tarification proposée (JSON)',
    example: {
      type: 'MONTHLY_SUBSCRIPTION',
      basePrice: { amount: 29, currency: 'EUR' },
      perUserPrice: { amount: 15, currency: 'EUR' },
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsJSON()
  readonly pricingProposal?: string;

  @ApiPropertyOptional({
    description: 'Prix mensuel proposé',
    example: 750.0,
    minimum: 0,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  @Type(() => Number)
  readonly proposedMonthlyPrice?: number;

  @ApiPropertyOptional({
    description: 'Devise pour le prix proposé',
    example: 'EUR',
    enum: ['EUR', 'USD', 'GBP'],
  })
  @IsOptional()
  @IsEnum(['EUR', 'USD', 'GBP'])
  readonly proposedCurrency?: string;

  @ApiPropertyOptional({
    description: 'Date de closing espérée',
    example: '2024-03-15T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  readonly expectedClosingDate?: string;

  @ApiPropertyOptional({
    description: 'Score de priorité (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  readonly priorityScore?: number;

  @ApiPropertyOptional({
    description: 'Date du premier contact',
    example: '2024-01-10T14:20:00Z',
  })
  @IsOptional()
  @IsDateString()
  readonly firstContactDate?: string;

  @ApiPropertyOptional({
    description: 'Tags associés au prospect (JSON array)',
    example: '["ENTERPRISE", "HIGH_VALUE", "URGENT"]',
    type: 'string',
  })
  @IsOptional()
  @IsJSON()
  readonly tags?: string;

  @ApiPropertyOptional({
    description: 'Champs personnalisés (JSON object)',
    example:
      '{"industrie": "IT", "tailleEquipe": "25-50", "budget": "5000-10000"}',
    type: 'string',
  })
  @IsOptional()
  @IsJSON()
  readonly customFields?: string;
}
