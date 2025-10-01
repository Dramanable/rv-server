/**
 * 🖼️ Business Galleries Service - Gestion des Galeries d'Entreprise
 *
 * Service pour la gestion des galeries d'images
 * spécifiques aux entreprises dans RV Project
 *
 * @version 1.0.0
 */

import { RVProjectClient } from '../client';

// Enums
export enum GalleryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
}

export enum GalleryType {
  SHOWCASE = 'SHOWCASE',
  BEFORE_AFTER = 'BEFORE_AFTER',
  TEAM = 'TEAM',
  FACILITY = 'FACILITY',
  SERVICES = 'SERVICES',
  PORTFOLIO = 'PORTFOLIO',
  TESTIMONIALS = 'TESTIMONIALS',
}

export enum ImageType {
  MAIN = 'MAIN',
  THUMBNAIL = 'THUMBNAIL',
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
  DETAIL = 'DETAIL',
}

// Interfaces
export interface BusinessGallery {
  readonly id: string;
  readonly businessId: string;
  readonly name: string;
  readonly description?: string;
  readonly type: GalleryType;
  readonly status: GalleryStatus;
  readonly isPublic: boolean;
  readonly sortOrder: number;
  readonly coverImageId?: string;
  readonly imagesCount: number;
  readonly totalSize: number;
  readonly tags: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;

  // Images associées
  readonly images?: readonly GalleryImage[];

  // Métadonnées
  readonly metadata?: {
    readonly seoTitle?: string;
    readonly seoDescription?: string;
    readonly keywords?: readonly string[];
  };
}

export interface GalleryImage {
  readonly id: string;
  readonly galleryId: string;
  readonly filename: string;
  readonly originalName: string;
  readonly url: string;
  readonly thumbnailUrl?: string;
  readonly type: ImageType;
  readonly mimeType: string;
  readonly size: number;
  readonly width: number;
  readonly height: number;
  readonly altText?: string;
  readonly caption?: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly uploadedAt: string;
  readonly uploadedBy: string;

  // Métadonnées d'image
  readonly metadata?: {
    readonly exif?: Record<string, any>;
    readonly location?: {
      readonly lat: number;
      readonly lng: number;
    };
    readonly tags?: readonly string[];
  };
}

export interface CreateGalleryDto {
  readonly businessId: string;
  readonly name: string;
  readonly description?: string;
  readonly type: GalleryType;
  readonly isPublic?: boolean;
  readonly tags?: readonly string[];
  readonly metadata?: {
    readonly seoTitle?: string;
    readonly seoDescription?: string;
    readonly keywords?: readonly string[];
  };
}

export interface UpdateGalleryDto {
  readonly name?: string;
  readonly description?: string;
  readonly type?: GalleryType;
  readonly status?: GalleryStatus;
  readonly isPublic?: boolean;
  readonly sortOrder?: number;
  readonly coverImageId?: string;
  readonly tags?: readonly string[];
  readonly metadata?: {
    readonly seoTitle?: string;
    readonly seoDescription?: string;
    readonly keywords?: readonly string[];
  };
}

export interface ListGalleriesDto {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?:
    | 'createdAt'
    | 'name'
    | 'sortOrder'
    | 'imagesCount'
    | 'updatedAt';
  readonly sortOrder?: 'asc' | 'desc';
  readonly search?: string;
  readonly businessId?: string;
  readonly type?: GalleryType;
  readonly status?: GalleryStatus;
  readonly isPublic?: boolean;
  readonly tags?: readonly string[];
  readonly hasImages?: boolean;
}

