import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

/**
 * DTO pour créer un nouveau type de calendrier
 */
export class CreateCalendarTypeDto {
  @ApiProperty({
    description: 'Business ID to which this calendar type belongs',
    example: 'b7d9f8e1-2345-4567-8901-234567890123',
  })
  @IsString()
  @IsUUID(4, { message: 'Business ID must be a valid UUID v4' })
  businessId!: string;

  @ApiProperty({
    description: 'Calendar type name',
    example: 'Consultation Standard',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @ApiProperty({
    description: 'Unique code for this calendar type within the business',
    example: 'CONSULTATION_STD',
    minLength: 2,
    maxLength: 20,
  })
  @IsString()
  @Length(2, 20, { message: 'Code must be between 2 and 20 characters' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  code!: string;

  @ApiPropertyOptional({
    description: 'Calendar type description',
    example: 'Standard consultation calendar for regular appointments',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Description cannot exceed 500 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description?: string;

  @ApiPropertyOptional({
    description: 'Color code for calendar display (hex format)',
    example: '#3B82F6',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  color?: string;

  @ApiPropertyOptional({
    description: 'Sort order for display',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Sort order must be at least 1' })
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether this calendar type is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO pour mettre à jour un type de calendrier
 */
export class UpdateCalendarTypeDto {
  @ApiPropertyOptional({
    description: 'Calendar type name',
    example: 'Consultation Premium',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;

  @ApiPropertyOptional({
    description: 'Unique code for this calendar type within the business',
    example: 'CONSULTATION_PREMIUM',
    minLength: 2,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(2, 20, { message: 'Code must be between 2 and 20 characters' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  code?: string;

  @ApiPropertyOptional({
    description: 'Calendar type description',
    example: 'Premium consultation calendar with extended features',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Description cannot exceed 500 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description?: string;

  @ApiPropertyOptional({
    description: 'Color code for calendar display (hex format)',
    example: '#10B981',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  color?: string;

  @ApiPropertyOptional({
    description: 'Sort order for display',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Sort order must be at least 1' })
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether this calendar type is active',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO pour rechercher des types de calendrier avec filtres avancés
 */
export class ListCalendarTypesDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'sortOrder',
    enum: ['name', 'code', 'sortOrder', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsIn(['name', 'code', 'sortOrder', 'createdAt', 'updatedAt'], {
    message:
      'Sort field must be one of: name, code, sortOrder, createdAt, updatedAt',
  })
  sortBy?: string = 'sortOrder';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'asc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'Sort order must be asc or desc' })
  sortOrder?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({
    description: 'Search term for name, code, or description',
    example: 'consultation',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, {
    message: 'Search term must be between 1 and 100 characters',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Business ID to filter calendar types',
    example: 'b7d9f8e1-2345-4567-8901-234567890123',
  })
  @IsOptional()
  @IsString()
  @IsUUID(4, { message: 'Business ID must be a valid UUID v4' })
  businessId?: string;
}

/**
 * Response DTO pour un type de calendrier
 */
export class CalendarTypeDto {
  @ApiProperty({
    description: 'Calendar type unique identifier',
    example: 'c7d9f8e1-2345-4567-8901-234567890123',
  })
  id!: string;

  @ApiProperty({
    description: 'Business ID',
    example: 'b7d9f8e1-2345-4567-8901-234567890123',
  })
  businessId!: string;

  @ApiProperty({
    description: 'Calendar type name',
    example: 'Consultation Standard',
  })
  name!: string;

  @ApiProperty({
    description: 'Calendar type code',
    example: 'CONSULTATION_STD',
  })
  code!: string;

  @ApiPropertyOptional({
    description: 'Calendar type description',
    example: 'Standard consultation calendar for regular appointments',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Color code for calendar display',
    example: '#3B82F6',
  })
  color?: string;

  @ApiProperty({
    description: 'Sort order',
    example: 1,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Whether this calendar type is active',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-15T10:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-15T10:00:00.000Z',
  })
  updatedAt!: string;

  @ApiProperty({
    description: 'User who created this calendar type',
    example: 'u7d9f8e1-2345-4567-8901-234567890123',
  })
  createdBy!: string;

  @ApiProperty({
    description: 'User who last updated this calendar type',
    example: 'u7d9f8e1-2345-4567-8901-234567890123',
  })
  updatedBy!: string;
}

/**
 * Response DTO pour les opérations de création
 */
export class CreateCalendarTypeResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Created calendar type data',
    type: CalendarTypeDto,
  })
  data!: CalendarTypeDto;

  @ApiProperty({
    description: 'Success message',
    example: 'Calendar type created successfully',
  })
  message!: string;
}

/**
 * Response DTO pour les opérations de mise à jour
 */
export class UpdateCalendarTypeResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Updated calendar type data',
    type: CalendarTypeDto,
  })
  data!: CalendarTypeDto;

  @ApiProperty({
    description: 'Success message',
    example: 'Calendar type updated successfully',
  })
  message!: string;
}

/**
 * Response DTO pour les opérations de suppression
 */
export class DeleteCalendarTypeResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Calendar type deleted successfully',
  })
  message!: string;
}

/**
 * Response DTO pour les listes paginées
 */
export class ListCalendarTypesResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'List of calendar types',
    type: [CalendarTypeDto],
  })
  data!: CalendarTypeDto[];

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
  meta!: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
