/**
 * ✏️ Update Professional DTO - Validation & Swagger
 *
 * DTO pour la mise à jour d'un professionnel avec validation stricte
 * et documentation Swagger complète.
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  IsUUID,
  Length,
} from "class-validator";

export class UpdateProfessionalDto {
  @ApiProperty({
    description: "Professional unique identifier",
    example: "123e4567-e89b-12d3-a456-426614174000",
    format: "uuid",
  })
  @IsUUID(4, { message: "Professional ID must be a valid UUID" })
  readonly id!: string;

  @ApiPropertyOptional({
    description: "Professional first name",
    example: "Dr. Marie",
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: "First name must be a string" })
  @Length(2, 50, {
    message: "First name must be between 2 and 50 characters",
  })
  readonly firstName?: string;

  @ApiPropertyOptional({
    description: "Professional last name",
    example: "Dubois",
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: "Last name must be a string" })
  @Length(2, 50, {
    message: "Last name must be between 2 and 50 characters",
  })
  readonly lastName?: string;

  @ApiPropertyOptional({
    description: "Professional email address (must be unique)",
    example: "marie.dubois@medical-center.fr",
    format: "email",
  })
  @IsOptional()
  @IsEmail({}, { message: "Email must be a valid email address" })
  readonly email?: string;

  @ApiPropertyOptional({
    description: "Professional phone number (E.164 format recommended)",
    example: "+33123456789",
  })
  @IsOptional()
  @IsPhoneNumber(undefined, {
    message: "Phone number must be a valid phone number",
  })
  readonly phone?: string;

  @ApiPropertyOptional({
    description: "Professional specialization or expertise area",
    example: "Cardiologue",
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: "Specialization must be a string" })
  @Length(2, 100, {
    message: "Specialization must be between 2 and 100 characters",
  })
  readonly specialization?: string;

  @ApiPropertyOptional({
    description: "Professional license or certification number",
    example: "CERT-2024-12345",
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: "License number must be a string" })
  @Length(1, 50, {
    message: "License number must be between 1 and 50 characters",
  })
  readonly licenseNumber?: string;

  @ApiPropertyOptional({
    description: "Professional biography or description",
    example: "Experienced cardiologist with 10+ years in preventive medicine.",
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: "Biography must be a string" })
  @Length(1, 1000, {
    message: "Biography must be between 1 and 1000 characters",
  })
  readonly biography?: string;

  @ApiPropertyOptional({
    description: "Professional profile image URL",
    example: "https://s3.amazonaws.com/bucket/professionals/profile.jpg",
    format: "url",
  })
  @IsOptional()
  @IsUrl({}, { message: "Profile image URL must be a valid URL" })
  readonly profileImageUrl?: string;

  @ApiPropertyOptional({
    description:
      "Indicates if the professional is currently available for appointments",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: "Availability status must be a boolean" })
  readonly isAvailable?: boolean;

  // 🎯 Factory method pour créer depuis les données frontend
  static fromRequest(id: string, data: any): UpdateProfessionalDto {
    return {
      id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      specialization: data.specialization,
      licenseNumber: data.licenseNumber,
      biography: data.biography,
      profileImageUrl: data.profileImageUrl,
      isAvailable: data.isAvailable,
    };
  }
}

/**
 * 📄 Update Professional Response DTO
 */
export class UpdateProfessionalResponseDto {
  @ApiProperty({
    description: "Operation success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Updated professional data",
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      businessId: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      firstName: {
        type: "string",
        example: "Dr. Marie",
      },
      lastName: {
        type: "string",
        example: "Dubois",
      },
      email: {
        type: "string",
        format: "email",
        example: "marie.dubois@medical-center.fr",
      },
      phone: {
        type: "string",
        example: "+33123456789",
        nullable: true,
      },
      specialization: {
        type: "string",
        example: "Cardiologue",
      },
      licenseNumber: {
        type: "string",
        example: "CERT-2024-12345",
        nullable: true,
      },
      biography: {
        type: "string",
        example: "Experienced cardiologist...",
        nullable: true,
      },
      profileImageUrl: {
        type: "string",
        format: "url",
        example: "https://s3.amazonaws.com/bucket/professionals/profile.jpg",
        nullable: true,
      },
      isAvailable: {
        type: "boolean",
        example: true,
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-09-24T10:30:00.000Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-09-24T10:30:00.000Z",
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

  @ApiProperty({
    description: "Additional metadata",
    type: "object",
    properties: {
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2024-09-24T10:30:00.000Z",
      },
      correlationId: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
    },
    additionalProperties: true,
  })
  readonly meta!: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}
