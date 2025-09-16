import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  IsBoolean,
  ValidateNested,
  IsInt,
  Min,
  Max,
  Length,
  IsObject,
  IsISO8601,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * 📅 Appointment Status Enumeration
 * 
 * Comprehensive status tracking for appointment lifecycle management
 */
export enum AppointmentStatus {
  PENDING = 'PENDING',           // Initial booking, awaiting confirmation
  CONFIRMED = 'CONFIRMED',       // Confirmed by staff/system
  IN_PROGRESS = 'IN_PROGRESS',   // Currently happening
  COMPLETED = 'COMPLETED',       // Successfully finished
  CANCELLED = 'CANCELLED',       // Cancelled by client or staff
  NO_SHOW = 'NO_SHOW',          // Client didn't show up
  RESCHEDULED = 'RESCHEDULED'    // Moved to different time
}

/**
 * 💰 Money DTO for multi-currency pricing
 */
export class MoneyDto {
  @ApiProperty({
    description: 'Amount in smallest currency unit (cents for EUR/USD)',
    example: 5000, // €50.00
    minimum: 0
  })
  @IsInt({ message: 'validation.money.amount_integer' })
  @Min(0, { message: 'validation.money.amount_min' })
  amount!: number;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'EUR',
    maxLength: 3,
    minLength: 3
  })
  @IsString({ message: 'validation.money.currency_string' })
  @Length(3, 3, { message: 'validation.money.currency_length' })
  currency!: string;
}

/**
 * 👤 Client Information DTO
 */
export class ClientInfoDto {
  @ApiProperty({
    description: 'Client first name',
    example: 'Jean',
    maxLength: 50
  })
  @IsString({ message: 'validation.client.first_name_string' })
  @Length(1, 50, { message: 'validation.client.first_name_length' })
  firstName!: string;

  @ApiProperty({
    description: 'Client last name',
    example: 'Dupont',
    maxLength: 50
  })
  @IsString({ message: 'validation.client.last_name_string' })
  @Length(1, 50, { message: 'validation.client.last_name_length' })
  lastName!: string;

  @ApiProperty({
    description: 'Client email address',
    example: 'jean.dupont@email.fr',
    format: 'email'
  })
  @IsString({ message: 'validation.client.email_string' })
  email!: string;

  @ApiProperty({
    description: 'Client phone number',
    example: '+33 1 23 45 67 89',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'validation.client.phone_string' })
  phone?: string;

  @ApiProperty({
    description: 'Date of birth for age verification',
    example: '1985-03-15',
    format: 'date',
    required: false
  })
  @IsOptional()
  @IsDateString({}, { message: 'validation.client.date_of_birth_date' })
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Additional client notes',
    example: 'Allergic to latex',
    maxLength: 500,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'validation.client.notes_string' })
  @Length(0, 500, { message: 'validation.client.notes_length' })
  notes?: string;
}

/**
 * 📅 Appointment Creation DTO
 * Used when booking new appointments
 * 
 * Frontend Usage Example:
 * ```typescript
 * const newAppointment: CreateAppointmentDto = {
 *   businessId: 'business-uuid-123',
 *   calendarId: 'calendar-uuid-456',
 *   serviceId: 'service-uuid-789',
 *   staffId: 'staff-uuid-101', // Optional, can be auto-assigned
 *   startTime: '2024-01-26T09:00:00Z',
 *   endTime: '2024-01-26T09:30:00Z',
 *   clientInfo: {
 *     firstName: 'Jean',
 *     lastName: 'Dupont',
 *     email: 'jean.dupont@email.fr',
 *     phone: '+33 1 23 45 67 89',
 *     notes: 'First-time patient'
 *   },
 *   price: {
 *     amount: 5000, // €50.00
 *     currency: 'EUR'
 *   },
 *   notes: 'Initial consultation requested',
 *   requiresConfirmation: true,
 *   sendReminders: true
 * };
 * 
 * const response = await api.post('/appointments', newAppointment);
 * ```
 */
