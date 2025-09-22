/**
 * 👥 User Management DTOs - Data Transfer Objects
 *
 * DTOs pour la gestion des utilisateurs avec pagination POST et filtres avancés
 * Production-ready avec validation stricte et documentation Swagger complète
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { UserRole } from '../../shared/enums/user-role.enum';

// ═══════════════════════════════════════════════════════════════
// 🔍 ENUMS & TYPES
// ═══════════════════════════════════════════════════════════════

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum UserSortField {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  EMAIL = 'email',
  FIRST_NAME = 'first_name',
  LAST_NAME = 'last_name',
  ROLE = 'role',
}

// ═══════════════════════════════════════════════════════════════
// 📋 PAGINATION & SORTING DTOs
// ═══════════════════════════════════════════════════════════════

export class PaginationDto {
  @ApiProperty({
    description: '📄 Page number (1-based indexing)',
    example: 1,
    minimum: 1,
    maximum: 10000,
    default: 1,
    type: 'integer',
    title: 'Page Number',
  })
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @Max(10000, { message: 'Page cannot exceed 10000' })
  page: number = 1;

  @ApiProperty({
    description: '📊 Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    type: 'integer',
    title: 'Items Per Page',
  })
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit: number = 20;
}

export class SortDto {
  @ApiProperty({
    description: '🔤 Field to sort by',
    example: UserSortField.CREATED_AT,
    enum: UserSortField,
    default: UserSortField.CREATED_AT,
    title: 'Sort Field',
  })
  @IsEnum(UserSortField, { message: 'Invalid sort field' })
  field: UserSortField = UserSortField.CREATED_AT;

  @ApiProperty({
    description: '↕️ Sort direction',
    example: SortDirection.DESC,
    enum: SortDirection,
    default: SortDirection.DESC,
    title: 'Sort Direction',
  })
  @IsEnum(SortDirection, { message: 'Sort direction must be ASC or DESC' })
  direction: SortDirection = SortDirection.DESC;
}

// ═══════════════════════════════════════════════════════════════
// 🔍 FILTERS DTOs
// ═══════════════════════════════════════════════════════════════

export class UserFiltersDto {
  @ApiPropertyOptional({
    description:
      '🔍 Search term for email, first name, or last name (case-insensitive)',
    example: 'john',
    type: 'string',
    minLength: 1,
    maxLength: 100,
    title: 'Search Term',
  })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: '📧 Filter by exact email address',
    example: 'user@example.com',
    type: 'string',
    format: 'email',
    title: 'Email Filter',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    description: '🎭 Filter by user roles (multiple roles supported)',
    example: [UserRole.PRACTITIONER, UserRole.ASSISTANT],
    type: 'array',
    items: { type: 'string', enum: Object.values(UserRole) },
    title: 'Role Filters',
  })
  @IsOptional()
  @IsArray({ message: 'Roles must be an array' })
  @IsEnum(UserRole, { each: true, message: 'Invalid role in roles array' })
  roles?: UserRole[];

  @ApiPropertyOptional({
    description: '✅ Filter by account status (active/inactive)',
    example: true,
    type: 'boolean',
    title: 'Active Status Filter',
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: '✅ Filter by verification status (verified/unverified)',
    example: true,
    type: 'boolean',
    title: 'Verification Status Filter',
  })
  @IsOptional()
  @IsBoolean({ message: 'isVerified must be a boolean' })
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: '📅 Filter by creation date (from date - ISO string)',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
    title: 'Created After Date',
  })
  @IsOptional()
  @IsString({ message: 'createdAfter must be a string' })
  createdAfter?: string;

  @ApiPropertyOptional({
    description: '📅 Filter by creation date (to date - ISO string)',
    example: '2024-12-31T23:59:59.999Z',
    type: 'string',
    format: 'date-time',
    title: 'Created Before Date',
  })
  @IsOptional()
  @IsString({ message: 'createdBefore must be a string' })
  createdBefore?: string;

  @ApiPropertyOptional({
    description: '🆔 Filter by specific user IDs (multiple IDs supported)',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: 'array',
    items: { type: 'string', format: 'uuid' },
    title: 'User ID Filters',
  })
  @IsOptional()
  @IsArray({ message: 'userIds must be an array' })
  @IsUUID(4, { each: true, message: 'Each userId must be a valid UUID v4' })
  userIds?: string[];
}

// ═══════════════════════════════════════════════════════════════
// 📨 REQUEST DTO - POST /users/list
// ═══════════════════════════════════════════════════════════════

export class ListUsersRequestDto {
  @ApiProperty({
    description: '📄 Pagination configuration',
    type: PaginationDto,
    title: 'Pagination Settings',
  })
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto = new PaginationDto();

  @ApiPropertyOptional({
    description: '🔤 Sorting configuration',
    type: SortDto,
    title: 'Sort Settings',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SortDto)
  sort?: SortDto;

  @ApiPropertyOptional({
    description: '🔍 Filtering options',
    type: UserFiltersDto,
    title: 'Filter Settings',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserFiltersDto)
  filters?: UserFiltersDto;
}

// ═══════════════════════════════════════════════════════════════
// 📤 RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════

export class UserListItemDto {
  @ApiProperty({
    description: '🆔 Unique user identifier (UUID v4)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    title: 'User ID',
  })
  id!: string;

  @ApiProperty({
    description: '📧 User email address',
    example: 'user@example.com',
    type: 'string',
    format: 'email',
    title: 'Email Address',
  })
  email!: string;

  @ApiPropertyOptional({
    description: '👤 Username (optional)',
    example: 'john_doe',
    type: 'string',
    title: 'Username',
  })
  username?: string;

  @ApiProperty({
    description: '👤 User first name',
    example: 'John',
    type: 'string',
    title: 'First Name',
  })
  firstName!: string;

  @ApiProperty({
    description: '👤 User last name',
    example: 'Doe',
    type: 'string',
    title: 'Last Name',
  })
  lastName!: string;

  @ApiProperty({
    description: '🎭 User role in the system',
    example: UserRole.PRACTITIONER,
    enum: UserRole,
    title: 'User Role',
  })
  role!: UserRole;

  @ApiProperty({
    description: '✅ Account active status',
    example: true,
    type: 'boolean',
    title: 'Is Active',
  })
  isActive!: boolean;

  @ApiProperty({
    description: '✅ Account verification status',
    example: true,
    type: 'boolean',
    title: 'Is Verified',
  })
  isVerified!: boolean;

  @ApiProperty({
    description: '📅 Account creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
    title: 'Created At',
  })
  createdAt!: string;

  @ApiProperty({
    description: '📅 Last update timestamp',
    example: '2024-01-20T14:45:00.000Z',
    type: 'string',
    format: 'date-time',
    title: 'Updated At',
  })
  updatedAt!: string;
}

export class PaginationMetaDto {
  @ApiProperty({
    description: '📄 Current page number',
    example: 1,
    type: 'integer',
    title: 'Current Page',
  })
  currentPage!: number;

  @ApiProperty({
    description: '📊 Items per page',
    example: 20,
    type: 'integer',
    title: 'Items Per Page',
  })
  itemsPerPage!: number;

  @ApiProperty({
    description: '📊 Total number of items',
    example: 150,
    type: 'integer',
    title: 'Total Items',
  })
  totalItems!: number;

  @ApiProperty({
    description: '📄 Total number of pages',
    example: 8,
    type: 'integer',
    title: 'Total Pages',
  })
  totalPages!: number;

  @ApiProperty({
    description: '◀️ Has previous page',
    example: false,
    type: 'boolean',
    title: 'Has Previous Page',
  })
  hasPreviousPage!: boolean;

  @ApiProperty({
    description: '▶️ Has next page',
    example: true,
    type: 'boolean',
    title: 'Has Next Page',
  })
  hasNextPage!: boolean;
}

export class ListUsersResponseDto {
  @ApiProperty({
    description: '👥 Array of users matching the criteria',
    type: [UserListItemDto],
    title: 'Users List',
  })
  data!: UserListItemDto[];

  @ApiProperty({
    description: '📊 Pagination metadata',
    type: PaginationMetaDto,
    title: 'Pagination Info',
  })
  meta!: PaginationMetaDto;

  @ApiProperty({
    description: '✅ Success message',
    example: 'Users retrieved successfully',
    type: 'string',
    title: 'Success Message',
  })
  message!: string;
}

// ═══════════════════════════════════════════════════════════════
// � CRUD OPERATION DTOs
// ═══════════════════════════════════════════════════════════════

export class CreateUserRequestDto {
  @ApiProperty({
    description: '📧 User email address',
    example: 'user@example.com',
    type: 'string',
    format: 'email',
    title: 'Email Address',
  })
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @ApiProperty({
    description: '👤 User first name',
    example: 'John',
    type: 'string',
    minLength: 2,
    maxLength: 50,
    title: 'First Name',
  })
  @IsString({ message: 'First name must be a string' })
  @Transform(({ value }) => value?.trim())
  firstName!: string;

  @ApiProperty({
    description: '👤 User last name',
    example: 'Doe',
    type: 'string',
    minLength: 2,
    maxLength: 50,
    title: 'Last Name',
  })
  @IsString({ message: 'Last name must be a string' })
  @Transform(({ value }) => value?.trim())
  lastName!: string;

  @ApiProperty({
    description: '🎭 User role in the system',
    example: UserRole.PRACTITIONER,
    enum: UserRole,
    title: 'User Role',
  })
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role!: UserRole;

  @ApiPropertyOptional({
    description: '📱 User phone number (optional)',
    example: '+1234567890',
    type: 'string',
    title: 'Phone Number',
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;
}

export class UpdateUserRequestDto {
  @ApiPropertyOptional({
    description: '👤 User first name',
    example: 'John',
    type: 'string',
    minLength: 2,
    maxLength: 50,
    title: 'First Name',
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @ApiPropertyOptional({
    description: '👤 User last name',
    example: 'Doe',
    type: 'string',
    minLength: 2,
    maxLength: 50,
    title: 'Last Name',
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @ApiPropertyOptional({
    description: '🎭 User role in the system',
    example: UserRole.PRACTITIONER,
    enum: UserRole,
    title: 'User Role',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: '📱 User phone number',
    example: '+1234567890',
    type: 'string',
    title: 'Phone Number',
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @ApiPropertyOptional({
    description: '✅ Account active status',
    example: true,
    type: 'boolean',
    title: 'Is Active',
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}

export class UserResponseDto {
  @ApiProperty({
    description: '🆔 Unique user identifier (UUID v4)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    title: 'User ID',
  })
  id!: string;

  @ApiProperty({
    description: '📧 User email address',
    example: 'user@example.com',
    type: 'string',
    format: 'email',
    title: 'Email Address',
  })
  email!: string;

  @ApiProperty({
    description: '👤 User first name',
    example: 'John',
    type: 'string',
    title: 'First Name',
  })
  firstName!: string;

  @ApiProperty({
    description: '👤 User last name',
    example: 'Doe',
    type: 'string',
    title: 'Last Name',
  })
  lastName!: string;

  @ApiProperty({
    description: '🎭 User role in the system',
    example: UserRole.PRACTITIONER,
    enum: UserRole,
    title: 'User Role',
  })
  role!: UserRole;

  @ApiPropertyOptional({
    description: '📱 User phone number (optional)',
    example: '+1234567890',
    type: 'string',
    title: 'Phone Number',
  })
  phone?: string;

  @ApiProperty({
    description: '✅ Account active status',
    example: true,
    type: 'boolean',
    title: 'Is Active',
  })
  isActive!: boolean;

  @ApiProperty({
    description: '✅ Account verification status',
    example: true,
    type: 'boolean',
    title: 'Is Verified',
  })
  isVerified!: boolean;

  @ApiProperty({
    description: '📅 Account creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
    title: 'Created At',
  })
  createdAt!: string;

  @ApiProperty({
    description: '📅 Last update timestamp',
    example: '2024-01-20T14:45:00.000Z',
    type: 'string',
    format: 'date-time',
    title: 'Updated At',
  })
  updatedAt!: string;
}

export class DeleteUserResponseDto {
  @ApiProperty({
    description: '✅ Success message',
    example: 'User deleted successfully',
    type: 'string',
    title: 'Success Message',
  })
  message!: string;

  @ApiProperty({
    description: '🆔 Deleted user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    title: 'Deleted User ID',
  })
  deletedUserId!: string;
}

// ═══════════════════════════════════════════════════════════════
// �🚨 ERROR RESPONSE DTOs SPÉCIFIQUES AUX UTILISATEURS
// ═══════════════════════════════════════════════════════════════

export class UserListValidationErrorDto {
  @ApiProperty({
    description: '🚨 Error message for invalid filters or pagination',
    example: 'Invalid request parameters',
    type: 'string',
    title: 'Error Message',
  })
  message!: string;

  @ApiProperty({
    description: '📋 Array of detailed validation errors',
    example: [
      'pagination.page must be at least 1',
      'filters.roles[0] must be a valid enum value',
    ],
    type: 'array',
    items: { type: 'string' },
    title: 'Validation Errors',
  })
  error!: string[];

  @ApiProperty({
    description: '🔢 HTTP status code',
    example: 400,
    type: 'number',
    title: 'Status Code',
  })
  statusCode!: number;
}
