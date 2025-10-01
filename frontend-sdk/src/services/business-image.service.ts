/**
 * 📷 RV Project Frontend SDK - Service de Gestion des Images
 *
 * Gestion des images d'entreprise (logo, bannière, etc.)
 */

import { RVProjectClient } from '../client';

export enum BusinessImageType {
  LOGO = 'LOGO',
  BANNER = 'BANNER',
  AVATAR = 'AVATAR',
  COVER = 'COVER',
  BACKGROUND = 'BACKGROUND',
  ICON = 'ICON',
  THUMBNAIL = 'THUMBNAIL',
}

export enum ImageProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface BusinessImage {
  readonly id: string;
  readonly businessId: string;
  readonly type: BusinessImageType;
  readonly filename: string;
  readonly originalName: string;
  readonly url: string;
  readonly thumbnailUrl?: string;
  readonly alt?: string;
  readonly width?: number;
  readonly height?: number;
  readonly size: number;
  readonly mimeType: string;
  readonly processingStatus: ImageProcessingStatus;
  readonly isActive: boolean;
  readonly uploadedAt: string;
  readonly uploadedBy: string;
}

export interface UploadBusinessImageRequest {
  readonly businessId: string;
  readonly type: BusinessImageType;
  readonly file: File;
  readonly alt?: string;
  readonly replaceExisting?: boolean;
}

export interface UpdateBusinessImageRequest {
  readonly alt?: string;
  readonly isActive?: boolean;
}

export interface ImageProcessingOptions {
  readonly resize?: {
    width: number;
    height: number;
    maintainAspectRatio?: boolean;
  };
  readonly crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  readonly quality?: number;
  readonly format?: 'jpeg' | 'png' | 'webp';
}

export class BusinessImageService {
  constructor(private client: RVProjectClient) {}

