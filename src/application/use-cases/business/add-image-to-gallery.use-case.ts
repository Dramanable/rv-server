/**
 * 📷 ADD IMAGE TO BUSINESS GALLERY USE CASE
 * ✅ Clean Architecture - Application Layer
 * ✅ Business rules for image management
 */

import { BusinessRepository } from "../../../domain/repositories/business.repository.interface";
import { BusinessId } from "../../../domain/value-objects/business-id.value-object";
import {
  BusinessImage,
  ImageCategory,
} from "../../../domain/value-objects/business-image.value-object";
import { BusinessNotFoundError } from "../../exceptions/business.exceptions";

export interface AddImageToGalleryRequest {
  readonly requestingUserId: string;
  readonly businessId: string;
  readonly imageData: {
    readonly url: string;
    readonly alt: string;
    readonly caption?: string;
    readonly category: ImageCategory;
    readonly metadata: {
      readonly size: number;
      readonly format: string;
      readonly dimensions: {
        readonly width: number;
        readonly height: number;
      };
      readonly uploadedAt: Date;
    };
    readonly isPublic?: boolean;
    readonly order?: number;
  };
}

export interface AddImageToGalleryResponse {
  readonly addedImage: BusinessImage;
  readonly totalImages: number;
  readonly message: string;
}

export class AddImageToBusinessGalleryUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(
    request: AddImageToGalleryRequest,
  ): Promise<AddImageToGalleryResponse> {
    // 1. Récupération du business
    const businessId = BusinessId.create(request.businessId);
    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new BusinessNotFoundError(request.businessId);
    }

    // 2. Validation des permissions
    // TODO: Vérifier que l'utilisateur peut modifier ce business
    // if (!business.canBeModifiedBy(request.requestingUserId)) {
    //   throw new BusinessPermissionError(request.requestingUserId, request.businessId);
    // }

    // 3. Création de l'image
    const newImage = BusinessImage.create({
      url: request.imageData.url,
      alt: request.imageData.alt,
      caption: request.imageData.caption,
      category: request.imageData.category,
      metadata: {
        size: request.imageData.metadata.size,
        format: request.imageData.metadata.format,
        dimensions: request.imageData.metadata.dimensions,
        uploadedAt: request.imageData.metadata.uploadedAt,
      },
      isPublic: request.imageData.isPublic ?? true,
      order: request.imageData.order ?? 0,
    });

    // 4. Ajout à la galerie avec validation des règles métier
    const currentGallery = business.gallery;
    const updatedGallery = currentGallery.addImage(newImage);

    // 5. Mise à jour du business
    const updatedBusiness = business.updateGallery(updatedGallery);

    // 6. Sauvegarde
    await this.businessRepository.save(updatedBusiness);

    return {
      addedImage: newImage,
      totalImages: updatedGallery.count,
      message: `Image ajoutée avec succès à la galerie. Total: ${updatedGallery.count} images.`,
    };
  }
}
