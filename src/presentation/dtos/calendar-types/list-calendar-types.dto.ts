import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

/**
 * DTO pour la recherche paginée des types de calendrier
 * ✅ Pattern standardisé pour toutes les ressources
 * ✅ Filtres métier spécifiques aux CalendarType
 * ✅ Documentation Swagger complète
 */
export class ListCalendarTypesDto {
  @ApiPropertyOptional({
    description: "Page number for pagination",
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "name",
    enum: ["name", "code", "createdAt", "updatedAt"],
    default: "createdAt",
  })
  @IsOptional()
  @IsIn(["name", "code", "createdAt", "updatedAt"])
  readonly sortBy?: string = "createdAt";

  @ApiPropertyOptional({
    description: "Sort order",
    example: "asc",
    enum: ["asc", "desc"],
    default: "desc",
  })
  @IsOptional()
  @IsIn(["asc", "desc"])
  readonly sortOrder?: "asc" | "desc" = "desc";

  @ApiPropertyOptional({
    description: "Search term for name, code or description",
    example: "consultation",
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  readonly search?: string;

  @ApiPropertyOptional({
    description: "Filter by active status",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @ApiPropertyOptional({
    description: "Filter by built-in status",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isBuiltIn?: boolean;

  @ApiPropertyOptional({
    description: "Filter by business ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsOptional()
  @IsString()
  readonly businessId?: string;
}
