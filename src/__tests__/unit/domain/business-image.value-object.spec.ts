/**
 * 🧪 BUSINESS IMAGE VALUE OBJECT - TESTS
 * ✅ TDD approach - Tests written FIRST
 * ✅ AWS S3 signed URLs integration
 */

import {
  BusinessImage,
  ImageCategory,
} from "@domain/value-objects/business-image.value-object";

describe("BusinessImage Value Object", () => {
  describe("🔴 RED - Creation and Validation", () => {
    it("should create a valid business image with AWS S3 URL", () => {
      // Given
      const imageData = {
        url: "https://business-images.s3.eu-west-1.amazonaws.com/business-123/logo.jpg",
        alt: "Logo du Cabinet Médical Centre Ville",
        category: ImageCategory.LOGO,
        metadata: {
          size: 1048576, // 1MB
          format: "jpg",
          dimensions: { width: 400, height: 300 },
          uploadedAt: new Date("2024-01-15T10:30:00Z"),
        },
      };

      // When
      const image = BusinessImage.create(imageData);

      // Then
      expect(image.id).toBeDefined();
      expect(image.url).toBe(imageData.url);
      expect(image.alt).toBe(imageData.alt);
      expect(image.category).toBe(ImageCategory.LOGO);
      expect(image.isPublic).toBe(true); // Default
      expect(image.order).toBe(0); // Default
    });

    it("should throw error for empty URL", () => {
      // Given
      const invalidData = {
        url: "",
        alt: "Valid alt text",
        category: ImageCategory.GALLERY,
        metadata: {
          size: 1048576,
          format: "jpg",
          dimensions: { width: 400, height: 300 },
          uploadedAt: new Date(),
        },
      };

      // When & Then
      expect(() => BusinessImage.create(invalidData)).toThrow(
        "Image URL cannot be empty",
      );
    });

    it("should throw error for invalid URL format", () => {
      // Given
      const invalidData = {
        url: "not-a-valid-url",
        alt: "Valid alt text",
        category: ImageCategory.GALLERY,
        metadata: {
          size: 1048576,
          format: "jpg",
          dimensions: { width: 400, height: 300 },
          uploadedAt: new Date(),
        },
      };

      // When & Then
      expect(() => BusinessImage.create(invalidData)).toThrow(
        "Invalid image URL format",
      );
    });

    it("should throw error for empty alt text", () => {
      // Given
      const invalidData = {
        url: "https://valid-url.com/image.jpg",
        alt: "",
        category: ImageCategory.GALLERY,
        metadata: {
          size: 1048576,
          format: "jpg",
          dimensions: { width: 400, height: 300 },
          uploadedAt: new Date(),
        },
      };

      // When & Then
      expect(() => BusinessImage.create(invalidData)).toThrow(
        "Alt text is required for accessibility",
      );
    });

    it("should throw error for alt text too long", () => {
      // Given
      const longAlt = "a".repeat(201); // 201 characters
      const invalidData = {
        url: "https://valid-url.com/image.jpg",
        alt: longAlt,
        category: ImageCategory.GALLERY,
        metadata: {
          size: 1048576,
          format: "jpg",
          dimensions: { width: 400, height: 300 },
          uploadedAt: new Date(),
        },
      };

      // When & Then
      expect(() => BusinessImage.create(invalidData)).toThrow(
        "Alt text must be less than 200 characters",
      );
    });

    it("should throw error for negative order", () => {
      // Given
      const invalidData = {
        url: "https://valid-url.com/image.jpg",
        alt: "Valid alt text",
        category: ImageCategory.GALLERY,
        order: -1,
        metadata: {
          size: 1048576,
          format: "jpg",
          dimensions: { width: 400, height: 300 },
          uploadedAt: new Date(),
        },
      };

      // When & Then
      expect(() => BusinessImage.create(invalidData)).toThrow(
        "Image order must be non-negative",
      );
    });
  });

  describe("🔴 RED - Business Rules", () => {
    it("should validate web optimization rules", () => {
      // Given - Unoptimized image (> 2MB)
      const largeImageData = {
        url: "https://business-images.s3.eu-west-1.amazonaws.com/business-123/large.jpg",
        alt: "Large unoptimized image",
        category: ImageCategory.GALLERY,
        metadata: {
          size: 3 * 1024 * 1024, // 3MB - over limit
          format: "jpg",
          dimensions: { width: 4000, height: 3000 },
          uploadedAt: new Date(),
        },
      };

      // When
      const image = BusinessImage.create(largeImageData);

      // Then
      expect(image.isOptimizedForWeb()).toBe(false);
    });

    it("should validate supported formats", () => {
      // Given - Unsupported format
      const unsupportedFormatData = {
        url: "https://business-images.s3.eu-west-1.amazonaws.com/business-123/image.bmp",
        alt: "Image with unsupported format",
        category: ImageCategory.GALLERY,
        metadata: {
          size: 1048576,
          format: "bmp", // Unsupported
          dimensions: { width: 400, height: 300 },
          uploadedAt: new Date(),
        },
      };

      // When
      const image = BusinessImage.create(unsupportedFormatData);

      // Then
      expect(image.isOptimizedForWeb()).toBe(false);
    });

    it("should identify logo images correctly", () => {
      // Given
      const logoData = {
        url: "https://business-images.s3.eu-west-1.amazonaws.com/business-123/logo.png",
        alt: "Company logo",
        category: ImageCategory.LOGO,
        metadata: {
          size: 512000,
          format: "png",
          dimensions: { width: 200, height: 200 },
          uploadedAt: new Date(),
        },
      };

      // When
      const image = BusinessImage.create(logoData);

      // Then
      expect(image.isLogo()).toBe(true);
      expect(image.isCoverImage()).toBe(false);
    });

    it("should identify cover images correctly", () => {
      // Given
      const coverData = {
        url: "https://business-images.s3.eu-west-1.amazonaws.com/business-123/cover.jpg",
        alt: "Business cover image",
        category: ImageCategory.COVER,
        metadata: {
          size: 1048576,
          format: "jpg",
          dimensions: { width: 1200, height: 600 },
          uploadedAt: new Date(),
        },
      };

      // When
      const image = BusinessImage.create(coverData);

      // Then
      expect(image.isCoverImage()).toBe(true);
      expect(image.isLogo()).toBe(false);
    });
  });

  describe("🔴 RED - AWS S3 Signed URLs", () => {
    it("should generate thumbnail URL for S3 images", () => {
      // Given
      const s3ImageData = {
        url: "https://business-images.s3.eu-west-1.amazonaws.com/business-123/gallery/image-001.jpg",
        alt: "Gallery image",
        category: ImageCategory.GALLERY,
        metadata: {
          size: 1048576,
          format: "jpg",
          dimensions: { width: 800, height: 600 },
          uploadedAt: new Date(),
        },
      };

      // When
      const image = BusinessImage.create(s3ImageData);
      const thumbnailUrl = image.generateThumbnailUrl();

      // Then
      expect(thumbnailUrl).toBe(
        "https://business-images.s3.eu-west-1.amazonaws.com/business-123/gallery/image-001_thumb.jpg",
      );
    });

    it("should generate responsive URLs for different sizes", () => {
      // Given
      const s3ImageData = {
        url: "https://business-images.s3.eu-west-1.amazonaws.com/business-123/services/service-photo.webp",
        alt: "Service photo",
        category: ImageCategory.SERVICES,
        metadata: {
          size: 800000,
          format: "webp",
          dimensions: { width: 1200, height: 800 },
          uploadedAt: new Date(),
        },
      };

      // When
      const image = BusinessImage.create(s3ImageData);
      const responsiveUrls = image.getResponsiveUrls();

      // Then
      expect(responsiveUrls).toEqual({
        small:
          "https://business-images.s3.eu-west-1.amazonaws.com/business-123/services/service-photo_small.webp",
        medium:
          "https://business-images.s3.eu-west-1.amazonaws.com/business-123/services/service-photo_medium.webp",
        large:
          "https://business-images.s3.eu-west-1.amazonaws.com/business-123/services/service-photo_large.webp",
        original:
          "https://business-images.s3.eu-west-1.amazonaws.com/business-123/services/service-photo.webp",
      });
    });

    it("should handle non-S3 URLs gracefully", () => {
      // Given
      const externalImageData = {
        url: "https://external-cdn.com/images/fallback.jpg",
        alt: "External image",
        category: ImageCategory.GALLERY,
        metadata: {
          size: 1048576,
          format: "jpg",
          dimensions: { width: 400, height: 300 },
          uploadedAt: new Date(),
        },
      };

      // When
      const image = BusinessImage.create(externalImageData);
      const thumbnailUrl = image.generateThumbnailUrl();

      // Then
      expect(thumbnailUrl).toBe(
        "https://external-cdn.com/images/fallback_thumb.jpg",
      );
    });
  });

  describe("🔴 RED - Equality and Serialization", () => {
    it("should compare images correctly by ID", () => {
      // Given
      const imageData = {
        url: "https://business-images.s3.eu-west-1.amazonaws.com/business-123/test.jpg",
        alt: "Test image",
        category: ImageCategory.GALLERY,
        metadata: {
          size: 1048576,
          format: "jpg",
          dimensions: { width: 400, height: 300 },
          uploadedAt: new Date(),
        },
      };

      // When
      const image1 = BusinessImage.create(imageData);
      const image2 = BusinessImage.create(imageData);

      // Then
      expect(image1.equals(image2)).toBe(false); // Different IDs
      expect(image1.equals(image1)).toBe(true); // Same instance
    });

    it("should provide meaningful string representation", () => {
      // Given
      const imageData = {
        url: "https://business-images.s3.eu-west-1.amazonaws.com/business-123/logo.png",
        alt: "Company logo",
        category: ImageCategory.LOGO,
        metadata: {
          size: 512000,
          format: "png",
          dimensions: { width: 200, height: 200 },
          uploadedAt: new Date(),
        },
      };

      // When
      const image = BusinessImage.create(imageData);
      const stringRepresentation = image.toString();

      // Then
      expect(stringRepresentation).toContain("BusinessImage");
      expect(stringRepresentation).toContain(image.id);
      expect(stringRepresentation).toContain("LOGO");
      expect(stringRepresentation).toContain("s3.eu-west-1.amazonaws.com");
    });
  });
});
