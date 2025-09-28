/**
 * 🚫 DTOs pour la révocation d'assignations de rôles
 * Respecte les principes de validation stricte et traçabilité
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

import { AssignmentScope } from '@shared/enums/assignment-scope.enum';
import { UserRole } from '@shared/enums/user-role.enum';

/**
 * 📝 DTO pour révoquer une assignation de rôle
 */
export class RevokeRoleDto {
  @ApiProperty({
    description: "ID de l'assignation de rôle à révoquer",
    example: '456e7890-e89b-12d3-a456-426614174111',
    format: 'uuid',
  })
  @IsUUID('4', { message: "L'ID d'assignation doit être un UUID valide" })
  @IsNotEmpty({ message: "L'ID d'assignation est obligatoire" })
  readonly assignmentId!: string;

  @ApiPropertyOptional({
    description: 'Raison de la révocation',
    example: 'Fin de projet temporaire',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'La raison doit être une chaîne de caractères' })
  @Length(1, 500, { message: 'La raison doit contenir 1 à 500 caractères' })
  readonly reason?: string;

  @ApiPropertyOptional({
    description: 'Notes additionnelles sur la révocation',
    example: 'Révocation planifiée suite à la fin du projet Q4',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Les notes doivent être une chaîne de caractères' })
  @Length(0, 1000, { message: 'Les notes ne peuvent dépasser 1000 caractères' })
  readonly notes?: string;

  @ApiPropertyOptional({
    description: 'Métadonnées de révocation',
    type: 'object',
    additionalProperties: true,
    example: {
      revokedBy: 'manager@example.com',
      category: 'planned_termination',
      impact: 'low',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Les métadonnées doivent être un objet valide' })
  readonly metadata?: Record<string, unknown>;
}

/**
 * 📄 DTO de réponse pour la révocation de rôle
 */
export class RevokeRoleResponseDto {
  @ApiProperty({
    description: "Succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Données de l'assignation révoquée",
    type: 'object',
    additionalProperties: true,
  })
  readonly data!: {
    readonly assignmentId: string;
    readonly userId: string;
    readonly role: UserRole;
    readonly businessContextId: string;
    readonly scope: AssignmentScope;
    readonly wasActive: boolean;
    readonly assignedAt: string;
    readonly revokedAt: string;
    readonly revokedBy: string;
    readonly reason?: string;
    readonly notes?: string;
    readonly metadata?: Record<string, unknown>;
  };

  @ApiProperty({
    description: "Informations sur l'opération",
    type: 'object',
    additionalProperties: true,
  })
  readonly operationInfo!: {
    readonly timestamp: string;
    readonly correlationId: string;
    readonly revokedBy: string;
    readonly affectedUser: {
      readonly userId: string;
      readonly email: string;
      readonly name?: string;
    };
    readonly revokedRole: {
      readonly role: UserRole;
      readonly scope: AssignmentScope;
      readonly businessContext: string;
    };
  };
}

/**
 * 📝 DTO pour révocation en lot (batch revocation)
 */
export class BatchRevokeRolesDto {
  @ApiProperty({
    description: "Liste des IDs d'assignations à révoquer",
    type: [String],
    example: [
      '456e7890-e89b-12d3-a456-426614174111',
      '567e8901-e89b-12d3-a456-426614174222',
      '678e9012-e89b-12d3-a456-426614174333',
    ],
  })
  @IsNotEmpty({ message: 'La liste des assignations ne peut être vide' })
  @IsUUID('4', {
    each: true,
    message: "Chaque ID d'assignation doit être un UUID valide",
  })
  readonly assignmentIds!: string[];

  @ApiPropertyOptional({
    description: 'Raison commune pour toutes les révocations',
    example: 'Restructuration organisationnelle',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'La raison doit être une chaîne de caractères' })
  @Length(1, 500, { message: 'La raison doit contenir 1 à 500 caractères' })
  readonly reason?: string;

  @ApiPropertyOptional({
    description: 'Notes communes pour toutes les révocations',
    example: 'Révocations en lot suite à la restructuration du département',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Les notes doivent être une chaîne de caractères' })
  @Length(0, 1000, { message: 'Les notes ne peuvent dépasser 1000 caractères' })
  readonly notes?: string;

  @ApiPropertyOptional({
    description: 'Métadonnées communes pour la révocation en lot',
    type: 'object',
    additionalProperties: true,
    example: {
      batchOperation: true,
      operationType: 'restructuring',
      department: 'IT',
      priority: 'high',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Les métadonnées doivent être un objet valide' })
  readonly metadata?: Record<string, unknown>;
}

/**
 * 📊 DTO de réponse pour la révocation en lot
 */
export class BatchRevokeRolesResponseDto {
  @ApiProperty({
    description: "Succès de l'opération en lot",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Résumé de l'opération en lot",
    type: 'object',
    additionalProperties: true,
  })
  readonly summary!: {
    readonly totalRequested: number;
    readonly successfulRevocations: number;
    readonly failedRevocations: number;
    readonly skippedRevocations: number;
  };

  @ApiProperty({
    description: 'Détails des révocations réussies',
    type: 'array',
  })
  readonly successful!: Array<{
    readonly assignmentId: string;
    readonly userId: string;
    readonly role: UserRole;
    readonly scope: AssignmentScope;
    readonly revokedAt: string;
  }>;

  @ApiPropertyOptional({
    description: 'Détails des révocations échouées',
    type: 'array',
  })
  readonly failed?: Array<{
    readonly assignmentId: string;
    readonly error: string;
    readonly errorCode: string;
    readonly userId?: string;
    readonly role?: UserRole;
  }>;

  @ApiPropertyOptional({
    description: 'Détails des révocations ignorées',
    type: 'array',
  })
  readonly skipped?: Array<{
    readonly assignmentId: string;
    readonly reason: string;
    readonly userId?: string;
    readonly role?: UserRole;
  }>;

  @ApiProperty({
    description: "Métadonnées de l'opération en lot",
    type: 'object',
    additionalProperties: true,
  })
  readonly operationMeta!: {
    readonly timestamp: string;
    readonly correlationId: string;
    readonly executionTimeMs: number;
    readonly revokedBy: string;
  };
}
