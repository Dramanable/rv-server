/**
 * 📷 BUSINESS IMAGE VALUE OBJECT
 * ✅ Clean Architecture compliant
 * ✅ Immutable value object for business image management
 */

import { ValueObjectValidationError } from "../exceptions/domain.exceptions";

export enum ImageCategory {
  LOGO = "LOGO",
  COVER = "COVER",
  INTERIOR = "INTERIOR",
  EXTERIOR = "EXTERIOR",
  STAFF = "STAFF",
  EQUIPMENT = "EQUIPMENT",
  SERVICES = "SERVICES",
  GALLERY = "GALLERY",
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageMetadata {
  size: number; // bytes
  format: string; // jpg, png, webp
  dimensions: ImageDimensions;
  uploadedAt: Date;
}

export class BusinessImage {
  constructor(
    private readonly _id: string,
    private readonly _url: string,
    private readonly _alt: string,
    private readonly _caption: string | undefined,
    private readonly _category: ImageCategory,
    private readonly _metadata: ImageMetadata,
    private readonly _isPublic: boolean,
    private readonly _order: number,
  ) {
    this.validateUrl();
    this.validateAlt();
    this.validateOrder();
  }

  static create(data: {
    url: string;
    alt: string;
    caption?: string;
    category: ImageCategory;
    metadata: ImageMetadata;
    isPublic?: boolean;
    order?: number;
  }): BusinessImage {
    return new BusinessImage(
      crypto.randomUUID(),
      data.url,
      data.alt,
      data.caption,
      data.category,
      data.metadata,
      data.isPublic ?? true,
      data.order ?? 0,
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get url(): string {
    return this._url;
  }

  get alt(): string {
    return this._alt;
  }

  get caption(): string | undefined {
    return this._caption;
  }

  get category(): ImageCategory {
    return this._category;
  }

  get metadata(): ImageMetadata {
    return this._metadata;
  }

  get isPublic(): boolean {
    return this._isPublic;
  }

  get order(): number {
    return this._order;
  }

  // Business rules
  isOptimizedForWeb(): boolean {
    const maxSize = 2 * 1024 * 1024; // 2MB
    const supportedFormats = ["jpg", "jpeg", "png", "webp"];

    return (
      this._metadata.size <= maxSize &&
      supportedFormats.includes(this._metadata.format.toLowerCase())
    );
  }

  isCoverImage(): boolean {
    return this._category === ImageCategory.COVER;
  }

  isLogo(): boolean {
    return this._category === ImageCategory.LOGO;
  }

  generateThumbnailUrl(): string {
    // Simple thumbnail generation logic
    const urlParts = this._url.split(".");
    const extension = urlParts.pop();
    const baseName = urlParts.join(".");

    return `${baseName}_thumb.${extension}`;
  }

  getResponsiveUrls(): {
    small: string;
    medium: string;
    large: string;
    original: string;
  } {
    const urlParts = this._url.split(".");
    const extension = urlParts.pop();
    const baseName = urlParts.join(".");

    return {
      small: `${baseName}_small.${extension}`,
      medium: `${baseName}_medium.${extension}`,
      large: `${baseName}_large.${extension}`,
      original: this._url,
    };
  }

  // Validation methods
  private validateUrl(): void {
    if (!this._url || this._url.trim().length === 0) {
      throw new ValueObjectValidationError(
        "BUSINESS_IMAGE_URL_EMPTY",
        "Image URL cannot be empty",
        { url: this._url },
      );
    }

    try {
      new URL(this._url);
    } catch {
      throw new ValueObjectValidationError(
        "BUSINESS_IMAGE_URL_INVALID",
        "Invalid image URL format",
        { url: this._url },
      );
    }
  }

  private validateAlt(): void {
    if (!this._alt || this._alt.trim().length === 0) {
      throw new ValueObjectValidationError(
        "BUSINESS_IMAGE_ALT_REQUIRED",
        "Alt text is required for accessibility",
        { alt: this._alt },
      );
    }

    if (this._alt.length > 200) {
      throw new ValueObjectValidationError(
        "BUSINESS_IMAGE_ALT_TOO_LONG",
        "Alt text must be less than 200 characters",
        { alt: this._alt, length: this._alt.length },
      );
    }
  }

  private validateOrder(): void {
    if (this._order < 0) {
      throw new ValueObjectValidationError(
        "BUSINESS_IMAGE_ORDER_NEGATIVE",
        "Image order must be non-negative",
        { order: this._order },
      );
    }
  }

  // Equality
  equals(other: BusinessImage): boolean {
    return this._id === other._id;
  }

  toString(): string {
    return `BusinessImage(${this._id}, ${this._category}, ${this._url})`;
  }
}
