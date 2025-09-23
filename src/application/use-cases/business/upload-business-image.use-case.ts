/**
 * 📤 UPLOAD BUSINESS IMAGE USE CASE
 * ✅ Upload sécurisé avec validation admin
 * ✅ Integration AWS S3 + signatures
 * ✅ Business rules compliance
 * ✅ TDD Implementation - GREEN phase
 */

import { BusinessRepository } from '../../../domain/repositories/business.repository';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import {
  BusinessImage,
  ImageCategory,
} from '../../../domain/value-objects/business-image.value-object';
import { ImageUploadSettings } from '../../../domain/value-objects/image-upload-settings.value-object';
import { AwsS3ImageService } from '../../../infrastructure/services/aws-s3-image.service';

export interface UploadBusinessImageRequest {
  readonly businessId: string;
  readonly requestingUserId: string;
  readonly imageBuffer: Buffer;
  readonly metadata: {
    readonly category: ImageCategory;
    readonly fileName: string;
    readonly contentType: string;
    readonly alt: string;
    readonly size: number;
    readonly dimensions: {
      readonly width: number;
      readonly height: number;
    };
  };
  readonly uploadSettings: ImageUploadSettings;
}

export interface UploadBusinessImageResponse {
  readonly success: boolean;
  readonly imageId: string;
  readonly signedUrl: string;
  readonly thumbnailUrl?: string;
  readonly variants?: {
    readonly small: string;
    readonly medium: string;
    readonly large: string;
  };
  readonly message: string;
}

export class UploadBusinessImageUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly imageService: AwsS3ImageService,
  ) {}

  async execute(
    request: UploadBusinessImageRequest,
  ): Promise<UploadBusinessImageResponse> {
    // 1. Validate business exists
    const businessId = BusinessId.create(request.businessId);
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new Error('Business not found');
    }

    // 2. Validate permissions
    if (business.getOwnerId() !== request.requestingUserId) {
      throw new Error('Insufficient permissions');
    }

    // 3. Validate image quota for gallery images
    if (request.metadata.category === ImageCategory.GALLERY) {
      const currentImageCount = business.getGallery().images.length;
      if (!request.uploadSettings.canBusinessAddMoreImages(currentImageCount)) {
        throw new Error('Image quota exceeded');
      }
    }

    // 4. Upload to S3 with validation
    try {
      const uploadResult = await this.imageService.validateAndUpload(
        request.businessId,
        request.imageBuffer,
        {
          category: request.metadata.category,
          fileName: request.metadata.fileName,
          contentType: request.metadata.contentType,
          alt: request.metadata.alt,
          size: request.metadata.size,
          dimensions: request.metadata.dimensions,
        },
        request.uploadSettings,
      );

      // 5. Create domain image object
      const businessImage = BusinessImage.create({
        url: `https://business-images.s3.eu-west-1.amazonaws.com/${uploadResult.s3Key}`,
        alt: request.metadata.alt,
        category: request.metadata.category,
        metadata: {
          size: request.metadata.size,
          format: request.metadata.contentType.split('/')[1] || 'unknown',
          dimensions: request.metadata.dimensions,
          uploadedAt: new Date(),
        },
      });

      // 6. Update business entity
      if (request.metadata.category === ImageCategory.LOGO) {
        // Replace existing logo: remove existing logos first, then add new one
        let updatedGallery = business.getGallery();
        const existingLogos = updatedGallery.findByCategory(ImageCategory.LOGO);

        // Remove existing logos
        for (const logo of existingLogos) {
          updatedGallery = updatedGallery.removeImage(logo.id);
        }

        // Add new logo
        updatedGallery = updatedGallery.addImage(businessImage);
        business.updateGallery(updatedGallery);
      } else {
        // Add to gallery
        business.updateGallery(business.getGallery().addImage(businessImage));
      }

      // 7. Save business
      await this.businessRepository.save(business);

      // 8. Generate signed download URL
      const signedUrl = await this.imageService.generateDownloadUrl(
        uploadResult.s3Key,
        60,
      );

      // 9. Generate responsive URLs if variants exist
      let variants;
      if (uploadResult.variants) {
        variants = {
          small: await this.imageService.generateDownloadUrl(
            uploadResult.variants.thumbnail,
            60,
          ),
          medium: await this.imageService.generateDownloadUrl(
            uploadResult.variants.medium,
            60,
          ),
          large: uploadResult.variants.large
            ? await this.imageService.generateDownloadUrl(
                uploadResult.variants.large,
                60,
              )
            : await this.imageService.generateDownloadUrl(
                uploadResult.variants.medium,
                60,
              ),
        };
      }

      return {
        success: true,
        imageId: businessImage.id,
        signedUrl,
        thumbnailUrl: uploadResult.variants?.thumbnail,
        variants,
        message: 'Image uploaded successfully',
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Image validation failed')) {
          throw error; // Re-throw validation errors
        }
        if (error.message.includes('S3')) {
          throw new Error('Failed to upload image');
        }
      }
      throw new Error('Failed to upload image');
    }
  }
}