export interface ListGalleriesResponse {
  readonly data: readonly BusinessGallery[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export interface CreateGalleryResponse {
  readonly success: boolean;
  readonly data: BusinessGallery;
  readonly message: string;
}

export interface UpdateGalleryResponse {
  readonly success: boolean;
  readonly data: BusinessGallery;
  readonly message: string;
}

export interface DeleteGalleryResponse {
  readonly success: boolean;
  readonly message: string;
}

export interface UploadImagesResponse {
  readonly success: boolean;
  readonly data: readonly GalleryImage[];
  readonly message: string;
  readonly totalUploaded: number;
  readonly failed?: readonly {
    readonly filename: string;
    readonly error: string;
  }[];
}

export interface UpdateImageDto {
  readonly altText?: string;
  readonly caption?: string;
  readonly type?: ImageType;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
  readonly tags?: readonly string[];
}

/**
 * 🖼️ Service principal pour la gestion des galeries d'entreprise
 */
export default class BusinessGalleriesService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister les galeries d'une entreprise
   */
  async getBusinessGalleries(businessId: string): Promise<BusinessGallery[]> {
    const response = await this.client.get(
      `/api/v1/business-galleries/${businessId}/galleries`,
    );
    return response.data.data;
  }

  /**
   * 📄 Obtenir une galerie par ID
   */
  async getById(galleryId: string): Promise<BusinessGallery> {
    const response = await this.client.get(
      `/api/v1/business-galleries/${galleryId}`,
    );
    return response.data.data;
  }

  /**
   * ➕ Créer une nouvelle galerie
   */
  async create(data: CreateGalleryDto): Promise<CreateGalleryResponse> {
    const response = await this.client.post(
      `/api/v1/business-galleries/${data.businessId}/create`,
      data,
    );
    return response.data;
  }

  /**
   * ✏️ Mettre à jour une galerie
   */
  async update(
    galleryId: string,
    data: UpdateGalleryDto,
  ): Promise<UpdateGalleryResponse> {
    const response = await this.client.put(
      `/api/v1/business-galleries/${galleryId}`,
      data,
    );
    return response.data;
  }

  /**
   * 🗑️ Supprimer une galerie
   */
  async delete(galleryId: string): Promise<DeleteGalleryResponse> {
    const response = await this.client.delete(
      `/api/v1/business-galleries/${galleryId}`,
    );
    return response.data;
  }

  /**
   * 📸 Télécharger des images dans une galerie
   */
  async uploadImages(
    galleryId: string,
    files: File[],
    options?: {
      altText?: string;
      caption?: string;
      type?: ImageType;
      tags?: string[];
    },
  ): Promise<UploadImagesResponse> {
    const formData = new FormData();

    // Ajouter les fichiers
    files.forEach((file) => {
      formData.append('images', file);
    });

    // Ajouter les options si fournies
    if (options) {
      if (options.altText) formData.append('altText', options.altText);
      if (options.caption) formData.append('caption', options.caption);
      if (options.type) formData.append('type', options.type);
      if (options.tags) formData.append('tags', JSON.stringify(options.tags));
    }

    const response = await this.client.post(
      `/api/v1/business-galleries/${galleryId}/images/upload`,
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
   * 🎨 Obtenir les galeries publiques d'une entreprise
   */
  async getPublicGalleries(businessId: string): Promise<BusinessGallery[]> {
    const galleries = await this.getBusinessGalleries(businessId);
    return galleries.filter(
      (gallery) => gallery.isPublic && gallery.status === GalleryStatus.ACTIVE,
    );
  }

  /**
   * 📊 Obtenir les galeries par type
   */
  async getByType(
    businessId: string,
    type: GalleryType,
  ): Promise<BusinessGallery[]> {
    const galleries = await this.getBusinessGalleries(businessId);
    return galleries.filter((gallery) => gallery.type === type);
  }

  /**
   * 🔍 Rechercher des galeries
   */
  async search(businessId: string, query: string): Promise<BusinessGallery[]> {
    const galleries = await this.getBusinessGalleries(businessId);
    return galleries.filter(
      (gallery) =>
        gallery.name.toLowerCase().includes(query.toLowerCase()) ||
        (gallery.description &&
          gallery.description.toLowerCase().includes(query.toLowerCase())) ||
        gallery.tags.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase()),
        ),
    );
  }

  /**
   * 🏷️ Obtenir les galeries par tags
   */
  async getByTags(
    businessId: string,
    tags: string[],
  ): Promise<BusinessGallery[]> {
    const galleries = await this.getBusinessGalleries(businessId);
    return galleries.filter((gallery) =>
      tags.some((tag) => gallery.tags.includes(tag)),
    );
  }

  /**
   * 📊 Obtenir les statistiques des galeries
   */
  async getGalleryStats(businessId: string): Promise<{
    totalGalleries: number;
    activeGalleries: number;
    totalImages: number;
    totalSize: number;
    galleryTypes: Record<GalleryType, number>;
  }> {
    const galleries = await this.getBusinessGalleries(businessId);

    const stats = {
      totalGalleries: galleries.length,
      activeGalleries: galleries.filter(
        (g) => g.status === GalleryStatus.ACTIVE,
      ).length,
      totalImages: galleries.reduce((sum, g) => sum + g.imagesCount, 0),
      totalSize: galleries.reduce((sum, g) => sum + g.totalSize, 0),
      galleryTypes: {} as Record<GalleryType, number>,
    };

    // Compter par type
    Object.values(GalleryType).forEach((type) => {
      stats.galleryTypes[type] = galleries.filter(
        (g) => g.type === type,
      ).length;
    });

    return stats;
  }

  /**
   * 🔄 Changer le statut d'une galerie
   */
  async changeStatus(
    galleryId: string,
    status: GalleryStatus,
  ): Promise<UpdateGalleryResponse> {
    return this.update(galleryId, { status });
  }

  /**
   * 📌 Définir l'image de couverture
   */
  async setCoverImage(
    galleryId: string,
    imageId: string,
  ): Promise<UpdateGalleryResponse> {
    return this.update(galleryId, { coverImageId: imageId });
  }

  /**
   * 🔢 Réorganiser l'ordre des galeries
   */
  async reorderGalleries(
    _businessId: string,
    galleryOrders: { galleryId: string; sortOrder: number }[],
  ): Promise<void> {
    await Promise.all(
      galleryOrders.map(({ galleryId, sortOrder }) =>
        this.update(galleryId, { sortOrder }),
      ),
    );
  }

  /**
   * 📁 Dupliquer une galerie
   */
  async duplicate(
    galleryId: string,
    newName: string,
  ): Promise<CreateGalleryResponse> {
    const originalGallery = await this.getById(galleryId);

    const duplicateData: CreateGalleryDto = {
      businessId: originalGallery.businessId,
      name: newName,
      ...(originalGallery.description && {
        description: originalGallery.description,
      }),
      type: originalGallery.type,
      isPublic: false, // Par défaut privée pour éviter la duplication publique
      tags: [...originalGallery.tags],
      ...(originalGallery.metadata && {
        metadata: { ...originalGallery.metadata },
      }),
    };

    return this.create(duplicateData);
  }

  /**
   * 🏷️ Obtenir tous les types de galerie
   */
  static getTypes(): GalleryType[] {
    return Object.values(GalleryType);
  }

  /**
   * 🏷️ Obtenir tous les statuts de galerie
   */
  static getStatuses(): GalleryStatus[] {
    return Object.values(GalleryStatus);
  }

  /**
   * 🎨 Obtenir la couleur pour un type de galerie
   */
  static getTypeColor(type: GalleryType): string {
    const colors: Record<GalleryType, string> = {
      [GalleryType.SHOWCASE]: '#3B82F6', // Bleu
      [GalleryType.BEFORE_AFTER]: '#10B981', // Vert
      [GalleryType.TEAM]: '#F59E0B', // Orange
      [GalleryType.FACILITY]: '#8B5CF6', // Violet
      [GalleryType.SERVICES]: '#EF4444', // Rouge
      [GalleryType.PORTFOLIO]: '#06B6D4', // Cyan
      [GalleryType.TESTIMONIALS]: '#84CC16', // Lime
    };
    return colors[type] || '#6B7280';
  }

  /**
   * 🎨 Obtenir l'icône pour un type de galerie
   */
  static getTypeIcon(type: GalleryType): string {
    const icons: Record<GalleryType, string> = {
      [GalleryType.SHOWCASE]: '🌟',
      [GalleryType.BEFORE_AFTER]: '🔄',
      [GalleryType.TEAM]: '👥',
      [GalleryType.FACILITY]: '🏢',
      [GalleryType.SERVICES]: '⚙️',
      [GalleryType.PORTFOLIO]: '🎨',
      [GalleryType.TESTIMONIALS]: '💬',
    };
    return icons[type] || '📷';
  }

  /**
   * 🎨 Obtenir la couleur pour un statut
   */
  static getStatusColor(status: GalleryStatus): string {
    const colors: Record<GalleryStatus, string> = {
      [GalleryStatus.ACTIVE]: '#22C55E', // Vert
      [GalleryStatus.INACTIVE]: '#6B7280', // Gris
      [GalleryStatus.DRAFT]: '#F59E0B', // Orange
      [GalleryStatus.ARCHIVED]: '#EF4444', // Rouge
    };
    return colors[status] || '#6B7280';
  }

  /**
   * ✅ Valider les données de galerie
   */
  static validateGalleryData(
    data: CreateGalleryDto | UpdateGalleryDto,
  ): string[] {
    const errors: string[] = [];

    if ('name' in data && data.name) {
      if (data.name.length < 2) {
        errors.push('Le nom de la galerie doit contenir au moins 2 caractères');
      }
      if (data.name.length > 100) {
        errors.push('Le nom de la galerie ne peut pas dépasser 100 caractères');
      }
    }

    if (
      'description' in data &&
      data.description &&
      data.description.length > 500
    ) {
      errors.push('La description ne peut pas dépasser 500 caractères');
    }

    if ('sortOrder' in data && data.sortOrder !== undefined) {
      if (data.sortOrder < 0 || data.sortOrder > 999) {
        errors.push("L'ordre de tri doit être entre 0 et 999");
      }
    }

    return errors;
  }

  /**
   * 🔧 Utilitaires pour les galeries
   */
  static readonly utils = {
    /**
     * Formater la taille de fichier
     */
    formatFileSize: (bytes: number): string => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Bytes';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return (
        Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
      );
    },

    /**
     * Valider le type de fichier image
     */
    isValidImageType: (mimeType: string): boolean => {
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      return validTypes.includes(mimeType.toLowerCase());
    },

    /**
     * Obtenir l'extension de fichier recommandée
     */
    getRecommendedExtension: (mimeType: string): string => {
      const extensions: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
      };
      return extensions[mimeType.toLowerCase()] || 'jpg';
    },

    /**
     * Calculer le ratio d'aspect
     */
    calculateAspectRatio: (width: number, height: number): string => {
      const gcd = (a: number, b: number): number =>
        b === 0 ? a : gcd(b, a % b);
      const divisor = gcd(width, height);
      return `${width / divisor}:${height / divisor}`;
    },
  };
}
