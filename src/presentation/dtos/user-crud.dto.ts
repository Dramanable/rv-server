/**
 * 👥 USER CRUD DTOs - Clean Architecture + TDD
 *
 * DTOs pour les opérations CRUD des utilisateurs avec recherche et pagination
 * Réservé aux SUPER_ADMIN uniquement
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  // IsUUID, // Temporarily commented - not used
  Min,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../shared/enums/user-role.enum';

/**
 * 🔍 DTO pour la recherche POST avec filtres et pagination
 */
export class SearchUsersDto {
  @ApiPropertyOptional({
    description: 'Terme de recherche global (nom, email)',
    example: 'john@example.com',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  readonly searchTerm?: string;

  @ApiPropertyOptional({
    description: 'Filtres par rôles',
    enum: UserRole,
    isArray: true,
    example: [UserRole.REGULAR_CLIENT, UserRole.LOCATION_MANAGER],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  readonly roles?: UserRole[];

  @ApiPropertyOptional({
    description: 'Filtrer par statut actif',
    example: true,
  })
  @IsOptional()
  readonly isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Date de création - depuis',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  readonly createdAfter?: string;

  @ApiPropertyOptional({
    description: "Date de création - jusqu'à",
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsString()
  readonly createdBefore?: string;

  @ApiPropertyOptional({
    description: 'Numéro de page (commence à 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly page?: number;

  @ApiPropertyOptional({
    description: "Nombre d'éléments par page",
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly limit?: number;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    example: 'createdAt',
    enum: ['name', 'email', 'role', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString()
  readonly sortBy?: string;

  @ApiPropertyOptional({
    description: 'Direction du tri',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  readonly sortOrder?: 'asc' | 'desc';
}

/**
 * 👤 DTO pour créer un utilisateur
 */
export class CreateUserDto {
  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'user@example.com',
  })
  @IsEmail()
  readonly email!: string;

  @ApiProperty({
    description: "Nom complet de l'utilisateur",
    example: 'John Doe',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  readonly name!: string;

  @ApiProperty({
    description: "Rôle de l'utilisateur",
    enum: UserRole,
    example: UserRole.REGULAR_CLIENT,
  })
  @IsEnum(UserRole)
  readonly role!: UserRole;

  @ApiPropertyOptional({
    description:
      'Mot de passe initial (optionnel, généré automatiquement si omis)',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  readonly password?: string;

  @ApiPropertyOptional({
    description: 'Forcer le changement de mot de passe à la première connexion',
    example: true,
  })
  @IsOptional()
  readonly passwordChangeRequired?: boolean;
}

/**
 * 📝 DTO pour mettre à jour un utilisateur
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: "Nom complet de l'utilisateur",
    example: 'John Doe Updated',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  readonly name?: string;

  @ApiPropertyOptional({
    description: "Rôle de l'utilisateur",
    enum: UserRole,
    example: UserRole.LOCATION_MANAGER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  readonly role?: UserRole;

  @ApiPropertyOptional({
    description: "Statut actif de l'utilisateur",
    example: false,
  })
  @IsOptional()
  readonly isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Forcer le changement de mot de passe',
    example: true,
  })
  @IsOptional()
  readonly passwordChangeRequired?: boolean;
}

/**
 * 📋 DTO de réponse pour un utilisateur
 */
export class UserResponseDto {
  @ApiProperty({
    description: "ID unique de l'utilisateur",
    example: 'f6696396-8476-44d0-b076-458c22aec11f',
  })
  readonly id!: string;

  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'user@example.com',
  })
  readonly email!: string;

  @ApiProperty({
    description: "Nom complet de l'utilisateur",
    example: 'John Doe',
  })
  readonly name!: string;

  @ApiProperty({
    description: "Rôle de l'utilisateur",
    enum: UserRole,
    example: UserRole.REGULAR_CLIENT,
  })
  readonly role!: UserRole;

  @ApiProperty({
    description: "Statut actif de l'utilisateur",
    example: true,
  })
  readonly isActive!: boolean;

  @ApiProperty({
    description: 'Changement de mot de passe requis',
    example: false,
  })
  readonly passwordChangeRequired!: boolean;

  @ApiProperty({
    description: 'Date de création',
    example: '2025-09-02T14:30:00.000Z',
  })
  readonly createdAt!: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2025-09-02T14:30:00.000Z',
  })
  readonly updatedAt!: Date;
}

/**
 * 📊 DTO de réponse pour la recherche paginée
 */
export class SearchUsersResponseDto {
  @ApiProperty({
    description: 'Liste des utilisateurs',
    type: [UserResponseDto],
  })
  readonly users!: UserResponseDto[];

  @ApiProperty({
    description: 'Informations de pagination',
  })
  readonly pagination!: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
  };

  @ApiProperty({
    description: 'Filtres appliqués',
  })
  readonly appliedFilters!: {
    readonly searchTerm?: string;
    readonly roles?: UserRole[];
    readonly isActive?: boolean;
    readonly dateRange?: {
      readonly from: string;
      readonly to: string;
    };
  };
}

/**
 * ✅ DTO de réponse standard
 */
export class UserOperationResponseDto {
  @ApiProperty({
    description: "Statut de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Message de confirmation',
    example: 'User created successfully',
  })
  readonly message!: string;

  @ApiPropertyOptional({
    description: "Données de l'utilisateur (pour création/mise à jour)",
    type: UserResponseDto,
  })
  readonly user?: UserResponseDto;
}
