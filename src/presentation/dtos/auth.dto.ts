/**
 * 📋 Authentication DTOs - Data Transfer Objects
 *
 * Objects de transfert de données pour les endpoints d'authentification
 */

import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @ApiPropertyOptional({
    description: 'Remember user login (extends refresh token duration)',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'rememberMe must be a boolean' })
  rememberMe?: boolean;
}

export class RefreshTokenDto {
  // Pas de propriétés car le refresh token vient des cookies
  // Ce DTO sert juste pour la documentation Swagger
}

export class LogoutDto {
  @ApiPropertyOptional({
    description: 'User ID for logout (optional, for audit purposes)',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Logout from all devices',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'logoutAllDevices must be a boolean' })
  logoutAllDevices?: boolean;
}

// Response DTOs pour la documentation
export class LoginResponseDto {
  @ApiProperty({
    description: 'User information',
    example: {
      id: 'user-123',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'USER',
    },
  })
  user!: {
    id: string;
    email: string;
    name: string;
    role: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Login successful',
  })
  message!: string;
}

export class RefreshResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Tokens refreshed successfully',
  })
  message!: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Logged out successfully',
  })
  message!: string;
}
