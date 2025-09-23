/**
 * 📷 BUSINESS GALLERY DTOs
 * ✅ Validation et documentation Swagger
 * ✅ Types pour upload d'images et galerie
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export enum ImageCategoryDto {
  LOGO = 'LOGO',
  COVER = 'COVER',
  INTERIOR = 'INTERIOR',
  EXTERIOR = 'EXTERIOR',
  STAFF = 'STAFF',
  EQUIPMENT = 'EQUIPMENT',
  SERVICES = 'SERVICES',
  GALLERY = 'GALLERY',
}

// === IMAGE METADATA DTO ===
export class ImageMetadataDto {
  @ApiProperty({
    description: 'Image file size in bytes',
    example: 1048576,
    minimum: 1,
    maximum: 5242880, // 5MB max
  })
  @IsNumber()
  @Min(1)
  @Max(5242880)
  size!: number;

  @ApiProperty({
    description: 'Image format',
    example: 'jpg',
    enum: ['jpg', 'jpeg', 'png', 'webp'],
  })
  @IsString()
  format!: string;

  @ApiProperty({
    description: 'Image dimensions',
    example: { width: 1920, height: 1080 },
  })
  dimensions!: {
    width: number;
    height: number;
  };

  @ApiProperty({
    description: 'Upload timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  uploadedAt!: Date;
}

// === BUSINESS IMAGE DTO ===
export class BusinessImageDto {
  @ApiProperty({
    description: 'Image unique identifier',
    example: 'img_123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Image URL',
    example: 'https://cdn.example.com/images/business/logo.jpg',
  })
  @IsUrl()
  url!: string;

  @ApiProperty({
    description: 'Alt text for accessibility',
    example: 'Logo du Cabinet Médical Centre Ville',
    minLength: 10,
    maxLength: 200,
  })
  @IsString()
  @Length(10, 200)
  alt!: string;

  @ApiPropertyOptional({
    description: 'Image caption',
    example: 'Notre nouveau logo inauguré en 2024',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @Length(1, 300)
  caption?: string;

  @ApiProperty({
    description: 'Image category',
    enum: ImageCategoryDto,
    example: ImageCategoryDto.LOGO,
  })
  @IsEnum(ImageCategoryDto)
  category!: ImageCategoryDto;

  @ApiProperty({
    description: 'Image metadata',
    type: ImageMetadataDto,
  })
  @ValidateNested()
  @Type(() => ImageMetadataDto)
  metadata!: ImageMetadataDto;

  @ApiProperty({
    description: 'Whether image is public',
    example: true,
  })
  @IsBoolean()
  isPublic!: boolean;

  @ApiProperty({
    description: 'Display order',
    example: 1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  order!: number;
}

// === CREATE IMAGE DTO ===
export class CreateBusinessImageDto {
  @ApiProperty({
    description: 'Image URL',
    example: 'https://cdn.example.com/images/business/new-photo.jpg',
  })
  @IsUrl({}, { message: 'URL must be valid' })
  url!: string;

  @ApiProperty({
    description: 'Alt text for accessibility',
    example: "Salle d'attente moderne avec éclairage naturel",
    minLength: 10,
    maxLength: 200,
  })
  @IsString()
  @Length(10, 200, {
    message: 'Alt text must be between 10 and 200 characters',
  })
  alt!: string;

  @ApiPropertyOptional({
    description: 'Image caption',
    example: "Notre salle d'attente rénovée pour votre confort",
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @Length(1, 300, { message: 'Caption must be less than 300 characters' })
  caption?: string;

  @ApiProperty({
    description: 'Image category',
    enum: ImageCategoryDto,
    example: ImageCategoryDto.INTERIOR,
  })
  @IsEnum(ImageCategoryDto, { message: 'Invalid image category' })
  category!: ImageCategoryDto;

  @ApiProperty({
    description: 'Image metadata',
    type: ImageMetadataDto,
  })
  @ValidateNested()
  @Type(() => ImageMetadataDto)
  metadata!: ImageMetadataDto;

  @ApiPropertyOptional({
    description: 'Whether image is public',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Display order',
    example: 5,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

// === UPDATE IMAGE ORDER DTO ===
export class UpdateImageOrderDto {
  @ApiProperty({
    description: 'New display order',
    example: 3,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  order!: number;
}

// === BUSINESS GALLERY DTO ===
export class BusinessGalleryDto {
  @ApiProperty({
    description: 'Gallery images',
    type: [BusinessImageDto],
    example: [
      {
        id: 'img_1',
        url: 'https://example.com/logo.jpg',
        alt: 'Logo',
        category: 'LOGO',
        isPublic: true,
        order: 0,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessImageDto)
  images!: BusinessImageDto[];

  @ApiProperty({
    description: 'Total number of images',
    example: 8,
    minimum: 0,
    maximum: 20,
  })
  @IsNumber()
  @Min(0)
  @Max(20)
  count!: number;

  @ApiProperty({
    description: 'Gallery statistics',
    example: {
      total: 8,
      public: 6,
      private: 2,
      byCategory: {
        LOGO: 1,
        COVER: 1,
        GALLERY: 6,
      },
      optimized: 8,
      totalSize: 15728640,
    },
  })
  statistics!: {
    total: number;
    public: number;
    private: number;
    byCategory: Record<string, number>;
    optimized: number;
    totalSize: number;
  };
}

// === GALLERY RESPONSE DTO ===
export class BusinessGalleryResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Business gallery data',
    type: BusinessGalleryDto,
  })
  data!: BusinessGalleryDto;

  @ApiProperty({
    description: 'Response message',
    example: 'Gallery retrieved successfully',
  })
  message!: string;
}

// === ADD IMAGE RESPONSE DTO ===
export class AddImageResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Added image data',
    type: BusinessImageDto,
  })
  data!: BusinessImageDto;

  @ApiProperty({
    description: 'Response message',
    example: 'Image added to gallery successfully',
  })
  message!: string;
}

// === BULK IMAGES DTO ===
export class BulkImagesDto {
  @ApiProperty({
    description: 'Multiple images to add',
    type: [CreateBusinessImageDto],
    maxItems: 10,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBusinessImageDto)
  images!: CreateBusinessImageDto[];
}

// === GALLERY FILTER DTO ===
export class GalleryFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by category',
    enum: ImageCategoryDto,
    example: ImageCategoryDto.GALLERY,
  })
  @IsOptional()
  @IsEnum(ImageCategoryDto)
  category?: ImageCategoryDto;

  @ApiPropertyOptional({
    description: 'Filter by public visibility',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Include image metadata',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;
}

// === CREATE GALLERY DTO ===
export class CreateBusinessGalleryDto {
  @ApiProperty({
    description: 'Gallery name',
    example: 'Portfolio Principal',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiPropertyOptional({
    description: 'Gallery description',
    example: 'Notre collection de réalisations et projets récents',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Display order',
    example: 1,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Is primary gallery',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Gallery configuration',
    example: {
      maxImages: 50,
      allowedFormats: ['JPEG', 'PNG', 'WEBP'],
      thumbnailSize: { width: 200, height: 200 },
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  galleryConfig?: any;
}

// === UPDATE GALLERY DTO ===
export class UpdateBusinessGalleryDto {
  @ApiPropertyOptional({
    description: 'Gallery name',
    example: 'Portfolio Mis à Jour',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Gallery description',
    example: 'Collection mise à jour de nos réalisations',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Display order',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Is primary gallery',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Gallery configuration',
    example: {
      maxImages: 100,
      allowedFormats: ['JPEG', 'PNG', 'WEBP', 'GIF'],
      thumbnailSize: { width: 300, height: 300 },
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  galleryConfig?: any;
}

// === CREATE GALLERY RESPONSE DTO ===
export class CreateBusinessGalleryResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Created gallery data',
    type: BusinessGalleryDto,
  })
  data!: BusinessGalleryDto;

  @ApiProperty({
    description: 'Response message',
    example: 'Gallery created successfully',
  })
  message!: string;
}

// === UPDATE GALLERY RESPONSE DTO ===
export class UpdateBusinessGalleryResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Updated gallery data',
    type: BusinessGalleryDto,
  })
  data!: BusinessGalleryDto;

  @ApiProperty({
    description: 'Response message',
    example: 'Gallery updated successfully',
  })
  message!: string;
}

// === DELETE GALLERY RESPONSE DTO ===
export class DeleteBusinessGalleryResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Gallery deleted successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Deleted gallery ID',
    example: 'gallery_123e4567-e89b-12d3-a456-426614174000',
  })
  deletedId!: string;
}

// === ADD IMAGE TO GALLERY DTO ===
export class AddImageToBusinessGalleryDto {
  @ApiProperty({
    description: 'Image ID to add to gallery',
    example: 'img_123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  imageId!: string;

  @ApiPropertyOptional({
    description: 'Display order of the image',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

// === ADD IMAGE TO GALLERY RESPONSE DTO ===
export class AddImageToBusinessGalleryResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Gallery ID where image was added',
    example: 'gallery_123e4567-e89b-12d3-a456-426614174000',
  })
  galleryId!: string;

  @ApiProperty({
    description: 'Added image ID',
    example: 'img_123e4567-e89b-12d3-a456-426614174000',
  })
  imageId!: string;

  @ApiProperty({
    description: 'Updated image count in gallery',
    example: 5,
  })
  imageCount!: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Image added to gallery successfully',
  })
  message!: string;
}
