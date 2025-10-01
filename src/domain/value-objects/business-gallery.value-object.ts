/**
 * 🖼️ BUSINESS GALLERY VALUE OBJECT
 * ✅ Clean Architecture compliant
 * ✅ Collection of business images with business rules
 */

import {
  DuplicateValueError,
  InvalidValueError,
  RequiredValueError,
  ValueNotFoundError,
  ValueOutOfRangeError,
} from "@domain/exceptions/value-object.exceptions";
import { BusinessImage, ImageCategory } from "./business-image.value-object";

export class BusinessGallery {
  private readonly _images: Map<string, BusinessImage>;

  constructor(images: BusinessImage[] = []) {
    this._images = new Map();

    // Add images with validation
    images.forEach((image) => {
      this.validateImageBeforeAdd(image);
      this._images.set(image.id, image);
    });

    this.validateGalleryRules();
  }

  static create(images: BusinessImage[] = []): BusinessGallery {
    return new BusinessGallery(images);
  }

  static empty(): BusinessGallery {
    return new BusinessGallery([]);
  }

  // Getters
  get images(): BusinessImage[] {
    return Array.from(this._images.values()).sort((a, b) => a.order - b.order);
  }

  get count(): number {
    return this._images.size;
  }

  get publicImages(): BusinessImage[] {
    return this.images.filter((image) => image.isPublic);
  }

  get privateImages(): BusinessImage[] {
    return this.images.filter((image) => !image.isPublic);
  }

  // Business rules methods
  addImage(image: BusinessImage): BusinessGallery {
    this.validateImageBeforeAdd(image);

    // Check maximum images limit
    if (this._images.size >= 20) {
      throw new ValueOutOfRangeError("gallery.size", this._images.size, 0, 19);
    }

    // Check for duplicate URLs
    const existingImage = this.findByUrl(image.url);
    if (existingImage) {
      throw new DuplicateValueError("image.url", image.url);
    }

    const newImages = new Map(this._images);
    newImages.set(image.id, image);

    return new BusinessGallery(Array.from(newImages.values()));
  }

  removeImage(imageId: string): BusinessGallery {
    if (!this._images.has(imageId)) {
      throw new ValueNotFoundError("imageId", imageId);
    }

    const newImages = new Map(this._images);
    newImages.delete(imageId);

    return new BusinessGallery(Array.from(newImages.values()));
  }

  updateImageOrder(imageId: string, newOrder: number): BusinessGallery {
    const image = this._images.get(imageId);
    if (!image) {
      throw new ValueNotFoundError("imageId", imageId);
    }

    if (newOrder < 0) {
      throw new ValueOutOfRangeError(
        "newOrder",
        newOrder,
        0,
        Number.MAX_SAFE_INTEGER,
      );
    }

    // Create new image with updated order
    const updatedImage = BusinessImage.create({
      url: image.url,
      alt: image.alt,
      caption: image.caption,
      category: image.category,
      metadata: image.metadata,
      isPublic: image.isPublic,
      order: newOrder,
    });

    const newImages = new Map(this._images);
    newImages.set(imageId, updatedImage);

    return new BusinessGallery(Array.from(newImages.values()));
  }

  updateImageVisibility(imageId: string, isPublic: boolean): BusinessGallery {
    const image = this._images.get(imageId);
    if (!image) {
      throw new ValueNotFoundError("imageId", imageId);
    }

    // Create new image with updated visibility
    const updatedImage = BusinessImage.create({
      url: image.url,
      alt: image.alt,
      caption: image.caption,
      category: image.category,
      metadata: image.metadata,
      isPublic: isPublic,
      order: image.order,
    });

    const newImages = new Map(this._images);
    newImages.set(imageId, updatedImage);

    return new BusinessGallery(Array.from(newImages.values()));
  }

  updateImageMetadata(
    imageId: string,
    updates: { caption?: string; alt?: string },
  ): BusinessGallery {
    const image = this._images.get(imageId);
    if (!image) {
      throw new ValueNotFoundError("imageId", imageId);
    }

    // Create new image with updated metadata
    const updatedImage = BusinessImage.create({
      url: image.url,
      alt: updates.alt !== undefined ? updates.alt : image.alt,
      caption: updates.caption !== undefined ? updates.caption : image.caption,
      category: image.category,
      metadata: image.metadata,
      isPublic: image.isPublic,
      order: image.order,
    });

    const newImages = new Map(this._images);
    newImages.set(imageId, updatedImage);

    return new BusinessGallery(Array.from(newImages.values()));
  }

