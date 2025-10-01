import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AssignmentScope } from "@shared/enums/assignment-scope.enum";
import { UserRole } from "@shared/enums/user-role.enum";
import {
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from "class-validator";

/**
 * 🎯 DTO pour l'assignation de rôle
 * Respecte les principes de validation stricte et documentation Swagger
 */
export class AssignRoleDto {
  @ApiProperty({
    description: "UUID de l'utilisateur à qui assigner le rôle",
    example: "f47b3c8a-8c5e-4b1a-9c2d-1e3f4a5b6c7d",
    format: "uuid",
  })
  @IsUUID(4, { message: "userId doit être un UUID valide" })
  readonly userId!: string;

  @ApiProperty({
    description: "Rôle à assigner à l'utilisateur",
    enum: UserRole,
    example: UserRole.LOCATION_MANAGER,
    enumName: "UserRole",
  })
  @IsEnum(UserRole, { message: "role doit être un rôle valide" })
  readonly role!: UserRole;

  @ApiProperty({
    description: "UUID du business (contexte racine obligatoire)",
    example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    format: "uuid",
  })
  @IsUUID(4, { message: "businessId doit être un UUID valide" })
  readonly businessId!: string;

  @ApiPropertyOptional({
    description:
      "UUID de la location (requis pour rôles LOCATION et DEPARTMENT)",
    example: "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID(4, { message: "locationId doit être un UUID valide" })
  readonly locationId?: string;

  @ApiPropertyOptional({
    description: "UUID du département (requis pour rôles DEPARTMENT)",
    example: "c3d4e5f6-g7h8-9012-cdef-345678901234",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID(4, { message: "departmentId doit être un UUID valide" })
  readonly departmentId?: string;

  @ApiProperty({
    description: "Étendue de l'assignation (détermine le niveau hiérarchique)",
    enum: AssignmentScope,
    example: AssignmentScope.BUSINESS,
    enumName: "AssignmentScope",
  })
  @IsEnum(AssignmentScope, {
    message: "assignmentScope doit être une étendue valide",
  })
  readonly assignmentScope!: AssignmentScope;

  @ApiPropertyOptional({
    description: "Date d'expiration de l'assignation (ISO 8601)",
    example: "2024-12-31T23:59:59.000Z",
    type: "string",
    format: "date-time",
  })
  @IsOptional()
  @IsDateString({}, { message: "expiresAt doit être une date ISO 8601 valide" })
  readonly expiresAt?: string;

  @ApiPropertyOptional({
    description: "Notes sur l'assignation de rôle",
    example: "Assignation temporaire pour le projet Q4",
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: "notes doit être une chaîne de caractères" })
  @Length(0, 500, { message: "notes ne peut pas dépasser 500 caractères" })
  readonly notes?: string;

  @ApiPropertyOptional({
    description: "Métadonnées flexibles pour l'assignation",
    type: "object",
    additionalProperties: true,
    example: {
      project: "Q4-2024",
      department: "Sales",
      temporary: true,
    },
  })
  @IsOptional()
  @IsObject({ message: "metadata doit être un objet valide" })
  readonly metadata?: Record<string, unknown>;
}

/**
 * 🎯 DTO de réponse après assignation de rôle
 */
export class AssignRoleResponseDto {
  @ApiProperty({
    description: "Succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Données de l'assignation créée",
    type: "object",
    additionalProperties: true,
    example: {
      assignmentId: "550e8400-e29b-41d4-a716-446655440000",
      userId: "123e4567-e89b-12d3-a456-426614174000",
      role: UserRole.LOCATION_MANAGER,
      businessContextId: "987fcdeb-51a2-43d7-8c9f-123456789abc",
      scope: AssignmentScope.BUSINESS,
      assignedAt: "2024-01-15T10:30:00Z",
      assignedBy: "456e7890-e12b-34c5-a678-901234567890",
      expiresAt: "2025-01-15T10:30:00Z",
      isActive: true,
    },
  })
  readonly data!: {
    readonly assignmentId: string;
    readonly userId: string;
    readonly role: UserRole;
    readonly businessId: string;
    readonly locationId?: string;
    readonly departmentId?: string;
    readonly assignmentScope: AssignmentScope;
    readonly assignedAt: string;
    readonly expiresAt?: string;
    readonly isActive: boolean;
    readonly notes?: string;
    readonly metadata?: Record<string, unknown>;
  };

  @ApiPropertyOptional({
    description: "Métadonnées de l'opération",
    type: "object",
    additionalProperties: true,
    example: {
      processedAt: "2024-01-15T10:30:00Z",
      correlationId: "550e8400-e29b-41d4-a716-446655440000",
      executionTimeMs: 125,
    },
  })
  readonly meta?: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}
