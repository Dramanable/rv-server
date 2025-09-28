/**
 * 🏥 PRESENTATION DTOs - ProfessionalRole
 * Clean Architecture - Presentation Layer
 * DTOs pour les opérations CRUD sur ProfessionalRole avec validation et documentation Swagger
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

/**
 * DTO principal pour représenter un ProfessionalRole
 */
export class ProfessionalRoleDto {
  @ApiProperty({
    description: 'Identifiant unique du rôle professionnel',
    example: '12345678-1234-1234-1234-123456789012',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'Code unique du rôle (utilisé pour référencement)',
    example: 'DOCTOR_GENERAL',
    minLength: 2,
    maxLength: 50,
  })
  readonly code!: string;

  @ApiProperty({
    description: 'Nom du rôle professionnel',
    example: 'Médecin généraliste',
    minLength: 2,
    maxLength: 100,
  })
  readonly name!: string;

  @ApiProperty({
    description: "Nom d'affichage (peut être différent du nom technique)",
    example: 'Dr. Généraliste',
    minLength: 2,
    maxLength: 100,
  })
  readonly displayName!: string;

  @ApiProperty({
    description: 'Catégorie du rôle professionnel (flexible pour MVP)',
    type: 'string',
    example: 'PRIMARY',
  })
  readonly category!: string;

  @ApiProperty({
    description: 'Description détaillée du rôle',
    example: 'Médecin de premier recours qui assure les soins de base',
  })
  readonly description!: string;

  @ApiProperty({
    description: 'Indique si ce rôle peut diriger une équipe',
    example: true,
  })
  readonly canLead!: boolean;

  @ApiProperty({
    description: 'Indique si le rôle est actif',
    example: true,
  })
  readonly isActive!: boolean;

  @ApiProperty({
    description: 'Date de création',
    type: String,
    format: 'date-time',
  })
  readonly createdAt!: Date;

  @ApiProperty({
    description: 'Date de dernière modification',
    type: String,
    format: 'date-time',
  })
  readonly updatedAt!: Date;
}

/**
 * DTO pour créer un nouveau ProfessionalRole
 */
export class CreateProfessionalRoleDto {
  @ApiProperty({
    description: 'Code unique du rôle (lettres, chiffres, underscore)',
    example: 'DOCTOR_GENERAL',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @Length(2, 50)
  @Matches(/^[A-Z0-9_]+$/, {
    message:
      'Code must contain only uppercase letters, numbers, and underscores',
  })
  readonly code!: string;

  @ApiProperty({
    description: 'Nom du rôle professionnel',
    example: 'Médecin généraliste',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  readonly name!: string;

  @ApiProperty({
    description: "Nom d'affichage (peut être différent du nom technique)",
    example: 'Dr. Généraliste',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  readonly displayName!: string;

  @ApiProperty({
    description: 'Catégorie du rôle professionnel (flexible pour MVP)',
    type: 'string',
    example: 'PRIMARY',
  })
  @IsString()
  @Length(2, 50)
  readonly category!: string;

  @ApiProperty({
    description: 'Description détaillée du rôle',
    example: 'Médecin de premier recours qui assure les soins de base',
    maxLength: 500,
  })
  @IsString()
  @Length(0, 500)
  readonly description!: string;

  @ApiPropertyOptional({
    description: 'Indique si ce rôle peut diriger une équipe',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly canLead?: boolean = false;

  @ApiPropertyOptional({
    description: 'Indique si le rôle est actif',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean = true;
}

/**
 * DTO pour mettre à jour un ProfessionalRole
 */
export class UpdateProfessionalRoleDto {
  @ApiPropertyOptional({
    description: 'Nom du rôle professionnel',
    example: 'Médecin généraliste',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  readonly name?: string;

  @ApiPropertyOptional({
    description: "Nom d'affichage (peut être différent du nom technique)",
    example: 'Dr. Généraliste',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  readonly displayName?: string;

  @ApiPropertyOptional({
    description: 'Catégorie du rôle professionnel (flexible pour MVP)',
    type: 'string',
    example: 'PRIMARY',
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  readonly category?: string;

  @ApiPropertyOptional({
    description: 'Description détaillée du rôle',
    example: 'Médecin de premier recours qui assure les soins de base',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Indique si ce rôle peut diriger une équipe',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly canLead?: boolean;

  @ApiPropertyOptional({
    description: 'Indique si le rôle est actif',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}

/**
 * DTO pour la recherche paginée de ProfessionalRoles
 */
export class ListProfessionalRolesDto {
  @ApiPropertyOptional({
    description: 'Numéro de page (commence à 1)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: "Nombre d'éléments par page",
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    enum: ['name', 'displayName', 'category', 'createdAt', 'code'],
    default: 'name',
    example: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'displayName', 'category', 'createdAt', 'code'])
  readonly sortBy?: string = 'name';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    enum: ['asc', 'desc'],
    default: 'asc',
    example: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  readonly sortOrder?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({
    description: 'Terme de recherche (nom, displayName, description, code)',
    example: 'médecin',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  readonly search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par catégorie (flexible pour MVP)',
    type: 'string',
    example: 'PRIMARY',
  })
  @IsOptional()
  @IsString()
  readonly category?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut actif',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrer par capacité de leadership',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly canLead?: boolean;
}

/**
 * DTO de réponse pour la liste paginée
 */
export class ListProfessionalRolesResponseDto {
  @ApiProperty({
    description: 'Liste des rôles professionnels',
    type: [ProfessionalRoleDto],
  })
  readonly data!: ProfessionalRoleDto[];

  @ApiProperty({
    description: 'Métadonnées de pagination',
    example: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 47,
      itemsPerPage: 10,
      hasNextPage: true,
      hasPrevPage: false,
    },
  })
  readonly meta!: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

/**
 * DTO de réponse pour les opérations de création
 */
export class CreateProfessionalRoleResponseDto {
  @ApiProperty({
    description: "Indique le succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Rôle professionnel créé',
    type: ProfessionalRoleDto,
  })
  readonly data!: ProfessionalRoleDto;
}

/**
 * DTO de réponse pour les opérations de mise à jour
 */
export class UpdateProfessionalRoleResponseDto {
  @ApiProperty({
    description: "Indique le succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Rôle professionnel mis à jour',
    type: ProfessionalRoleDto,
  })
  readonly data!: ProfessionalRoleDto;
}

/**
 * DTO de réponse pour les opérations de suppression
 */
export class DeleteProfessionalRoleResponseDto {
  @ApiProperty({
    description: "Indique le succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Message de confirmation',
    example: 'Professional role deleted successfully',
  })
  readonly message!: string;
}
