/**
 * 🔍 DTOs pour la recherche et listage des assignations de rôles
 * Respecte les standards API de pagination, tri et filtrage avancé
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from "class-validator";

import { AssignmentScope } from "@shared/enums/assignment-scope.enum";
import { UserRole } from "@shared/enums/user-role.enum";

/**
 * 📝 DTO pour la recherche avancée des assignations de rôles
 */
export class ListRoleAssignmentsDto {
  // 📊 === PAGINATION ===
  @ApiPropertyOptional({
    description: "Numéro de page (commence à 1)",
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Le numéro de page doit être un entier" })
  @Min(1, { message: "Le numéro de page doit être supérieur à 0" })
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
  @IsInt({ message: "La limite doit être un entier" })
  @Min(1, { message: "La limite doit être supérieure à 0" })
  @Max(100, { message: "La limite ne peut dépasser 100" })
  readonly limit?: number = 10;

  // 🎯 === TRI ===
  @ApiPropertyOptional({
    description: "Champ de tri",
    enum: ["assignedAt", "expiresAt", "role", "scope", "isActive"],
    example: "assignedAt",
    default: "assignedAt",
  })
  @IsOptional()
  @IsIn(["assignedAt", "expiresAt", "role", "scope", "isActive"], {
    message: "Le champ de tri doit être valide",
  })
  readonly sortBy?: string = "assignedAt";

  @ApiPropertyOptional({
    description: "Ordre de tri",
    enum: ["asc", "desc"],
    example: "desc",
    default: "desc",
  })
  @IsOptional()
  @IsIn(["asc", "desc"], { message: "L'ordre de tri doit être asc ou desc" })
  readonly sortOrder?: "asc" | "desc" = "desc";

  // 🔍 === RECHERCHE TEXTUELLE ===
  @ApiPropertyOptional({
    description: "Recherche textuelle dans les notes et métadonnées",
    example: "promotion temporaire",
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: "La recherche doit être une chaîne de caractères" })
  @Length(1, 100, { message: "La recherche doit contenir 1 à 100 caractères" })
  readonly search?: string;

  // 🎭 === FILTRES MÉTIER ===
  @ApiPropertyOptional({
    description: "Filtrer par utilisateur spécifique",
    example: "123e4567-e89b-12d3-a456-426614174000",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID("4", { message: "L'ID utilisateur doit être un UUID valide" })
  readonly userId?: string;

  @ApiPropertyOptional({
    description: "Filtrer par rôle spécifique",
    enum: UserRole,
    example: UserRole.LOCATION_MANAGER,
    enumName: "UserRole",
  })
  @IsOptional()
  @IsEnum(UserRole, { message: "Le rôle doit être valide" })
  readonly role?: UserRole;

  @ApiPropertyOptional({
    description: "Filtrer par portée d'assignation",
    enum: AssignmentScope,
    example: AssignmentScope.BUSINESS,
    enumName: "AssignmentScope",
  })
  @IsOptional()
  @IsEnum(AssignmentScope, { message: "Le scope doit être valide" })
  readonly scope?: AssignmentScope;

  @ApiPropertyOptional({
    description: "Filtrer par contexte métier spécifique",
    example: "987fcdeb-51a2-43d7-8c9f-123456789abc",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID("4", { message: "L'ID du contexte métier doit être un UUID valide" })
  readonly businessContextId?: string;

  @ApiPropertyOptional({
    description: "Filtrer par statut actif/inactif",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: "Le statut actif doit être un booléen" })
  readonly isActive?: boolean;

  @ApiPropertyOptional({
    description: "Filtrer par assignations expirées",
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: "Le filtre expiré doit être un booléen" })
  readonly isExpired?: boolean;

  @ApiPropertyOptional({
    description: "Filtrer par date d'assignation depuis (ISO 8601)",
    example: "2024-01-01T00:00:00.000Z",
    format: "date-time",
  })
  @IsOptional()
  @IsDateString({}, { message: "La date depuis doit être au format ISO 8601" })
  readonly assignedSince?: string;

  @ApiPropertyOptional({
    description: "Filtrer par date d'assignation jusqu'à (ISO 8601)",
    example: "2024-12-31T23:59:59.000Z",
    format: "date-time",
  })
  @IsOptional()
  @IsDateString({}, { message: "La date jusqu'à doit être au format ISO 8601" })
  readonly assignedUntil?: string;

  @ApiPropertyOptional({
    description: "Filtrer par assignations qui expirent bientôt (en jours)",
    example: 30,
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Le délai d'expiration doit être un entier" })
  @Min(1, { message: "Le délai d'expiration doit être supérieur à 0" })
  @Max(365, { message: "Le délai d'expiration ne peut dépasser 365 jours" })
  readonly expiringInDays?: number;
}

/**
 * 📄 DTO pour un élément d'assignation de rôle dans la liste
 */
export class RoleAssignmentItemDto {
  @ApiProperty({
    description: "ID unique de l'assignation",
    example: "456e7890-e89b-12d3-a456-426614174111",
    format: "uuid",
  })
  readonly assignmentId!: string;

  @ApiProperty({
    description: "ID de l'utilisateur",
    example: "123e4567-e89b-12d3-a456-426614174000",
    format: "uuid",
  })
  readonly userId!: string;

  @ApiProperty({
    description: "Information utilisateur",
    type: "object",
    additionalProperties: true,
  })
  readonly user!: {
    readonly email: string;
    readonly firstName?: string;
    readonly lastName?: string;
  };

  @ApiProperty({
    description: "Rôle assigné",
    enum: UserRole,
    example: UserRole.LOCATION_MANAGER,
    enumName: "UserRole",
  })
  readonly role!: UserRole;

  @ApiProperty({
    description: "Portée de l'assignation",
    enum: AssignmentScope,
    example: AssignmentScope.BUSINESS,
    enumName: "AssignmentScope",
  })
  readonly scope!: AssignmentScope;

  @ApiProperty({
    description: "ID du contexte métier",
    example: "987fcdeb-51a2-43d7-8c9f-123456789abc",
    format: "uuid",
  })
  readonly businessContextId!: string;

  @ApiProperty({
    description: "Information du contexte métier",
    type: "object",
    additionalProperties: true,
  })
  readonly businessContext!: {
    readonly name: string;
    readonly type: string;
    readonly description?: string;
  };

  @ApiProperty({
    description: "Statut actif de l'assignation",
    example: true,
  })
  readonly isActive!: boolean;

  @ApiProperty({
    description: "Date d'assignation",
    example: "2024-01-15T10:30:00.000Z",
    format: "date-time",
  })
  readonly assignedAt!: string;

  @ApiProperty({
    description: "ID de l'utilisateur qui a effectué l'assignation",
    example: "789e0123-e89b-12d3-a456-426614174222",
    format: "uuid",
  })
  readonly assignedBy!: string;

  @ApiPropertyOptional({
    description: "Date d'expiration",
    example: "2024-12-31T23:59:59.000Z",
    format: "date-time",
  })
  readonly expiresAt?: string;

  @ApiPropertyOptional({
    description: "Indicateur d'expiration",
    example: false,
  })
  readonly isExpired?: boolean;

  @ApiPropertyOptional({
    description: "Jours restants avant expiration",
    example: 45,
  })
  readonly daysUntilExpiry?: number;

  @ApiPropertyOptional({
    description: "Notes sur l'assignation",
    example: "Assignation temporaire pour le projet Q4",
  })
  readonly notes?: string;

  @ApiPropertyOptional({
    description: "Métadonnées de l'assignation",
    type: "object",
    additionalProperties: true,
    example: {
      project: "Q4-2024",
      department: "Sales",
      temporary: true,
    },
  })
  readonly metadata?: Record<string, unknown>;
}

/**
 * 📊 DTO de réponse pour la liste des assignations
 */
export class ListRoleAssignmentsResponseDto {
  @ApiProperty({
    description: "Succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Liste des assignations de rôles",
    type: [RoleAssignmentItemDto],
  })
  readonly data!: RoleAssignmentItemDto[];

  @ApiProperty({
    description: "Métadonnées de pagination",
    type: "object",
    additionalProperties: true,
    example: {
      currentPage: 1,
      totalPages: 10,
      totalItems: 100,
      itemsPerPage: 10,
      hasNextPage: true,
      hasPrevPage: false,
      filters: {
        role: UserRole.LOCATION_MANAGER,
        scope: AssignmentScope.BUSINESS,
        isActive: true,
      },
      sorting: {
        sortBy: "assignedAt",
        sortOrder: "desc",
      },
    },
  })
  readonly meta!: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
    readonly filters: {
      readonly role?: UserRole;
      readonly scope?: AssignmentScope;
      readonly isActive?: boolean;
      readonly search?: string;
    };
    readonly sorting: {
      readonly sortBy: string;
      readonly sortOrder: "asc" | "desc";
    };
  };

  @ApiPropertyOptional({
    description: "Informations sur l'opération",
    type: "object",
    additionalProperties: true,
    example: {
      processedAt: "2024-01-15T10:30:00Z",
      correlationId: "550e8400-e29b-41d4-a716-446655440000",
    },
  })
  readonly operationMeta?: {
    readonly timestamp: string;
    readonly correlationId: string;
    readonly executionTimeMs: number;
  };
}
