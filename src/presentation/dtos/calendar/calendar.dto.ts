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
import { CalendarType } from '../../../shared/enums/calendar-type.enum';

/**
 * 🕐 Time Slot DTO
 * Represents a specific time slot in a calendar
 */
export class TimeSlotDto {
  @ApiProperty({
    description: 'Start time in HH:MM format',
    example: '09:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString({ message: 'validation.calendar.time_slot_start_string' })
  start: string;

  @ApiProperty({
    description: 'End time in HH:MM format',
    example: '17:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString({ message: 'validation.calendar.time_slot_end_string' })
  end: string;

  @ApiProperty({
    description: 'Break periods within the slot',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        start: { type: 'string', example: '12:00' },
        end: { type: 'string', example: '13:00' },
        title: { type: 'string', example: 'Lunch Break' }
      }
    },
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'validation.calendar.breaks_array' })
  breaks?: Array<{
    start: string;
    end: string;
    title?: string;
  }>;
}

/**
 * 📅 Working Hours DTO
 * Defines working hours for each day of the week
 */
export class WorkingHoursDto {
  @ApiProperty({
    description: 'Monday working hours',
    type: TimeSlotDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlotDto)
  monday?: TimeSlotDto;

  @ApiProperty({
    description: 'Tuesday working hours',
    type: TimeSlotDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlotDto)
  tuesday?: TimeSlotDto;

  @ApiProperty({
    description: 'Wednesday working hours',
    type: TimeSlotDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlotDto)
  wednesday?: TimeSlotDto;

  @ApiProperty({
    description: 'Thursday working hours',
    type: TimeSlotDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlotDto)
  thursday?: TimeSlotDto;

  @ApiProperty({
    description: 'Friday working hours',
    type: TimeSlotDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlotDto)
  friday?: TimeSlotDto;

  @ApiProperty({
    description: 'Saturday working hours',
    type: TimeSlotDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlotDto)
  saturday?: TimeSlotDto;

  @ApiProperty({
    description: 'Sunday working hours',
    type: TimeSlotDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlotDto)
  sunday?: TimeSlotDto;
}

/**
 * 📋 Booking Rules DTO
 * Configuration for appointment booking constraints
 */
export class BookingRulesDto {
  @ApiProperty({
    description: 'Minimum advance booking time in hours',
    example: 2,
    minimum: 0,
    maximum: 8760
  })
  @IsOptional()
  @IsInt({ message: 'validation.calendar.min_advance_hours_integer' })
  @Min(0, { message: 'validation.calendar.min_advance_hours_min' })
  @Max(8760, { message: 'validation.calendar.min_advance_hours_max' }) // Max 1 year
  minAdvanceHours?: number;

  @ApiProperty({
    description: 'Maximum advance booking time in days',
    example: 30,
    minimum: 1,
    maximum: 365
  })
  @IsOptional()
  @IsInt({ message: 'validation.calendar.max_advance_days_integer' })
  @Min(1, { message: 'validation.calendar.max_advance_days_min' })
  @Max(365, { message: 'validation.calendar.max_advance_days_max' })
  maxAdvanceDays?: number;

  @ApiProperty({
    description: 'Buffer time between appointments in minutes',
    example: 15,
    minimum: 0,
    maximum: 120
  })
  @IsOptional()
  @IsInt({ message: 'validation.calendar.buffer_minutes_integer' })
  @Min(0, { message: 'validation.calendar.buffer_minutes_min' })
  @Max(120, { message: 'validation.calendar.buffer_minutes_max' })
  bufferMinutes?: number;

  @ApiProperty({
    description: 'Allow same-day cancellations',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'validation.calendar.allow_same_day_cancellation_boolean' })
  allowSameDayCancellation?: boolean;

  @ApiProperty({
    description: 'Require confirmation for appointments',
    example: false
  })
  @IsOptional()
  @IsBoolean({ message: 'validation.calendar.require_confirmation_boolean' })
  requireConfirmation?: boolean;

  @ApiProperty({
    description: 'Allow online booking',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'validation.calendar.allow_online_booking_boolean' })
  allowOnlineBooking?: boolean;
}

/**
 * 📅 Calendar Creation DTO
 * Used when creating a new calendar for staff or business
 * 
 * Frontend Usage Example:
 * ```typescript
 * const newCalendar: CreateCalendarDto = {
 *   businessId: 'business-uuid-123',
 *   staffId: 'staff-uuid-456', // Optional for business-wide calendars
 *   addressId: 'address-uuid-789',
 *   name: 'Dr. Marie Dupont - Cabinet Principal',
 *   description: 'Consultations dentaires et chirurgie',
 *   type: CalendarType.STAFF,
 *   workingHours: {
 *     monday: { 
 *       start: '08:00', 
 *       end: '18:00', 
 *       breaks: [{ start: '12:00', end: '14:00', title: 'Déjeuner' }] 
 *     },
 *     tuesday: { start: '08:00', end: '18:00' },
 *     // ... other days
 *   },
 *   bookingRules: {
 *     minAdvanceHours: 2,
 *     maxAdvanceDays: 60,
 *     bufferMinutes: 15,
 *     allowSameDayCancellation: false,
 *     requireConfirmation: true,
 *     allowOnlineBooking: true
 *   },
 *   settings: {
 *     timezone: 'Europe/Paris',
 *     defaultServiceDuration: 30,
 *     autoConfirm: false
 *   }
 * };
 * 
 * const response = await api.post('/calendars', newCalendar);
 * ```
 */
export class CreateCalendarDto {
  @ApiProperty({
    description: 'ID of the business this calendar belongs to',
    example: 'business-uuid-123',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'validation.calendar.business_id_invalid' })
  businessId: string;

  @ApiProperty({
    description: 'ID of the staff member (optional for business-wide calendars)',
    example: 'staff-uuid-456',
    format: 'uuid',
    required: false
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.calendar.staff_id_invalid' })
  staffId?: string;

  @ApiProperty({
    description: 'ID of the business address/location',
    example: 'address-uuid-789',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'validation.calendar.address_id_invalid' })
  addressId: string;

  @ApiProperty({
    description: 'Calendar display name',
    example: 'Dr. Marie Dupont - Cabinet Principal',
    minLength: 2,
    maxLength: 100
  })
  @IsString({ message: 'validation.calendar.name_string' })
  @Length(2, 100, { message: 'validation.calendar.name_length' })
  name: string;

  @ApiProperty({
    description: 'Calendar description',
    example: 'Consultations dentaires et chirurgie orthodontique',
    maxLength: 500,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'validation.calendar.description_string' })
  @Length(0, 500, { message: 'validation.calendar.description_length' })
  description?: string;

  @ApiProperty({
    description: 'Type of calendar',
    enum: CalendarType,
    example: CalendarType.STAFF
  })
  @IsEnum(CalendarType, { message: 'validation.calendar.type_invalid' })
  type: CalendarType;

  @ApiProperty({
    description: 'Working hours configuration for each day',
    type: WorkingHoursDto
  })
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours: WorkingHoursDto;

  @ApiProperty({
    description: 'Booking rules and constraints',
    type: BookingRulesDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BookingRulesDto)
  bookingRules?: BookingRulesDto;

  @ApiProperty({
    description: 'Additional calendar settings',
    example: {
      timezone: 'Europe/Paris',
      defaultServiceDuration: 30,
      autoConfirm: false,
      reminderEnabled: true,
      reminderHours: 24
    },
    required: false
  })
  @IsOptional()
  @IsObject({ message: 'validation.calendar.settings_object' })
  settings?: Record<string, any>;

  @ApiProperty({
    description: 'Calendar color for UI display',
    example: '#4CAF50',
    pattern: '^#[0-9A-Fa-f]{6}$',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'validation.calendar.color_string' })
  color?: string;

  @ApiProperty({
    description: 'Whether the calendar is active',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'validation.calendar.is_active_boolean' })
  isActive?: boolean = true;
}

/**
 * ✏️ Calendar Update DTO
 * Used for partial updates of calendar information
 */
export class UpdateCalendarDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.calendar.name_string' })
  @Length(2, 100, { message: 'validation.calendar.name_length' })
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.calendar.description_string' })
  @Length(0, 500, { message: 'validation.calendar.description_length' })
  description?: string;

  @ApiProperty({ enum: CalendarType, required: false })
  @IsOptional()
  @IsEnum(CalendarType, { message: 'validation.calendar.type_invalid' })
  type?: CalendarType;

  @ApiProperty({ type: WorkingHoursDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours?: WorkingHoursDto;

  @ApiProperty({ type: BookingRulesDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => BookingRulesDto)
  bookingRules?: BookingRulesDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject({ message: 'validation.calendar.settings_object' })
  settings?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.calendar.color_string' })
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean({ message: 'validation.calendar.is_active_boolean' })
  isActive?: boolean;
}

/**
 * 📋 Calendar Response DTO
 * Complete calendar information returned by the API
 */
export class CalendarResponseDto {
  @ApiProperty({
    description: 'Unique calendar identifier',
    example: 'calendar-uuid-123'
  })
  id: string;

  @ApiProperty({
    description: 'Business this calendar belongs to',
    example: 'business-uuid-456'
  })
  businessId: string;

  @ApiProperty({
    description: 'Staff member (if staff calendar)',
    example: 'staff-uuid-789'
  })
  staffId?: string;

  @ApiProperty({
    description: 'Business address/location',
    example: 'address-uuid-101'
  })
  addressId: string;

  @ApiProperty({ example: 'Dr. Marie Dupont - Cabinet Principal' })
  name: string;

  @ApiProperty({ example: 'Consultations dentaires et chirurgie' })
  description?: string;

  @ApiProperty({ enum: CalendarType })
  type: CalendarType;

  @ApiProperty({ 
    description: 'Working hours for each day',
    type: WorkingHoursDto 
  })
  workingHours: WorkingHoursDto;

  @ApiProperty({ 
    description: 'Booking rules and constraints',
    type: BookingRulesDto 
  })
  bookingRules: BookingRulesDto;

  @ApiProperty({ description: 'Calendar settings and preferences' })
  settings: Record<string, any>;

  @ApiProperty({ description: 'Calendar color for UI', example: '#4CAF50' })
  color?: string;

  @ApiProperty({ description: 'Whether the calendar is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Staff member information (if applicable)' })
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    role: string;
  };

  @ApiProperty({ description: 'Address information' })
  address?: {
    id: string;
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

/**
 * 🔍 Calendar List Query DTO
 * Advanced filtering options for calendar listing
 */
export class CalendarListQueryDto {
  @ApiProperty({
    description: 'Business ID to filter calendars by',
    required: false,
    example: 'business-uuid-123'
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.calendar.business_id_invalid' })
  businessId?: string;

  @ApiProperty({
    description: 'Staff ID to filter calendars by',
    required: false,
    example: 'staff-uuid-456'
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.calendar.staff_id_invalid' })
  staffId?: string;

  @ApiProperty({
    description: 'Address ID to filter calendars by',
    required: false,
    example: 'address-uuid-789'
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.calendar.address_id_invalid' })
  addressId?: string;

  @ApiProperty({
    description: 'Filter by calendar type',
    enum: CalendarType,
    required: false
  })
  @IsOptional()
  @IsEnum(CalendarType, { message: 'validation.calendar.type_invalid' })
  type?: CalendarType;

  @ApiProperty({
    description: 'Filter by active status',
    required: false,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'validation.calendar.is_active_boolean' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Search in calendar names and descriptions',
    required: false,
    example: 'dentaire'
  })
  @IsOptional()
  @IsString({ message: 'validation.search_string' })
  search?: string;

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
    default: 'createdAt',
    enum: ['name', 'type', 'createdAt', 'updatedAt']
  })
  @IsOptional()
  @IsString({ message: 'validation.sort_by_string' })
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    default: 'desc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString({ message: 'validation.sort_order_string' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * 📊 Paginated Calendar Response DTO
 * List response with pagination metadata
 */
export class PaginatedCalendarResponseDto {
  @ApiProperty({ 
    description: 'Array of calendars',
    type: [CalendarResponseDto] 
  })
  data: CalendarResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 20,
      total: 45,
      totalPages: 3,
      hasNext: true,
      hasPrev: false
    }
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * 📅 Calendar Availability Query DTO
 * Used to check availability for specific dates and times
 */
export class CalendarAvailabilityQueryDto {
  @ApiProperty({
    description: 'Start date for availability check (ISO format)',
    example: '2024-01-26T00:00:00Z',
    format: 'date-time'
  })
  @IsISO8601({}, { message: 'validation.calendar.start_date_iso' })
  startDate: string;

  @ApiProperty({
    description: 'End date for availability check (ISO format)',
    example: '2024-01-26T23:59:59Z',
    format: 'date-time'
  })
  @IsISO8601({}, { message: 'validation.calendar.end_date_iso' })
  endDate: string;

  @ApiProperty({
    description: 'Service duration in minutes (optional)',
    required: false,
    example: 30,
    minimum: 1,
    maximum: 480
  })
  @IsOptional()
  @IsInt({ message: 'validation.calendar.duration_integer' })
  @Min(1, { message: 'validation.calendar.duration_min' })
  @Max(480, { message: 'validation.calendar.duration_max' }) // Max 8 hours
  durationMinutes?: number;

  @ApiProperty({
    description: 'Include buffer time in calculation',
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'validation.calendar.include_buffer_boolean' })
  includeBuffer?: boolean = true;
}

/**
 * 📅 Calendar Availability Response DTO
 * Available time slots for booking
 */
export class CalendarAvailabilityResponseDto {
  @ApiProperty({
    description: 'Calendar ID',
    example: 'calendar-uuid-123'
  })
  calendarId: string;

  @ApiProperty({
    description: 'Date being checked',
    example: '2024-01-26'
  })
  date: string;

  @ApiProperty({
    description: 'Available time slots',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        start: { type: 'string', example: '09:00' },
        end: { type: 'string', example: '09:30' },
        available: { type: 'boolean', example: true },
        reason: { type: 'string', example: 'Available for booking' }
      }
    }
  })
  availableSlots: Array<{
    start: string;
    end: string;
    available: boolean;
    reason?: string;
  }>;

  @ApiProperty({
    description: 'Total available slots count',
    example: 16
  })
  totalAvailableSlots: number;

  @ApiProperty({
    description: 'Working hours for this date',
    type: TimeSlotDto
  })
  workingHours?: TimeSlotDto;
}
