import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class ClientInfoResponseDto {
  @ApiProperty({
    description: "First name of the client",
    example: "Jean",
  })
  readonly firstName!: string;

  @ApiProperty({
    description: "Last name of the client",
    example: "Dupont",
  })
  readonly lastName!: string;

  @ApiProperty({
    description: "Email address of the client",
    example: "jean.dupont@example.com",
  })
  readonly email!: string;

  @ApiPropertyOptional({
    description: "Phone number of the client",
    example: "+33123456789",
  })
  readonly phone?: string;

  @ApiPropertyOptional({
    description: "Whether this is a new client",
    example: false,
  })
  readonly isNewClient?: boolean;
}

export class BookedByInfoResponseDto {
  @ApiProperty({
    description: "First name of the person booking",
    example: "Marie",
  })
  readonly firstName!: string;

  @ApiProperty({
    description: "Last name of the person booking",
    example: "Dupont",
  })
  readonly lastName!: string;

  @ApiProperty({
    description: "Email address of the person booking",
    example: "marie.dupont@example.com",
  })
  readonly email!: string;

  @ApiPropertyOptional({
    description: "Phone number of the person booking",
    example: "+33987654321",
  })
  readonly phone?: string;

  @ApiProperty({
    description: "Relationship to the client",
    example: "SPOUSE",
  })
  readonly relationship!: string;

  @ApiPropertyOptional({
    description: 'Description of relationship when "OTHER" is selected',
    example: "Voisin proche qui aide",
  })
  readonly relationshipDescription?: string;
}

export class ClientInfoWithBookedByResponseDto extends ClientInfoResponseDto {
  @ApiPropertyOptional({
    description: "Information about the person booking for the client",
    type: BookedByInfoResponseDto,
  })
  readonly bookedBy?: BookedByInfoResponseDto;
}

export class TimeSlotResponseDto {
  @ApiProperty({
    description: "Start time of the time slot (ISO 8601)",
    example: "2025-01-15T14:30:00.000Z",
  })
  readonly startTime!: string;

  @ApiProperty({
    description: "End time of the time slot (ISO 8601)",
    example: "2025-01-15T15:30:00.000Z",
  })
  readonly endTime!: string;

  @ApiProperty({
    description: "Duration in minutes",
    example: 60,
  })
  readonly durationInMinutes!: number;
}

export class AppointmentResponseDto {
  @ApiProperty({
    description: "Unique appointment ID",
    example: "990e8400-e29b-41d4-a716-446655440099",
  })
  readonly id!: string;

  @ApiProperty({
    description: "Business ID where the appointment is scheduled",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  readonly businessId!: string;

  @ApiProperty({
    description: "Calendar ID for the appointment",
    example: "660e8400-e29b-41d4-a716-446655440001",
  })
  readonly calendarId!: string;

  @ApiProperty({
    description: "Service ID being provided",
    example: "770e8400-e29b-41d4-a716-446655440002",
  })
  readonly serviceId!: string;

  @ApiProperty({
    description: "Time slot information",
    type: TimeSlotResponseDto,
  })
  readonly timeSlot!: TimeSlotResponseDto;

  @ApiProperty({
    description: "Client information including booking details",
    type: ClientInfoWithBookedByResponseDto,
  })
  readonly clientInfo!: ClientInfoWithBookedByResponseDto;

  @ApiProperty({
    description: "Current appointment status",
    example: "CONFIRMED",
    enum: [
      "SCHEDULED",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ],
  })
  readonly status!: string;

  @ApiPropertyOptional({
    description: "Assigned staff member ID",
    example: "880e8400-e29b-41d4-a716-446655440003",
  })
  readonly assignedStaffId?: string;

  @ApiProperty({
    description: "Appointment title",
    example: "Consultation de routine",
  })
  readonly title!: string;

  @ApiPropertyOptional({
    description: "Additional description or notes",
    example: "Contrôle annuel avec vaccins",
  })
  readonly description?: string;

  @ApiProperty({
    description: "Creation timestamp (ISO 8601)",
    example: "2025-01-10T10:00:00.000Z",
  })
  readonly createdAt!: string;

  @ApiProperty({
    description: "Last update timestamp (ISO 8601)",
    example: "2025-01-10T10:05:00.000Z",
  })
  readonly updatedAt!: string;
}

export class AvailableSlotResponseDto {
  @ApiProperty({
    description: "Available time slot",
    type: TimeSlotResponseDto,
  })
  readonly slot!: TimeSlotResponseDto;

  @ApiPropertyOptional({
    description: "Available staff member for this slot",
    example: "880e8400-e29b-41d4-a716-446655440003",
  })
  readonly availableStaffId?: string;

  @ApiProperty({
    description: "Whether this is a preferred slot",
    example: true,
  })
  readonly isPreferred!: boolean;
}

export class GetAvailableSlotsResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Available time slots for the requested date",
    type: [AvailableSlotResponseDto],
  })
  readonly data!: AvailableSlotResponseDto[];

  @ApiProperty({
    description: "Additional metadata",
    example: {
      date: "2025-01-15",
      serviceId: "770e8400-e29b-41d4-a716-446655440002",
      totalSlots: 8,
    },
    additionalProperties: true,
  })
  readonly meta!: {
    readonly date: string;
    readonly serviceId: string;
    readonly totalSlots: number;
  };
}

export class BookAppointmentResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Booked appointment details",
    type: AppointmentResponseDto,
  })
  readonly data!: AppointmentResponseDto;

  @ApiProperty({
    description: "Additional metadata",
    example: {
      confirmationCode: "APT-2025-0115-001",
      notificationSent: true,
    },
    additionalProperties: true,
  })
  readonly meta!: {
    readonly confirmationCode: string;
    readonly notificationSent: boolean;
  };
}

export class ListAppointmentsResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "List of appointments",
    type: [AppointmentResponseDto],
  })
  readonly data!: AppointmentResponseDto[];

  @ApiProperty({
    description: "Pagination metadata",
    example: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 97,
      itemsPerPage: 20,
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

export class AppointmentOperationResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Updated appointment details",
    type: AppointmentResponseDto,
  })
  readonly data!: AppointmentResponseDto;

  @ApiProperty({
    description: "Additional metadata",
    example: {
      operation: "UPDATE",
      notificationSent: true,
      previousStatus: "SCHEDULED",
    },
    additionalProperties: true,
  })
  readonly meta!: {
    readonly operation: string;
    readonly notificationSent: boolean;
    readonly previousStatus?: string;
  };
}

export class CancelAppointmentResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Cancelled appointment details",
    type: AppointmentResponseDto,
  })
  readonly data!: AppointmentResponseDto;

  @ApiProperty({
    description: "Cancellation metadata",
    example: {
      operation: "CANCEL",
      cancellationReason: "Conflit d'horaire côté client",
      notificationSent: true,
      rebookingOffered: true,
    },
    additionalProperties: true,
  })
  readonly meta!: {
    readonly operation: string;
    readonly cancellationReason: string;
    readonly notificationSent: boolean;
    readonly rebookingOffered: boolean;
  };
}
