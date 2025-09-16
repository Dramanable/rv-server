import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../shared/enums/user-role.enum';

/**
 * 📋 DTO - Create User Request
 *
 * DTO pour la création d'un utilisateur avec validation complète
 */
export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email!: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name!: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.REGULAR_CLIENT,
    enumName: 'UserRole',
  })
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  @IsNotEmpty({ message: 'Role is required' })
  role!: UserRole;

  @ApiPropertyOptional({
    description: 'Whether the user must change their password on next login',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Password change requirement must be a boolean' })
  @Transform(({ value }: { value: unknown }) => Boolean(value))
  passwordChangeRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to send welcome email to the user',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Send welcome email must be a boolean' })
  @Transform(({ value }: { value: unknown }) => Boolean(value))
  sendWelcomeEmail?: boolean;
}

/**
 * 📋 DTO - Update User Request
 *
 * DTO pour la mise à jour d'un utilisateur
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe Updated',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.LOCATION_MANAGER,
    enumName: 'UserRole',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Whether the user must change their password on next login',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Password change requirement must be a boolean' })
  @Transform(({ value }: { value: unknown }) => Boolean(value))
  passwordChangeRequired?: boolean;
}

/**
 * 📋 DTO - User Response
 *
 * DTO pour la réponse utilisateur (lecture)
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID(4, { message: 'ID must be a valid UUID' })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.REGULAR_CLIENT,
    enumName: 'UserRole',
  })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({
    description: 'Whether the user must change their password on next login',
    example: false,
  })
  @IsBoolean()
  passwordChangeRequired!: boolean;

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2024-01-15T10:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  createdAt!: string;

  @ApiProperty({
    description: 'Date when the user was last updated',
    example: '2024-01-15T10:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString()
  updatedAt!: string;
}

/**
 * 📋 DTO - User List Response
 *
 * DTO pour la réponse liste d'utilisateurs avec pagination
 */
export class UserListResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [UserResponseDto],
  })
  users!: UserResponseDto[];

  @ApiProperty({
    description: 'Total number of users',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 15,
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNext!: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrevious!: boolean;
}