export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Business ID where appointment is booked',
    example: 'business-uuid-123',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'validation.appointment.business_id_invalid' })
  businessId!: string;

  @ApiProperty({
    description: 'Calendar ID for the appointment',
    example: 'calendar-uuid-456',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'validation.appointment.calendar_id_invalid' })
  calendarId!: string;

  @ApiProperty({
    description: 'Service being booked',
    example: 'service-uuid-789',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'validation.appointment.service_id_invalid' })
  serviceId!: string;

  @ApiProperty({
    description: 'Staff member (optional, can be auto-assigned)',
    example: 'staff-uuid-101',
    format: 'uuid',
    required: false
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.appointment.staff_id_invalid' })
  staffId?: string;

  @ApiProperty({
    description: 'Client ID if existing client, otherwise use clientInfo',
    example: 'client-uuid-202',
    format: 'uuid',
    required: false
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.appointment.client_id_invalid' })
  clientId?: string;

  @ApiProperty({
    description: 'Appointment start time (ISO format)',
    example: '2024-01-26T09:00:00Z',
    format: 'date-time'
  })
  @IsISO8601({}, { message: 'validation.appointment.start_time_iso' })
  startTime!: string;

  @ApiProperty({
    description: 'Appointment end time (ISO format)',
    example: '2024-01-26T09:30:00Z',
    format: 'date-time'
  })
  @IsISO8601({}, { message: 'validation.appointment.end_time_iso' })
  endTime!: string;

  @ApiProperty({
    description: 'Client information (required if clientId not provided)',
    type: ClientInfoDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ClientInfoDto)
  clientInfo?: ClientInfoDto;

  @ApiProperty({
    description: 'Appointment price',
    type: MoneyDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  price?: MoneyDto;

  @ApiProperty({
    description: 'Additional appointment notes',
    example: 'Initial consultation requested',
    maxLength: 1000,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'validation.appointment.notes_string' })
  @Length(0, 1000, { message: 'validation.appointment.notes_length' })
  notes?: string;

  @ApiProperty({
    description: 'Whether appointment requires manual confirmation',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean({ message: 'validation.appointment.requires_confirmation_boolean' })
  requiresConfirmation?: boolean = false;

  @ApiProperty({
    description: 'Whether to send appointment reminders',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'validation.appointment.send_reminders_boolean' })
  sendReminders?: boolean = true;

  @ApiProperty({
    description: 'Recurring appointment configuration',
    example: {
      frequency: 'weekly',
      interval: 1,
      endDate: '2024-06-26T09:30:00Z',
      occurrences: 20
    },
    required: false
  })
  @IsOptional()
  @IsObject({ message: 'validation.appointment.recurrence_object' })
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number; // Every X days/weeks/months
    endDate?: string; // When to stop recurring
    occurrences?: number; // How many times to repeat
  };

  @ApiProperty({
    description: 'Additional metadata and custom fields',
    example: {
      source: 'online_booking',
      referralCode: 'FRIEND2024',
      specialRequests: ['wheelchair_access', 'interpreter_needed']
    },
    required: false
  })
  @IsOptional()
  @IsObject({ message: 'validation.appointment.metadata_object' })
  metadata?: Record<string, any>;
}

/**
 * ✏️ Appointment Update DTO
 * Used for modifying existing appointments
 */
export class UpdateAppointmentDto {
  @ApiProperty({ format: 'uuid', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'validation.appointment.calendar_id_invalid' })
  calendarId?: string;

  @ApiProperty({ format: 'uuid', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'validation.appointment.service_id_invalid' })
  serviceId?: string;

  @ApiProperty({ format: 'uuid', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'validation.appointment.staff_id_invalid' })
  staffId?: string;

  @ApiProperty({ format: 'date-time', required: false })
  @IsOptional()
  @IsISO8601({}, { message: 'validation.appointment.start_time_iso' })
  startTime?: string;

  @ApiProperty({ format: 'date-time', required: false })
  @IsOptional()
  @IsISO8601({}, { message: 'validation.appointment.end_time_iso' })
  endTime?: string;

  @ApiProperty({ type: ClientInfoDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ClientInfoDto)
  clientInfo?: ClientInfoDto;

  @ApiProperty({ type: MoneyDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  price?: MoneyDto;

  @ApiProperty({ enum: AppointmentStatus, required: false })
  @IsOptional()
  @IsEnum(AppointmentStatus, { message: 'validation.appointment.status_invalid' })
  status?: AppointmentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.appointment.notes_string' })
  @Length(0, 1000, { message: 'validation.appointment.notes_length' })
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean({ message: 'validation.appointment.send_reminders_boolean' })
  sendReminders?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject({ message: 'validation.appointment.metadata_object' })
  metadata?: Record<string, any>;
}

/**
 * 📋 Appointment Response DTO
 * Complete appointment information returned by the API
 */
export class AppointmentResponseDto {
  @ApiProperty({
    description: 'Unique appointment identifier',
    example: 'appointment-uuid-123'
  })
  id!: string;

  @ApiProperty({
    description: 'Business this appointment belongs to',
    example: 'business-uuid-456'
  })
  businessId!: string;

  @ApiProperty({
    description: 'Calendar used for this appointment',
    example: 'calendar-uuid-789'
  })
  calendarId!: string;

  @ApiProperty({
    description: 'Service being provided',
    example: 'service-uuid-101'
  })
  serviceId!: string;

  @ApiProperty({
    description: 'Staff member providing the service',
    example: 'staff-uuid-202'
  })
  staffId?: string;

  @ApiProperty({
    description: 'Client receiving the service',
    example: 'client-uuid-303'
  })
  clientId?: string;

  @ApiProperty({ format: 'date-time' })
  startTime!: Date;

  @ApiProperty({ format: 'date-time' })
  endTime!: Date;

  @ApiProperty({ enum: AppointmentStatus })
  status!: AppointmentStatus;

  @ApiProperty({ type: ClientInfoDto })
  clientInfo!: ClientInfoDto;

  @ApiProperty({ type: MoneyDto })
  price?: MoneyDto;

  @ApiProperty({ description: 'Appointment notes' })
  notes?: string;

  @ApiProperty({ description: 'Whether reminders are enabled' })
  sendReminders!: boolean;

  @ApiProperty({ description: 'Recurring appointment information' })
  recurrence?: {
    frequency: string;
    interval: number;
    endDate?: Date;
    occurrences?: number;
    parentAppointmentId?: string;
  };

  @ApiProperty({ description: 'Additional appointment metadata' })
  metadata!: Record<string, any>;

  @ApiProperty({ description: 'Service information' })
  service?: {
    id: string;
    name: string;
    category: string;
    duration: number;
    price: MoneyDto;
  };

  @ApiProperty({ description: 'Staff member information' })
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    role: string;
  };

  @ApiProperty({ description: 'Calendar information' })
  calendar?: {
    id: string;
    name: string;
    type: string;
    color: string;
  };

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;

  @ApiProperty({ description: 'User who created the appointment' })
  createdBy?: string;

  @ApiProperty({ description: 'User who last updated the appointment' })
  updatedBy?: string;
}

/**
 * 🔍 Appointment List Query DTO
 * Advanced filtering options for appointment listing
 */
export class AppointmentListQueryDto {
  @ApiProperty({
    description: 'Business ID to filter appointments',
    required: false,
    example: 'business-uuid-123'
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.appointment.business_id_invalid' })
  businessId?: string;

  @ApiProperty({
    description: 'Calendar ID to filter appointments',
    required: false,
    example: 'calendar-uuid-456'
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.appointment.calendar_id_invalid' })
  calendarId?: string;

  @ApiProperty({
    description: 'Staff ID to filter appointments',
    required: false,
    example: 'staff-uuid-789'
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.appointment.staff_id_invalid' })
  staffId?: string;

  @ApiProperty({
    description: 'Service ID to filter appointments',
    required: false,
    example: 'service-uuid-101'
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.appointment.service_id_invalid' })
  serviceId?: string;

  @ApiProperty({
    description: 'Client ID to filter appointments',
    required: false,
    example: 'client-uuid-202'
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.appointment.client_id_invalid' })
  clientId?: string;

  @ApiProperty({
    description: 'Filter by appointment status',
    enum: AppointmentStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(AppointmentStatus, { message: 'validation.appointment.status_invalid' })
  status?: AppointmentStatus;

  @ApiProperty({
    description: 'Start date for date range filtering (ISO format)',
    example: '2024-01-26T00:00:00Z',
    format: 'date-time',
    required: false
  })
  @IsOptional()
  @IsISO8601({}, { message: 'validation.appointment.start_date_iso' })
  startDate?: string;

  @ApiProperty({
    description: 'End date for date range filtering (ISO format)',
    example: '2024-01-26T23:59:59Z',
    format: 'date-time',
    required: false
  })
  @IsOptional()
  @IsISO8601({}, { message: 'validation.appointment.end_date_iso' })
  endDate?: string;

  @ApiProperty({
    description: 'Search in client names, emails, or appointment notes',
    required: false,
    example: 'jean dupont'
  })
  @IsOptional()
  @IsString({ message: 'validation.search_string' })
  search?: string;

  @ApiProperty({
    description: 'Include cancelled appointments',
    required: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'validation.appointment.include_cancelled_boolean' })
  includeCancelled?: boolean = false;

  @ApiProperty({
    description: 'Page number (1-based)',
    required: false,
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'validation.page_integer' })
  @Min(1, { message: 'validation.page_min' })
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'validation.limit_integer' })
  @Min(1, { message: 'validation.limit_min' })
  @Max(100, { message: 'validation.limit_max' })
  limit?: number = 20;

  @ApiProperty({
    description: 'Sort field',
    required: false,
    default: 'startTime',
    enum: ['startTime', 'endTime', 'createdAt', 'status', 'clientName']
  })
  @IsOptional()
  @IsString({ message: 'validation.sort_by_string' })
  sortBy?: string = 'startTime';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    default: 'asc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString({ message: 'validation.sort_order_string' })
  sortOrder?: 'asc' | 'desc' = 'asc';
}

/**
 * 📊 Paginated Appointment Response DTO
 * List response with pagination metadata
 */
export class PaginatedAppointmentResponseDto {
  @ApiProperty({ 
    description: 'Array of appointments',
    type: [AppointmentResponseDto] 
  })
  data!: AppointmentResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 20,
      total: 156,
      totalPages: 8,
      hasNext: true,
      hasPrev: false
    }
  })
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  @ApiProperty({
    description: 'Summary statistics for the current filter',
    example: {
      totalAppointments: 156,
      confirmedAppointments: 142,
      pendingAppointments: 8,
      cancelledAppointments: 6,
      totalRevenue: {
        amount: 750000, // €7,500.00
        currency: 'EUR'
      }
    }
  })
  summary?: {
    totalAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    cancelledAppointments: number;
    totalRevenue?: MoneyDto;
  };
}

/**
 * 📅 Appointment Availability DTO
 * Used for checking appointment availability
 */
export class AppointmentAvailabilityDto {
  @ApiProperty({
    description: 'Business ID to check availability for',
    example: 'business-uuid-123',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'validation.appointment.business_id_invalid' })
  businessId!: string;

  @ApiProperty({
    description: 'Service ID to check availability for',
    example: 'service-uuid-456',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'validation.appointment.service_id_invalid' })
  serviceId!: string;

  @ApiProperty({
    description: 'Preferred staff member (optional)',
    example: 'staff-uuid-789',
    format: 'uuid',
    required: false
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.appointment.staff_id_invalid' })
  staffId?: string;

  @ApiProperty({
    description: 'Start date for availability search (ISO format)',
    example: '2024-01-26T00:00:00Z',
    format: 'date-time'
  })
  @IsISO8601({}, { message: 'validation.appointment.start_date_iso' })
  startDate!: string;

  @ApiProperty({
    description: 'End date for availability search (ISO format)',
    example: '2024-02-02T23:59:59Z',
    format: 'date-time'
  })
  @IsISO8601({}, { message: 'validation.appointment.end_date_iso' })
  endDate!: string;

  @ApiProperty({
    description: 'Number of available slots to return',
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'validation.appointment.max_slots_integer' })
  @Min(1, { message: 'validation.appointment.max_slots_min' })
  @Max(100, { message: 'validation.appointment.max_slots_max' })
  maxSlots?: number = 20;
}
