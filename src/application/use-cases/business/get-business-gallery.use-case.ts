/**
 * 🖼️ GET BUSINESS GALLERY USE CASE
 * ✅ TDD Implementation - Clean Architecture
 * ✅ Business logic for retrieving business gallery with images
 */

import { BusinessRepository } from '../../../domain/repositories/business.repository';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import {
  BusinessImage,
  ImageCategory,
} from '../../../domain/value-objects/business-image.value-object';
import { I18nService } from '../../../shared/types/i18n.interface';
import { ILogger } from '../../../shared/types/logger.interface';
import { BusinessNotFoundError } from '../../exceptions/business.exceptions';

export interface GetBusinessGalleryRequest {
  readonly businessId: string;
  readonly includePrivate?: boolean;
  readonly category?: ImageCategory;
  readonly requestingUserId?: string;
}

export interface BusinessImageDto {
  readonly id: string;
  readonly url: string;
  readonly alt: string;
  readonly caption?: string;
  readonly category: ImageCategory;
  readonly isPublic: boolean;
  readonly order: number;
  readonly metadata: {
    readonly size: number;
    readonly format: string;
    readonly dimensions: {
      readonly width: number;
      readonly height: number;
    };
    readonly uploadedAt: Date;
  };
}

export interface GetBusinessGalleryResponse {
  readonly success: boolean;
  readonly businessId: string;
  readonly images: BusinessImageDto[];
  readonly statistics: {
    readonly total: number;
    readonly public: number;
    readonly private: number;
    readonly byCategory: Record<ImageCategory, number>;
    readonly totalSize: number;
  };
  readonly hasLogo: boolean;
  readonly hasCoverImage: boolean;
}

/**
 * Retrieves business gallery with optional filtering
 */
export class GetBusinessGalleryUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly logger: ILogger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: GetBusinessGalleryRequest,
  ): Promise<GetBusinessGalleryResponse> {
    this.logger.log('Retrieving business gallery', {
      businessId: request.businessId,
      includePrivate: request.includePrivate,
      category: request.category,
      requestingUserId: request.requestingUserId,
    });

    try {
      // 1. Find the business
      const businessId = BusinessId.create(request.businessId);
      const business = await this.businessRepository.findById(businessId);

      if (!business) {
        const errorMessage = this.i18n.t('error.business.not_found');
        this.logger.error('Business not found for gallery retrieval', {
          businessId: request.businessId,
          requestingUserId: request.requestingUserId,
        });
        throw new BusinessNotFoundError(errorMessage);
      }

      // 2. Get gallery from business
      const gallery = business.gallery;

      // 3. Filter images based on request
      let images = gallery.images;

      // Filter by visibility (public/private)
      if (!request.includePrivate) {
        images = gallery.publicImages;
      }

      // Filter by category if specified
      if (request.category) {
        images = gallery.findByCategory(request.category);
      }

      // 4. Convert to DTOs
      const imageDtos = images.map((image) => this.mapImageToDto(image));

      // 5. Get gallery statistics
      const statistics = gallery.getStatistics();

      this.logger.log('Business gallery retrieved successfully', {
        businessId: request.businessId,
        totalImages: images.length,
        hasLogo: business.hasLogo(),
        hasCoverImage: business.hasCoverImage(),
      });

      return {
        success: true,
        businessId: request.businessId,
        images: imageDtos,
        statistics,
        hasLogo: business.hasLogo(),
        hasCoverImage: business.hasCoverImage(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to retrieve business gallery', {
        businessId: request.businessId,
        error: errorMessage,
        requestingUserId: request.requestingUserId,
      });
      throw error;
    }
  }

  private mapImageToDto(image: BusinessImage): BusinessImageDto {
    return {
      id: image.id,
      url: image.url,
      alt: image.alt,
      caption: image.caption,
      category: image.category,
      isPublic: image.isPublic,
      order: image.order,
      metadata: {
        size: image.metadata.size,
        format: image.metadata.format,
        dimensions: image.metadata.dimensions,
        uploadedAt: image.metadata.uploadedAt,
      },
    };
  }
}
