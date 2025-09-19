/**
 * 📋 Authentication DTOs - Data Transfer Objects
 *
 * Objects de transfert de données pour les endpoints d'authentification
 * Production-ready avec validation stricte et documentation complète
 */

import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '📧 User email address for authentication',
    example: 'user@example.com',
    format: 'email',
    type: 'string',
    maxLength: 255,
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    title: 'Email Address',
  })
  @IsEmail(
    { allow_utf8_local_part: false },
    { message: 'Please provide a valid email address' },
  )
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email!: string;

  @ApiProperty({
    description:
      '🔒 User password with security requirements: 8+ chars, uppercase, lowercase, number, special char (@$!%*?&)',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 128,
    type: 'string',
    format: 'password',
    pattern:
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    title: 'Password',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
  })
  password!: string;

  @ApiPropertyOptional({
    description:
      '⏰ Remember user login session (if true: refresh token valid for 30 days, if false: valid for 7 days)',
    default: false,
    type: 'boolean',
    example: false,
    title: 'Remember Me Flag',
  })
  @IsOptional()
  @IsBoolean({ message: 'rememberMe must be a boolean' })
  rememberMe?: boolean;
}

export class RefreshTokenDto {
  @ApiProperty({
    description:
      '🔄 Refresh token is automatically extracted from secure HttpOnly cookies - no request body required. The refresh token is securely stored in HttpOnly cookies and automatically sent by the browser.',
    example: {},
    type: 'object',
    additionalProperties: false,
    title: 'Refresh Token Request (Empty Body)',
  })
  // Propriété fictive pour la documentation - le refresh token vient des cookies
  _note?: string;
}

export class RegisterDto {
  @ApiProperty({
    description: '📧 User email address - must be unique in the system',
    example: 'newuser@example.com',
    format: 'email',
    type: 'string',
    maxLength: 255,
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    title: 'Email Address',
  })
  @IsEmail(
    { allow_utf8_local_part: false },
    { message: 'Please provide a valid email address' },
  )
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email!: string;

