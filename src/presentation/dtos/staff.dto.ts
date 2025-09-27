/**
 * 👥 STAFF DTOs
 * ✅ Data Transfer Objects pour la gestion du personnel
 * ✅ Validation complète avec class-validator
 * ✅ Documentation Swagger détaillée
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { StaffRole } from "../../shared/enums/staff-role.enum";

/**
 * 📋 LIST STAFF DTO - Recherche avancée paginée
 */
export class ListStaffDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  readonly page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    enum: ["createdAt", "firstName", "lastName", "role", "email"],
    default: "createdAt",
  })
  @IsOptional()
  @IsString()
  readonly sortBy?: string = "createdAt";

  @ApiPropertyOptional({ enum: ["asc", "desc"], default: "desc" })
  @IsOptional()
  @IsString()
  readonly sortOrder?: "asc" | "desc" = "desc";

  @ApiPropertyOptional({
    description: "Search term for name, email, specialization",
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  readonly search?: string;

  @ApiPropertyOptional({ description: "Filter by staff role" })
  @IsOptional()
  @IsEnum(StaffRole)
  readonly role?: StaffRole;

  @ApiPropertyOptional({ description: "Filter by active status" })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @ApiPropertyOptional({
    description: "Filter by business ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  readonly businessId?: string;
}

/**
 * 📄 GET STAFF RESPONSE DTO
 */
export class GetStaffResponseDto {
  @ApiProperty()
  readonly success!: boolean;

  @ApiProperty({
    description: "Staff member details",
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      businessId: { type: "string", format: "uuid" },
      profile: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          title: { type: "string" },
          specialization: { type: "string" },
          bio: { type: "string" },
          profileImageUrl: { type: "string" },
          certifications: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
        },
      },
      role: { type: "string", enum: Object.values(StaffRole) },
      email: { type: "string", format: "email" },
      phone: { type: "string" },
      status: { type: "string" },
      availability: { type: "object", additionalProperties: true },
      calendarIntegration: { type: "object", additionalProperties: true },
      hireDate: { type: "string", format: "date-time" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  })
  readonly data!: any;

  @ApiProperty()
  readonly meta!: {
    readonly timestamp: string;
    readonly requestId: string;
  };
}

/**
 * 📋 LIST STAFF RESPONSE DTO
 */
export class ListStaffResponseDto {
  @ApiProperty()
  readonly success!: boolean;

  @ApiProperty({
    description: "Array of staff members",
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        businessId: { type: "string", format: "uuid" },
        profile: {
          type: "object",
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            specialization: { type: "string" },
          },
        },
        role: { type: "string", enum: Object.values(StaffRole) },
        email: { type: "string", format: "email" },
        status: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  })
  readonly data!: any[];

  @ApiProperty({
    description: "Pagination metadata",
    type: "object",
    properties: {
      currentPage: { type: "number" },
      totalPages: { type: "number" },
      totalItems: { type: "number" },
      itemsPerPage: { type: "number" },
      hasNextPage: { type: "boolean" },
      hasPrevPage: { type: "boolean" },
    },
  })
  readonly meta!: any;
}

/**
 * ➕ CREATE STAFF DTO
 */
export class CreateStaffDto {
  @ApiProperty({
    description: "Business UUID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  readonly businessId!: string;

  @ApiProperty({
    description: "Staff first name",
    example: "Dr. Jean",
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  readonly firstName!: string;

  @ApiProperty({
    description: "Staff last name",
    example: "Dupont",
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  readonly lastName!: string;

  @ApiProperty({
    description: "Staff email address",
    example: "dr.dupont@medicenter.fr",
    format: "email",
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email!: string;

  @ApiPropertyOptional({
    description: "Staff phone number",
    example: "+33123456789",
  })
  @IsOptional()
  @IsString()
  readonly phone?: string;

  @ApiProperty({
    description: "Staff role",
    enum: StaffRole,
    example: StaffRole.DOCTOR,
  })
  @IsEnum(StaffRole)
  @IsNotEmpty()
  readonly role!: StaffRole;

  @ApiPropertyOptional({
    description: "Job title",
    example: "Médecin Généraliste",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  readonly jobTitle?: string;

  @ApiPropertyOptional({
    description: "Professional specialization",
    example: "Consultation et Traitement",
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  readonly specialization?: string;

  @ApiPropertyOptional({
    description: "Professional biography",
    example: "Médecin expérimenté avec 15 ans de pratique...",
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  readonly bio?: string;

  @ApiPropertyOptional({
    description: "Professional certifications",
    example: ["Diplôme de Médecine", "Spécialisation Cardiologie"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly certifications?: string[];

  @ApiPropertyOptional({
    description: "Spoken languages",
    example: ["French", "English", "Spanish"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly languages?: string[];

  @ApiPropertyOptional({
    description: "Working hours configuration",
    type: "object",
    additionalProperties: true,
  })
  @IsOptional()
  readonly workingHours?: {
    readonly monday?: { start: string; end: string };
    readonly tuesday?: { start: string; end: string };
    readonly wednesday?: { start: string; end: string };
    readonly thursday?: { start: string; end: string };
    readonly friday?: { start: string; end: string };
    readonly saturday?: { start: string; end: string };
    readonly sunday?: { start: string; end: string };
  };
}

/**
 * ➕ CREATE STAFF RESPONSE DTO
 */
export class CreateStaffResponseDto {
  @ApiProperty()
  readonly success!: boolean;

  @ApiProperty({
    description: "Created staff member details",
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      firstName: { type: "string" },
      lastName: { type: "string" },
      email: { type: "string", format: "email" },
      role: { type: "string", enum: Object.values(StaffRole) },
      businessId: { type: "string", format: "uuid" },
      isActive: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
    },
  })
  readonly data!: {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly role: StaffRole;
    readonly businessId: string;
    readonly isActive: boolean;
    readonly createdAt: Date;
  };

  @ApiProperty()
  readonly meta!: {
    readonly timestamp: string;
    readonly requestId: string;
  };
}

/**
 * Profile Update DTO (partial)
 */
export class StaffProfileUpdateDto {
  @ApiPropertyOptional({ minLength: 2, maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  readonly firstName?: string;

  @ApiPropertyOptional({ minLength: 2, maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  readonly lastName?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  readonly title?: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  readonly specialization?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  readonly bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly profileImageUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly certifications?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly languages?: string[];
}

/**
 * Contact Info Update DTO (partial)
 */
export class StaffContactInfoUpdateDto {
  @ApiPropertyOptional({ format: "email" })
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly phone?: string;
}

/**
 * ✏️ UPDATE STAFF DTO
 */
export class UpdateStaffDto {
  @ApiPropertyOptional({
    description: "Profile information to update",
    type: StaffProfileUpdateDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => StaffProfileUpdateDto)
  readonly profile?: StaffProfileUpdateDto;

  @ApiPropertyOptional({
    description: "Staff role",
    enum: StaffRole,
  })
  @IsOptional()
  @IsEnum(StaffRole)
  readonly role?: StaffRole;

  @ApiPropertyOptional({
    description: "Staff status",
    enum: ["ACTIVE", "INACTIVE", "ON_LEAVE", "SUSPENDED"],
  })
  @IsOptional()
  @IsString()
  readonly status?: string;

  @ApiPropertyOptional({
    description: "Contact information to update",
    type: StaffContactInfoUpdateDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => StaffContactInfoUpdateDto)
  readonly contactInfo?: StaffContactInfoUpdateDto;

  @ApiPropertyOptional({
    description: "Availability configuration",
    type: "object",
    additionalProperties: true,
  })
  @IsOptional()
  readonly availability?: any;

  @ApiPropertyOptional({
    description: "Calendar integration settings",
    type: "object",
    additionalProperties: true,
  })
  @IsOptional()
  readonly calendarIntegration?: any;
}

/**
 * ✏️ UPDATE STAFF RESPONSE DTO
 */
export class UpdateStaffResponseDto {
  @ApiProperty()
  readonly success!: boolean;

  @ApiProperty({
    description: "Updated staff member details",
    type: "object",
    additionalProperties: true,
  })
  readonly data!: any;

  @ApiProperty()
  readonly meta!: {
    readonly timestamp: string;
    readonly requestId: string;
  };
}

/**
 * 🗑️ DELETE STAFF RESPONSE DTO
 */
export class DeleteStaffResponseDto {
  @ApiProperty()
  readonly success!: boolean;

  @ApiProperty({
    description: "Deletion confirmation",
    type: "object",
    properties: {
      staffId: { type: "string", format: "uuid" },
      message: { type: "string" },
    },
  })
  readonly data!: {
    readonly staffId: string;
    readonly message: string;
  };

  @ApiProperty()
  readonly meta!: {
    readonly timestamp: string;
    readonly requestId: string;
  };
}
