/**
 * 🖼️ RV Project Frontend SDK - Service de Gestion des Galeries
 *
 * Gestion des galeries d'images pour les entreprises
 */

import { RVProjectClient } from '../client';
import { PaginatedResponse } from '../types';

export enum GalleryType {
  MAIN = 'MAIN',
  PORTFOLIO = 'PORTFOLIO',
  TEAM = 'TEAM',
  FACILITIES = 'FACILITIES',
  PRODUCTS = 'PRODUCTS',
  SERVICES = 'SERVICES',
  CERTIFICATES = 'CERTIFICATES',
  CUSTOM = 'CUSTOM'
}

export enum ImageStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

export interface Gallery {
  readonly id: string;
  readonly businessId: string;
  readonly name: string;
  readonly description?: string;
  readonly type: GalleryType;
  readonly isPublic: boolean;
  readonly isActive: boolean;
  readonly imageCount: number;
  readonly displayOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface GalleryImage {
  readonly id: string;
  readonly galleryId: string;
  readonly filename: string;
  readonly originalName: string;
  readonly url: string;
  readonly thumbnailUrl?: string;
  readonly alt?: string;
  readonly caption?: string;
  readonly status: ImageStatus;
  readonly displayOrder: number;
  readonly width?: number;
  readonly height?: number;
  readonly size: number;
  readonly mimeType: string;
  readonly uploadedAt: string;
  readonly uploadedBy: string;
}

export interface CreateGalleryRequest {
  readonly businessId: string;
  readonly name: string;
  readonly description?: string;
  readonly type: GalleryType;
  readonly isPublic?: boolean;
  readonly displayOrder?: number;
}

export interface UpdateGalleryRequest {
  readonly name?: string;
  readonly description?: string;
  readonly isPublic?: boolean;
  readonly isActive?: boolean;
  readonly displayOrder?: number;
}

export interface UploadImageRequest {
  readonly galleryId: string;
  readonly files: File[];
  readonly alt?: string;
  readonly caption?: string;
  readonly displayOrder?: number;
}

export interface UpdateImageRequest {
  readonly alt?: string;
  readonly caption?: string;
  readonly status?: ImageStatus;
  readonly displayOrder?: number;
}

export interface ListGalleriesRequest {
  readonly businessId: string;
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
  readonly type?: GalleryType;
  readonly isPublic?: boolean;
  readonly isActive?: boolean;
  readonly search?: string;
}

export interface ListImagesRequest {
  readonly galleryId: string;
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
  readonly status?: ImageStatus;
  readonly search?: string;
}

export class GalleryService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister toutes les galeries
   */
  async list(request: ListGalleriesRequest): Promise<PaginatedResponse<Gallery>> {
    const response = await this.client.post<PaginatedResponse<Gallery>>(
      '/api/v1/business-gallery/list',
      request
    );
    return response.data;
  }

  /**
   * 📄 Obtenir une galerie par ID
   */
  async getById(id: string): Promise<Gallery> {
    const response = await this.client.get<Gallery>(`/api/v1/business-gallery/${id}`);
    return response.data;
  }

  /**
   * ➕ Créer une nouvelle galerie
   */
  async create(request: CreateGalleryRequest): Promise<Gallery> {
    const response = await this.client.post<Gallery>('/api/v1/business-gallery', request);
    return response.data;
  }

  /**
   * ✏️ Mettre à jour une galerie
   */
  async update(id: string, updates: UpdateGalleryRequest): Promise<Gallery> {
    const response = await this.client.put<Gallery>(`/api/v1/business-gallery/${id}`, updates);
    return response.data;
  }

  /**
   * 🗑️ Supprimer une galerie
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/business-gallery/${id}`);
  }

  /**
   * 🖼️ Lister les images d'une galerie
   */
  async listImages(request: ListImagesRequest): Promise<PaginatedResponse<GalleryImage>> {
    const response = await this.client.post<PaginatedResponse<GalleryImage>>(
      '/api/v1/business-gallery/images/list',
      request
    );
    return response.data;
  }

