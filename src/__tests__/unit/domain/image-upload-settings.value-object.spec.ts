/**
 * 🧪 IMAGE UPLOAD SETTINGS VALUE OBJECT - TESTS
 * ✅ TDD approach - Tests written FIRST
 * ✅ Admin-configurable image policies
 */

import {
  ImageUploadSettings,
  ImageFormat,
  ImagePolicy,
} from '../../../domain/value-objects/image-upload-settings.value-object';

describe('ImageUploadSettings Value Object', () => {
  describe('🔴 RED - Creation and Validation', () => {
    it('should create default image upload settings', () => {
      // When
      const settings = ImageUploadSettings.createDefault();

      // Then
      expect(settings.maxFileSize).toBe(5 * 1024 * 1024); // 5MB default
      expect(settings.allowedFormats).toEqual([
        ImageFormat.JPEG,
        ImageFormat.PNG,
        ImageFormat.WEBP,
      ]);
      expect(settings.maxImagesPerBusiness).toBe(20);
      expect(settings.requiresModeration).toBe(false);
      expect(settings.autoOptimize).toBe(true);
    });

    it('should create custom image upload settings', () => {
      // Given
      const customSettings = {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFormats: [ImageFormat.JPEG, ImageFormat.PNG],
        maxImagesPerBusiness: 50,
        requiresModeration: true,
        autoOptimize: false,
        policies: [
          {
            category: 'LOGO',
            maxSize: 2 * 1024 * 1024, // 2MB for logos
            requiredDimensions: { width: 200, height: 200 },
            allowedFormats: [ImageFormat.PNG],
          },
        ],
      };

      // When
      const settings = ImageUploadSettings.create(customSettings);

      // Then
      expect(settings.maxFileSize).toBe(10 * 1024 * 1024);
      expect(settings.allowedFormats).toEqual([
        ImageFormat.JPEG,
        ImageFormat.PNG,
      ]);
      expect(settings.maxImagesPerBusiness).toBe(50);
      expect(settings.requiresModeration).toBe(true);
      expect(settings.autoOptimize).toBe(false);
      expect(settings.policies).toHaveLength(1);
    });

    it('should throw error for invalid max file size', () => {
      // Given
      const invalidSettings = {
        maxFileSize: -1,
        allowedFormats: [ImageFormat.JPEG],
        maxImagesPerBusiness: 10,
      };

      // When & Then
      expect(() => ImageUploadSettings.create(invalidSettings)).toThrow(
        'Max file size must be positive',
      );
    });

    it('should throw error for empty allowed formats', () => {
      // Given
      const invalidSettings = {
        maxFileSize: 5 * 1024 * 1024,
        allowedFormats: [],
        maxImagesPerBusiness: 10,
      };

      // When & Then
      expect(() => ImageUploadSettings.create(invalidSettings)).toThrow(
        'At least one image format must be allowed',
      );
    });

    it('should throw error for invalid max images per business', () => {
      // Given
      const invalidSettings = {
        maxFileSize: 5 * 1024 * 1024,
        allowedFormats: [ImageFormat.JPEG],
        maxImagesPerBusiness: 0,
      };

      // When & Then
      expect(() => ImageUploadSettings.create(invalidSettings)).toThrow(
        'Max images per business must be at least 1',
      );
    });
  });

  describe('🔴 RED - Image Validation Business Rules', () => {
    it('should validate image against general settings', () => {
      // Given
      const settings = ImageUploadSettings.createDefault();
      const validImage = {
        size: 2 * 1024 * 1024, // 2MB
        format: 'jpg',
        dimensions: { width: 800, height: 600 },
      };

      // When
      const isValid = settings.validateImage(validImage);

      // Then
      expect(isValid.isValid).toBe(true);
      expect(isValid.errors).toHaveLength(0);
    });

    it('should reject image that exceeds max file size', () => {
      // Given
      const settings = ImageUploadSettings.createDefault(); // 5MB max
      const oversizedImage = {
        size: 10 * 1024 * 1024, // 10MB
        format: 'jpg',
        dimensions: { width: 800, height: 600 },
      };

      // When
      const validation = settings.validateImage(oversizedImage);

      // Then
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'File size exceeds maximum allowed (5MB)',
      );
    });

    it('should reject image with unsupported format', () => {
      // Given
      const settings = ImageUploadSettings.create({
        maxFileSize: 5 * 1024 * 1024,
        allowedFormats: [ImageFormat.JPEG, ImageFormat.PNG],
        maxImagesPerBusiness: 20,
      });
      const unsupportedImage = {
        size: 1 * 1024 * 1024,
        format: 'gif', // Not in allowed formats
        dimensions: { width: 400, height: 300 },
      };

      // When
      const validation = settings.validateImage(unsupportedImage);

      // Then
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Image format gif is not supported');
    });

    it('should validate image against category-specific policy', () => {
      // Given
      const settings = ImageUploadSettings.create({
        maxFileSize: 5 * 1024 * 1024,
        allowedFormats: [ImageFormat.JPEG, ImageFormat.PNG],
        maxImagesPerBusiness: 20,
        policies: [
          {
            category: 'LOGO',
            maxSize: 1 * 1024 * 1024, // 1MB for logos
            requiredDimensions: { width: 200, height: 200 },
            allowedFormats: [ImageFormat.PNG],
          },
        ],
      });
      const logoImage = {
        size: 512 * 1024, // 512KB
        format: 'png',
        dimensions: { width: 200, height: 200 },
        category: 'LOGO',
      };

      // When
      const validation = settings.validateImage(logoImage);

      // Then
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject logo image that violates policy dimensions', () => {
      // Given
      const settings = ImageUploadSettings.create({
        maxFileSize: 5 * 1024 * 1024,
        allowedFormats: [ImageFormat.JPEG, ImageFormat.PNG],
        maxImagesPerBusiness: 20,
        policies: [
          {
            category: 'LOGO',
            maxSize: 1 * 1024 * 1024,
            requiredDimensions: { width: 200, height: 200 },
            allowedFormats: [ImageFormat.PNG],
          },
        ],
      });
      const invalidLogoImage = {
        size: 512 * 1024,
        format: 'png',
        dimensions: { width: 300, height: 200 }, // Wrong dimensions
        category: 'LOGO',
      };

      // When
      const validation = settings.validateImage(invalidLogoImage);

      // Then
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'Logo images must be exactly 200x200 pixels',
      );
    });

    it('should reject logo image with wrong format policy', () => {
      // Given
      const settings = ImageUploadSettings.create({
        maxFileSize: 5 * 1024 * 1024,
        allowedFormats: [ImageFormat.JPEG, ImageFormat.PNG],
        maxImagesPerBusiness: 20,
        policies: [
          {
            category: 'LOGO',
            maxSize: 1 * 1024 * 1024,
            requiredDimensions: { width: 200, height: 200 },
            allowedFormats: [ImageFormat.PNG],
          },
        ],
      });
      const invalidLogoImage = {
        size: 512 * 1024,
        format: 'jpg', // Should be PNG for logos
        dimensions: { width: 200, height: 200 },
        category: 'LOGO',
      };

      // When
      const validation = settings.validateImage(invalidLogoImage);

      // Then
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Logo images must be in PNG format');
    });
  });

  describe('🔴 RED - Business Quota Management', () => {
    it('should check if business can add more images', () => {
      // Given
      const settings = ImageUploadSettings.create({
        maxFileSize: 5 * 1024 * 1024,
        allowedFormats: [ImageFormat.JPEG],
        maxImagesPerBusiness: 10,
      });
      const currentImageCount = 7;

      // When
      const canAddMore = settings.canBusinessAddMoreImages(currentImageCount);

      // Then
      expect(canAddMore).toBe(true);
    });

    it('should prevent adding images when quota is reached', () => {
      // Given
      const settings = ImageUploadSettings.create({
        maxFileSize: 5 * 1024 * 1024,
        allowedFormats: [ImageFormat.JPEG],
        maxImagesPerBusiness: 10,
      });
      const currentImageCount = 10; // At limit

      // When
      const canAddMore = settings.canBusinessAddMoreImages(currentImageCount);

      // Then
      expect(canAddMore).toBe(false);
    });

    it('should calculate remaining image quota', () => {
      // Given
      const settings = ImageUploadSettings.create({
        maxFileSize: 5 * 1024 * 1024,
        allowedFormats: [ImageFormat.JPEG],
        maxImagesPerBusiness: 15,
      });
      const currentImageCount = 8;

      // When
      const remaining = settings.getRemainingQuota(currentImageCount);

      // Then
      expect(remaining).toBe(7); // 15 - 8 = 7
    });
  });

  describe('🔴 RED - Admin Configuration Updates', () => {
    it('should update max file size setting', () => {
      // Given
      const settings = ImageUploadSettings.createDefault();
      const newMaxSize = 10 * 1024 * 1024; // 10MB

      // When
      const updatedSettings = settings.updateMaxFileSize(newMaxSize);

      // Then
      expect(updatedSettings.maxFileSize).toBe(newMaxSize);
      expect(updatedSettings.allowedFormats).toEqual(settings.allowedFormats); // Unchanged
    });

    it('should update allowed formats setting', () => {
      // Given
      const settings = ImageUploadSettings.createDefault();
      const newFormats = [ImageFormat.WEBP, ImageFormat.PNG];

      // When
      const updatedSettings = settings.updateAllowedFormats(newFormats);

      // Then
      expect(updatedSettings.allowedFormats).toEqual(newFormats);
      expect(updatedSettings.maxFileSize).toBe(settings.maxFileSize); // Unchanged
    });

    it('should update max images per business setting', () => {
      // Given
      const settings = ImageUploadSettings.createDefault();
      const newMaxImages = 100;

      // When
      const updatedSettings = settings.updateMaxImagesPerBusiness(newMaxImages);

      // Then
      expect(updatedSettings.maxImagesPerBusiness).toBe(newMaxImages);
    });

    it('should toggle moderation requirement', () => {
      // Given
      const settings = ImageUploadSettings.createDefault(); // Default: false

      // When
      const withModeration = settings.enableModeration();
      const withoutModeration = withModeration.disableModeration();

      // Then
      expect(withModeration.requiresModeration).toBe(true);
      expect(withoutModeration.requiresModeration).toBe(false);
    });

    it('should add category-specific policy', () => {
      // Given
      const settings = ImageUploadSettings.createDefault();
      const coverPolicy: ImagePolicy = {
        category: 'COVER',
        maxSize: 3 * 1024 * 1024, // 3MB for covers
        requiredDimensions: { width: 1200, height: 600 },
        allowedFormats: [ImageFormat.JPEG, ImageFormat.WEBP],
      };

      // When
      const updatedSettings = settings.addPolicy(coverPolicy);

      // Then
      expect(updatedSettings.policies).toHaveLength(1);
      expect(updatedSettings.policies[0]).toEqual(coverPolicy);
    });
  });

  describe('🔴 RED - Serialization and Export', () => {
    it('should serialize to JSON correctly', () => {
      // Given
      const settings = ImageUploadSettings.create({
        maxFileSize: 8 * 1024 * 1024,
        allowedFormats: [ImageFormat.JPEG, ImageFormat.PNG],
        maxImagesPerBusiness: 30,
        requiresModeration: true,
        autoOptimize: false,
      });

      // When
      const json = settings.toJSON();

      // Then
      expect(json).toMatchObject({
        maxFileSize: 8 * 1024 * 1024,
        allowedFormats: ['JPEG', 'PNG'],
        maxImagesPerBusiness: 30,
        requiresModeration: true,
        autoOptimize: false,
        policies: [],
      });
    });

    it('should create from JSON correctly', () => {
      // Given
      const json = {
        maxFileSize: 8 * 1024 * 1024,
        allowedFormats: ['JPEG', 'PNG'],
        maxImagesPerBusiness: 30,
        requiresModeration: true,
        autoOptimize: false,
        policies: [
          {
            category: 'LOGO',
            maxSize: 1 * 1024 * 1024,
            requiredDimensions: { width: 200, height: 200 },
            allowedFormats: ['PNG'],
          },
        ],
      };

      // When
      const settings = ImageUploadSettings.fromJSON(json);

      // Then
      expect(settings.maxFileSize).toBe(8 * 1024 * 1024);
      expect(settings.allowedFormats).toEqual([
        ImageFormat.JPEG,
        ImageFormat.PNG,
      ]);
      expect(settings.requiresModeration).toBe(true);
      expect(settings.policies).toHaveLength(1);
    });
  });
});