  @ApiProperty({
    description:
      '👤 User full name for display purposes (minimum 2 characters, maximum 100 characters)',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
    type: 'string',
    pattern: "^[a-zA-ZÀ-ÿ\\s\\-']{2,100}$",
    title: 'Full Name',
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Matches(/^[a-zA-ZÀ-ÿ\s\-']{2,100}$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  })
  name!: string;

  @ApiProperty({
    description:
      '🔒 User password with security requirements: 8+ chars, uppercase, lowercase, number, special char (@$!%*?&)',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 128,
    type: 'string',
    format: 'password',
    pattern:
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    title: 'Password',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
  })
  password!: string;

  @ApiPropertyOptional({
    description:
      '⏰ Remember user login session after registration (if true: refresh token valid for 30 days, if false: valid for 7 days)',
    default: false,
    type: 'boolean',
    example: false,
    title: 'Remember Me Flag',
  })
  @IsOptional()
  @IsBoolean({ message: 'rememberMe must be a boolean' })
  rememberMe?: boolean;
}

export class LogoutDto {
  @ApiPropertyOptional({
    description:
      '🚪 Logout from all user devices and sessions (revokes all refresh tokens)',
    default: false,
    type: 'boolean',
    example: false,
    title: 'Logout All Devices Flag',
  })
  @IsOptional()
  @IsBoolean({ message: 'logoutAllDevices must be a boolean' })
  logoutAllDevices?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 📄 RESPONSE DTOS - DOCUMENTATION SWAGGER DÉTAILLÉE
// ═══════════════════════════════════════════════════════════════

export class UserResponseDto {
  @ApiProperty({
    description: '🆔 Unique user identifier (UUID v4)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid',
    title: 'User ID',
  })
  id!: string;

  @ApiProperty({
    description: '📧 User email address (verified and unique)',
    example: 'user@example.com',
    type: 'string',
    format: 'email',
    title: 'Email Address',
  })
  email!: string;

  @ApiProperty({
    description: '👤 User full name for display',
    example: 'John Doe',
    type: 'string',
    minLength: 2,
    maxLength: 100,
    title: 'Full Name',
  })
  name!: string;

  @ApiProperty({
    description: '🎭 User role in the system',
    example: 'REGULAR_CLIENT',
    enum: [
      'PLATFORM_ADMIN',
      'BUSINESS_OWNER',
      'BUSINESS_ADMIN',
      'LOCATION_MANAGER',
      'PRACTITIONER',
      'ASSISTANT',
      'REGULAR_CLIENT',
      'VIP_CLIENT',
    ],
    title: 'User Role',
  })
  role!: string;

  @ApiProperty({
    description: '📅 Account creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
    title: 'Created At',
  })
  createdAt!: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: '👤 Authenticated user information',
    type: UserResponseDto,
    title: 'User Data',
  })
  user!: UserResponseDto;

  @ApiProperty({
    description: '✅ Success message confirming login',
    example: 'Login successful',
    type: 'string',
    title: 'Success Message',
  })
  message!: string;
}

export class RefreshResponseDto {
  @ApiProperty({
    description:
      '✅ Success message confirming token refresh (new tokens set in secure cookies)',
    example: 'Tokens refreshed successfully',
    type: 'string',
    title: 'Success Message',
  })
  message!: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: '👤 Newly created user information',
    type: UserResponseDto,
    title: 'User Data',
  })
  user!: UserResponseDto;

  @ApiProperty({
    description: '✅ Success message confirming registration and auto-login',
    example: 'Registration successful - user created and logged in',
    type: 'string',
    title: 'Success Message',
  })
  message!: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description:
      '✅ Success message confirming logout and cookie cleanup (all authentication cookies cleared)',
    example: 'Logout successful',
    type: 'string',
    title: 'Success Message',
  })
  message!: string;
}

// ═══════════════════════════════════════════════════════════════
// 🚨 ERROR RESPONSE DTOS - CODES D'ERREUR DOCUMENTÉS
// ═══════════════════════════════════════════════════════════════

export class ValidationErrorDto {
  @ApiProperty({
    description: '🚨 Error message describing the validation failure',
    example: 'Validation failed',
    type: 'string',
    title: 'Error Message',
  })
  message!: string;

  @ApiProperty({
    description: '📋 Array of detailed validation errors',
    example: [
      'email must be a valid email address',
      'password must be at least 8 characters long',
    ],
    type: 'array',
    items: { type: 'string' },
    title: 'Validation Errors',
  })
  error!: string[];

  @ApiProperty({
    description: '🔢 HTTP status code',
    example: 400,
    type: 'number',
    title: 'Status Code',
  })
  statusCode!: number;
}

export class UnauthorizedErrorDto {
  @ApiProperty({
    description: '🚨 Error message for authentication failure',
    example: 'Invalid credentials',
    type: 'string',
    title: 'Error Message',
  })
  message!: string;

  @ApiProperty({
    description: '🔒 Error type identifier',
    example: 'Unauthorized',
    type: 'string',
    title: 'Error Type',
  })
  error!: string;

  @ApiProperty({
    description: '🔢 HTTP status code',
    example: 401,
    type: 'number',
    title: 'Status Code',
  })
  statusCode!: number;
}

export class ThrottleErrorDto {
  @ApiProperty({
    description: '🚨 Rate limiting error message',
    example: 'Too many requests',
    type: 'string',
    title: 'Error Message',
  })
  message!: string;

  @ApiProperty({
    description: '⏱️ Seconds to wait before retry',
    example: 300,
    type: 'number',
    title: 'Retry After (seconds)',
  })
  retryAfter!: number;

  @ApiProperty({
    description: '🔢 HTTP status code',
    example: 429,
    type: 'number',
    title: 'Status Code',
  })
  statusCode!: number;
}
