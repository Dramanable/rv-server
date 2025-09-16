/**
 * 📋 SEARCH DTO - Simple DTO for search users endpoint
 */

import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../shared/enums/user-role.enum';

export class SearchUsersSimpleDto {
  @ApiProperty({
    description: 'Search term for name and email',
    required: false,
    example: 'john',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  searchTerm?: string;

  @ApiProperty({
    description: 'Filter by user roles',
    required: false,
    enum: UserRole,
    isArray: true,
    example: [UserRole.REGULAR_CLIENT, UserRole.LOCATION_MANAGER],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

  @ApiProperty({
    description: 'Filter by active status',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Filter users created after this date',
    required: false,
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  createdAfter?: string;

  @ApiProperty({
    description: 'Filter users created before this date',
    required: false,
    example: '2023-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  createdBefore?: string;

  @ApiProperty({
    description: 'Page number (1-based)',
    required: false,
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiProperty({
    description: 'Sort field',
    required: false,
    default: 'createdAt',
    example: 'name',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'asc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
