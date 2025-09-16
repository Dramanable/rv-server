import { IsUUID, IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, Min, Max, MaxLength, MinLength, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCategory } from '../../../shared/enums/service-category.enum';

/**
 * 💰 Money DTO for pricing
 */
export class MoneyDto {
  @ApiProperty({
    description: 'Amount in the smallest currency unit (cents)',
    example: 5000,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'EUR',
    maxLength: 3,
    minLength: 3
  })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency: string;
}

/**
 * ⚙️ Service Settings DTO
 */
export class ServiceSettingsDto {
  @ApiPropertyOptional({
    description: 'Maximum number of participants/clients for group services',
    example: 1,
    minimum: 1,
    maximum: 50,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  maxParticipants?: number = 1;

  @ApiPropertyOptional({
    description: 'Whether the service requires confirmation before booking',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  requiresConfirmation?: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether the service allows online booking',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  allowOnlineBooking?: boolean = true;

  @ApiPropertyOptional({
    description: 'Minimum hours before appointment that booking is allowed',
    example: 2,
    minimum: 0,
    maximum: 168
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(168) // 1 week maximum
  minAdvanceBookingHours?: number;

  @ApiPropertyOptional({
    description: 'Maximum days in advance that booking is allowed',
    example: 30,
    minimum: 1,
    maximum: 365
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  maxAdvanceBookingDays?: number;

  @ApiPropertyOptional({
    description: 'Buffer time in minutes after the service',
    example: 15,
    minimum: 0,
    maximum: 120
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  bufferTimeMinutes?: number;
}

/**
 * 🛠️ Create Service Request DTO
 */
export class CreateServiceDto {
  @ApiProperty({
    description: 'Business ID that owns this service',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsUUID()
  businessId: string;

  @ApiProperty({
    description: 'Service name',
    example: 'General Medical Consultation',
    maxLength: 255,
    minLength: 2
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed service description',
    example: 'Comprehensive medical consultation including examination, diagnosis, and treatment recommendations',
    maxLength: 2000
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description: 'Service category',
    enum: ServiceCategory,
    example: ServiceCategory.CONSULTATION,
    enumName: 'ServiceCategory'
  })
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @ApiProperty({
    description: 'Service duration in minutes',
    example: 30,
    minimum: 5,
    maximum: 480
  })
  @IsNumber()
  @Min(5)
  @Max(480) // 8 hours maximum
  durationMinutes: number;

  @ApiProperty({
    description: 'Base price for the service',
    type: MoneyDto
  })
  @ValidateNested()
  @Type(() => MoneyDto)
  basePrice: MoneyDto;

  @ApiPropertyOptional({
    description: 'Array of required staff role IDs for this service',
    example: ['doctor', 'nurse'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredStaffRoles?: string[];

  @ApiPropertyOptional({
    description: 'Special requirements or instructions for the service',
    example: 'Please bring valid ID and insurance card',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  requirements?: string;

  @ApiPropertyOptional({
    description: 'Service configuration settings',
    type: ServiceSettingsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceSettingsDto)
  settings?: ServiceSettingsDto;

  @ApiPropertyOptional({
    description: 'Service tags for categorization and search',
    example: ['medical', 'consultation', 'general'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

/**
 * 📝 Update Service Request DTO
 */
export class UpdateServiceDto {
  @ApiPropertyOptional({
    description: 'Service name',
    example: 'Updated Medical Consultation',
    maxLength: 255,
    minLength: 2
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Detailed service description',
    example: 'Updated comprehensive medical consultation including examination, diagnosis, and treatment recommendations',
    maxLength: 2000
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Service category',
    enum: ServiceCategory,
    example: ServiceCategory.CONSULTATION,
    enumName: 'ServiceCategory'
  })
  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @ApiPropertyOptional({
    description: 'Service duration in minutes',
    example: 45,
    minimum: 5,
    maximum: 480
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(480)
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Base price for the service',
    type: MoneyDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  basePrice?: MoneyDto;

  @ApiPropertyOptional({
    description: 'Array of required staff role IDs for this service',
    example: ['doctor', 'specialist'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredStaffRoles?: string[];

  @ApiPropertyOptional({
    description: 'Special requirements or instructions for the service',
    example: 'Updated requirements: Please bring valid ID and updated insurance card',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  requirements?: string;

  @ApiPropertyOptional({
    description: 'Service configuration settings',
    type: ServiceSettingsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceSettingsDto)
  settings?: ServiceSettingsDto;

  @ApiPropertyOptional({
    description: 'Service tags for categorization and search',
    example: ['medical', 'consultation', 'specialist'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Whether the service is active and bookable',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * 📄 Service Response DTO
 */
export class ServiceResponseDto {
  @ApiProperty({
    description: 'Service unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({
    description: 'Business ID that owns this service',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  businessId: string;

  @ApiProperty({
    description: 'Service name',
    example: 'General Medical Consultation'
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed service description',
    example: 'Comprehensive medical consultation including examination, diagnosis, and treatment recommendations'
  })
  description?: string;

  @ApiProperty({
    description: 'Service category',
    enum: ServiceCategory,
    example: ServiceCategory.CONSULTATION,
    enumName: 'ServiceCategory'
  })
  category: ServiceCategory;

  @ApiProperty({
    description: 'Service duration in minutes',
    example: 30
  })
  durationMinutes: number;

  @ApiProperty({
    description: 'Base price for the service',
    type: MoneyDto
  })
  basePrice: MoneyDto;

  @ApiPropertyOptional({
    description: 'Array of required staff role IDs for this service',
    example: ['doctor', 'nurse'],
    type: [String]
  })
  requiredStaffRoles?: string[];

  @ApiPropertyOptional({
    description: 'Special requirements or instructions for the service',
    example: 'Please bring valid ID and insurance card'
  })
  requirements?: string;

  @ApiPropertyOptional({
    description: 'Service configuration settings',
    type: ServiceSettingsDto
  })
  settings?: ServiceSettingsDto;

  @ApiPropertyOptional({
    description: 'Service tags for categorization and search',
    example: ['medical', 'consultation', 'general'],
    type: [String]
  })
  tags?: string[];

  @ApiProperty({
    description: 'Whether the service is active and bookable',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Service creation timestamp',
    example: '2024-09-15T10:00:00Z',
    format: 'date-time'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Service last update timestamp',
    example: '2024-09-15T14:30:00Z',
    format: 'date-time'
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Number of times this service has been booked',
    example: 127
  })
  bookingCount?: number;

  @ApiPropertyOptional({
    description: 'Average rating from customer feedback',
    example: 4.8,
    minimum: 0,
    maximum: 5
  })
  averageRating?: number;

  @ApiPropertyOptional({
    description: 'Service image URLs',
    example: ['https://storage.example.com/services/consultation.jpg'],
    type: [String]
  })
  imageUrls?: string[];
}

/**
 * 🔍 Service List Query DTO
 */
export class ServiceListQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by business ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @ApiPropertyOptional({
    description: 'Filter by service category',
    enum: ServiceCategory,
    enumName: 'ServiceCategory'
  })
  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @ApiPropertyOptional({
    description: 'Search term for name or description',
    example: 'consultation',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true
  })
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum duration in minutes',
    example: 15,
    minimum: 5
  })
  @IsOptional()
  @Type(() => Number)
  @Min(5)
  minDuration?: number;

  @ApiPropertyOptional({
    description: 'Maximum duration in minutes',
    example: 120,
    maximum: 480
  })
  @IsOptional()
  @Type(() => Number)
  @Max(480)
  maxDuration?: number;

  @ApiPropertyOptional({
    description: 'Minimum price in cents',
    example: 1000,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price in cents',
    example: 20000,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter by tags',
    example: ['consultation', 'medical'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'name',
    enum: ['name', 'category', 'duration', 'price', 'createdAt', 'updatedAt', 'popularity']
  })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'category' | 'duration' | 'price' | 'createdAt' | 'updatedAt' | 'popularity' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort direction',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * 📄 Paginated Service List Response DTO
 */
export class PaginatedServiceResponseDto {
  @ApiProperty({
    description: 'Array of services',
    type: [ServiceResponseDto]
  })
  data: ServiceResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 20,
      total: 45,
      totalPages: 3,
      hasNext: true,
      hasPrevious: false
    }
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };

  @ApiPropertyOptional({
    description: 'Available filter options based on current data',
    example: {
      categories: ['CONSULTATION', 'THERAPY', 'DIAGNOSTIC'],
      tags: ['medical', 'consultation', 'therapy'],
      priceRange: { min: 1000, max: 15000 },
      durationRange: { min: 15, max: 120 }
    }
  })
  filters?: {
    categories: ServiceCategory[];
    tags: string[];
    priceRange: { min: number; max: number };
    durationRange: { min: number; max: number };
  };
}
