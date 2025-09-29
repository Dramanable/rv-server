/**
 * 🔧 IMAGE UPLOAD SETTINGS VALUE OBJECT
 * ✅ Configuration admin pour gestion images
 * ✅ Validation policies par catégorie
 * ✅ Quota management par business
 * ✅ TDD Implementation - GREEN phase
 */

import { ValueObjectValidationError } from '../exceptions/domain.exceptions';

export enum ImageFormat {
  JPEG = 'JPEG',
  PNG = 'PNG',
  WEBP = 'WEBP',
  GIF = 'GIF',
}

export interface ImagePolicy {
  readonly category: string;
  readonly maxSize: number; // bytes
  readonly requiredDimensions?: {
    readonly width: number;
    readonly height: number;
  };
  readonly allowedFormats: ImageFormat[];
}

export interface ImageValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
}

export interface ImageUploadSettingsData {
  readonly maxFileSize: number;
  readonly allowedFormats: ImageFormat[];
  readonly maxImagesPerBusiness: number;
  readonly requiresModeration?: boolean;
  readonly autoOptimize?: boolean;
  readonly policies?: ImagePolicy[];
}

export class ImageUploadSettings {
  private readonly _maxFileSize: number;
  private readonly _allowedFormats: ImageFormat[];
  private readonly _maxImagesPerBusiness: number;
  private readonly _requiresModeration: boolean;
  private readonly _autoOptimize: boolean;
  private readonly _policies: ImagePolicy[];

  private constructor(data: ImageUploadSettingsData) {
    // Validation
    if (data.maxFileSize <= 0) {
      throw new ValueObjectValidationError(
        'IMAGE_MAX_FILE_SIZE_INVALID',
        'Max file size must be positive',
        { maxFileSize: data.maxFileSize },
      );
    }

    if (data.allowedFormats.length === 0) {
      throw new ValueObjectValidationError(
        'IMAGE_ALLOWED_FORMATS_EMPTY',
        'At least one image format must be allowed',
        { allowedFormats: data.allowedFormats },
      );
    }

    if (data.maxImagesPerBusiness < 1) {
      throw new ValueObjectValidationError(
        'IMAGE_MAX_IMAGES_INVALID',
        'Max images per business must be at least 1',
        { maxImagesPerBusiness: data.maxImagesPerBusiness },
      );
    }

    this._maxFileSize = data.maxFileSize;
    this._allowedFormats = [...data.allowedFormats];
    this._maxImagesPerBusiness = data.maxImagesPerBusiness;
    this._requiresModeration = data.requiresModeration ?? false;
    this._autoOptimize = data.autoOptimize ?? true;
    this._policies = data.policies ? [...data.policies] : [];
  }

  static createDefault(): ImageUploadSettings {
    return new ImageUploadSettings({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: [ImageFormat.JPEG, ImageFormat.PNG, ImageFormat.WEBP],
      maxImagesPerBusiness: 20,
      requiresModeration: false,
      autoOptimize: true,
    });
  }

  static create(data: ImageUploadSettingsData): ImageUploadSettings {
    return new ImageUploadSettings(data);
  }

  // Getters
  get maxFileSize(): number {
    return this._maxFileSize;
  }

  get allowedFormats(): ImageFormat[] {
    return [...this._allowedFormats];
  }

  get maxImagesPerBusiness(): number {
    return this._maxImagesPerBusiness;
  }

  get requiresModeration(): boolean {
    return this._requiresModeration;
  }

  get autoOptimize(): boolean {
    return this._autoOptimize;
  }

  get policies(): ImagePolicy[] {
    return [...this._policies];
  }

