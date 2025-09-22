/**
 * ✏️ UPDATE BUSINESS GALLERY USE CASE
 * ✅ TDD Implementation - Clean Architecture
 * ✅ Business logic for updating gallery metadata and organization
 */

import { BusinessRepository } from '../../../domain/repositories/business.repository';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import { ILogger } from '../../../shared/types/logger.interface';
import { I18nService } from '../../../shared/types/i18n.interface';
import { BusinessNotFoundError } from '../../exceptions/business.exceptions';

export interface UpdateBusinessGalleryRequest {
  readonly businessId: string;
  readonly requestingUserId: string;
  readonly updates: {
    readonly reorganizeImages?: Array<{
      readonly imageId: string;
      readonly newOrder: number;
    }>;
    readonly updateImageVisibility?: Array<{
      readonly imageId: string;
      readonly isPublic: boolean;
    }>;
    readonly updateImageCaptions?: Array<{
      readonly imageId: string;
      readonly caption?: string;
      readonly alt?: string;
    }>;
  };
}

export interface UpdateBusinessGalleryResponse {
  readonly success: boolean;
  readonly businessId: string;
  readonly updatedImages: number;
  readonly message: string;
}

/**
 * Updates business gallery organization and image metadata
 */
export class UpdateBusinessGalleryUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly logger: ILogger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: UpdateBusinessGalleryRequest,
  ): Promise<UpdateBusinessGalleryResponse> {
    this.logger.log('Updating business gallery', {
      businessId: request.businessId,
      requestingUserId: request.requestingUserId,
      updatesCount: {
        reorganize: request.updates.reorganizeImages?.length || 0,
        visibility: request.updates.updateImageVisibility?.length || 0,
        captions: request.updates.updateImageCaptions?.length || 0,
      },
    });

    try {
      // 1. Find the business
      const businessId = BusinessId.create(request.businessId);
      const business = await this.businessRepository.findById(businessId);

      if (!business) {
        const errorMessage = this.i18n.t('error.business.not_found');
        this.logger.error('Business not found for gallery update', {
          businessId: request.businessId,
          requestingUserId: request.requestingUserId,
        });
        throw new BusinessNotFoundError(errorMessage);
      }

      // 2. Get current gallery
      let updatedGallery = business.gallery;
      let updatedImagesCount = 0;

      // 3. Apply reorganization changes
      if (request.updates.reorganizeImages?.length) {
        for (const reorder of request.updates.reorganizeImages) {
          updatedGallery = updatedGallery.updateImageOrder(
            reorder.imageId,
            reorder.newOrder,
          );
          updatedImagesCount++;
        }
      }

      // 4. Apply visibility changes
      if (request.updates.updateImageVisibility?.length) {
        for (const visibility of request.updates.updateImageVisibility) {
          updatedGallery = updatedGallery.updateImageVisibility(
            visibility.imageId,
            visibility.isPublic,
          );
          updatedImagesCount++;
        }
      }

      // 5. Apply caption changes
      if (request.updates.updateImageCaptions?.length) {
        for (const caption of request.updates.updateImageCaptions) {
          updatedGallery = updatedGallery.updateImageMetadata(caption.imageId, {
            caption: caption.caption,
            alt: caption.alt,
          });
          updatedImagesCount++;
        }
      }

      // 6. Update business with new gallery
      business.updateGallery(updatedGallery);

      // 7. Save business
      await this.businessRepository.save(business);

      this.logger.log('Business gallery updated successfully', {
        businessId: request.businessId,
        updatedImagesCount,
        totalImages: updatedGallery.count,
      });

      return {
        success: true,
        businessId: request.businessId,
        updatedImages: updatedImagesCount,
        message: this.i18n.t('gallery.updated_successfully', {
          count: updatedImagesCount,
        }),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to update business gallery', {
        businessId: request.businessId,
        error: errorMessage,
        requestingUserId: request.requestingUserId,
      });
      throw error;
    }
  }
}
