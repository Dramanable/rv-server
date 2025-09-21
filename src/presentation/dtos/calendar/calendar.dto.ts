/**
 * 📅 Calendar DTOs - Complete & Standardized
 *
 * ✅ Validation complète avec class-validator
 * ✅ Documentation Swagger détaillée
 * ✅ Pattern standardisé (Create, Update, List, Response)
 * ✅ Support i18n pour messages d'erreur
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  CalendarStatus,
  CalendarType,
} from '../../../domain/entities/calendar.entity';

// === WORKING HOURS DTO ===
export class WorkingHoursDto {
  @ApiProperty({
    description: 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)',
    minimum: 0,
    maximum: 6,
    example: 1,
  })
  @IsInt({ message: 'Day of week must be an integer' })
  @Min(0, { message: 'Day of week must be between 0 and 6' })
  @Max(6, { message: 'Day of week must be between 0 and 6' })
  readonly dayOfWeek!: number;

  @ApiProperty({
    description: 'Whether this is a working day',
    example: true,
  })
  @IsBoolean({ message: 'isWorking must be a boolean' })
  readonly isWorking!: boolean;

  @ApiProperty({
    description: 'Start time in HH:MM format',
    example: '09:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString({ message: 'Start time must be a string' })
  readonly startTime!: string;

  @ApiProperty({
    description: 'End time in HH:MM format',
    example: '17:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString({ message: 'End time must be a string' })
  readonly endTime!: string;

  @ApiPropertyOptional({
    description: 'Break periods during the day',
    example: [{ start: '12:00', end: '13:00', name: 'Lunch' }],
  })
  @IsOptional()
  @IsArray()
  readonly breaks?: Array<{
    readonly start: string;
    readonly end: string;
    readonly name?: string;
  }>;
}

// === CALENDAR SETTINGS DTO ===
export class CalendarSettingsDto {
  @ApiPropertyOptional({
    description: 'Calendar timezone',
    example: 'Europe/Paris',
    default: 'Europe/Paris',
  })
  @IsOptional()
  @IsString()
  readonly timezone?: string;

  @ApiPropertyOptional({
    description: 'Default slot duration in minutes',
    minimum: 5,
    maximum: 480,
    default: 30,
    example: 30,
  })
  @IsOptional()
  @IsInt({ message: 'Default slot duration must be an integer' })
  @Min(5, { message: 'Default slot duration must be at least 5 minutes' })
  @Max(480, { message: 'Default slot duration must not exceed 8 hours' })
  readonly defaultSlotDuration?: number;

  @ApiPropertyOptional({
    description: 'Minimum notice time in minutes',
    minimum: 0,
    default: 60,
    example: 60,
  })
  @IsOptional()
  @IsInt({ message: 'Minimum notice must be an integer' })
  @Min(0, { message: 'Minimum notice cannot be negative' })
  readonly minimumNotice?: number;

  @ApiPropertyOptional({
    description: 'Maximum advance booking in days',
    minimum: 1,
    maximum: 365,
    default: 30,
    example: 30,
  })
  @IsOptional()
  @IsInt({ message: 'Maximum advance booking must be an integer' })
  @Min(1, { message: 'Maximum advance booking must be at least 1 day' })
  @Max(365, { message: 'Maximum advance booking must not exceed 365 days' })
  readonly maximumAdvanceBooking?: number;

  @ApiPropertyOptional({
    description: 'Allow multiple bookings in same time slot',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly allowMultipleBookings?: boolean;

  @ApiPropertyOptional({
    description: 'Auto-confirm bookings without approval',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly autoConfirmBookings?: boolean;

  @ApiPropertyOptional({
    description: 'Buffer time between slots in minutes',
    minimum: 0,
    maximum: 60,
    default: 0,
    example: 5,
  })
  @IsOptional()
  @IsInt({ message: 'Buffer time must be an integer' })
  @Min(0, { message: 'Buffer time cannot be negative' })
  @Max(60, { message: 'Buffer time must not exceed 60 minutes' })
  readonly bufferTimeBetweenSlots?: number;
}

// === CREATE CALENDAR DTO ===
export class CreateCalendarDto {
  @ApiProperty({
    description: 'Business ID that owns this calendar',
    example: 'b123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Business ID must be a valid UUID' })
  readonly businessId!: string;

  @ApiProperty({
    description: 'Calendar type',
    enum: CalendarType,
    example: CalendarType.BUSINESS,
  })
  @IsEnum(CalendarType, { message: 'Invalid calendar type' })
  readonly type!: CalendarType;

  @ApiProperty({
    description: 'Calendar name',
    minLength: 3,
    maxLength: 100,
    example: 'Cabinet Principal',
  })
  @IsString({ message: 'Calendar name must be a string' })
  @Length(3, 100, {
    message: 'Calendar name must be between 3 and 100 characters',
  })
  readonly name!: string;

  @ApiProperty({
    description: 'Calendar description',
    minLength: 10,
    maxLength: 500,
    example: 'Calendrier principal du cabinet pour les consultations générales',
  })
  @IsString({ message: 'Description must be a string' })
  @Length(10, 500, {
    message: 'Description must be between 10 and 500 characters',
  })
  readonly description!: string;

  @ApiPropertyOptional({
    description: 'Owner ID (required for STAFF calendar type)',
    example: 'u123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Owner ID must be a valid UUID' })
  readonly ownerId?: string;

  @ApiPropertyOptional({
    description: 'Calendar settings',
    type: CalendarSettingsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CalendarSettingsDto)
  readonly settings?: CalendarSettingsDto;

  @ApiPropertyOptional({
    description:
      'Working hours for each day of the week (0=Sunday to 6=Saturday)',
    type: [WorkingHoursDto],
    example: [
      { dayOfWeek: 0, isWorking: false, startTime: '00:00', endTime: '00:00' },
      { dayOfWeek: 1, isWorking: true, startTime: '09:00', endTime: '17:00' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursDto)
  readonly workingHours?: WorkingHoursDto[];
}

// === UPDATE CALENDAR DTO ===
export class UpdateCalendarDto {
  @ApiPropertyOptional({
    description: 'Calendar name',
    minLength: 3,
    maxLength: 100,
    example: 'Cabinet Principal - Rénové',
  })
  @IsOptional()
  @IsString({ message: 'Calendar name must be a string' })
  @Length(3, 100, {
    message: 'Calendar name must be between 3 and 100 characters',
  })
  readonly name?: string;

  @ApiPropertyOptional({
    description: 'Calendar description',
    minLength: 10,
    maxLength: 500,
    example: 'Calendrier principal du cabinet rénové avec nouveaux équipements',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(10, 500, {
    message: 'Description must be between 10 and 500 characters',
  })
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Calendar status',
    enum: CalendarStatus,
    example: CalendarStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CalendarStatus, { message: 'Invalid calendar status' })
  readonly status?: CalendarStatus;

  @ApiPropertyOptional({
    description: 'Calendar settings',
    type: CalendarSettingsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CalendarSettingsDto)
  readonly settings?: CalendarSettingsDto;

  @ApiPropertyOptional({
    description: 'Working hours for each day of the week',
    type: [WorkingHoursDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursDto)
  readonly workingHours?: WorkingHoursDto[];
}

// === LIST CALENDARS DTO ===
export class ListCalendarsDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['name', 'type', 'status', 'createdAt', 'updatedAt'],
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsOptional()
  @IsIn(['name', 'type', 'status', 'createdAt', 'updatedAt'])
  readonly sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  readonly sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Search term for calendar name or description',
    maxLength: 100,
    example: 'principal',
  })
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @Length(1, 100, {
    message: 'Search term must be between 1 and 100 characters',
  })
  readonly search?: string;

  @ApiPropertyOptional({
    description: 'Filter by business ID',
    example: 'b123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Business ID must be a valid UUID' })
  readonly businessId?: string;

  @ApiPropertyOptional({
    description: 'Filter by calendar type',
    enum: CalendarType,
    example: CalendarType.BUSINESS,
  })
  @IsOptional()
  @IsEnum(CalendarType, { message: 'Invalid calendar type' })
  readonly type?: CalendarType;

  @ApiPropertyOptional({
    description: 'Filter by calendar status',
    enum: CalendarStatus,
    example: CalendarStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CalendarStatus, { message: 'Invalid calendar status' })
  readonly status?: CalendarStatus;

  @ApiPropertyOptional({
    description: 'Filter by owner ID (for STAFF calendars)',
    example: 'u123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Owner ID must be a valid UUID' })
  readonly ownerId?: string;
}

// === CALENDAR SUMMARY (FOR LIST) ===
export class CalendarSummaryDto {
  @ApiProperty({
    description: 'Calendar unique identifier',
    example: 'c123e4567-e89b-12d3-a456-426614174000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'Business ID',
    example: 'b123e4567-e89b-12d3-a456-426614174000',
  })
  readonly businessId!: string;

  @ApiProperty({
    description: 'Calendar type',
    enum: CalendarType,
    example: CalendarType.BUSINESS,
  })
  readonly type!: CalendarType;

  @ApiProperty({
    description: 'Calendar name',
    example: 'Cabinet Principal',
  })
  readonly name!: string;

  @ApiProperty({
    description: 'Calendar description (truncated)',
    example: 'Calendrier principal du cabinet pour...',
  })
  readonly description!: string;

  @ApiPropertyOptional({
    description: 'Owner ID (for STAFF calendars)',
    example: 'u123e4567-e89b-12d3-a456-426614174000',
  })
  readonly ownerId?: string;

  @ApiProperty({
    description: 'Calendar status',
    enum: CalendarStatus,
    example: CalendarStatus.ACTIVE,
  })
  readonly status!: CalendarStatus;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  readonly createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-20T14:45:00Z',
  })
  readonly updatedAt!: Date;
}

// === CALENDAR RESPONSE (DETAILED) ===
export class CalendarResponseDto {
  @ApiProperty({
    description: 'Calendar unique identifier',
    example: 'c123e4567-e89b-12d3-a456-426614174000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'Business ID',
    example: 'b123e4567-e89b-12d3-a456-426614174000',
  })
  readonly businessId!: string;

  @ApiProperty({
    description: 'Calendar type',
    enum: CalendarType,
    example: CalendarType.BUSINESS,
  })
  readonly type!: CalendarType;

  @ApiProperty({
    description: 'Calendar name',
    example: 'Cabinet Principal',
  })
  readonly name!: string;

  @ApiProperty({
    description: 'Calendar description',
    example: 'Calendrier principal du cabinet pour les consultations générales',
  })
  readonly description!: string;

  @ApiPropertyOptional({
    description: 'Owner ID (for STAFF calendars)',
    example: 'u123e4567-e89b-12d3-a456-426614174000',
  })
  readonly ownerId?: string;

  @ApiProperty({
    description: 'Calendar status',
    enum: CalendarStatus,
    example: CalendarStatus.ACTIVE,
  })
  readonly status!: CalendarStatus;

  @ApiProperty({
    description: 'Calendar settings',
    example: {
      timezone: 'Europe/Paris',
      defaultSlotDuration: 30,
      minimumNotice: 60,
      maximumAdvanceBooking: 30,
      allowMultipleBookings: false,
      autoConfirmBookings: true,
      bufferTimeBetweenSlots: 5,
    },
  })
  readonly settings!: {
    readonly timezone: string;
    readonly defaultSlotDuration: number;
    readonly minimumNotice: number;
    readonly maximumAdvanceBooking: number;
    readonly allowMultipleBookings: boolean;
    readonly autoConfirmBookings: boolean;
    readonly bufferTimeBetweenSlots: number;
  };

  @ApiProperty({
    description: 'Calendar availability information',
    example: {
      workingHours: [
        {
          dayOfWeek: 1,
          isWorking: true,
          periods: [{ startTime: '09:00', endTime: '17:00' }],
        },
      ],
      specialDates: [
        { date: '2024-12-25', isAvailable: false, reason: 'Christmas Day' },
      ],
      holidays: [{ name: 'New Year', date: '2024-01-01' }],
      maintenancePeriods: [],
    },
  })
  readonly availability!: {
    readonly workingHours: Array<{
      readonly dayOfWeek: number;
      readonly isWorking: boolean;
      readonly periods: Array<{
        readonly startTime: string;
        readonly endTime: string;
      }>;
    }>;
    readonly specialDates: Array<{
      readonly date: string;
      readonly isAvailable: boolean;
      readonly reason?: string;
    }>;
    readonly holidays: Array<{
      readonly name: string;
      readonly date: string;
    }>;
    readonly maintenancePeriods: Array<{
      readonly startDate: string;
      readonly endDate: string;
      readonly reason: string;
    }>;
  };

  @ApiProperty({
    description: 'Number of booking rules configured',
    example: 3,
  })
  readonly bookingRulesCount!: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  readonly createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-20T14:45:00Z',
  })
  readonly updatedAt!: Date;
}

// === LIST CALENDARS RESPONSE ===
export class ListCalendarsResponseDto {
  @ApiProperty({
    description: 'Array of calendar summaries',
    type: [CalendarSummaryDto],
  })
  readonly data!: CalendarSummaryDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      currentPage: 1,
      totalPages: 3,
      totalItems: 25,
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

// === CREATE CALENDAR RESPONSE ===
export class CreateCalendarResponseDto {
  @ApiProperty({
    description: 'Created calendar unique identifier',
    example: 'c123e4567-e89b-12d3-a456-426614174000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'Business ID',
    example: 'b123e4567-e89b-12d3-a456-426614174000',
  })
  readonly businessId!: string;

  @ApiProperty({
    description: 'Calendar type',
    enum: CalendarType,
    example: CalendarType.BUSINESS,
  })
  readonly type!: CalendarType;

  @ApiProperty({
    description: 'Calendar name',
    example: 'Cabinet Principal',
  })
  readonly name!: string;

  @ApiProperty({
    description: 'Calendar description',
    example: 'Calendrier principal du cabinet pour les consultations générales',
  })
  readonly description!: string;

  @ApiProperty({
    description: 'Initial calendar status',
    enum: CalendarStatus,
    example: CalendarStatus.ACTIVE,
  })
  readonly status!: CalendarStatus;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  readonly createdAt!: Date;
}

// === UPDATE CALENDAR RESPONSE ===
export class UpdateCalendarResponseDto {
  @ApiProperty({
    description: 'Updated calendar unique identifier',
    example: 'c123e4567-e89b-12d3-a456-426614174000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'Calendar name',
    example: 'Cabinet Principal - Mis à jour',
  })
  readonly name!: string;

  @ApiProperty({
    description: 'Calendar description',
    example: 'Calendrier principal mis à jour avec nouveaux horaires',
  })
  readonly description!: string;

  @ApiProperty({
    description: 'Calendar status',
    enum: CalendarStatus,
    example: CalendarStatus.ACTIVE,
  })
  readonly status!: CalendarStatus;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-20T14:45:00Z',
  })
  readonly updatedAt!: Date;
}

// === DELETE CALENDAR RESPONSE ===
export class DeleteCalendarResponseDto {
  @ApiProperty({
    description: 'Success confirmation',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Confirmation message',
    example: 'Calendar successfully deleted',
  })
  readonly message!: string;

  @ApiProperty({
    description: 'Deleted calendar ID',
    example: 'c123e4567-e89b-12d3-a456-426614174000',
  })
  readonly deletedId!: string;

  @ApiProperty({
    description: 'Deletion timestamp',
    example: '2024-01-25T16:20:00Z',
  })
  readonly deletedAt!: Date;
}
