/**
 * 📅 APPOINTMENT DTOs
 * ✅ Data Transfer Objects pour l'API REST
 * ✅ Validation avec class-validator
 * ✅ Documentation Swagger complète
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// ✅ AppointmentType removed - type now determined by Service

// =====================================
// GET AVAILABLE SLOTS DTOs
// =====================================

export enum ViewMode {
  DAY = 'day',
  WEEK = 'week',
  NEXT_WEEK = 'next_week',
}

export class GetAvailableSlotsDto {
  @ApiProperty({
    description: 'Business UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  businessId!: string;

  @ApiProperty({
    description: 'Service UUID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  serviceId!: string;

  @ApiProperty({
    description: 'Calendar UUID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  calendarId!: string;

  @ApiPropertyOptional({
    description: 'Staff UUID (optional for specific practitioner)',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @IsOptional()
  @IsUUID()
  readonly staffId?: string;

  @ApiProperty({
    description: 'View mode - day, week, or next_week (like Doctolib)',
    enum: ViewMode,
    example: ViewMode.WEEK,
  })
  @IsEnum(ViewMode)
  viewMode!: ViewMode;

  @ApiProperty({
    description: 'Reference date for the view (ISO format)',
    example: '2024-01-15T10:00:00Z',
  })
  @IsDateString()
  referenceDate!: Date;

  @ApiPropertyOptional({
    description: 'Appointment duration in minutes',
    example: 30,
    minimum: 15,
    maximum: 480,
  })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  readonly duration?: number;

  @ApiPropertyOptional({
    description: 'Include reasons why slots are unavailable',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly includeUnavailableReasons?: boolean;

  @ApiPropertyOptional({
    description: 'Client timezone',
    example: 'Europe/Paris',
  })
  @IsOptional()
  @IsString()
  readonly timeZone?: string;
}

export class TimeSlotDto {
  @ApiProperty({
    description: 'Slot start time',
    example: '2024-01-15T09:00:00Z',
  })
  startTime!: Date;

  @ApiProperty({
    description: 'Slot end time',
    example: '2024-01-15T09:30:00Z',
  })
  endTime!: Date;

  @ApiProperty({
    description: 'Whether the slot is available',
    example: true,
  })
  isAvailable!: boolean;

  @ApiPropertyOptional({
    description: 'Price for this slot',
    example: 65.0,
  })
  readonly price?: number;

  @ApiPropertyOptional({
    description: 'Staff member name',
    example: 'Dr. Marie Dupont',
  })
  readonly staffName?: string;

  @ApiPropertyOptional({
    description: 'Staff member UUID',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  readonly staffId?: string;
}

export class DailySlotsDto {
  @ApiProperty({
    description: 'Date for this day',
    example: '2024-01-15',
  })
  date!: string;

  @ApiProperty({
    description: 'Day of week (0=Sunday, 6=Saturday)',
    example: 1,
  })
  dayOfWeek!: number;

  @ApiProperty({
    description: 'Available time slots for this day',
    type: [TimeSlotDto],
  })
  slots!: TimeSlotDto[];
}

export class NavigationDto {
  @ApiProperty({
    description: 'Previous period available',
    example: true,
  })
  hasPrevious!: boolean;

  @ApiProperty({
    description: 'Next period available',
    example: true,
  })
  hasNext!: boolean;

  @ApiProperty({
    description: 'Previous period date',
    example: '2024-01-08T00:00:00Z',
  })
  previousDate!: Date;

  @ApiProperty({
    description: 'Next period date',
    example: '2024-01-22T00:00:00Z',
  })
  nextDate!: Date;
}

export class SlotsMetadataDto {
  @ApiProperty({
    description: 'Total number of slots in period',
    example: 84,
  })
  totalSlots!: number;

  @ApiProperty({
    description: 'Number of available slots',
    example: 42,
  })
  availableSlots!: number;

  @ApiProperty({
    description: 'Number of booked slots',
    example: 42,
  })
  bookedSlots!: number;

  @ApiProperty({
    description: 'Utilization rate percentage',
    example: 50.0,
  })
  utilizationRate!: number;
}

export class AvailableSlotsDataDto {
  @ApiProperty({
    description: 'Current view mode',
    enum: ViewMode,
  })
  viewMode!: ViewMode;

  @ApiProperty({
    description: 'Current period being displayed',
    example: 'Semaine du 15 au 21 janvier 2024',
  })
  currentPeriod!: string;

  @ApiProperty({
    description: 'Available slots by day',
    type: [DailySlotsDto],
  })
  availableSlots!: DailySlotsDto[];

  @ApiProperty({
    description: 'Navigation information',
    type: NavigationDto,
  })
  navigation!: NavigationDto;

  @ApiProperty({
    description: 'Metadata about slots',
    type: SlotsMetadataDto,
  })
  metadata!: SlotsMetadataDto;
}

export class AvailableSlotsResponseDto {
  @ApiProperty({
    description: 'Operation success',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Available slots data',
    type: AvailableSlotsDataDto,
  })
  data!: AvailableSlotsDataDto;

  @ApiProperty({
    description: 'Response metadata',
    example: {
      timestamp: '2024-01-15T10:00:00Z',
      requestId: 'slots-1705320000000',
    },
  })
  readonly meta!: {
    timestamp: string;
    requestId: string;
  };
}

// =====================================
// BOOK APPOINTMENT DTOs
// =====================================

export class ClientInfoDto {
  @ApiProperty({
    description: 'Client first name',
    example: 'Marie',
  })
  @IsString()
  @Length(2, 50)
  firstName!: string;

  @ApiProperty({
    description: 'Client last name',
    example: 'Dupont',
  })
  @IsString()
  @Length(2, 50)
  lastName!: string;

  @ApiProperty({
    description: 'Client email address',
    example: 'marie.dupont@email.com',
  })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    description: 'Client phone number',
    example: '+33123456789',
  })
  @IsOptional()
  @IsPhoneNumber('FR')
  readonly phone?: string;

  @ApiPropertyOptional({
    description: 'Client date of birth',
    example: '1985-03-15',
  })
  @IsOptional()
  @IsDateString()
  readonly dateOfBirth?: Date;

  @ApiProperty({
    description: 'Whether this is a new client',
    example: true,
  })
  @IsBoolean()
  isNewClient!: boolean;

  @ApiPropertyOptional({
    description: 'Additional notes about the client',
    example: 'Première consultation',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  readonly notes?: string;
}

export class NotificationPreferencesDto {
  @ApiProperty({
    description: 'Send email reminder',
    example: true,
  })
  @IsBoolean()
  emailReminder!: boolean;

  @ApiProperty({
    description: 'Send SMS reminder',
    example: false,
  })
  @IsBoolean()
  smsReminder!: boolean;

  @ApiProperty({
    description: 'Hours before appointment for reminder',
    example: 24,
    minimum: 1,
    maximum: 168,
  })
  @IsInt()
  @Min(1)
  @Max(168)
  reminderHours!: number;
}

export class BookAppointmentDto {
  @ApiProperty({
    description: 'Business UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  businessId!: string;

  @ApiProperty({
    description: 'Service UUID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  serviceId!: string;

  @ApiProperty({
    description: 'Calendar UUID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  calendarId!: string;

  @ApiPropertyOptional({
    description: 'Staff UUID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @IsOptional()
  @IsUUID()
  readonly staffId?: string;

  @ApiProperty({
    description: 'Appointment start time',
    example: '2024-01-15T09:00:00Z',
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  startTime!: Date;

  @ApiProperty({
    description: 'Appointment end time',
    example: '2024-01-15T09:30:00Z',
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  endTime!: Date;

  @ApiProperty({
    description: 'Client information',
    type: ClientInfoDto,
  })
  @ValidateNested()
  @Type(() => ClientInfoDto)
  clientInfo!: ClientInfoDto;

  // ✅ Type removed - now determined by linked Service

  @ApiPropertyOptional({
    description: 'Appointment title',
    example: 'Consultation dentaire',
  })
  @IsOptional()
  @IsString()
  @Length(5, 100)
  readonly title?: string;

  @ApiPropertyOptional({
    description: 'Appointment description',
    example: 'Contrôle de routine + détartrage',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Mark as urgent appointment',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isUrgent?: boolean;

  @ApiPropertyOptional({
    description: 'Notification preferences',
    type: NotificationPreferencesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  readonly notificationPreferences?: NotificationPreferencesDto;
}

export class AppointmentDetailsDto {
  @ApiProperty({
    description: 'Business name',
    example: 'Cabinet Dentaire Dupont',
  })
  businessName!: string;

  @ApiProperty({
    description: 'Service name',
    example: 'Consultation dentaire',
  })
  serviceName!: string;

  @ApiPropertyOptional({
    description: 'Staff member name',
    example: 'Dr. Marie Dupont',
  })
  readonly staffName?: string;

  @ApiProperty({
    description: 'Appointment start time',
    example: '2024-01-15T09:00:00Z',
  })
  startTime!: Date;

  @ApiProperty({
    description: 'Appointment end time',
    example: '2024-01-15T09:30:00Z',
  })
  endTime!: Date;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 30,
  })
  duration!: number;

  @ApiProperty({
    description: 'Price amount',
    example: 65.0,
  })
  price!: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'EUR',
  })
  currency!: string;

  @ApiPropertyOptional({
    description: 'Business address',
    example: '123 Rue de la Paix, 75001 Paris',
  })
  readonly address?: string;
}

export class ClientInfoResponseDto {
  @ApiProperty({
    description: 'Client full name',
    example: 'Marie Dupont',
  })
  fullName!: string;

  @ApiProperty({
    description: 'Client email',
    example: 'marie.dupont@email.com',
  })
  email!: string;

  @ApiPropertyOptional({
    description: 'Client phone',
    example: '+33123456789',
  })
  readonly phone?: string;
}

export class NextStepsDto {
  @ApiProperty({
    description: 'Whether confirmation is required',
    example: true,
  })
  confirmationRequired!: boolean;

  @ApiProperty({
    description: 'Whether payment is required',
    example: false,
  })
  paymentRequired!: boolean;

  @ApiProperty({
    description: 'Required documents',
    example: ['carte_vitale', 'mutuelle'],
  })
  documentsRequired!: string[];

  @ApiPropertyOptional({
    description: 'Arrival instructions',
    example: "Merci d'arriver 10 minutes avant votre rendez-vous",
  })
  readonly arrivalInstructions?: string;
}

export class NotificationsDto {
  @ApiProperty({
    description: 'Confirmation email sent',
    example: true,
  })
  confirmationEmailSent!: boolean;

  @ApiProperty({
    description: 'Confirmation SMS sent',
    example: true,
  })
  confirmationSmsSent!: boolean;

  @ApiProperty({
    description: 'Reminder scheduled',
    example: true,
  })
  reminderScheduled!: boolean;
}

export class BookAppointmentDataDto {
  @ApiProperty({
    description: 'Appointment UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  appointmentId!: string;

  @ApiProperty({
    description: 'Confirmation number',
    example: 'RV-20240115-A4B2',
  })
  confirmationNumber!: string;

  @ApiProperty({
    description: 'Appointment status',
    example: 'CONFIRMED',
  })
  status!: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Votre rendez-vous a été confirmé avec succès',
  })
  message!: string;

  @ApiProperty({
    description: 'Appointment details',
    type: AppointmentDetailsDto,
  })
  appointmentDetails!: AppointmentDetailsDto;

  @ApiProperty({
    description: 'Client information',
    type: ClientInfoResponseDto,
  })
  clientInfo!: ClientInfoResponseDto;

  @ApiProperty({
    description: 'Next steps for the client',
    type: NextStepsDto,
  })
  nextSteps!: NextStepsDto;

  @ApiProperty({
    description: 'Notifications status',
    type: NotificationsDto,
  })
  notifications!: NotificationsDto;
}

export class BookAppointmentResponseDto {
  @ApiProperty({
    description: 'Operation success',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Booking data',
    type: BookAppointmentDataDto,
  })
  data!: BookAppointmentDataDto;

  @ApiProperty({
    description: 'Response metadata',
    example: {
      timestamp: '2024-01-15T10:00:00Z',
      requestId: 'book-1705320000000',
    },
  })
  readonly meta!: {
    timestamp: string;
    requestId: string;
  };
}

// =====================================
// LIST APPOINTMENTS DTOs
// =====================================

export class ListAppointmentsDto {
  @ApiPropertyOptional({
    description: 'Page number',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['startTime', 'status', 'createdAt'],
    default: 'startTime',
  })
  @IsOptional()
  @IsIn(['startTime', 'status', 'createdAt'])
  readonly sortBy?: string = 'startTime';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  readonly sortOrder?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({
    description: 'Search term',
    example: 'Marie Dupont',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  readonly search?: string;

  @ApiPropertyOptional({
    description: 'Filter by business UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  readonly businessId?: string;

  @ApiPropertyOptional({
    description: 'Filter by appointment status',
    example: 'CONFIRMED',
  })
  @IsOptional()
  @IsString()
  readonly status?: string;

  @ApiPropertyOptional({
    description: 'Filter from date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  readonly fromDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter to date',
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  readonly toDate?: Date;
}

export class AppointmentDto {
  @ApiProperty({
    description: 'Appointment UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Confirmation number',
    example: 'RV-20240115-A4B2',
  })
  confirmationNumber!: string;

  @ApiProperty({
    description: 'Appointment status',
    example: 'CONFIRMED',
  })
  status!: string;

  // ✅ Type removed - now determined by linked Service

  @ApiProperty({
    description: 'Start time',
    example: '2024-01-15T09:00:00Z',
  })
  startTime!: Date;

  @ApiProperty({
    description: 'End time',
    example: '2024-01-15T09:30:00Z',
  })
  endTime!: Date;

  @ApiProperty({
    description: 'Client full name',
    example: 'Marie Dupont',
  })
  clientName!: string;

  @ApiProperty({
    description: 'Client email',
    example: 'marie.dupont@email.com',
  })
  clientEmail!: string;

  @ApiProperty({
    description: 'Business name',
    example: 'Cabinet Dentaire Dupont',
  })
  businessName!: string;

  @ApiProperty({
    description: 'Service name',
    example: 'Consultation dentaire',
  })
  serviceName!: string;

  @ApiPropertyOptional({
    description: 'Staff name',
    example: 'Dr. Marie Dupont',
  })
  readonly staffName?: string;

  @ApiProperty({
    description: 'Price amount',
    example: 65.0,
  })
  price!: number;

  @ApiProperty({
    description: 'Created at',
    example: '2024-01-10T10:00:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Updated at',
    example: '2024-01-10T10:00:00Z',
  })
  updatedAt!: Date;
}

export class ListAppointmentsResponseDto {
  @ApiProperty({
    description: 'Operation success',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Appointments list',
    type: [AppointmentDto],
  })
  data!: AppointmentDto[];

  @ApiProperty({
    description: 'Pagination metadata',
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

// =====================================
// UPDATE & CANCEL DTOs
// =====================================

export class UpdateAppointmentDto {
  @ApiPropertyOptional({
    description: 'New start time',
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  readonly startTime?: Date;

  @ApiPropertyOptional({
    description: 'New end time',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  readonly endTime?: Date;

  @ApiPropertyOptional({
    description: 'New title',
    example: 'Consultation de suivi',
  })
  @IsOptional()
  @IsString()
  @Length(5, 100)
  readonly title?: string;

  @ApiPropertyOptional({
    description: 'New description',
    example: 'Suivi post-traitement',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Reason for modification',
    example: 'Demande du patient',
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  readonly modificationReason?: string;
}

export class UpdateAppointmentResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  data!: AppointmentDto;

  @ApiProperty()
  message!: string;
}

export class CancelAppointmentDto {
  @ApiProperty({
    description: 'Reason for cancellation',
    example: 'Indisponibilité du patient',
  })
  @IsString()
  @Length(5, 200)
  reason!: string;

  @ApiPropertyOptional({
    description: 'Send notification to client',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly notifyClient?: boolean;
}

export class GetAppointmentResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty({ type: AppointmentDto })
  data!: AppointmentDto;

  @ApiProperty()
  message!: string;
}

export class CancelAppointmentResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  readonly refundAmount?: number;
}

export class AppointmentStatsDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  byStatus!: {
    CONFIRMED: number;
    PENDING: number;
    CANCELLED: number;
    COMPLETED: number;
    NO_SHOW: number;
  };

  @ApiProperty()
  byPeriod!: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };

  @ApiProperty()
  revenue!: {
    total: number;
    thisMonth: number;
    averagePerAppointment: number;
  };

  @ApiProperty()
  topServices!: Array<{
    serviceName: string;
    count: number;
    revenue: number;
  }>;

  @ApiProperty()
  recentActivity!: Array<{
    id: string;
    action: string;
    timestamp: Date;
    details: string;
  }>;
}

export class AppointmentStatsResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty({ type: AppointmentStatsDto })
  data!: AppointmentStatsDto;

  @ApiProperty()
  message!: string;
}
