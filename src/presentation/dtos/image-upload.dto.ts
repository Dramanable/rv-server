import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for image upload with multipart form data
 * Used specifically for file upload endpoints with metadata
 */
export class ImageUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to upload (JPEG, PNG, WEBP)',
    example: '[Binary file data]',
  })
  image!: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Alternative text for accessibility',
    example: 'Photo of our new office space',
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  alt?: string;

  @ApiPropertyOptional({
    description: 'Caption or description for the image',
    example: 'Our newly renovated reception area, completed in 2024',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  caption?: string;

  @ApiPropertyOptional({
    description: 'Category of the image',
    enum: ['GALLERY', 'COVER', 'PROFILE', 'LOGO'],
    example: 'GALLERY',
  })
  @IsOptional()
  @IsEnum(['GALLERY', 'COVER', 'PROFILE', 'LOGO'])
  category?: 'GALLERY' | 'COVER' | 'PROFILE' | 'LOGO' = 'GALLERY';

  @ApiPropertyOptional({
    description: 'Whether the image should be publicly visible',
    example: true,
    type: 'boolean',
  })
  @IsOptional()
  @Transform(({ value }: { value: any }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  isPublic?: boolean = true;
}

/**
 * Response DTO for successful image upload
 */
export class ImageUploadResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Uploaded image data with variants and metadata',
    type: 'object',
    properties: {
      imageId: {
        type: 'string',
        format: 'uuid',
        example: '987fcdeb-51a2-43d7-8f6e-123456789abc',
      },
      originalUrl: {
        type: 'string',
        example: 'https://s3.amazonaws.com/business-images/original/image.jpg',
      },
      variants: {
        type: 'object',
        properties: {
          thumbnail: {
            type: 'string',
            example: 'https://s3.../thumb_200x200.jpg',
          },
          medium: {
            type: 'string',
            example: 'https://s3.../medium_800x600.jpg',
          },
          large: {
            type: 'string',
            example: 'https://s3.../large_1200x900.jpg',
          },
        },
      },
      signedUrls: {
        type: 'object',
        properties: {
          view: {
            type: 'string',
            example: 'https://s3.../signed-url?expires=...',
          },
          download: {
            type: 'string',
            example: 'https://s3.../download?expires=...',
          },
        },
      },
      metadata: {
        type: 'object',
        properties: {
          size: { type: 'number', example: 2048576 },
          width: { type: 'number', example: 1920 },
          height: { type: 'number', example: 1080 },
          format: { type: 'string', example: 'JPEG' },
          uploadedAt: { type: 'string', format: 'date-time' },
        },
      },
      galleryInfo: {
        type: 'object',
        properties: {
          totalImages: { type: 'number', example: 12 },
          displayOrder: { type: 'number', example: 13 },
          category: { type: 'string', example: 'GALLERY' },
        },
      },
    },
  })
  data!: {
    imageId: string;
    originalUrl: string;
    variants: {
      thumbnail: string;
      medium: string;
      large: string;
    };
    signedUrls: {
      view: string;
      download: string;
    };
    metadata: {
      size: number;
      width: number;
      height: number;
      format: string;
      uploadedAt: string;
    };
    galleryInfo: {
      totalImages: number;
      displayOrder: number;
      category: string;
    };
  };

  @ApiProperty({
    description: 'Success message',
    example: 'Image uploaded successfully with 3 variants generated',
  })
  message!: string;
}

/**
 * Error response for failed image upload
 */
export class ImageUploadErrorDto {
  @ApiProperty({
    description: 'Success status',
    example: false,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Error details',
    type: 'object',
    properties: {
      code: { type: 'string', example: 'INVALID_FILE_FORMAT' },
      message: {
        type: 'string',
        example: 'Only JPEG, PNG, and WEBP formats are allowed',
      },
      details: {
        type: 'object',
        properties: {
          allowedFormats: {
            type: 'array',
            items: { type: 'string' },
            example: ['JPEG', 'PNG', 'WEBP'],
          },
          receivedFormat: { type: 'string', example: 'GIF' },
          maxSize: { type: 'string', example: '10MB' },
        },
      },
    },
  })
  error!: {
    code: string;
    message: string;
    details?: {
      allowedFormats?: string[];
      receivedFormat?: string;
      maxSize?: string;
      currentCount?: number;
      maxAllowed?: number;
      upgradeRequired?: boolean;
    };
  };
}

/**
 * File validation utility types
 */
export interface FileValidationOptions {
  maxSize: number; // in bytes
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export const DEFAULT_IMAGE_VALIDATION: FileValidationOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
};

/**
 * Image processing options for AWS S3
 */
export interface ImageProcessingOptions {
  generateThumbnail: boolean;
  thumbnailSize: { width: number; height: number };
  generateMedium: boolean;
  mediumSize: { width: number; height: number };
  generateLarge: boolean;
  largeSize: { width: number; height: number };
  quality: number; // 1-100
  format: 'original' | 'jpeg' | 'webp';
  watermark?: {
    enabled: boolean;
    text?: string;
    image?: string;
    position: 'center' | 'bottom-right' | 'bottom-left';
    opacity: number; // 0-1
  };
}

export const DEFAULT_PROCESSING_OPTIONS: ImageProcessingOptions = {
  generateThumbnail: true,
  thumbnailSize: { width: 200, height: 200 },
  generateMedium: true,
  mediumSize: { width: 800, height: 600 },
  generateLarge: true,
  largeSize: { width: 1200, height: 900 },
  quality: 85,
  format: 'original',
  watermark: {
    enabled: false,
    position: 'bottom-right',
    opacity: 0.7,
  },
};
