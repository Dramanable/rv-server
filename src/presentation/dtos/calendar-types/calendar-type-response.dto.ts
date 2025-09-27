import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO de réponse pour un type de calendrier
 * ✅ Toutes les propriétés exposées à l'API
 * ✅ Documentation Swagger complète
 * ✅ Format standardisé pour l'API
 */
export class CalendarTypeDto {
  @ApiProperty({
    description: "Unique identifier of the calendar type",
    example: "123e4567-e89b-12d3-a456-426614174000",
    format: "uuid",
  })
  readonly id!: string;

  @ApiProperty({
    description: "Business ID that owns this calendar type",
    example: "550e8400-e29b-41d4-a716-446655440000",
    format: "uuid",
  })
  readonly businessId!: string;

  @ApiProperty({
    description: "Name of the calendar type",
    example: "Consultation Médicale",
  })
  readonly name!: string;

  @ApiProperty({
    description: "Unique code for the calendar type",
    example: "CONSULTATION",
  })
  readonly code!: string;

  @ApiProperty({
    description: "Description of the calendar type",
    example: "Calendrier pour les consultations médicales et suivis patients",
  })
  readonly description!: string;

  @ApiProperty({
    description: "Color associated with the calendar type",
    example: "#4CAF50",
  })
  readonly color!: string;

  @ApiProperty({
    description: "Icon identifier for the calendar type",
    example: "medical-calendar",
    nullable: true,
  })
  readonly icon!: string | null;

  @ApiProperty({
    description: "Sort order for displaying calendar types",
    example: 1,
    minimum: 0,
  })
  readonly sortOrder!: number;

  @ApiProperty({
    description: "Whether this calendar type is active",
    example: true,
  })
  readonly isActive!: boolean;

  @ApiProperty({
    description:
      "Whether this is a built-in calendar type (cannot be modified)",
    example: false,
  })
  readonly isBuiltIn!: boolean;

  @ApiProperty({
    description: "ID of the user who created this calendar type",
    example: "987fcdeb-51a2-43d1-9c15-789456123000",
    format: "uuid",
  })
  readonly createdBy!: string;

  @ApiProperty({
    description: "ID of the user who last updated this calendar type",
    example: "987fcdeb-51a2-43d1-9c15-789456123000",
    format: "uuid",
  })
  readonly updatedBy!: string;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2024-01-15T10:30:00.000Z",
    format: "date-time",
  })
  readonly createdAt!: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2024-01-20T15:45:00.000Z",
    format: "date-time",
  })
  readonly updatedAt!: Date;
}

/**
 * DTO de réponse simple pour un type de calendrier (GET by ID)
 */
export class CalendarTypeResponseDto {
  @ApiProperty({
    description: "Operation success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Calendar type data",
    type: CalendarTypeDto,
  })
  readonly data!: CalendarTypeDto;
}

/**
 * DTO de réponse pour la création d'un type de calendrier
 */
export class CreateCalendarTypeResponseDto {
  @ApiProperty({
    description: "Operation success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Created calendar type",
    type: CalendarTypeDto,
  })
  readonly data!: CalendarTypeDto;

  @ApiProperty({
    description: "Response metadata",
    example: {
      timestamp: "2024-01-15T10:30:00.000Z",
      correlationId: "abc123-def456-ghi789",
    },
  })
  readonly meta!: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}

/**
 * DTO de réponse pour la mise à jour d'un type de calendrier
 */
export class UpdateCalendarTypeResponseDto {
  @ApiProperty({
    description: "Operation success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Updated calendar type",
    type: CalendarTypeDto,
  })
  readonly data!: CalendarTypeDto;

  @ApiProperty({
    description: "Response metadata",
    example: {
      timestamp: "2024-01-15T10:30:00.000Z",
      correlationId: "abc123-def456-ghi789",
    },
  })
  readonly meta!: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}

/**
 * DTO de réponse pour la suppression d'un type de calendrier
 */
export class DeleteCalendarTypeResponseDto {
  @ApiProperty({
    description: "Operation success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Deletion confirmation message",
    example: "Calendar type deleted successfully",
  })
  readonly message!: string;

  @ApiProperty({
    description: "Response metadata",
    example: {
      timestamp: "2024-01-15T10:30:00.000Z",
      correlationId: "abc123-def456-ghi789",
    },
  })
  readonly meta!: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}

/**
 * DTO de réponse pour la liste paginée des types de calendrier
 */
export class ListCalendarTypesResponseDto {
  @ApiProperty({
    description: "Operation success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "List of calendar types",
    type: [CalendarTypeDto],
  })
  readonly data!: CalendarTypeDto[];

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