  // Validation Methods
  validateImage(imageData: {
    size: number;
    format: string;
    dimensions: { width: number; height: number };
    category?: string;
  }): ImageValidationResult {
    const errors: string[] = [];

    // Check file size
    if (imageData.size > this._maxFileSize) {
      const maxSizeMB = Math.round(this._maxFileSize / (1024 * 1024));
      errors.push(`File size exceeds maximum allowed (${maxSizeMB}MB)`);
    }

    // Check format - Fix: normalize format for comparison
    const formatNormalized = imageData.format.toLowerCase();
    const normalizedAllowedFormats = this._allowedFormats.map((f) =>
      f.toLowerCase(),
    );

    if (!normalizedAllowedFormats.includes(formatNormalized)) {
      errors.push(`Image format ${imageData.format} is not supported`);
    }

    // Check category-specific policies
    if (imageData.category) {
      const policy = this._policies.find(
        (p) => p.category === imageData.category,
      );
      if (policy) {
        const policyValidation = this.validateAgainstPolicy(imageData, policy);
        errors.push(...policyValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateAgainstPolicy(
    imageData: {
      size: number;
      format: string;
      dimensions: { width: number; height: number };
    },
    policy: ImagePolicy,
  ): ImageValidationResult {
    const errors: string[] = [];

    // Check policy-specific size limit
    if (imageData.size > policy.maxSize) {
      errors.push(`${policy.category} images exceed maximum size`);
    }

    // Check required dimensions
    if (policy.requiredDimensions) {
      if (
        imageData.dimensions.width !== policy.requiredDimensions.width ||
        imageData.dimensions.height !== policy.requiredDimensions.height
      ) {
        errors.push(
          `${policy.category} images must be exactly ${policy.requiredDimensions.width}x${policy.requiredDimensions.height} pixels`,
        );
      }
    }

    // Check policy-specific formats
    const formatNormalized = imageData.format.toLowerCase();
    const policyFormatsNormalized = policy.allowedFormats.map((f) =>
      f.toLowerCase(),
    );

    if (!policyFormatsNormalized.includes(formatNormalized)) {
      if (policy.category === 'LOGO') {
        errors.push('Logo images must be in PNG format');
      } else {
        errors.push(`${policy.category} images must use allowed formats`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Quota Management
  canBusinessAddMoreImages(currentImageCount: number): boolean {
    return currentImageCount < this._maxImagesPerBusiness;
  }

  getRemainingQuota(currentImageCount: number): number {
    return Math.max(0, this._maxImagesPerBusiness - currentImageCount);
  }

  // Admin Configuration Updates (immutable)
  updateMaxFileSize(newMaxSize: number): ImageUploadSettings {
    return new ImageUploadSettings({
      maxFileSize: newMaxSize,
      allowedFormats: this._allowedFormats,
      maxImagesPerBusiness: this._maxImagesPerBusiness,
      requiresModeration: this._requiresModeration,
      autoOptimize: this._autoOptimize,
      policies: this._policies,
    });
  }

  updateAllowedFormats(newFormats: ImageFormat[]): ImageUploadSettings {
    return new ImageUploadSettings({
      maxFileSize: this._maxFileSize,
      allowedFormats: newFormats,
      maxImagesPerBusiness: this._maxImagesPerBusiness,
      requiresModeration: this._requiresModeration,
      autoOptimize: this._autoOptimize,
      policies: this._policies,
    });
  }

  updateMaxImagesPerBusiness(newMaxImages: number): ImageUploadSettings {
    return new ImageUploadSettings({
      maxFileSize: this._maxFileSize,
      allowedFormats: this._allowedFormats,
      maxImagesPerBusiness: newMaxImages,
      requiresModeration: this._requiresModeration,
      autoOptimize: this._autoOptimize,
      policies: this._policies,
    });
  }

  enableModeration(): ImageUploadSettings {
    return new ImageUploadSettings({
      maxFileSize: this._maxFileSize,
      allowedFormats: this._allowedFormats,
      maxImagesPerBusiness: this._maxImagesPerBusiness,
      requiresModeration: true,
      autoOptimize: this._autoOptimize,
      policies: this._policies,
    });
  }

  disableModeration(): ImageUploadSettings {
    return new ImageUploadSettings({
      maxFileSize: this._maxFileSize,
      allowedFormats: this._allowedFormats,
      maxImagesPerBusiness: this._maxImagesPerBusiness,
      requiresModeration: false,
      autoOptimize: this._autoOptimize,
      policies: this._policies,
    });
  }

  addPolicy(policy: ImagePolicy): ImageUploadSettings {
    return new ImageUploadSettings({
      maxFileSize: this._maxFileSize,
      allowedFormats: this._allowedFormats,
      maxImagesPerBusiness: this._maxImagesPerBusiness,
      requiresModeration: this._requiresModeration,
      autoOptimize: this._autoOptimize,
      policies: [...this._policies, policy],
    });
  }

  // Serialization
  toJSON(): any {
    return {
      maxFileSize: this._maxFileSize,
      allowedFormats: this._allowedFormats,
      maxImagesPerBusiness: this._maxImagesPerBusiness,
      requiresModeration: this._requiresModeration,
      autoOptimize: this._autoOptimize,
      policies: this._policies,
    };
  }

  static fromJSON(json: any): ImageUploadSettings {
    return new ImageUploadSettings({
      maxFileSize: json.maxFileSize,
      allowedFormats: json.allowedFormats.map((f: string) => f as ImageFormat),
      maxImagesPerBusiness: json.maxImagesPerBusiness,
      requiresModeration: json.requiresModeration,
      autoOptimize: json.autoOptimize,
      policies: json.policies || [],
    });
  }
}
