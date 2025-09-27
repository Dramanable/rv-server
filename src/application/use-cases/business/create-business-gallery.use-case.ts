/**
 * 🎯 CREATE BUSINESS GALLERY USE CASE
 * ✅ TDD Implementation - Clean Architecture
 * ✅ Initializes business gallery for image management
 */

import { BusinessRepository } from "../../../domain/repositories/business.repository";
import { BusinessId } from "../../../domain/value-objects/business-id.value-object";
import { I18nService } from "../../../shared/types/i18n.interface";
import { ILogger } from "../../../shared/types/logger.interface";
import { BusinessNotFoundError } from "../../exceptions/business.exceptions";

export interface CreateBusinessGalleryRequest {
  readonly businessId: string;
  readonly requestingUserId: string;
}

export interface CreateBusinessGalleryResponse {
  readonly success: boolean;
  readonly businessId: string;
  readonly galleryImageCount: number;
  readonly message: string;
}

/**
 * Note: BusinessGallery is automatically created with Business entity.
 * This use case validates gallery readiness and provides gallery status.
 */
export class CreateBusinessGalleryUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly logger: ILogger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: CreateBusinessGalleryRequest,
  ): Promise<CreateBusinessGalleryResponse> {
    this.logger.log("Validating business gallery readiness", {
      businessId: request.businessId,
      requestingUserId: request.requestingUserId,
    });

    try {
      // 1. Find the business
      const businessId = BusinessId.create(request.businessId);
      const business = await this.businessRepository.findById(businessId);

      if (!business) {
        const errorMessage = this.i18n.t("error.business.not_found");
        this.logger.error("Business not found for gallery validation", {
          businessId: request.businessId,
          requestingUserId: request.requestingUserId,
        });
        throw new BusinessNotFoundError(errorMessage);
      }

      // 2. Check current gallery status
      const currentGallery = business.gallery;
      const imageCount = currentGallery.count;

      this.logger.log("Business gallery validated successfully", {
        businessId: request.businessId,
        currentImageCount: imageCount,
        hasLogo: business.hasLogo(),
        hasCoverImage: business.hasCoverImage(),
      });

      // 3. Return gallery status
      const message =
        imageCount > 0
          ? this.i18n.t("gallery.existing_with_images", { count: imageCount })
          : this.i18n.t("gallery.ready_for_images");

      return {
        success: true,
        businessId: request.businessId,
        galleryImageCount: imageCount,
        message,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to validate business gallery", {
        businessId: request.businessId,
        error: errorMessage,
        requestingUserId: request.requestingUserId,
      });
      throw error;
    }
  }
}
