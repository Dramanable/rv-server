/**
 * 🏢 Create Business DTO - Validation + Documentation
 * 
 * DTO pour la création d'entreprise avec validation stricte
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  IsArray, 
  IsBoolean, 
  IsNumber, 
  IsUrl,
  ValidateNested,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum BusinessTypeDto {
  CLINIC = 'CLINIC',
  DENTAL_CLINIC = 'DENTAL_CLINIC',
  VETERINARY_CLINIC = 'VETERINARY_CLINIC',
  MEDICAL_CENTER = 'MEDICAL_CENTER',
  LAW_FIRM = 'LAW_FIRM',
  LEGAL_SERVICES = 'LEGAL_SERVICES',
  NOTARY = 'NOTARY',
  BEAUTY_SALON = 'BEAUTY_SALON',
  BARBER_SHOP = 'BARBER_SHOP',
  SPA = 'SPA',
  NAIL_SALON = 'NAIL_SALON',
  FITNESS_CENTER = 'FITNESS_CENTER',
  GYM = 'GYM',
  YOGA_STUDIO = 'YOGA_STUDIO',
  PILATES_STUDIO = 'PILATES_STUDIO',
  CONSULTING = 'CONSULTING',
  COACHING = 'COACHING',
  THERAPY = 'THERAPY',
  RESTAURANT = 'RESTAURANT',
  CAFE = 'CAFE',
  BAR = 'BAR',
  AUTOMOTIVE = 'AUTOMOTIVE',
  GARAGE = 'GARAGE',
  CAR_WASH = 'CAR_WASH',
  EDUCATION = 'EDUCATION',
  TRAINING_CENTER = 'TRAINING_CENTER',
  LANGUAGE_SCHOOL = 'LANGUAGE_SCHOOL',
  REAL_ESTATE = 'REAL_ESTATE',
  INSURANCE = 'INSURANCE',
  FINANCE = 'FINANCE',
  OTHER = 'OTHER',
}

class BrandColorsDto {
  @ApiProperty({ 
    description: 'Primary brand color in hex format',
    example: '#3B82F6',
    pattern: '^#([0-9A-F]{3}){1,2}$'
  })
  @IsString()
  @Matches(/^#([0-9A-F]{3}){1,2}$/i, { message: 'Primary color must be a valid hex color' })
  primary!: string;

  @ApiPropertyOptional({ 
    description: 'Secondary brand color in hex format',
    example: '#10B981',
    pattern: '^#([0-9A-F]{3}){1,2}$'
  })
  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-F]{3}){1,2}$/i, { message: 'Secondary color must be a valid hex color' })
  secondary?: string;

  @ApiPropertyOptional({ 
    description: 'Accent brand color in hex format',
    example: '#F59E0B',
    pattern: '^#([0-9A-F]{3}){1,2}$'
  })
  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-F]{3}){1,2}$/i, { message: 'Accent color must be a valid hex color' })
  accent?: string;
}

class BrandingDto {
  @ApiPropertyOptional({ 
    description: 'Logo URL (from file upload service)',
    example: 'https://cdn.example.com/logos/business-logo.png'
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Cover image URL (from file upload service)',
    example: 'https://cdn.example.com/covers/business-cover.jpg'
  })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Brand colors configuration',
    type: BrandColorsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandColorsDto)
  brandColors?: BrandColorsDto;

  @ApiPropertyOptional({ 
    description: 'Additional brand images URLs',
    type: [String],
    example: ['https://cdn.example.com/gallery/img1.jpg', 'https://cdn.example.com/gallery/img2.jpg']
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  @ArrayMaxSize(10, { message: 'Maximum 10 brand images allowed' })
  images?: string[];
}

class SocialMediaDto {
  @ApiPropertyOptional({ 
    description: 'Facebook page URL',
    example: 'https://facebook.com/mybusiness'
  })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional({ 
    description: 'Instagram profile URL',
    example: 'https://instagram.com/mybusiness'
  })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional({ 
    description: 'LinkedIn company URL',
    example: 'https://linkedin.com/company/mybusiness'
  })
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @ApiPropertyOptional({ 
    description: 'Twitter profile URL',
    example: 'https://twitter.com/mybusiness'
  })
  @IsOptional()
  @IsUrl()
  twitter?: string;
}

class ContactInfoDto {
  @ApiProperty({ 
    description: 'Primary business email',
    example: 'contact@mybusiness.com'
  })
  @IsEmail()
  primaryEmail!: string;

  @ApiPropertyOptional({ 
    description: 'Additional business emails',
    type: [String],
    example: ['support@mybusiness.com', 'billing@mybusiness.com']
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  @ArrayMaxSize(5, { message: 'Maximum 5 secondary emails allowed' })
  secondaryEmails?: string[];

  @ApiProperty({ 
    description: 'Primary business phone number',
    example: '+33123456789'
  })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  primaryPhone!: string;

  @ApiPropertyOptional({ 
    description: 'Additional business phone numbers',
    type: [String],
    example: ['+33987654321', '+33555666777']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(3, { message: 'Maximum 3 secondary phones allowed' })
  secondaryPhones?: string[];

  @ApiPropertyOptional({ 
    description: 'Business website URL',
    example: 'https://www.mybusiness.com'
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ 
    description: 'Social media links',
    type: SocialMediaDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto;
}

class AppointmentSettingsDto {
  @ApiPropertyOptional({ 
    description: 'Default appointment duration in minutes',
    example: 60,
    minimum: 5,
    maximum: 480
  })
  @IsOptional()
  @IsNumber()
  @Min(5, { message: 'Default duration must be at least 5 minutes' })
  @Max(480, { message: 'Default duration cannot exceed 480 minutes (8 hours)' })
  defaultDuration?: number;

  @ApiPropertyOptional({ 
    description: 'Buffer time between appointments in minutes',
    example: 15,
    minimum: 0,
    maximum: 60
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Buffer time cannot be negative' })
  @Max(60, { message: 'Buffer time cannot exceed 60 minutes' })
  bufferTime?: number;

  @ApiPropertyOptional({ 
    description: 'Maximum days in advance for booking',
    example: 30,
    minimum: 1,
    maximum: 365
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Advance booking limit must be at least 1 day' })
  @Max(365, { message: 'Advance booking limit cannot exceed 365 days' })
  advanceBookingLimit?: number;

  @ApiPropertyOptional({ 
    description: 'Cancellation policy description',
    example: 'Cancellations must be made at least 24 hours in advance'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Cancellation policy cannot exceed 500 characters' })
  cancellationPolicy?: string;
}

class NotificationSettingsDto {
  @ApiPropertyOptional({ 
    description: 'Enable email notifications',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ 
    description: 'Enable SMS notifications',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiPropertyOptional({ 
    description: 'Reminder time before appointment in minutes',
    example: 60,
    minimum: 0,
    maximum: 10080
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Reminder time cannot be negative' })
  @Max(10080, { message: 'Reminder time cannot exceed 7 days (10080 minutes)' })
  reminderTime?: number;
}

class SettingsDto {
  @ApiPropertyOptional({ 
    description: 'Business timezone',
    example: 'Europe/Paris'
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ 
    description: 'Default currency code',
    example: 'EUR'
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ 
    description: 'Default language code',
    example: 'fr-FR'
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({ 
    description: 'Appointment-related settings',
    type: AppointmentSettingsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AppointmentSettingsDto)
  appointmentSettings?: AppointmentSettingsDto;

  @ApiPropertyOptional({ 
    description: 'Notification preferences',
    type: NotificationSettingsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notificationSettings?: NotificationSettingsDto;
}

export class CreateBusinessDto {
  @ApiProperty({ 
    description: 'Business name (must be unique)',
    example: 'My Dental Clinic',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @MinLength(3, { message: 'Business name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Business name cannot exceed 100 characters' })
  name!: string;

  @ApiPropertyOptional({ 
    description: 'Business description',
    example: 'A modern dental clinic providing comprehensive oral care services',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Business slogan or tagline',
    example: 'Your smile is our priority',
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Slogan cannot exceed 255 characters' })
  slogan?: string;

  @ApiProperty({ 
    description: 'Type of business',
    enum: BusinessTypeDto,
    example: BusinessTypeDto.DENTAL_CLINIC
  })
  @IsEnum(BusinessTypeDto, { message: 'Invalid business type' })
  type!: BusinessTypeDto;

  @ApiPropertyOptional({ 
    description: 'Branding configuration',
    type: BrandingDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandingDto)
  branding?: BrandingDto;

  @ApiProperty({ 
    description: 'Contact information',
    type: ContactInfoDto
  })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo!: ContactInfoDto;

  @ApiPropertyOptional({ 
    description: 'Business settings and preferences',
    type: SettingsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SettingsDto)
  settings?: SettingsDto;
}
