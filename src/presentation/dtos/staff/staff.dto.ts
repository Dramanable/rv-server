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
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { StaffRole } from '../../../shared/enums/staff-role.enum';

/**
 * 👥 Staff Creation DTO
 * Used when adding new staff members to a business
 * 
 * Frontend Usage Example:
 * ```typescript
 * const newStaff: CreateStaffDto = {
 *   businessId: 'business-uuid-here',
 *   userId: 'user-uuid-here', // From user system
 *   firstName: 'Marie',
 *   lastName: 'Dupont',
 *   role: StaffRole.PRACTITIONER,
 *   email: 'marie.dupont@clinique.fr',
 *   phone: '+33 1 23 45 67 89',
 *   specialties: ['DENTAL_SURGERY', 'ORTHODONTICS'],
 *   workingHours: {
 *     monday: { start: '09:00', end: '17:00', break: { start: '12:00', end: '13:00' } },
 *     tuesday: { start: '09:00', end: '17:00', break: { start: '12:00', end: '13:00' } }
 *   }
 * };
 * 
 * const response = await api.post('/staff', newStaff);
 * ```
 */
export class CreateStaffDto {
  @ApiProperty({
    description: 'ID of the business this staff member belongs to',
    example: 'business-uuid-123',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'validation.staff.business_id_invalid' })
  businessId: string;

  @ApiProperty({
    description: 'User ID from the authentication system',
    example: 'user-uuid-456',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'validation.staff.user_id_invalid' })
  userId: string;

  @ApiProperty({
    description: 'Staff member first name',
    example: 'Marie',
    minLength: 2,
    maxLength: 50
  })
  @IsString({ message: 'validation.staff.first_name_string' })
  @Length(2, 50, { message: 'validation.staff.first_name_length' })
  firstName: string;

  @ApiProperty({
    description: 'Staff member last name',
    example: 'Dupont',
    minLength: 2,
    maxLength: 50
  })
  @IsString({ message: 'validation.staff.last_name_string' })
  @Length(2, 50, { message: 'validation.staff.last_name_length' })
  lastName: string;

  @ApiProperty({
    description: 'Role of the staff member in the business',
    enum: StaffRole,
    example: StaffRole.PRACTITIONER
  })
  @IsEnum(StaffRole, { message: 'validation.staff.role_invalid' })
  role: StaffRole;

  @ApiProperty({
    description: 'Professional email address',
    example: 'marie.dupont@clinique.fr',
    format: 'email'
  })
  @IsString({ message: 'validation.staff.email_string' })
  email: string;

  @ApiProperty({
    description: 'Professional phone number',
    example: '+33 1 23 45 67 89',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'validation.staff.phone_string' })
  phone?: string;

  @ApiProperty({
    description: 'Array of service specialties',
    example: ['DENTAL_SURGERY', 'ORTHODONTICS'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'validation.staff.specialties_array' })
  @IsString({ each: true, message: 'validation.staff.specialty_string' })
  specialties?: string[];

  @ApiProperty({
    description: 'Working hours configuration per day',
    example: {
      monday: { start: '09:00', end: '17:00', break: { start: '12:00', end: '13:00' } },
      tuesday: { start: '09:00', end: '17:00', break: { start: '12:00', end: '13:00' } }
    },
    required: false
  })
  @IsOptional()
  workingHours?: Record<string, any>;

  @ApiProperty({
    description: 'Additional settings and preferences',
    example: { 
      bookingBuffer: 15, // minutes between appointments
      maxAdvanceBooking: 60, // days in advance
      allowClientCancellation: true 
    },
    required: false
  })
  @IsOptional()
  settings?: Record<string, any>;
}

/**
 * ✏️ Staff Update DTO
 * Used for partial updates of staff information
 */
export class UpdateStaffDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.staff.first_name_string' })
  @Length(2, 50, { message: 'validation.staff.first_name_length' })
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.staff.last_name_string' })
  @Length(2, 50, { message: 'validation.staff.last_name_length' })
  lastName?: string;

  @ApiProperty({ enum: StaffRole, required: false })
  @IsOptional()
  @IsEnum(StaffRole, { message: 'validation.staff.role_invalid' })
  role?: StaffRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.staff.email_string' })
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.staff.phone_string' })
  phone?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray({ message: 'validation.staff.specialties_array' })
  @IsString({ each: true, message: 'validation.staff.specialty_string' })
  specialties?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  workingHours?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  settings?: Record<string, any>;

  @ApiProperty({ 
    description: 'Whether the staff member is currently active',
    required: false 
  })
  @IsOptional()
  @IsBoolean({ message: 'validation.staff.is_active_boolean' })
  isActive?: boolean;
}

/**
 * 📋 Staff Response DTO
 * Complete staff information returned by the API
 */
export class StaffResponseDto {
  @ApiProperty({
    description: 'Unique staff member identifier',
    example: 'staff-uuid-789'
  })
  id: string;

  @ApiProperty({
    description: 'Business this staff member belongs to',
    example: 'business-uuid-123'
  })
  businessId: string;

  @ApiProperty({
    description: 'Associated user ID',
    example: 'user-uuid-456'
  })
  userId: string;

  @ApiProperty({ example: 'Marie' })
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  lastName: string;

  @ApiProperty({ 
    description: 'Full display name',
    example: 'Dr. Marie Dupont' 
  })
  displayName: string;

  @ApiProperty({ enum: StaffRole })
  role: StaffRole;

  @ApiProperty({ example: 'marie.dupont@clinique.fr' })
  email: string;

  @ApiProperty({ example: '+33 1 23 45 67 89' })
  phone?: string;

  @ApiProperty({ 
    description: 'Service specialties',
    type: [String] 
  })
  specialties: string[];

  @ApiProperty({ description: 'Working hours configuration' })
  workingHours: Record<string, any>;

  @ApiProperty({ description: 'Staff settings and preferences' })
  settings: Record<string, any>;

  @ApiProperty({ description: 'Whether the staff member is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

/**
 * 🔍 Staff List Query DTO
 * Advanced filtering options for staff listing
 */
export class StaffListQueryDto {
  @ApiProperty({
    description: 'Business ID to filter staff by',
    required: false,
    example: 'business-uuid-123'
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.staff.business_id_invalid' })
  businessId?: string;

  @ApiProperty({
    description: 'Filter by staff role',
    enum: StaffRole,
    required: false
  })
  @IsOptional()
  @IsEnum(StaffRole, { message: 'validation.staff.role_invalid' })
  role?: StaffRole;

  @ApiProperty({
    description: 'Filter by service specialty',
    required: false,
    example: 'DENTAL_SURGERY'
  })
  @IsOptional()
  @IsString({ message: 'validation.staff.specialty_string' })
  specialty?: string;

  @ApiProperty({
    description: 'Filter by active status',
    required: false,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'validation.staff.is_active_boolean' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Search in staff names and emails',
    required: false,
    example: 'marie'
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
    enum: ['firstName', 'lastName', 'role', 'createdAt', 'updatedAt']
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
 * 📊 Paginated Staff Response DTO
 * List response with pagination metadata
 */
export class PaginatedStaffResponseDto {
  @ApiProperty({ 
    description: 'Array of staff members',
    type: [StaffResponseDto] 
  })
  data: StaffResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 20,
      total: 150,
      totalPages: 8,
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
