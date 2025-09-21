/**
 * 🏢 Business DTOs - Complete & Standardized
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
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
// Enums copiés depuis domain pour éviter les dépendances circulaires
export enum BusinessSector {
  LEGAL = 'LEGAL',
  MEDICAL = 'MEDICAL',
  HEALTH = 'HEALTH',
  BEAUTY = 'BEAUTY',
  CONSULTING = 'CONSULTING',
  FINANCE = 'FINANCE',
  EDUCATION = 'EDUCATION',
  WELLNESS = 'WELLNESS',
  AUTOMOTIVE = 'AUTOMOTIVE',
  OTHER = 'OTHER',
}

export enum BusinessStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

// === ADDRESS DTO ===
export class AddressDto {
  @ApiProperty({
    description: 'Street address',
    example: '123 Rue de la Paix',
  })
  @IsString()
  @Length(5, 200, {
    message: 'Street address must be between 5 and 200 characters',
  })
  readonly street!: string;

  @ApiProperty({
    description: 'City name',
    example: 'Paris',
  })
  @IsString()
  @Length(2, 100, { message: 'City must be between 2 and 100 characters' })
  readonly city!: string;

  @ApiProperty({
    description: 'Postal code',
    example: '75001',
  })
  @IsString()
  @Length(4, 10, { message: 'Postal code must be between 4 and 10 characters' })
  readonly postalCode!: string;

  @ApiProperty({
    description: 'Country name',
    example: 'France',
  })
  @IsString()
  @Length(2, 100, { message: 'Country must be between 2 and 100 characters' })
  readonly country!: string;

  @ApiPropertyOptional({
    description: 'Region or state',
    example: 'Île-de-France',
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  readonly region?: string;
}

// === CONTACT INFO DTO ===
export class ContactInfoDto {
  @ApiProperty({
    description: 'Primary email address',
    example: 'contact@cabinet-exemple.fr',
  })
  @IsEmail({}, { message: 'Primary email must be a valid email address' })
  readonly primaryEmail!: string;

  @ApiPropertyOptional({
    description: 'Secondary email addresses',
    example: ['admin@cabinet-exemple.fr', 'info@cabinet-exemple.fr'],
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true, message: 'Each secondary email must be valid' })
  readonly secondaryEmails?: string[];

  @ApiProperty({
    description: 'Primary phone number',
    example: '+33123456789',
  })
  @IsPhoneNumber('FR', {
    message: 'Primary phone must be a valid French phone number',
  })
  readonly primaryPhone!: string;

  @ApiPropertyOptional({
    description: 'Secondary phone numbers',
    example: ['+33987654321'],
  })
  @IsOptional()
  @IsArray()
  @IsPhoneNumber('FR', { each: true })
  readonly secondaryPhones?: string[];

  @ApiPropertyOptional({
    description: 'Business website URL',
    example: 'https://www.cabinet-exemple.fr',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  readonly website?: string;

  @ApiPropertyOptional({
    description: 'Social media links',
    example: {
      facebook: 'https://facebook.com/cabinet-exemple',
      instagram: 'https://instagram.com/cabinet_exemple',
    },
  })
  @IsOptional()
  @IsObject()
  readonly socialMedia?: {
    readonly facebook?: string;
    readonly instagram?: string;
    readonly linkedin?: string;
    readonly twitter?: string;
  };
}

// === SETTINGS DTO ===
export class BusinessSettingsDto {
  @ApiPropertyOptional({
    description: 'Business timezone',
    example: 'Europe/Paris',
    default: 'Europe/Paris',
  })
  @IsOptional()
  @IsString()
  readonly timezone?: string;

  @ApiPropertyOptional({
    description: 'Business currency',
    example: 'EUR',
    default: 'EUR',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3, { message: 'Currency must be a 3-letter code' })
  readonly currency?: string;

  @ApiPropertyOptional({
    description: 'Business language',
    example: 'fr',
    default: 'fr',
  })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  readonly language?: string;

  @ApiPropertyOptional({
    description: 'Appointment settings',
    example: {
      defaultDuration: 30,
      bufferTime: 5,
      advanceBookingLimit: 30,
      cancellationPolicy: '24h before appointment',
    },
  })
  @IsOptional()
  @IsObject()
  readonly appointmentSettings?: {
    readonly defaultDuration?: number;
    readonly bufferTime?: number;
    readonly advanceBookingLimit?: number;
    readonly cancellationPolicy?: string;
  };

  @ApiPropertyOptional({
    description: 'Notification settings',
    example: {
      emailNotifications: true,
      smsNotifications: true,
      reminderTime: 24,
    },
  })
  @IsOptional()
  @IsObject()
  readonly notificationSettings?: {
    readonly emailNotifications?: boolean;
    readonly smsNotifications?: boolean;
    readonly reminderTime?: number;
  };
}

// === CREATE BUSINESS DTO ===
export class CreateBusinessDto {
  @ApiProperty({
    description: 'Business name',
    example: 'Cabinet Médical Centre Ville',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'Business name must be a string' })
  @Length(3, 100, {
    message: 'Business name must be between 3 and 100 characters',
  })
  readonly name!: string;

  @ApiProperty({
    description: 'Business description',
    example: 'Cabinet médical spécialisé en médecine générale et pédiatrie',
    maxLength: 500,
  })
  @IsString({ message: 'Description must be a string' })
  @Length(10, 500, {
    message: 'Description must be between 10 and 500 characters',
  })
  readonly description!: string;

  @ApiPropertyOptional({
    description: 'Business slogan',
    example: 'Votre santé, notre priorité',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(5, 200)
  readonly slogan?: string;

  @ApiProperty({
    description: 'Business sector',
    enum: BusinessSector,
    example: BusinessSector.MEDICAL,
  })
  @IsEnum(BusinessSector, { message: 'Invalid business sector' })
  readonly sector!: BusinessSector;

  @ApiProperty({
    description: 'Business address',
    type: AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  readonly address!: AddressDto;

  @ApiProperty({
    description: 'Contact information',
    type: ContactInfoDto,
  })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  readonly contactInfo!: ContactInfoDto;

  @ApiPropertyOptional({
    description: 'Business settings',
    type: BusinessSettingsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessSettingsDto)
  readonly settings?: BusinessSettingsDto;
}

// === UPDATE BUSINESS DTO ===
export class UpdateBusinessDto {
  @ApiPropertyOptional({
    description: 'Business name',
    example: 'Cabinet Médical Centre Ville - Nouveau nom',
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Business name must be a string' })
  @Length(3, 100, {
    message: 'Business name must be between 3 and 100 characters',
  })
  readonly name?: string;

  @ApiPropertyOptional({
    description: 'Business description',
    example: 'Cabinet médical rénové avec nouvelles spécialités',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(10, 500, {
    message: 'Description must be between 10 and 500 characters',
  })
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Business slogan',
    example: 'Excellence médicale depuis 1995',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(5, 200)
  readonly slogan?: string;

  @ApiPropertyOptional({
    description: 'Business sector',
    enum: BusinessSector,
    example: BusinessSector.MEDICAL,
  })
  @IsOptional()
  @IsEnum(BusinessSector, { message: 'Invalid business sector' })
  readonly sector?: BusinessSector;

  @ApiPropertyOptional({
    description: 'Business address',
    type: AddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  readonly address?: AddressDto;

  @ApiPropertyOptional({
    description: 'Contact information',
    type: ContactInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  readonly contactInfo?: ContactInfoDto;

  @ApiPropertyOptional({
    description: 'Business settings',
    type: BusinessSettingsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessSettingsDto)
  readonly settings?: BusinessSettingsDto;
}

// === BUSINESS RESPONSE DTO ===
export class BusinessResponseDto {
  @ApiProperty({
    description: 'Business unique identifier',
    example: 'b123e4567-e89b-12d3-a456-426614174000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'Business name',
    example: 'Cabinet Médical Centre Ville',
  })
  readonly name!: string;

  @ApiProperty({
    description: 'Business description',
    example: 'Cabinet médical spécialisé en médecine générale et pédiatrie',
  })
  readonly description!: string;

  @ApiPropertyOptional({
    description: 'Business slogan',
    example: 'Votre santé, notre priorité',
  })
  readonly slogan?: string;

  @ApiProperty({
    description: 'Business sector',
    enum: BusinessSector,
    example: BusinessSector.MEDICAL,
  })
  readonly sector!: BusinessSector;

  @ApiProperty({
    description: 'Business status',
    enum: BusinessStatus,
    example: BusinessStatus.ACTIVE,
  })
  readonly status!: BusinessStatus;

  @ApiProperty({
    description: 'Business address',
    example: {
      street: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      region: 'Île-de-France',
    },
  })
  readonly address!: {
    readonly street: string;
    readonly city: string;
    readonly postalCode: string;
    readonly country: string;
    readonly region?: string;
  };

  @ApiProperty({
    description: 'Contact information',
    example: {
      primaryEmail: 'contact@cabinet-exemple.fr',
      primaryPhone: '+33123456789',
      website: 'https://www.cabinet-exemple.fr',
    },
  })
  readonly contactInfo!: {
    readonly primaryEmail: string;
    readonly secondaryEmails?: string[];
    readonly primaryPhone: string;
    readonly secondaryPhones?: string[];
    readonly website?: string;
    readonly socialMedia?: {
      readonly facebook?: string;
      readonly instagram?: string;
      readonly linkedin?: string;
      readonly twitter?: string;
    };
  };

  @ApiPropertyOptional({
    description: 'Business branding information',
    example: {
      logoUrl: 'https://example.com/logo.png',
      coverImageUrl: 'https://example.com/cover.jpg',
    },
  })
  readonly branding?: {
    readonly logoUrl?: string;
    readonly coverImageUrl?: string;
    readonly brandColors?: {
      readonly primary: string;
      readonly secondary: string;
      readonly accent?: string;
    };
    readonly images?: string[];
  };

  @ApiProperty({
    description: 'Business settings',
    example: {
      timezone: 'Europe/Paris',
      currency: 'EUR',
      language: 'fr',
    },
  })
  readonly settings!: {
    readonly timezone: string;
    readonly currency: string;
    readonly language: string;
    readonly appointmentSettings: {
      readonly defaultDuration: number;
      readonly bufferTime: number;
      readonly advanceBookingLimit: number;
      readonly cancellationPolicy: string;
    };
    readonly notificationSettings: {
      readonly emailNotifications: boolean;
      readonly smsNotifications: boolean;
      readonly reminderTime: number;
    };
  };

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

// === LIST BUSINESSES DTO ===
export class ListBusinessesDto {
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
    enum: ['name', 'sector', 'status', 'createdAt', 'updatedAt'],
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsOptional()
  @IsIn(['name', 'sector', 'status', 'createdAt', 'updatedAt'])
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
    description: 'Search term for business name or description',
    maxLength: 100,
    example: 'médical',
  })
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @Length(1, 100, {
    message: 'Search term must be between 1 and 100 characters',
  })
  readonly search?: string;

  @ApiPropertyOptional({
    description: 'Filter by business sector',
    enum: BusinessSector,
    example: BusinessSector.MEDICAL,
  })
  @IsOptional()
  @IsEnum(BusinessSector, { message: 'Invalid business sector' })
  readonly sector?: BusinessSector;

  @ApiPropertyOptional({
    description: 'Filter by business status',
    enum: BusinessStatus,
    example: BusinessStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(BusinessStatus, { message: 'Invalid business status' })
  readonly status?: BusinessStatus;

  @ApiPropertyOptional({
    description: 'Filter by city',
    maxLength: 100,
    example: 'Paris',
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  readonly city?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}

// === BUSINESS SUMMARY (FOR LIST) ===
export class BusinessSummaryDto {
  @ApiProperty({
    description: 'Business unique identifier',
    example: 'b123e4567-e89b-12d3-a456-426614174000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'Business name',
    example: 'Cabinet Médical Centre Ville',
  })
  readonly name!: string;

  @ApiProperty({
    description: 'Business description (truncated)',
    example: 'Cabinet médical spécialisé en médecine générale...',
  })
  readonly description!: string;

  @ApiProperty({
    description: 'Business sector',
    enum: BusinessSector,
    example: BusinessSector.MEDICAL,
  })
  readonly sector!: BusinessSector;

  @ApiProperty({
    description: 'Business status',
    enum: BusinessStatus,
    example: BusinessStatus.ACTIVE,
  })
  readonly status!: BusinessStatus;

  @ApiProperty({
    description: 'Primary email',
    example: 'contact@cabinet-exemple.fr',
  })
  readonly primaryEmail!: string;

  @ApiProperty({
    description: 'Primary phone',
    example: '+33123456789',
  })
  readonly primaryPhone!: string;

  @ApiProperty({
    description: 'City location',
    example: 'Paris',
  })
  readonly city!: string;

  @ApiPropertyOptional({
    description: 'Logo URL',
    example: 'https://example.com/logo.png',
  })
  readonly logoUrl?: string;

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

// === LIST BUSINESSES RESPONSE ===
export class ListBusinessesResponseDto {
  @ApiProperty({
    description: 'Array of business summaries',
    type: [BusinessSummaryDto],
  })
  readonly data!: BusinessSummaryDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      currentPage: 1,
      totalPages: 10,
      totalItems: 95,
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

// === CREATE BUSINESS RESPONSE ===
export class CreateBusinessResponseDto {
  @ApiProperty({
    description: 'Created business unique identifier',
    example: 'b123e4567-e89b-12d3-a456-426614174000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'Business name',
    example: 'Cabinet Médical Centre Ville',
  })
  readonly name!: string;

  @ApiProperty({
    description: 'Business description',
    example: 'Cabinet médical spécialisé en médecine générale',
  })
  readonly description!: string;

  @ApiProperty({
    description: 'Business sector',
    enum: BusinessSector,
    example: BusinessSector.MEDICAL,
  })
  readonly sector!: BusinessSector;

  @ApiProperty({
    description: 'Initial business status',
    enum: BusinessStatus,
    example: BusinessStatus.PENDING_VERIFICATION,
  })
  readonly status!: BusinessStatus;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  readonly createdAt!: Date;
}

// === UPDATE BUSINESS RESPONSE ===
export class UpdateBusinessResponseDto {
  @ApiProperty({
    description: 'Updated business unique identifier',
    example: 'b123e4567-e89b-12d3-a456-426614174000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'Updated business name',
    example: 'Cabinet Médical Centre Ville - Rénové',
  })
  readonly name!: string;

  @ApiProperty({
    description: 'Updated business description',
    example: 'Cabinet médical entièrement rénové avec nouvelles spécialités',
  })
  readonly description!: string;

  @ApiProperty({
    description: 'Business sector',
    enum: BusinessSector,
    example: BusinessSector.MEDICAL,
  })
  readonly sector!: BusinessSector;

  @ApiProperty({
    description: 'Business status',
    enum: BusinessStatus,
    example: BusinessStatus.ACTIVE,
  })
  readonly status!: BusinessStatus;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-20T14:45:00Z',
  })
  readonly updatedAt!: Date;
}

// === DELETE BUSINESS RESPONSE ===
export class DeleteBusinessResponseDto {
  @ApiProperty({
    description: 'Success confirmation',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Confirmation message',
    example: 'Business successfully deleted',
  })
  readonly message!: string;

  @ApiProperty({
    description: 'Deleted business ID',
    example: 'b123e4567-e89b-12d3-a456-426614174000',
  })
  readonly deletedId!: string;

  @ApiProperty({
    description: 'Deletion timestamp',
    example: '2024-01-25T16:20:00Z',
  })
  readonly deletedAt!: Date;
}