  // Query methods
  findById(imageId: string): BusinessImage | undefined {
    return this._images.get(imageId);
  }

  findByUrl(url: string): BusinessImage | undefined {
    return Array.from(this._images.values()).find((image) => image.url === url);
  }

  findByCategory(category: ImageCategory): BusinessImage[] {
    return this.images.filter((image) => image.category === category);
  }

  getLogo(): BusinessImage | undefined {
    const logos = this.findByCategory(ImageCategory.LOGO);
    return logos.length > 0 ? logos[0] : undefined;
  }

  getCoverImage(): BusinessImage | undefined {
    const covers = this.findByCategory(ImageCategory.COVER);
    return covers.length > 0 ? covers[0] : undefined;
  }

  getGalleryImages(): BusinessImage[] {
    return this.findByCategory(ImageCategory.GALLERY);
  }

  getInteriorImages(): BusinessImage[] {
    return this.findByCategory(ImageCategory.INTERIOR);
  }

  getExteriorImages(): BusinessImage[] {
    return this.findByCategory(ImageCategory.EXTERIOR);
  }

  // SEO and optimization methods
  getOptimizedImages(): BusinessImage[] {
    return this.images.filter((image) => image.isOptimizedForWeb());
  }

  getUnoptimizedImages(): BusinessImage[] {
    return this.images.filter((image) => !image.isOptimizedForWeb());
  }

  generateImageSitemap(): Array<{
    url: string;
    caption?: string;
    title: string;
  }> {
    return this.publicImages.map((image) => ({
      url: image.url,
      caption: image.caption,
      title: image.alt,
    }));
  }

  // Statistics
  getStatistics(): {
    total: number;
    public: number;
    private: number;
    byCategory: Record<ImageCategory, number>;
    optimized: number;
    totalSize: number;
  } {
    const byCategory = {} as Record<ImageCategory, number>;

    // Initialize categories
    Object.values(ImageCategory).forEach((category) => {
      byCategory[category] = 0;
    });

    // Count by category and calculate total size
    let totalSize = 0;
    this.images.forEach((image) => {
      byCategory[image.category]++;
      totalSize += image.metadata.size;
    });

    return {
      total: this.count,
      public: this.publicImages.length,
      private: this.privateImages.length,
      byCategory,
      optimized: this.getOptimizedImages().length,
      totalSize,
    };
  }

  // Validation methods
  private validateImageBeforeAdd(image: BusinessImage): void {
    if (!image) {
      throw new RequiredValueError("image");
    }

    if (!image.isOptimizedForWeb()) {
      throw new InvalidValueError(
        "image",
        image,
        "Image must be optimized for web (max 2MB, supported format)",
      );
    }
  }

  private validateGalleryRules(): void {
    const logoImages = this.findByCategory(ImageCategory.LOGO);
    const coverImages = this.findByCategory(ImageCategory.COVER);

    // Business rule: Maximum 1 logo
    if (logoImages.length > 1) {
      throw new ValueOutOfRangeError(
        "logoImages.length",
        logoImages.length,
        0,
        1,
      );
    }

    // Business rule: Maximum 1 cover image
    if (coverImages.length > 1) {
      throw new ValueOutOfRangeError(
        "coverImages.length",
        coverImages.length,
        0,
        1,
      );
    }

    // Business rule: Check for unique orders within categories
    const categoryOrders = new Map<ImageCategory, Set<number>>();

    this.images.forEach((image) => {
      if (!categoryOrders.has(image.category)) {
        categoryOrders.set(image.category, new Set());
      }

      const orders = categoryOrders.get(image.category)!;
      if (orders.has(image.order)) {
        throw new DuplicateValueError(
          `image.order.${image.category}`,
          image.order,
        );
      }

      orders.add(image.order);
    });
  }

  // Equality
  equals(other: BusinessGallery): boolean {
    if (this.count !== other.count) {
      return false;
    }

    return this.images.every((image) => {
      const otherImage = other.findById(image.id);
      return otherImage && image.equals(otherImage);
    });
  }

  toString(): string {
    return `BusinessGallery(${this.count} images)`;
  }
}
