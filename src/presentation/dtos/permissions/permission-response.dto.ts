/**
 * 🎯 DTO - PermissionResponse
 * Clean Architecture - Presentation Layer
 * DTO pour les réponses contenant une permission
 */

import { ApiProperty } from "@nestjs/swagger";

export class PermissionResponseDto {
  @ApiProperty({
    description: "Identifiant unique de la permission",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  readonly id!: string;

  @ApiProperty({
    description: "Nom unique de la permission",
    example: "MANAGE_APPOINTMENTS",
  })
  readonly name!: string;

  @ApiProperty({
    description: "Nom d'affichage de la permission",
    example: "Gérer les rendez-vous",
  })
  readonly displayName!: string;

  @ApiProperty({
    description: "Description détaillée de la permission",
    example: "Permet de créer, modifier et annuler les rendez-vous",
  })
  readonly description!: string;

  @ApiProperty({
    description: "Catégorie de la permission",
    example: "APPOINTMENTS",
    enum: ["BUSINESS", "STAFF", "SERVICES", "APPOINTMENTS", "USERS", "SYSTEM"],
  })
  readonly category!: string;

  @ApiProperty({
    description: "Indique si c'est une permission système",
    example: false,
  })
  readonly isSystemPermission!: boolean;

  @ApiProperty({
    description: "Statut actif/inactif de la permission",
    example: true,
  })
  readonly isActive!: boolean;

  @ApiProperty({
    description: "Date de création (ISO string)",
    example: "2024-12-18T10:30:00.000Z",
  })
  readonly createdAt!: string;

  @ApiProperty({
    description: "Date de dernière modification (ISO string)",
    example: "2024-12-18T15:45:00.000Z",
  })
  readonly updatedAt!: string;
}
