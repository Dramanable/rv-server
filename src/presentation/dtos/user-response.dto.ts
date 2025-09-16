/**
 * 📝 DTO - User Response DTOs
 *
 * DTOs pour les réponses utilisateur avec validation et documentation Swagger.
 * Sépare les préoccupations entre domaine et présentation.
 *
 * FONCTIONNALITÉS :
 * - Validation avec class-validator
 * - Transformation avec class-transformer
 * - Documentation Swagger complète
 * - Mapping depuis les entités domaine
 */

import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../../shared/enums/user-role.enum';

/**
 * DTO pour la réponse utilisateur publique
 * Expose uniquement les champs sécurisés
 */
export class UserResponseDto {
  @ApiProperty({
    description: "Identifiant unique de l'utilisateur",
    example: 'usr_1234567890abcdef',
    format: 'uuid',
  })
  @Expose()
  @IsString()
  id!: string;

  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'john.doe@example.com',
    format: 'email',
  })
  @Expose()
  @IsEmail()
  @Transform(({ obj }) => obj.email?.value || obj.email)
  email!: string;

  @ApiProperty({
    description: "Nom complet de l'utilisateur",
    example: 'John Doe',
    minLength: 1,
    maxLength: 100,
  })
  @Expose()
  @IsString()
  name!: string;

  @ApiProperty({
    description: "Rôle de l'utilisateur dans le système",
    enum: UserRole,
    example: UserRole.REGULAR_CLIENT,
    enumName: 'UserRole',
  })
  @Expose()
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({
    description: 'Date de création du compte utilisateur',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  @Expose()
  @IsDateString()
  createdAt!: Date;

  @ApiProperty({
    description: 'Date de dernière modification du compte',
    example: '2024-01-20T14:45:00.000Z',
    format: 'date-time',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsDateString()
  updatedAt?: Date;

  @ApiProperty({
    description: "Indique si l'utilisateur doit changer son mot de passe",
    example: false,
    default: false,
  })
  @Expose()
  @IsBoolean()
  passwordChangeRequired!: boolean;
}

/**
 * DTO pour la réponse utilisateur avec détails administratifs
 * Ajoute des informations pour les administrateurs
 */
export class UserDetailResponseDto extends UserResponseDto {
  @ApiProperty({
    description: "Statut de vérification de l'email",
    example: true,
    default: false,
  })
  @Expose()
  @IsBoolean()
  emailVerified!: boolean;

  @ApiProperty({
    description: 'Date de dernière connexion',
    example: '2024-01-22T08:15:00.000Z',
    format: 'date-time',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsDateString()
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Nombre de tentatives de connexion échouées',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @Expose()
  @IsOptional()
  failedLoginAttempts?: number;
}

/**
 * DTO pour les réponses paginées d'utilisateurs
 */
export class PaginatedUserResponseDto {
  @ApiProperty({
    description: 'Liste des utilisateurs pour la page actuelle',
    type: [UserResponseDto],
    isArray: true,
  })
  @Expose()
  data!: UserResponseDto[];

  @ApiProperty({
    description: 'Métadonnées de pagination',
    type: 'object',
    properties: {
      currentPage: {
        type: 'number',
        description: 'Numéro de la page actuelle',
        example: 1,
        minimum: 1,
      },
      itemsPerPage: {
        type: 'number',
        description: "Nombre d'éléments par page",
        example: 10,
        minimum: 1,
        maximum: 100,
      },
      totalItems: {
        type: 'number',
        description: "Nombre total d'éléments",
        example: 150,
        minimum: 0,
      },
      totalPages: {
        type: 'number',
        description: 'Nombre total de pages',
        example: 15,
        minimum: 0,
      },
      hasNext: {
        type: 'boolean',
        description: "Indique s'il y a une page suivante",
        example: true,
      },
      hasPrevious: {
        type: 'boolean',
        description: "Indique s'il y a une page précédente",
        example: false,
      },
    },
  })
  @Expose()
  meta!: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
