import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsUUID,
  IsString,
  IsDateString,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsIn,
  IsInt,
  Min,
  Max,
  Length,
} from "class-validator";

export class GetAvailableSlotsDto {
  @ApiProperty({
    description: "UUID of the business",
    example: "550e8400-e29b-41d4-a716-446655440000",
    format: "uuid",
  })
  @IsUUID()
  readonly businessId!: string;

  @ApiProperty({
    description: "UUID of the service",
    example: "770e8400-e29b-41d4-a716-446655440002",
    format: "uuid",
  })
  @IsUUID()
  readonly serviceId!: string;

  @ApiProperty({
    description: "Date to search for available slots (ISO 8601 date)",
    example: "2025-01-15",
    format: "date",
  })
  @IsDateString()
  readonly date!: string;

  @ApiPropertyOptional({
    description: "UUID of preferred staff member",
    example: "880e8400-e29b-41d4-a716-446655440003",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  readonly preferredStaffId?: string;
}

export class ListAppointmentsDto {
  @ApiPropertyOptional({
    description: "Page number for pagination",
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 20;

  @ApiPropertyOptional({
    description: "Field to sort by",
    enum: ["startTime", "createdAt", "updatedAt", "status"],
    default: "startTime",
    example: "startTime",
  })
  @IsOptional()
  @IsIn(["startTime", "createdAt", "updatedAt", "status"])
  readonly sortBy?: string = "startTime";

  @ApiPropertyOptional({
    description: "Sort order",
    enum: ["asc", "desc"],
    default: "asc",
    example: "asc",
  })
  @IsOptional()
  @IsIn(["asc", "desc"])
  readonly sortOrder?: "asc" | "desc" = "asc";

  @ApiPropertyOptional({
    description: "Search term for client name or appointment title",
    example: "Jean Dupont",
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  readonly search?: string;

  @ApiPropertyOptional({
    description: "Filter by appointment status",
    enum: [
      "SCHEDULED",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ],
    example: "CONFIRMED",
  })
  @IsOptional()
  @IsIn([
    "SCHEDULED",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
  ])
  readonly status?: string;

  @ApiPropertyOptional({
    description: "Filter by business ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  readonly businessId?: string;

  @ApiPropertyOptional({
    description: "Filter by service ID",
    example: "770e8400-e29b-41d4-a716-446655440002",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  readonly serviceId?: string;

  @ApiPropertyOptional({
    description: "Filter by staff member ID",
    example: "880e8400-e29b-41d4-a716-446655440003",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  readonly staffId?: string;

  @ApiPropertyOptional({
    description: "Filter by date range start (ISO 8601 date)",
    example: "2025-01-15",
    format: "date",
  })
  @IsOptional()
  @IsDateString()
  readonly dateFrom?: string;

  @ApiPropertyOptional({
    description: "Filter by date range end (ISO 8601 date)",
    example: "2025-01-31",
    format: "date",
  })
  @IsOptional()
  @IsDateString()
  readonly dateTo?: string;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({
    description: "New start time for the appointment (ISO 8601)",
    example: "2025-01-15T15:00:00.000Z",
    format: "date-time",
  })
  @IsOptional()
  @IsDateString()
  readonly startTime?: string;

  @ApiPropertyOptional({
    description: "New end time for the appointment (ISO 8601)",
    example: "2025-01-15T16:00:00.000Z",
    format: "date-time",
  })
  @IsOptional()
  @IsDateString()
  readonly endTime?: string;

  @ApiPropertyOptional({
    description: "New appointment status",
    enum: [
      "SCHEDULED",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ],
    example: "CONFIRMED",
  })
  @IsOptional()
  @IsIn([
    "SCHEDULED",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
  ])
  readonly status?: string;

  @ApiPropertyOptional({
    description: "Updated title for the appointment",
    example: "Consultation de suivi",
    minLength: 5,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(5, 100)
  readonly title?: string;

  @ApiPropertyOptional({
    description: "Updated description or notes",
    example: "Ajout de vaccins au contrôle",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  readonly description?: string;

  @ApiPropertyOptional({
    description: "New assigned staff member ID",
    example: "880e8400-e29b-41d4-a716-446655440999",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  readonly assignedStaffId?: string;
}

export class CancelAppointmentDto {
  @ApiProperty({
    description: "Reason for cancellation",
    example: "Conflit d'horaire côté client",
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @Length(10, 500)
  readonly cancellationReason!: string;

  @ApiPropertyOptional({
    description: "Whether to notify the client of cancellation",
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly notifyClient?: boolean;

  @ApiPropertyOptional({
    description: "Whether to offer rebooking options",
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly offerRebooking?: boolean;
}
