import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
} from "class-validator";

/**
 * ✅ EXCELLENT - DTO pour création de type de service avec validation stricte
 */
export class CreateServiceTypeDto {
  @ApiProperty({
    description: "Business ID - Enterprise UUID v4 format",
    example: "123e4567-e89b-12d3-a456-426614174000",
    format: "uuid",
  })
  @IsString()
  @IsUUID("4", { message: "Business ID must be a valid UUID v4" })
  businessId!: string;

  @ApiProperty({
    description: "Service type name - Business defined",
    example: "Consultation Premium",
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100, {
    message: "Service type name must be between 2 and 100 characters",
  })
  name!: string;

  @ApiProperty({
    description: "Service type code - Uppercase alphanumeric with underscores",
    example: "CONSULT_PREMIUM",
    minLength: 2,
    maxLength: 20,
  })
  @IsString()
  @Length(2, 20, {
    message: "Service type code must be between 2 and 20 characters",
  })
  @Matches(/^[A-Z0-9_]+$/, {
    message:
      "Code must contain only uppercase letters, numbers, and underscores",
  })
  code!: string;

  @ApiPropertyOptional({
    description: "Service type description - Optional detailed explanation",
    example: "Consultation premium avec suivi personnalisé étendu",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, {
    message: "Service type description cannot exceed 500 characters",
  })
  description?: string;

  @ApiPropertyOptional({
    description: "Sort order for display - Higher numbers appear first",
    example: 100,
    minimum: 0,
    maximum: 9999,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sortOrder?: number;

  @ApiPropertyOptional({
    description: "Whether the service type is active",
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * ✅ EXCELLENT - DTO pour mise à jour de type de service
 */
export class UpdateServiceTypeDto {
  @ApiPropertyOptional({
    description: "Service type name - Business defined",
    example: "Consultation Premium Updated",
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100, {
    message: "Service type name must be between 2 and 100 characters",
  })
  name?: string;

  @ApiPropertyOptional({
    description: "Service type code - Uppercase alphanumeric with underscores",
    example: "CONSULT_PREMIUM_V2",
    minLength: 2,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(2, 20, {
    message: "Service type code must be between 2 and 20 characters",
  })
  @Matches(/^[A-Z0-9_]+$/, {
    message:
      "Code must contain only uppercase letters, numbers, and underscores",
  })
  code?: string;

  @ApiPropertyOptional({
    description: "Service type description - Optional detailed explanation",
    example: "Consultation premium avec suivi personnalisé étendu - Version 2",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, {
    message: "Service type description cannot exceed 500 characters",
  })
  description?: string;

  @ApiPropertyOptional({
    description: "Sort order for display - Higher numbers appear first",
    example: 150,
    minimum: 0,
    maximum: 9999,
  })
  @IsOptional()
  @IsInt()
  @Min(0, { message: "Sort order cannot be negative" })
  @Max(9999, { message: "Sort order cannot exceed 9999" })
  sortOrder?: number;

  @ApiPropertyOptional({
    description: "Whether the service type is active",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * ✅ EXCELLENT - DTO pour recherche/filtrage des types de service
 */
export class ListServiceTypesDto {
  @ApiPropertyOptional({ minimum: 1, default: 1, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10, example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: ["name", "code", "sortOrder", "createdAt"],
    default: "sortOrder",
    example: "sortOrder",
  })
  @IsOptional()
  @IsIn(["name", "code", "sortOrder", "createdAt"])
  sortBy?: string = "sortOrder";

  @ApiPropertyOptional({
    enum: ["asc", "desc"],
    default: "asc",
    example: "asc",
  })
  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "asc";

  @ApiPropertyOptional({
    description: "Search term for name and code fields",
    example: "consultation",
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  search?: string;

  @ApiPropertyOptional({
    description: "Filter by active status",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * ✅ EXCELLENT - DTO de réponse pour type de service
 */
export class ServiceTypeDto {
  @ApiProperty({
    description: "Service type unique identifier",
    example: "987fcdeb-51d2-43e8-b456-789012345678",
  })
  id!: string;

  @ApiProperty({
    description: "Business ID that owns this service type",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  businessId!: string;

  @ApiProperty({
    description: "Service type name",
    example: "Consultation Premium",
  })
  name!: string;

  @ApiProperty({
    description: "Service type code",
    example: "CONSULT_PREMIUM",
  })
  code!: string;

  @ApiProperty({
    description: "Service type description",
    example: "Consultation premium avec suivi personnalisé étendu",
  })
  description!: string;

  @ApiProperty({
    description: "Sort order for display",
    example: 100,
  })
  sortOrder!: number;

  @ApiProperty({
    description: "Whether the service type is active",
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2024-01-15T10:30:00.000Z",
  })
  createdAt!: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2024-01-15T14:45:00.000Z",
  })
  updatedAt!: Date;
}

/**
 * ✅ EXCELLENT - DTO de réponse pour liste paginée
 */
export class ListServiceTypesResponseDto {
  @ApiProperty({ type: [ServiceTypeDto] })
  data!: ServiceTypeDto[];

  @ApiProperty({
    description: "Pagination metadata",
    example: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 47,
      itemsPerPage: 10,
      hasNextPage: true,
      hasPrevPage: false,
    },
  })
  meta!: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

/**
 * ✅ EXCELLENT - DTO de réponse pour création
 */
export class CreateServiceTypeResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: ServiceTypeDto })
  data!: ServiceTypeDto;

  @ApiProperty({
    description: "Request metadata",
    example: {
      timestamp: "2024-01-15T10:30:00.000Z",
      correlationId: "create_service_type_1642234200000",
    },
  })
  meta!: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}

/**
 * ✅ EXCELLENT - DTO de réponse pour mise à jour
 */
export class UpdateServiceTypeResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: ServiceTypeDto })
  data!: ServiceTypeDto;

  @ApiProperty({
    description: "Request metadata",
    example: {
      timestamp: "2024-01-15T14:45:00.000Z",
      correlationId: "update_service_type_1642248300000",
    },
  })
  meta!: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}

/**
 * ✅ EXCELLENT - DTO de réponse pour suppression
 */
export class DeleteServiceTypeResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({
    description: "Deletion confirmation message",
    example: "Service type deleted successfully",
  })
  message!: string;

  @ApiProperty({
    description: "Request metadata",
    example: {
      timestamp: "2024-01-15T16:20:00.000Z",
      correlationId: "delete_service_type_1642254000000",
    },
  })
  meta!: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}
