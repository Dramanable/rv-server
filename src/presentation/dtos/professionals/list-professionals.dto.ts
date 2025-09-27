/**
 * 📋 List Professionals DTO - Advanced Search & Pagination
 *
 * DTO pour la recherche avancée paginée des professionnels avec filtres métier
 * et documentation Swagger complète pour intégration frontend.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
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

export class ListProfessionalsDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100 items per page' })
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['firstName', 'lastName', 'email', 'specialization', 'createdAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  @IsIn(['firstName', 'lastName', 'email', 'specialization', 'createdAt'], {
    message:
      'Sort field must be one of: firstName, lastName, email, specialization, createdAt',
  })
  readonly sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order (ascending or descending)',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  @IsIn(['asc', 'desc'], {
    message: 'Sort order must be either "asc" or "desc"',
  })
  readonly sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Search term for name, email, or specialization',
    example: 'cardiologue',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @Length(1, 100, {
    message: 'Search term must be between 1 and 100 characters',
  })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  readonly search?: string;

  @ApiPropertyOptional({
    description:
      'Filter by business ID (scope professionals to specific business)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Business ID must be a valid UUID' })
  readonly businessId?: string;

  @ApiPropertyOptional({
    description: 'Filter by availability status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  @IsBoolean({ message: 'Availability filter must be a boolean' })
  readonly isAvailable?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by specialization',
    example: 'Cardiologue',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Specialization must be a string' })
  @Length(2, 100, {
    message: 'Specialization must be between 2 and 100 characters',
  })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  readonly specialization?: string;

  @ApiPropertyOptional({
    description: 'Filter professionals with/without license number',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  @IsBoolean({ message: 'License filter must be a boolean' })
  readonly hasLicense?: boolean;

  // 🎯 Factory method pour créer depuis les paramètres de requête
  static fromQuery(query: any): ListProfessionalsDto {
    return {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
      search: query.search?.trim(),
      businessId: query.businessId,
      isAvailable:
        query.isAvailable !== undefined
          ? query.isAvailable === 'true'
          : undefined,
      specialization: query.specialization?.trim(),
      hasLicense:
        query.hasLicense !== undefined
          ? query.hasLicense === 'true'
          : undefined,
    };
  }
}

/**
 * 📄 List Professionals Response DTO
 */
export class ListProfessionalsResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Array of professionals matching the search criteria',
    type: 'array',
    items: {
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
    },
  })
  readonly data!: Array<{
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
  }>;

  @ApiProperty({
    description: 'Pagination metadata',
    type: 'object',
    properties: {
      currentPage: {
        type: 'number',
        example: 1,
      },
      totalPages: {
        type: 'number',
        example: 5,
      },
      totalItems: {
        type: 'number',
        example: 47,
      },
      itemsPerPage: {
        type: 'number',
        example: 10,
      },
      hasNextPage: {
        type: 'boolean',
        example: true,
      },
      hasPrevPage: {
        type: 'boolean',
        example: false,
      },
    },
  })
  readonly meta!: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
    readonly timestamp: string;
    readonly correlationId: string;
  };
}
