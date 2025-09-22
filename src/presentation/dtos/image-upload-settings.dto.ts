/**
 * 🔧 IMAGE UPLOAD SETTINGS DTOs
 * ✅ Configuration admin pour images
 * ✅ Validation et Swagger schemas
 * ✅ TDD Integration ready
 */

import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ImageFormatDto {
  JPEG = 'JPEG',
  PNG = 'PNG',
  WEBP = 'WEBP',
  GIF = 'GIF',
}

export class ImagePolicyDto {
  @ApiProperty({
    description: 'Category this policy applies to',
    example: 'LOGO',
    enum: ['LOGO', 'COVER', 'GALLERY', 'SERVICES', 'TEAM'],
  })
  readonly category!: string;

  @ApiProperty({
    description: 'Maximum file size in bytes for this category',
    example: 2097152, // 2MB
    minimum: 1,
  })
  @IsPositive()
  readonly maxSize!: number;

  @ApiPropertyOptional({
    description: 'Required dimensions for this category',
    example: { width: 200, height: 200 },
  })
  @IsOptional()
  readonly requiredDimensions?: {
    readonly width: number;
    readonly height: number;
  };

  @ApiProperty({
    description: 'Allowed formats for this category',
    example: ['PNG'],
    enum: ImageFormatDto,
    isArray: true,
  })
  @IsArray()
  @IsEnum(ImageFormatDto, { each: true })
  readonly allowedFormats!: ImageFormatDto[];
}

export class CreateImageUploadSettingsDto {
  @ApiProperty({
    description: 'Maximum file size in bytes',
    example: 5242880, // 5MB
    minimum: 1,
  })
  @IsPositive()
  readonly maxFileSize!: number;

  @ApiProperty({
    description: 'Allowed image formats',
    example: ['JPEG', 'PNG', 'WEBP'],
    enum: ImageFormatDto,
    isArray: true,
  })
  @IsArray()
  @IsEnum(ImageFormatDto, { each: true })
  readonly allowedFormats!: ImageFormatDto[];

  @ApiProperty({
    description: 'Maximum images per business',
    example: 20,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  readonly maxImagesPerBusiness!: number;

  @ApiPropertyOptional({
    description: 'Whether images require moderation',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly requiresModeration?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to auto-optimize images',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly autoOptimize?: boolean;

  @ApiPropertyOptional({
    description: 'Category-specific policies',
    type: [ImagePolicyDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImagePolicyDto)
  readonly policies?: ImagePolicyDto[];
}

export class UpdateImageUploadSettingsDto {
  @ApiPropertyOptional({
    description: 'Maximum file size in bytes',
    example: 10485760, // 10MB
    minimum: 1,
  })
  @IsOptional()
  @IsPositive()
  readonly maxFileSize?: number;

  @ApiPropertyOptional({
    description: 'Allowed image formats',
    example: ['JPEG', 'PNG', 'WEBP'],
    enum: ImageFormatDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ImageFormatDto, { each: true })
  readonly allowedFormats?: ImageFormatDto[];

  @ApiPropertyOptional({
    description: 'Maximum images per business',
    example: 50,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly maxImagesPerBusiness?: number;

  @ApiPropertyOptional({
    description: 'Whether images require moderation',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly requiresModeration?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to auto-optimize images',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly autoOptimize?: boolean;
}

export class UploadBusinessImageDto {
  @ApiProperty({
    description: 'Image category',
    example: 'LOGO',
    enum: ['LOGO', 'COVER', 'GALLERY', 'SERVICES', 'TEAM'],
  })
  readonly category!: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'company-logo.png',
  })
  readonly fileName!: string;

  @ApiProperty({
    description: 'MIME content type',
    example: 'image/png',
  })
  readonly contentType!: string;

  @ApiProperty({
    description: 'Alt text for accessibility',
    example: 'Company Logo - Medical Center',
    maxLength: 200,
  })
  readonly alt!: string;

  @ApiPropertyOptional({
    description: 'Image dimensions',
    example: { width: 200, height: 200 },
  })
  @IsOptional()
  readonly dimensions?: {
    readonly width: number;
    readonly height: number;
  };
}

export class ImageUploadResponseDto {
  @ApiProperty({
    description: 'Upload success status',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Generated image ID',
    example: 'img_123e4567-e89b-12d3-a456-426614174000',
  })
  readonly imageId!: string;

  @ApiProperty({
    description: 'Signed URL for downloading (expires in 1 hour)',
    example:
      'https://business-images.s3.eu-west-1.amazonaws.com/business-123/logo/logo.png?X-Amz-Signature=...',
  })
  readonly signedUrl!: string;

  @ApiPropertyOptional({
    description: 'Thumbnail URL if available',
    example:
      'https://business-images.s3.eu-west-1.amazonaws.com/business-123/logo/logo_thumb.png',
  })
  readonly thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Responsive image variants',
    example: {
      small: 'https://...image_small.jpg',
      medium: 'https://...image_medium.jpg',
      large: 'https://...image_large.jpg',
    },
  })
  readonly variants?: {
    readonly small: string;
    readonly medium: string;
    readonly large: string;
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Image uploaded successfully',
  })
  readonly message!: string;
}

export class ImageUploadSettingsResponseDto {
  @ApiProperty({
    description: 'Maximum file size in bytes',
    example: 5242880, // 5MB
  })
  readonly maxFileSize!: number;

  @ApiProperty({
    description: 'Allowed image formats',
    example: ['JPEG', 'PNG', 'WEBP'],
  })
  readonly allowedFormats!: string[];

  @ApiProperty({
    description: 'Maximum images per business',
    example: 20,
  })
  readonly maxImagesPerBusiness!: number;

  @ApiProperty({
    description: 'Whether images require moderation',
    example: false,
  })
  readonly requiresModeration!: boolean;

  @ApiProperty({
    description: 'Whether to auto-optimize images',
    example: true,
  })
  readonly autoOptimize!: boolean;

  @ApiProperty({
    description: 'Category-specific policies',
    type: [ImagePolicyDto],
  })
  readonly policies!: ImagePolicyDto[];
}
