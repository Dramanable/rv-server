/**
 * 🏭 Business Sectors Service - Gestion des Secteurs d'Activité
 *
 * Service pour la gestion des secteurs d'activité
 * dans le système RV Project
 *
 * @version 1.0.0
 */

import { RVProjectClient } from '../client';

// Interfaces
export interface BusinessSector {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly isActive: boolean;
  readonly parentSectorId?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly sortOrder: number;
  readonly businessCount?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
}

export interface CreateBusinessSectorDto {
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly parentSectorId?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly sortOrder?: number;
}

export interface UpdateBusinessSectorDto {
  readonly name?: string;
  readonly code?: string;
  readonly description?: string;
  readonly parentSectorId?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export interface ListBusinessSectorsDto {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: 'createdAt' | 'name' | 'code' | 'sortOrder';
  readonly sortOrder?: 'asc' | 'desc';
  readonly search?: string;
  readonly isActive?: boolean;
  readonly parentSectorId?: string;
}

export interface ListBusinessSectorsResponse {
  readonly data: readonly BusinessSector[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export interface CreateBusinessSectorResponse {
  readonly success: boolean;
  readonly data: BusinessSector;
  readonly message: string;
}

export interface UpdateBusinessSectorResponse {
  readonly success: boolean;
  readonly data: BusinessSector;
  readonly message: string;
}

export interface DeleteBusinessSectorResponse {
  readonly success: boolean;
  readonly message: string;
}

/**
 * 🏭 Service principal pour la gestion des secteurs d'activité
 */
export default class BusinessSectorsService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister les secteurs d'activité avec filtrage avancé
   */
  async list(params: ListBusinessSectorsDto = {}): Promise<ListBusinessSectorsResponse> {
    const response = await this.client.post('/api/v1/business-sectors/list', params);
    return response.data;
  }

  /**
   * 📄 Obtenir un secteur d'activité par ID
   */
  async getById(id: string): Promise<BusinessSector> {
    const response = await this.client.get(`/api/v1/business-sectors/${id}`);
    return response.data.data;
  }

  /**
   * ➕ Créer un nouveau secteur d'activité
   */
  async create(data: CreateBusinessSectorDto): Promise<CreateBusinessSectorResponse> {
    const response = await this.client.post('/api/v1/business-sectors', data);
    return response.data;
  }

  /**
   * ✏️ Mettre à jour un secteur d'activité
   */
  async update(id: string, data: UpdateBusinessSectorDto): Promise<UpdateBusinessSectorResponse> {
    const response = await this.client.put(`/api/v1/business-sectors/${id}`, data);
    return response.data;
  }

  /**
   * 🗑️ Supprimer un secteur d'activité
   */
  async delete(id: string): Promise<DeleteBusinessSectorResponse> {
    const response = await this.client.delete(`/api/v1/business-sectors/${id}`);
    return response.data;
  }

  /**
   * 🏢 Obtenir tous les secteurs actifs
   */
  async getActiveSectors(): Promise<BusinessSector[]> {
    const response = await this.list({ isActive: true, limit: 100 });
    return [...response.data];
  }

  /**
   * 🌳 Obtenir la hiérarchie des secteurs
   */
  async getSectorsHierarchy(): Promise<BusinessSector[]> {
    const response = await this.client.get('/api/v1/business-sectors/hierarchy');
    return response.data.data;
  }

  /**
   * 🔍 Rechercher des secteurs par nom ou code
   */
  async search(query: string): Promise<BusinessSector[]> {
    const response = await this.list({ search: query, limit: 50 });
    return [...response.data];
  }

  /**
   * 📊 Obtenir les statistiques des secteurs
   */
  async getStats(): Promise<{
    totalSectors: number;
    activeSectors: number;
    inactiveSectors: number;
    topSectors: BusinessSector[];
  }> {
    const response = await this.client.get('/api/v1/business-sectors/stats');
    return response.data.data;
  }

  /**
   * 🔧 Utilitaires pour les secteurs d'activité
   */
  static readonly utils = {
    /**
     * Valider le code d'un secteur
     */
    validateCode: (code: string): boolean => {
      return /^[A-Z0-9_]{2,10}$/.test(code);
    },

    /**
     * Générer un code à partir du nom
     */
    generateCode: (name: string): string => {
      return name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 10);
    },

    /**
     * Formater le nom d'un secteur
     */
    formatName: (name: string): string => {
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },

    /**
     * Obtenir la couleur par défaut selon le secteur
     */
    getDefaultColor: (name: string): string => {
      const colors: Record<string, string> = {
        'MEDICAL': '#EF4444',
        'BEAUTY': '#F59E0B',
        'FITNESS': '#10B981',
        'EDUCATION': '#3B82F6',
        'WELLNESS': '#8B5CF6',
        'TECHNOLOGY': '#6366F1',
        'CONSULTING': '#14B8A6',
        'RETAIL': '#F97316'
      };

      const upperName = name.toUpperCase();
      for (const [key, color] of Object.entries(colors)) {
        if (upperName.includes(key)) {
          return color;
        }
      }

      return '#6B7280'; // Couleur par défaut
    },

    /**
     * Obtenir l'icône par défaut selon le secteur
     */
    getDefaultIcon: (name: string): string => {
      const icons: Record<string, string> = {
        'MEDICAL': '⚕️',
        'BEAUTY': '💄',
        'FITNESS': '💪',
        'EDUCATION': '🎓',
        'WELLNESS': '🧘',
        'TECHNOLOGY': '💻',
        'CONSULTING': '💼',
        'RETAIL': '🛍️',
        'RESTAURANT': '🍽️',
        'AUTOMOTIVE': '🚗',
        'REAL_ESTATE': '🏠',
        'FINANCE': '💰'
      };

      const upperName = name.toUpperCase();
      for (const [key, icon] of Object.entries(icons)) {
        if (upperName.includes(key)) {
          return icon;
        }
      }

      return '🏢'; // Icône par défaut
    }
  };
}
