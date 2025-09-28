/**
 * 🎯 Skills DTOs - Presentation Layer
 * Clean Architecture - Validation complète avec Swagger
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// ================== SKILL DTO PRINCIPAL ==================

export class SkillDto {
  @ApiProperty({
    description: 'Identifiant unique de la compétence',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'Identifiant du business',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  readonly businessId!: string;

  @ApiProperty({
    description: 'Nom de la compétence',
    example: 'Massage thérapeutique',
    minLength: 2,
    maxLength: 100,
  })
  readonly name!: string;

  @ApiProperty({
    description: 'Catégorie de la compétence',
    example: 'Soins corporels',
    minLength: 2,
    maxLength: 50,
  })
  readonly category!: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de la compétence',
    example: 'Techniques de massage pour soulager les tensions musculaires',
    maxLength: 500,
  })
  readonly description?: string;

  @ApiProperty({
    description: 'Indique si la compétence est critique pour le business',
    example: true,
  })
  readonly isCritical!: boolean;

  @ApiProperty({
    description: 'Indique si la compétence est active',
    example: true,
  })
  readonly isActive!: boolean;

  @ApiProperty({
    description: 'Date de création',
    example: '2025-09-28T10:00:00.000Z',
  })
  readonly createdAt!: string;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2025-09-28T10:00:00.000Z',
  })
  readonly updatedAt!: string;
}

// ================== CREATE SKILL ==================

export class CreateSkillDto {
  @ApiProperty({
    description: 'Identifiant du business',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Business ID must be a valid UUID' })
  readonly businessId!: string;

  @ApiProperty({
    description: 'Nom de la compétence',
    example: 'Massage thérapeutique',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  readonly name!: string;

  @ApiProperty({
    description: 'Catégorie de la compétence',
    example: 'Soins corporels',
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50, { message: 'Category must be between 2 and 50 characters' })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  readonly category!: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de la compétence',
    example: 'Techniques de massage pour soulager les tensions musculaires',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Description cannot exceed 500 characters' })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Indique si la compétence est critique pour le business',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isCritical must be a boolean' })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  readonly isCritical?: boolean;

  @ApiProperty({
    description: 'ID utilisateur effectuant la demande',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Requesting user ID must be a valid UUID' })
  readonly requestingUserId!: string;

  @ApiProperty({
    description: 'ID de corrélation pour traçabilité',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Correlation ID must be a valid UUID' })
  readonly correlationId!: string;

  @ApiPropertyOptional({
    description: 'Adresse IP du client',
    example: '192.168.1.100',
  })
  @IsOptional()
  @IsString()
  readonly clientIp?: string;

  @ApiPropertyOptional({
    description: 'User agent du client',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  })
  @IsOptional()
  @IsString()
  readonly userAgent?: string;
}

export class CreateSkillResponseDto {
  @ApiProperty({
    description: 'Indique le succès de la création',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Données de la compétence créée',
    type: SkillDto,
  })
  readonly data!: SkillDto;
}

// ================== GET SKILL ==================

export class GetSkillResponseDto {
  @ApiProperty({
    description: 'Indique le succès de la récupération',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Données de la compétence',
    type: SkillDto,
  })
  readonly data!: SkillDto;
}

// ================== UPDATE SKILL ==================

export class UpdateSkillDto {
  @ApiPropertyOptional({
    description: 'Skill name',
    example: 'Advanced TypeScript',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  readonly name?: string;

  @ApiPropertyOptional({
    description: 'Skill category',
    example: 'Programming Languages',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  readonly category?: string;

  @ApiPropertyOptional({
    description: 'Skill description',
    example: 'Advanced knowledge in TypeScript development and best practices',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Is this a critical skill for business operations',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isCritical?: boolean;

  @ApiPropertyOptional({
    description: 'Is the skill currently active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Correlation ID for tracking',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  readonly correlationId?: string;
}

export class UpdateSkillResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Updated skill data',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Skill unique identifier',
      },
      businessId: {
        type: 'string',
        example: '550e8400-e29b-41d4-a716-446655440001',
        description: 'Associated business ID',
      },
      name: {
        type: 'string',
        example: 'Advanced TypeScript',
        description: 'Updated skill name',
      },
      category: {
        type: 'string',
        example: 'Programming Languages',
        description: 'Updated skill category',
      },
      description: {
        type: 'string',
        example:
          'Advanced knowledge in TypeScript development and best practices',
        description: 'Updated skill description',
      },
      isActive: {
        type: 'boolean',
        example: true,
        description: 'Active status',
      },
      isCritical: {
        type: 'boolean',
        example: true,
        description: 'Critical status for business operations',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2023-12-07T10:30:00.000Z',
        description: 'Creation timestamp',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2023-12-07T14:25:00.000Z',
        description: 'Last update timestamp',
      },
    },
  })
  readonly data!: {
    readonly id: string;
    readonly businessId: string;
    readonly name: string;
    readonly category: string;
    readonly description: string | null;
    readonly isActive: boolean;
    readonly isCritical: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
  };
}

// ================== LIST SKILLS ==================

export class ListSkillsDto {
  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be greater than 0' })
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: "Nombre d'éléments par page",
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be greater than 0' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    enum: ['name', 'category', 'createdAt', 'updatedAt'],
    default: 'name',
    example: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'category', 'createdAt', 'updatedAt'])
  readonly sortBy?: 'name' | 'category' | 'createdAt' | 'updatedAt' = 'name';

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
    description: 'Terme de recherche dans le nom et la description',
    example: 'massage',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, {
    message: 'Search term must be between 1 and 100 characters',
  })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  readonly search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par catégorie',
    example: 'Soins corporels',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'Category must be between 1 and 50 characters' })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  readonly category?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut actif',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  readonly isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrer par statut critique',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isCritical must be a boolean' })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  readonly isCritical?: boolean;

  @ApiProperty({
    description: 'ID utilisateur effectuant la demande',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Requesting user ID must be a valid UUID' })
  readonly requestingUserId!: string;

  @ApiProperty({
    description: 'ID de corrélation pour traçabilité',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Correlation ID must be a valid UUID' })
  readonly correlationId!: string;
}

export class ListSkillsResponseDto {
  @ApiProperty({
    description: 'Indique le succès de la récupération',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Liste des compétences',
    type: [SkillDto],
  })
  readonly data!: SkillDto[];

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

// ================== DELETE SKILL ==================

// ================== DELETE SKILL ==================

export class DeleteSkillResponseDto {
  @ApiProperty({
    description: 'Indique le succès de la suppression',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Message de confirmation',
    example: 'Skill deleted successfully',
  })
  readonly message!: string;
}
