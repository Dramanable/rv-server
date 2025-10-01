/**
 * 🎯 Service DTOs - Clean Architecture Presentation Layer
 *
 * DTOs pour la gestion des services avec validation stricte
 * ✅ Validation class-validator + documentation Swagger complète
 * ✅ Alignement parfait avec les interfaces Use Case
 */
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import {
  PricingConfigDto,
  ServicePackageDto,
} from "./service/pricing-config.dto";

// ==================== VALUE OBJECTS DTOs ====================

export class MoneyDto {
  @ApiProperty({
    description: "Price amount",
    example: 75.5,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  readonly amount!: number;

  @ApiProperty({
    description: "Currency code (ISO 4217)",
    example: "EUR",
    enum: ["EUR", "USD", "GBP", "CAD"],
  })
  @IsString()
  @IsIn(["EUR", "USD", "GBP", "CAD"])
  readonly currency!: string;
}

export class ServiceSettingsDto {
  @ApiPropertyOptional({
    description: "Enable online booking for this service",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isOnlineBookingEnabled?: boolean;

  @ApiPropertyOptional({
    description: "Requires approval before booking confirmation",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly requiresApproval?: boolean;

  @ApiPropertyOptional({
    description: "Maximum days in advance for booking",
    example: 30,
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  readonly maxAdvanceBookingDays?: number;

  @ApiPropertyOptional({
    description: "Minimum hours in advance for booking",
    example: 2,
    minimum: 0,
    maximum: 72,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(72)
  readonly minAdvanceBookingHours?: number;

  @ApiPropertyOptional({
    description: "Buffer time before appointment (minutes)",
    example: 15,
    minimum: 0,
    maximum: 120,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  readonly bufferTimeBefore?: number;

  @ApiPropertyOptional({
    description: "Buffer time after appointment (minutes)",
    example: 15,
    minimum: 0,
    maximum: 120,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  readonly bufferTimeAfter?: number;

  @ApiPropertyOptional({
    description: "Allow group bookings for this service",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isGroupBookingAllowed?: boolean;

  @ApiPropertyOptional({
    description: "Maximum group size allowed",
    example: 6,
    minimum: 2,
    maximum: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(20)
  readonly maxGroupSize?: number;
}

export class ServiceRequirementsDto {
  @ApiPropertyOptional({
    description: "Preparation instructions for the service",
    example: "Please arrive 10 minutes early",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  readonly preparation?: string;

  @ApiPropertyOptional({
    description: "Required materials or items to bring",
    example: ["ID card", "Medical records"],
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @Length(1, 100, { each: true })
  readonly materials?: string[];

  @ApiPropertyOptional({
    description: "Service restrictions or contraindications",
    example: ["No pregnancy", "No heart conditions"],
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @Length(1, 200, { each: true })
  readonly restrictions?: string[];

  @ApiPropertyOptional({
    description: "Cancellation policy for this service",
    example: "24 hours notice required for cancellation",
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  readonly cancellationPolicy?: string;
}

// ==================== CRUD DTOs ====================

export class CreateServiceDto {
  @ApiProperty({
    description: "Business ID that owns this service",
    example: "550e8400-e29b-41d4-a716-446655440000",
    format: "uuid",
  })
  @IsUUID("4")
  readonly businessId!: string;

  @ApiProperty({
    description: "Service name",
    example: "Deep Tissue Massage",
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  readonly name!: string;

  @ApiPropertyOptional({
    description: "Detailed service description",
    example: "Therapeutic massage focusing on deeper layers of muscle",
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  readonly description?: string;

  @ApiProperty({
    description: "Service type IDs (at least one required)",
    example: [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
    ],
    type: [String],
    format: "uuid",
  })
  @IsArray()
  @IsUUID("4", { each: true })
  @ArrayMinSize(1, { message: "At least one service type ID is required" })
  readonly serviceTypeIds!: string[];

  @ApiProperty({
    description: "Service duration in minutes",
    example: 60,
    minimum: 15,
    maximum: 480,
  })
  @IsNumber()
  @Min(15)
  @Max(480)
  readonly duration!: number;

  @ApiPropertyOptional({
    description: "Service price (legacy - use pricingConfig instead)",
    type: MoneyDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  readonly price?: MoneyDto;

  @ApiProperty({
    description: "Flexible pricing configuration",
    type: PricingConfigDto,
  })
  @ValidateNested()
  @Type(() => PricingConfigDto)
  readonly pricingConfig!: PricingConfigDto;

  @ApiPropertyOptional({
    description: "Service packages (forfaits)",
    type: [ServicePackageDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicePackageDto)
  readonly packages?: ServicePackageDto[];

  @ApiPropertyOptional({
    description: "Service booking and behavior settings",
    type: ServiceSettingsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceSettingsDto)
  readonly settings?: ServiceSettingsDto;

  @ApiPropertyOptional({
    description: "Service requirements and policies",
    type: ServiceRequirementsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceRequirementsDto)
  readonly requirements?: ServiceRequirementsDto;

  @ApiPropertyOptional({
    description: "Whether the service is active",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}

export class UpdateServiceDto {
  @ApiPropertyOptional({
    description: "Service name",
    example: "Deep Tissue Massage",
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  readonly name?: string;

  @ApiPropertyOptional({
    description: "Detailed service description",
    example: "Therapeutic massage focusing on deeper layers of muscle",
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  readonly description?: string;

  @ApiPropertyOptional({
    description: "Service type IDs (at least one required if provided)",
    example: [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
    ],
    type: [String],
    format: "uuid",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  @ArrayMinSize(1, { message: "At least one service type ID is required" })
  readonly serviceTypeIds?: string[];

  @ApiPropertyOptional({
    description: "Service duration in minutes",
    example: 60,
    minimum: 15,
    maximum: 480,
  })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(480)
  readonly duration?: number;

  @ApiPropertyOptional({
    description: "Service price (legacy - use pricingConfig instead)",
    type: MoneyDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  readonly price?: MoneyDto;

  @ApiPropertyOptional({
    description: "Flexible pricing configuration",
    type: PricingConfigDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PricingConfigDto)
  readonly pricingConfig?: PricingConfigDto;

  @ApiPropertyOptional({
    description: "Service packages (forfaits)",
    type: [ServicePackageDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicePackageDto)
  readonly packages?: ServicePackageDto[];

  @ApiPropertyOptional({
    description: "Service booking and behavior settings",
    type: ServiceSettingsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceSettingsDto)
  readonly settings?: ServiceSettingsDto;

  @ApiPropertyOptional({
    description: "Service requirements and policies",
    type: ServiceRequirementsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceRequirementsDto)
  readonly requirements?: ServiceRequirementsDto;

  @ApiPropertyOptional({
    description: "Whether the service is active",
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}

export class ListServicesDto {
  @ApiPropertyOptional({
    description: "Page number (1-based)",
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of services per page",
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "name",
    enum: ["name", "duration", "price", "createdAt"],
    default: "createdAt",
  })
  @IsOptional()
  @IsIn(["name", "duration", "price", "createdAt"])
  readonly sortBy?: string = "createdAt";

  @ApiPropertyOptional({
    description: "Sort order",
    example: "desc",
    enum: ["asc", "desc"],
    default: "desc",
  })
  @IsOptional()
  @IsIn(["asc", "desc"])
  readonly sortOrder?: "asc" | "desc" = "desc";

  @ApiPropertyOptional({
    description: "Search term for service name or description",
    example: "massage",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  readonly search?: string;

  @ApiPropertyOptional({
    description: "Filter by business ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID("4")
  readonly businessId?: string;

  @ApiPropertyOptional({
    description: "Filter by service type IDs",
    example: ["550e8400-e29b-41d4-a716-446655440001"],
    type: [String],
    format: "uuid",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  readonly serviceTypeIds?: string[];

  @ApiPropertyOptional({
    description: "Filter by active status",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @ApiPropertyOptional({
    description: "Filter by minimum duration (minutes)",
    example: 30,
    minimum: 15,
  })
  @IsOptional()
  @IsNumber()
  @Min(15)
  readonly minDuration?: number;

  @ApiPropertyOptional({
    description: "Filter by maximum duration (minutes)",
    example: 120,
    maximum: 480,
  })
  @IsOptional()
  @IsNumber()
  @Max(480)
  readonly maxDuration?: number;

  @ApiPropertyOptional({
    description: "Filter by minimum price",
    example: 25.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly minPrice?: number;

  @ApiPropertyOptional({
    description: "Filter by maximum price",
    example: 200.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly maxPrice?: number;
}

// ==================== RESPONSE DTOs ====================

export class ServiceDto {
  @ApiProperty({
    description: "Service unique identifier",
    example: "550e8400-e29b-41d4-a716-446655440000",
    format: "uuid",
  })
  readonly id!: string;

  @ApiProperty({
    description: "Service name",
    example: "Deep Tissue Massage",
  })
  readonly name!: string;

  @ApiPropertyOptional({
    description: "Detailed service description",
    example: "Therapeutic massage focusing on deeper layers of muscle",
  })
  readonly description?: string;

  @ApiProperty({
    description: "Service type IDs",
    example: [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
    ],
    type: [String],
    format: "uuid",
  })
  readonly serviceTypeIds!: string[];

  @ApiProperty({
    description: "Service duration in minutes",
    example: 60,
  })
  readonly duration!: number;

  @ApiPropertyOptional({
    description: "Service price (legacy - null for FREE services)",
    type: MoneyDto,
  })
  readonly price?: MoneyDto;

  @ApiProperty({
    description: "Flexible pricing configuration",
    type: PricingConfigDto,
  })
  readonly pricingConfig!: PricingConfigDto;

  @ApiPropertyOptional({
    description: "Service packages (forfaits)",
    type: [ServicePackageDto],
  })
  readonly packages?: ServicePackageDto[];

  @ApiProperty({
    description: "Business ID that owns this service",
    example: "550e8400-e29b-41d4-a716-446655440000",
    format: "uuid",
  })
  readonly businessId!: string;

  @ApiProperty({
    description: "Whether the service is active",
    example: true,
  })
  readonly isActive!: boolean;

  @ApiPropertyOptional({
    description: "Service booking settings",
    type: ServiceSettingsDto,
  })
  readonly settings?: ServiceSettingsDto;

  @ApiPropertyOptional({
    description: "Service requirements",
    type: ServiceRequirementsDto,
  })
  readonly requirements?: ServiceRequirementsDto;

  @ApiProperty({
    description: "Service creation timestamp",
    example: "2024-01-15T10:30:00Z",
    format: "date-time",
  })
  readonly createdAt!: Date;

  @ApiProperty({
    description: "Service last update timestamp",
    example: "2024-01-15T14:30:00Z",
    format: "date-time",
  })
  readonly updatedAt!: Date;
}

export class ListServicesResponseDto {
  @ApiProperty({
    description: "Array of services",
    type: [ServiceDto],
  })
  readonly data!: ServiceDto[];

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
  readonly meta!: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

// ==================== OPERATION RESPONSE DTOs ====================

export class CreateServiceResponseDto {
  @ApiProperty({
    description: "Operation success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Created service data",
    type: ServiceDto,
  })
  readonly data!: ServiceDto;

  @ApiProperty({
    description: "Success message",
    example: "Service created successfully",
  })
  readonly message!: string;
}

export class UpdateServiceResponseDto {
  @ApiProperty({
    description: "Operation success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Updated service data",
    type: ServiceDto,
  })
  readonly data!: ServiceDto;

  @ApiProperty({
    description: "Success message",
    example: "Service updated successfully",
  })
  readonly message!: string;
}

export class DeleteServiceResponseDto {
  @ApiProperty({
    description: "Operation success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Success message",
    example: "Service deleted successfully",
  })
  readonly message!: string;

  @ApiProperty({
    description: "Deleted service ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
    format: "uuid",
  })
  readonly serviceId!: string;
}