  /**
   * 📤 Uploader des images
   */
  async uploadImages(request: UploadImageRequest): Promise<GalleryImage[]> {
    const formData = new FormData();
    formData.append('galleryId', request.galleryId);

    request.files.forEach((file) => {
      formData.append('images', file);
    });

    if (request.alt) formData.append('alt', request.alt);
    if (request.caption) formData.append('caption', request.caption);
    if (request.displayOrder !== undefined) {
      formData.append('displayOrder', request.displayOrder.toString());
    }

    const response = await this.client.post<GalleryImage[]>(
      '/api/v1/business-gallery/images/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }

  /**
   * 📷 Obtenir une image par ID
   */
  async getImageById(id: string): Promise<GalleryImage> {
    const response = await this.client.get<GalleryImage>(`/api/v1/business-gallery/images/${id}`);
    return response.data;
  }

  /**
   * ✏️ Mettre à jour une image
   */
  async updateImage(id: string, updates: UpdateImageRequest): Promise<GalleryImage> {
    const response = await this.client.put<GalleryImage>(
      `/api/v1/business-gallery/images/${id}`,
      updates
    );
    return response.data;
  }

  /**
   * 🗑️ Supprimer une image
   */
  async deleteImage(id: string): Promise<void> {
    await this.client.delete(`/api/v1/business-gallery/images/${id}`);
  }

  /**
   * 🔄 Réorganiser les galeries
   */
  async reorderGalleries(businessId: string, galleryOrders: { id: string; displayOrder: number }[]): Promise<Gallery[]> {
    const response = await this.client.post<Gallery[]>(
      '/api/v1/business-gallery/reorder',
      {
        businessId,
        galleryOrders
      }
    );
    return response.data;
  }

  /**
   * 🔄 Réorganiser les images d'une galerie
   */
  async reorderImages(galleryId: string, imageOrders: { id: string; displayOrder: number }[]): Promise<GalleryImage[]> {
    const response = await this.client.post<GalleryImage[]>(
      '/api/v1/business-gallery/images/reorder',
      {
        galleryId,
        imageOrders
      }
    );
    return response.data;
  }

  /**
   * 🏷️ Obtenir les galeries par type
   */
  async getByType(businessId: string, type: GalleryType): Promise<Gallery[]> {
    const response = await this.list({
      businessId,
      type,
      limit: 100
    });
    return [...response.data];
  }

  /**
   * 🌟 Obtenir la galerie principale
   */
  async getMainGallery(businessId: string): Promise<Gallery | null> {
    try {
      const galleries = await this.getByType(businessId, GalleryType.MAIN);
      const firstGallery = galleries[0];
      return firstGallery || null;
    } catch {
      return null;
    }
  }

  /**
   * 📊 Obtenir les statistiques des galeries
   */
  async getStats(businessId: string): Promise<{
    totalGalleries: number;
    activeGalleries: number;
    publicGalleries: number;
    totalImages: number;
    activeImages: number;
    byType: Record<GalleryType, number>;
    byStatus: Record<ImageStatus, number>;
    totalStorageUsed: number;
    averageImagesPerGallery: number;
  }> {
    const response = await this.client.get<{
      totalGalleries: number;
      activeGalleries: number;
      publicGalleries: number;
      totalImages: number;
      activeImages: number;
      byType: Record<GalleryType, number>;
      byStatus: Record<ImageStatus, number>;
      totalStorageUsed: number;
      averageImagesPerGallery: number;
    }>(`/api/v1/business-gallery/stats?businessId=${businessId}`);
    return response.data;
  }

  /**
   * 🔍 Rechercher des images
   */
  async searchImages(businessId: string, query: string, options?: {
    galleryTypes?: GalleryType[];
    statuses?: ImageStatus[];
    limit?: number;
  }): Promise<GalleryImage[]> {
    const response = await this.client.post<GalleryImage[]>(
      '/api/v1/business-gallery/images/search',
      {
        businessId,
        query,
        ...options
      }
    );
    return response.data;
  }

  /**
   * 📂 Dupliquer une galerie
   */
  async duplicate(galleryId: string, newName: string): Promise<Gallery> {
    const response = await this.client.post<Gallery>(
      `/api/v1/business-gallery/${galleryId}/duplicate`,
      { name: newName }
    );
    return response.data;
  }

  /**
   * 🛡️ Méthodes utilitaires pour les galeries
   */
  static getTypeDisplayName(type: GalleryType): string {
    const names: Record<GalleryType, string> = {
      [GalleryType.MAIN]: 'Galerie principale',
      [GalleryType.PORTFOLIO]: 'Portfolio',
      [GalleryType.TEAM]: 'Équipe',
      [GalleryType.FACILITIES]: 'Installations',
      [GalleryType.PRODUCTS]: 'Produits',
      [GalleryType.SERVICES]: 'Services',
      [GalleryType.CERTIFICATES]: 'Certificats',
      [GalleryType.CUSTOM]: 'Personnalisée'
    };
    return names[type];
  }

  static getStatusDisplayName(status: ImageStatus): string {
    const names: Record<ImageStatus, string> = {
      [ImageStatus.ACTIVE]: 'Active',
      [ImageStatus.INACTIVE]: 'Inactive',
      [ImageStatus.PENDING]: 'En attente',
      [ImageStatus.REJECTED]: 'Rejetée'
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

  static isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  static sortGalleriesByDisplayOrder(galleries: Gallery[]): Gallery[] {
    return [...galleries].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  static sortImagesByDisplayOrder(images: GalleryImage[]): GalleryImage[] {
    return [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  static filterPublicGalleries(galleries: Gallery[]): Gallery[] {
    return galleries.filter(gallery => gallery.isPublic && gallery.isActive);
  }

  static filterActiveImages(images: GalleryImage[]): GalleryImage[] {
    return images.filter(image => image.status === ImageStatus.ACTIVE);
  }

  static generateThumbnailUrl(imageUrl: string, size: number = 300): string {
    // Assuming the backend provides thumbnail generation
    return `${imageUrl}?thumbnail=${size}`;
  }
}

export default GalleryService;
