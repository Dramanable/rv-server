/**
 * 🎯 DTO - ListPermissionsResponse
 * Clean Architecture - Presentation Layer
 * DTO pour les réponses de liste paginée des permissions
 */

import { ApiProperty } from "@nestjs/swagger";
import { PermissionResponseDto } from "./permission-response.dto";

export class ListPermissionsResponseDto {
  @ApiProperty({
    description: "Succès de la requête",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Liste des permissions",
    type: [PermissionResponseDto],
  })
  readonly data!: PermissionResponseDto[];

  @ApiProperty({
    description: "Métadonnées de pagination",
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

export class CreatePermissionResponseDto {
  @ApiProperty({
    description: "Succès de la requête",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Permission créée",
    type: PermissionResponseDto,
  })
  readonly data!: PermissionResponseDto;
}

export class UpdatePermissionResponseDto {
  @ApiProperty({
    description: "Succès de la requête",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Permission mise à jour",
    type: PermissionResponseDto,
  })
  readonly data!: PermissionResponseDto;
}

export class DeletePermissionResponseDto {
  @ApiProperty({
    description: "Succès de la requête",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Message de confirmation",
    example: "Permission supprimée avec succès",
  })
  readonly message!: string;
}
