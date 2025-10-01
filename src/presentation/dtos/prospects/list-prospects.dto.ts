import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsUUID,
  IsBoolean,
  Min,
  Max,
  Length,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

/**
 * 🎯 ListProspectsDto - DTO pour la recherche paginée des prospects
 *
 * Supporte pagination, tri, recherche textuelle et filtres métier
 * pour une expérience de recherche complète.
 */
export class ListProspectsDto {
  // 📊 PAGINATION
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    description: 'Numéro de page (commence à 1)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
    description: "Nombre d'éléments par page (max 100)",
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  readonly limit?: number = 10;

  // 🔄 TRI
  @ApiPropertyOptional({
    enum: [
      'businessName',
      'contactName',
      'email',
      'status',
      'businessSize',
      'estimatedValue',
      'priorityScore',
      'createdAt',
      'lastContactDate',
    ],
    default: 'createdAt',
    description: 'Champ sur lequel trier les résultats',
  })
  @IsOptional()
  @IsIn([
    'businessName',
    'contactName',
    'email',
    'status',
    'businessSize',
    'estimatedValue',
    'priorityScore',
    'createdAt',
    'lastContactDate',
  ])
  readonly sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Ordre de tri (croissant ou décroissant)',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  readonly sortOrder?: 'asc' | 'desc' = 'desc';

  // 🔍 RECHERCHE TEXTUELLE
  @ApiPropertyOptional({
    description:
      'Recherche textuelle dans businessName, contactName, email, notes',
    minLength: 1,
    maxLength: 100,
    example: 'TechCorp',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    return value.trim();
  })
  readonly search?: string;

  // 🎯 FILTRES MÉTIER
  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: [
      'LEAD',
      'CONTACTED',
      'QUALIFIED',
      'PROPOSAL',
      'NEGOTIATION',
      'CLOSED_WON',
      'CLOSED_LOST',
    ],
    example: 'QUALIFIED',
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
    description: "Filtrer par taille d'entreprise",
    enum: ['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'],
    example: 'MEDIUM',
  })
  @IsOptional()
  @IsEnum(['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'])
  readonly businessSize?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par commercial assigné',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  readonly assignedSalesRep?: string;

  @ApiPropertyOptional({
    description: "Filtrer par source d'acquisition",
    example: 'WEBSITE',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  readonly source?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par score de priorité minimum',
    minimum: 0,
    maximum: 100,
    example: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  readonly minPriorityScore?: number;

  @ApiPropertyOptional({
    description: 'Filtrer par valeur estimée minimum',
    minimum: 0,
    example: 1000.0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  readonly minEstimatedValue?: number;

  @ApiPropertyOptional({
    description: 'Inclure uniquement les prospects avec propositions de prix',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  readonly hasProposal?: boolean;

  // 📅 FILTRES TEMPORELS
  @ApiPropertyOptional({
    description: 'Filtrer par date de création après (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  readonly createdAfter?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par date de création avant (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  readonly createdBefore?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par dernier contact après (ISO 8601)',
    example: '2024-01-15T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  readonly lastContactAfter?: string;
}
