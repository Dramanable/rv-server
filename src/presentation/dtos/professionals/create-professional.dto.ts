/**
 * 🏗️ Create Professional DTO - Validation & Swagger
 *
 * DTO pour la création d'un professionnel avec validation stricte
 * et documentation Swagger complète pour intégration frontend.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateProfessionalDto {
  @ApiProperty({
    description: 'Business ID where the professional will be registered',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID(4, { message: 'Business ID must be a valid UUID' })
  readonly businessId!: string;

  @ApiProperty({
    description: 'Professional first name',
    example: 'Dr. Marie',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'First name must be a string' })
  @Length(2, 50, {
    message: 'First name must be between 2 and 50 characters',
  })
  readonly firstName!: string;

  @ApiProperty({
    description: 'Professional last name',
    example: 'Dubois',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Last name must be a string' })
  @Length(2, 50, {
    message: 'Last name must be between 2 and 50 characters',
  })
  readonly lastName!: string;

  @ApiProperty({
    description: 'Professional email address (must be unique)',
    example: 'marie.dubois@medical-center.fr',
    format: 'email',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  readonly email!: string;

  @ApiPropertyOptional({
    description: 'Professional phone number (E.164 format recommended)',
    example: '+33123456789',
  })
  @IsOptional()
  @IsPhoneNumber(undefined, {
    message: 'Phone number must be a valid phone number',
  })
  readonly phone?: string;

  @ApiProperty({
    description: 'Professional specialization or expertise area',
    example: 'Cardiologue',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Specialization must be a string' })
  @Length(2, 100, {
    message: 'Specialization must be between 2 and 100 characters',
  })
  readonly specialization!: string;

  @ApiPropertyOptional({
    description: 'Professional license or certification number',
    example: 'CERT-2024-12345',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'License number must be a string' })
  @Length(1, 50, {
    message: 'License number must be between 1 and 50 characters',
  })
  readonly licenseNumber?: string;

  @ApiPropertyOptional({
    description: 'Professional biography or description',
    example: 'Experienced cardiologist with 10+ years in preventive medicine.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Biography must be a string' })
  @Length(1, 1000, {
    message: 'Biography must be between 1 and 1000 characters',
  })
  readonly biography?: string;

  @ApiPropertyOptional({
    description: 'Professional profile image URL',
    example: 'https://s3.amazonaws.com/bucket/professionals/profile.jpg',
    format: 'url',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Profile image URL must be a valid URL' })
  readonly profileImageUrl?: string;

  @ApiPropertyOptional({
    description:
      'Indicates if the professional is currently available for appointments',
    example: true,
    default: true,
  })
  @IsOptional()
  readonly isAvailable?: boolean;

  // 🎯 Factory method pour créer depuis les données frontend
  static fromRequest(data: any): CreateProfessionalDto {
    return {
      businessId: data.businessId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      specialization: data.specialization,
      licenseNumber: data.licenseNumber,
      biography: data.biography,
      profileImageUrl: data.profileImageUrl,
      isAvailable: data.isAvailable ?? true,
    };
  }
}

/**
 * 📄 Create Professional Response DTO
 */
export class CreateProfessionalResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Created professional data',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      businessId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      firstName: {
        type: 'string',
        example: 'Dr. Marie',
      },
      lastName: {
        type: 'string',
        example: 'Dubois',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'marie.dubois@medical-center.fr',
      },
      phone: {
        type: 'string',
        example: '+33123456789',
        nullable: true,
      },
      specialization: {
        type: 'string',
        example: 'Cardiologue',
      },
      licenseNumber: {
        type: 'string',
        example: 'CERT-2024-12345',
        nullable: true,
      },
      biography: {
        type: 'string',
        example: 'Experienced cardiologist...',
        nullable: true,
      },
      profileImageUrl: {
        type: 'string',
        format: 'url',
        example: 'https://s3.amazonaws.com/bucket/professionals/profile.jpg',
        nullable: true,
      },
      isAvailable: {
        type: 'boolean',
        example: true,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-09-24T10:30:00.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-09-24T10:30:00.000Z',
      },
    },
  })
  readonly data!: {
    readonly id: string;
    readonly businessId: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly phone?: string;
    readonly specialization: string;
    readonly licenseNumber?: string;
    readonly biography?: string;
    readonly profileImageUrl?: string;
    readonly isAvailable: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
  };

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: 'object',
    properties: {
      timestamp: {
        type: 'string',
        format: 'date-time',
        example: '2024-09-24T10:30:00.000Z',
      },
      correlationId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
    additionalProperties: true,
  })
  readonly meta?: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}
