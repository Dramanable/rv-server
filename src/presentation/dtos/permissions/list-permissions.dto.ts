/**
 * 🎯 DTO - ListPermissions
 * Clean Architecture - Presentation Layer
 * DTO pour la recherche paginée des permissions
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class ListPermissionsDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    description: "Numéro de page pour la pagination",
    example: 1,
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
    description: "Nombre d'éléments par page",
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    enum: ["name", "displayName", "category", "createdAt"],
    default: "createdAt",
    description: "Champ de tri",
    example: "createdAt",
  })
  @IsOptional()
  @IsIn(["name", "displayName", "category", "createdAt"])
  readonly sortBy?: string = "createdAt";

  @ApiPropertyOptional({
    enum: ["asc", "desc"],
    default: "desc",
    description: "Ordre de tri",
    example: "desc",
  })
  @IsOptional()
  @IsIn(["asc", "desc"])
  readonly sortOrder?: "asc" | "desc" = "desc";

  @ApiPropertyOptional({
    description: "Terme de recherche dans nom, nom d'affichage et description",
    example: "rendez-vous",
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  readonly search?: string;

  @ApiPropertyOptional({
    description: "Filtrer par catégorie de permission",
    enum: ["BUSINESS", "STAFF", "SERVICES", "APPOINTMENTS", "USERS", "SYSTEM"],
    example: "APPOINTMENTS",
  })
  @IsOptional()
  @IsString()
  readonly category?: string;

  @ApiPropertyOptional({
    description: "Filtrer par statut actif/inactif",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @ApiPropertyOptional({
    description: "Filtrer par type de permission (système ou non)",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isSystemPermission?: boolean;
}
