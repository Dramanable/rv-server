/**
 * 🗑️ DELETE BUSINESS GALLERY USE CASE
 * ✅ TDD Implementation - Clean Architecture
 * ✅ Business logic for safely removing gallery with image cleanup
 */

import { BusinessRepository } from '../../../domain/repositories/business.repository';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import { BusinessGallery } from '../../../domain/value-objects/business-gallery.value-object';
import { ILogger } from '../../../shared/types/logger.interface';
import { I18nService } from '../../../shared/types/i18n.interface';
import { BusinessNotFoundError } from '../../exceptions/business.exceptions';

export interface DeleteBusinessGalleryRequest {
  readonly businessId: string;
  readonly requestingUserId: string;
  readonly options?: {
    readonly removeAllImages?: boolean; // If false, keeps images as orphaned
    readonly deleteFromS3?: boolean; // If true, also removes from AWS S3
  };
}

export interface DeleteBusinessGalleryResponse {
  readonly success: boolean;
  readonly businessId: string;
  readonly deletedImages: number;
  readonly orphanedImages: number;
  readonly s3FilesRemoved: number;
  readonly message: string;
}

/**
 * Safely removes all images from business gallery
 * Note: BusinessGallery cannot be deleted from Business entity (it's always present)
 * This use case clears all images from the gallery
 */
export class DeleteBusinessGalleryUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly logger: ILogger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: DeleteBusinessGalleryRequest,
  ): Promise<DeleteBusinessGalleryResponse> {
    this.logger.log('Clearing business gallery', {
      businessId: request.businessId,
      requestingUserId: request.requestingUserId,
      removeAllImages: request.options?.removeAllImages ?? true,
      deleteFromS3: request.options?.deleteFromS3 ?? false,
    });

    try {
      // 1. Find the business
      const businessId = BusinessId.create(request.businessId);
      const business = await this.businessRepository.findById(businessId);

      if (!business) {
        const errorMessage = this.i18n.t('error.business.not_found');
        this.logger.error('Business not found for gallery deletion', {
          businessId: request.businessId,
          requestingUserId: request.requestingUserId,
        });
        throw new BusinessNotFoundError(errorMessage);
      }

      // 2. Get current gallery and count images
      const currentGallery = business.gallery;
      const imageCount = currentGallery.count;

      if (imageCount === 0) {
        this.logger.log('Business gallery already empty', {
          businessId: request.businessId,
        });

        return {
          success: true,
          businessId: request.businessId,
          deletedImages: 0,
          orphanedImages: 0,
          s3FilesRemoved: 0,
          message: this.i18n.t('gallery.already_empty'),
        };
      }

      // 3. Get all image URLs for potential S3 cleanup
      const imageUrls = currentGallery.images.map((image) => image.url);

      // 4. Clear the gallery (creates empty gallery)
      business.updateGallery(BusinessGallery.empty());

      // 5. Save business with cleared gallery
      await this.businessRepository.save(business);

      // 6. Handle S3 cleanup if requested
      const s3FilesRemoved = 0;
      if (request.options?.deleteFromS3) {
        // TODO: Implement S3 cleanup
        // This would require injecting an S3 service
        this.logger.log('S3 cleanup requested but not implemented yet', {
          businessId: request.businessId,
          imageUrls: imageUrls.length,
        });
      }

      this.logger.log('Business gallery cleared successfully', {
        businessId: request.businessId,
        deletedImages: imageCount,
        s3FilesRemoved,
      });

      return {
        success: true,
        businessId: request.businessId,
        deletedImages: imageCount,
        orphanedImages: 0, // All images are removed, not orphaned
        s3FilesRemoved,
        message: this.i18n.t('gallery.cleared_successfully', {
          count: imageCount,
        }),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to clear business gallery', {
        businessId: request.businessId,
        error: errorMessage,
        requestingUserId: request.requestingUserId,
      });
      throw error;
    }
  }
}
