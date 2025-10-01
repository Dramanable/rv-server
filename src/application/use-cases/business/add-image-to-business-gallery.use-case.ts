/**
 * 🖼️ ADD IMAGE TO BUSINESS GALLERY USE CASE
 * ✅ TDD Implementation - Clean Architecture
 * ✅ Business logic for adding images to gallery
 */

import { BusinessRepository } from "../../../domain/repositories/business.repository";
import { BusinessId } from "../../../domain/value-objects/business-id.value-object";
import {
  BusinessImage,
  ImageCategory,
} from "../../../domain/value-objects/business-image.value-object";
import { I18nService } from "../../../shared/types/i18n.interface";
import { ILogger } from "../../../shared/types/logger.interface";
import { BusinessNotFoundError } from "../../exceptions/business.exceptions";

export interface AddImageToBusinessGalleryRequest {
  readonly businessId: string;
  readonly imageUrl: string;
  readonly alt: string;
  readonly caption?: string;
  readonly category: ImageCategory;
  readonly isPublic: boolean;
  readonly order: number;
  readonly metadata: {
    readonly size: number;
    readonly width: number;
    readonly height: number;
    readonly format: string;
    readonly uploadedBy: string;
  };
  readonly requestingUserId: string;
}

export interface AddImageToBusinessGalleryResponse {
  readonly success: boolean;
  readonly imageId: string;
  readonly businessId: string;
  readonly imageUrl: string;
  readonly category: ImageCategory;
  readonly totalImages: number;
  readonly message: string;
}

/**
 * Adds a new image to the business gallery with validation
 */
export class AddImageToBusinessGalleryUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly logger: ILogger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: AddImageToBusinessGalleryRequest,
  ): Promise<AddImageToBusinessGalleryResponse> {
    this.logger.log("Adding image to business gallery", {
      businessId: request.businessId,
      category: request.category,
      requestingUserId: request.requestingUserId,
    });

    try {
      // 1. Find the business
      const businessId = BusinessId.create(request.businessId);
      const business = await this.businessRepository.findById(businessId);

      if (!business) {
        const errorMessage = this.i18n.t("error.business.not_found");
        this.logger.error("Business not found for image addition", {
          businessId: request.businessId,
          requestingUserId: request.requestingUserId,
        });
        throw new BusinessNotFoundError(errorMessage);
      }

      // 2. Create the new image
      const imageMetadata = {
        size: request.metadata.size,
        format: request.metadata.format,
        dimensions: {
          width: request.metadata.width,
          height: request.metadata.height,
        },
        uploadedAt: new Date(),
      };

      const newImage = BusinessImage.create({
        url: request.imageUrl,
        alt: request.alt,
        caption: request.caption,
        category: request.category,
        metadata: imageMetadata,
        isPublic: request.isPublic,
        order: request.order,
      });

      // 3. Add image to gallery (creates new business instance)
      const currentGallery = business.gallery;
      const updatedGallery = currentGallery.addImage(newImage);

      // 4. Update business with new gallery
      const updatedBusiness = business.updateGallery(updatedGallery);

      // 5. Save to repository
      await this.businessRepository.save(updatedBusiness);

      this.logger.log("Image added to business gallery successfully", {
        businessId: request.businessId,
        imageId: newImage.id,
        category: request.category,
        totalImages: updatedGallery.count,
      });

      return {
        success: true,
        imageId: newImage.id,
        businessId: request.businessId,
        imageUrl: request.imageUrl,
        category: request.category,
        totalImages: updatedGallery.count,
        message: this.i18n.t("gallery.image_added_successfully"),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to add image to business gallery", {
        businessId: request.businessId,
        error: errorMessage,
        requestingUserId: request.requestingUserId,
      });
      throw error;
    }
  }
}