  /**
   * � Upload Business Image to AWS S3
   * Endpoint: POST /api/v1/business/images/{businessId}/upload
   */
  async upload(
    businessId: string,
    file: File,
    metadata?: {
      alt?: string;
      title?: string;
      description?: string;
    },
  ): Promise<BusinessImage> {
    const formData = new FormData();
    formData.append('file', file);

    if (metadata?.alt) formData.append('alt', metadata.alt);
    if (metadata?.title) formData.append('title', metadata.title);
    if (metadata?.description)
      formData.append('description', metadata.description);

    const response = await this.client.post<BusinessImage>(
      `/api/v1/business/images/${businessId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  }

  /**
   * � List Business Gallery Images
   * Endpoint: GET /api/v1/business/images/{businessId}/gallery
   */
  async getGallery(businessId: string): Promise<BusinessImage[]> {
    const response = await this.client.get<BusinessImage[]>(
      `/api/v1/business/images/${businessId}/gallery`,
    );
    return response.data;
  }

  /**
   * �️ Add Image to Business Gallery
   * Endpoint: POST /api/v1/business/images/{businessId}/gallery
   */
  async addToGallery(
    businessId: string,
    imageData: {
      file: File;
      alt?: string;
      title?: string;
      description?: string;
      category?: string;
    },
  ): Promise<BusinessImage> {
    const formData = new FormData();
    formData.append('file', imageData.file);

    if (imageData.alt) formData.append('alt', imageData.alt);
    if (imageData.title) formData.append('title', imageData.title);
    if (imageData.description)
      formData.append('description', imageData.description);
    if (imageData.category) formData.append('category', imageData.category);

    const response = await this.client.post<BusinessImage>(
      `/api/v1/business/images/${businessId}/gallery`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  }

  /**
   * 🗑️ Delete Business Image
   * Endpoint: DELETE /api/v1/business/images/{businessId}/images/{imageId}
   */
  async deleteImage(businessId: string, imageId: string): Promise<void> {
    await this.client.delete(
      `/api/v1/business/images/${businessId}/images/${imageId}`,
    );
  }

  /**
   * 🔍 Update Business SEO Profile
   * Endpoint: PUT /api/v1/business/images/{businessId}/seo
   */
  async updateSeoProfile(
    businessId: string,
    seoData: {
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string[];
      ogImage?: string;
      twitterImage?: string;
      altTexts?: Record<string, string>;
    },
  ): Promise<{
    success: boolean;
    data: {
      metaTitle: string;
      metaDescription: string;
      keywords: string[];
      ogImage?: string;
      twitterImage?: string;
      altTexts: Record<string, string>;
    };
  }> {
    const response = await this.client.put<{
      success: boolean;
      data: {
        metaTitle: string;
        metaDescription: string;
        keywords: string[];
        ogImage?: string;
        twitterImage?: string;
        altTexts: Record<string, string>;
      };
    }>(`/api/v1/business/images/${businessId}/seo`, seoData);
    return response.data;
  }

  /**
   * 🔄 Replace image in gallery
   */
  async replaceImage(
    businessId: string,
    imageId: string,
    file: File,
    metadata?: {
      alt?: string;
      title?: string;
      description?: string;
    },
  ): Promise<BusinessImage> {
    // Delete old image first
    await this.deleteImage(businessId, imageId);

    // Upload new image
    return this.upload(businessId, file, metadata);
  }

  /**
   * 📊 Get gallery statistics from local data
   */
  async getGalleryStats(businessId: string): Promise<{
    totalImages: number;
    byType: Record<BusinessImageType, number>;
    totalStorageUsed: number;
    averageImageSize: number;
  }> {
    const gallery = await this.getGallery(businessId);

    const byType = {} as Record<BusinessImageType, number>;
    Object.values(BusinessImageType).forEach((type) => {
      byType[type] = gallery.filter((img) => img.type === type).length;
    });

    const totalStorageUsed = gallery.reduce(
      (total, img) => total + img.size,
      0,
    );
    const averageImageSize =
      gallery.length > 0 ? totalStorageUsed / gallery.length : 0;

    return {
      totalImages: gallery.length,
      byType,
      totalStorageUsed,
      averageImageSize,
    };
  }

  /**
   * 🌟 Get images by type from gallery
   */
  async getImagesByType(
    businessId: string,
    type: BusinessImageType,
  ): Promise<BusinessImage[]> {
    const gallery = await this.getGallery(businessId);
    return gallery.filter((image) => image.type === type);
  }

  /**
   * 🌟 Get logo images
   */
  async getLogos(businessId: string): Promise<BusinessImage[]> {
    return this.getImagesByType(businessId, BusinessImageType.LOGO);
  }

  /**
   * 🏞️ Get banner images
   */
  async getBanners(businessId: string): Promise<BusinessImage[]> {
    return this.getImagesByType(businessId, BusinessImageType.BANNER);
  }

  /**
   * 👤 Get avatar images
   */
  async getAvatars(businessId: string): Promise<BusinessImage[]> {
    return this.getImagesByType(businessId, BusinessImageType.AVATAR);
  }

  /**
   * 📋 Filter images by criteria
   */
  async filterImages(
    businessId: string,
    filters: {
      type?: BusinessImageType;
      minSize?: number;
      maxSize?: number;
      isActive?: boolean;
      searchTerm?: string;
    },
  ): Promise<BusinessImage[]> {
    const gallery = await this.getGallery(businessId);

    return gallery.filter((image) => {
      if (filters.type && image.type !== filters.type) return false;
      if (filters.minSize && image.size < filters.minSize) return false;
      if (filters.maxSize && image.size > filters.maxSize) return false;
      if (filters.isActive !== undefined && image.isActive !== filters.isActive)
        return false;
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesFilename = image.filename
          .toLowerCase()
          .includes(searchLower);
        const matchesAlt =
          image.alt?.toLowerCase().includes(searchLower) || false;
        if (!matchesFilename && !matchesAlt) return false;
      }
      return true;
    });
  }

  /**
   * 🛡️ Méthodes utilitaires pour les images
   */
  static getTypeDisplayName(type: BusinessImageType): string {
    const names: Record<BusinessImageType, string> = {
      [BusinessImageType.LOGO]: 'Logo',
      [BusinessImageType.BANNER]: 'Bannière',
      [BusinessImageType.AVATAR]: 'Avatar',
      [BusinessImageType.COVER]: 'Image de couverture',
      [BusinessImageType.BACKGROUND]: 'Image de fond',
      [BusinessImageType.ICON]: 'Icône',
      [BusinessImageType.THUMBNAIL]: 'Miniature',
    };
    return names[type];
  }

  static getStatusDisplayName(status: ImageProcessingStatus): string {
    const names: Record<ImageProcessingStatus, string> = {
      [ImageProcessingStatus.PENDING]: 'En attente',
      [ImageProcessingStatus.PROCESSING]: 'En cours de traitement',
      [ImageProcessingStatus.COMPLETED]: 'Terminé',
      [ImageProcessingStatus.FAILED]: 'Échec',
    };
    return names[status];
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  static isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(file.type);
  }

  static getRecommendedDimensions(
    type: BusinessImageType,
  ): { width: number; height: number } | null {
    const recommendations: Record<
      BusinessImageType,
      { width: number; height: number }
    > = {
      [BusinessImageType.LOGO]: { width: 300, height: 300 },
      [BusinessImageType.BANNER]: { width: 1200, height: 400 },
      [BusinessImageType.AVATAR]: { width: 200, height: 200 },
      [BusinessImageType.COVER]: { width: 1920, height: 1080 },
      [BusinessImageType.BACKGROUND]: { width: 1920, height: 1080 },
      [BusinessImageType.ICON]: { width: 64, height: 64 },
      [BusinessImageType.THUMBNAIL]: { width: 150, height: 150 },
    };
    return recommendations[type] || null;
  }

  static validateImageDimensions(
    type: BusinessImageType,
    dimensions: { width: number; height: number },
  ): { isValid: boolean; message?: string } {
    const recommended = this.getRecommendedDimensions(type);
    if (!recommended) return { isValid: true };

    const { width, height } = dimensions;
    const minWidth = recommended.width * 0.5;
    const minHeight = recommended.height * 0.5;
    const maxWidth = recommended.width * 2;
    const maxHeight = recommended.height * 2;

    if (width < minWidth || height < minHeight) {
      return {
        isValid: false,
        message: `Image trop petite. Minimum recommandé: ${minWidth}x${minHeight}px`,
      };
    }

    if (width > maxWidth || height > maxHeight) {
      return {
        isValid: false,
        message: `Image trop grande. Maximum recommandé: ${maxWidth}x${maxHeight}px`,
      };
    }

    return { isValid: true };
  }

  static getImageUrl(image: BusinessImage, thumbnail: boolean = false): string {
    return thumbnail && image.thumbnailUrl ? image.thumbnailUrl : image.url;
  }

  static generateThumbnailUrl(imageUrl: string, size: number = 150): string {
    return `${imageUrl}?thumbnail=${size}`;
  }

  static isProcessingCompleted(image: BusinessImage): boolean {
    return image.processingStatus === ImageProcessingStatus.COMPLETED;
  }

  static isProcessingFailed(image: BusinessImage): boolean {
    return image.processingStatus === ImageProcessingStatus.FAILED;
  }
}

export default BusinessImageService;
