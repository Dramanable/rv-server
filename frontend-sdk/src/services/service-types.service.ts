/**
 * 🛠️ RV Project Frontend SDK - Service des Types de Services
 *
 * Gestion des catégories et types de services pour l'organisation des prestations
 */

import { RVProjectClient } from '../client';
import { PaginatedResponse } from '../types';

export enum ServiceTypeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum ServiceTypeCategory {
  HEALTH = 'HEALTH',
  BEAUTY = 'BEAUTY',
  WELLNESS = 'WELLNESS',
  FITNESS = 'FITNESS',
  CONSULTATION = 'CONSULTATION',
  THERAPY = 'THERAPY',
  MAINTENANCE = 'MAINTENANCE',
  EDUCATION = 'EDUCATION',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHER = 'OTHER',
}

export interface ServiceTypeSettings {
  readonly requiresQuestionnaire: boolean;
  readonly allowOnlineBooking: boolean;
  readonly requiresDeposit: boolean;
  readonly depositAmount?: number;
  readonly depositPercentage?: number;
  readonly cancellationPolicy: {
    readonly allowCancellation: boolean;
    readonly cancellationDeadline: number; // en heures
    readonly cancellationFee?: number;
    readonly cancellationFeePercentage?: number;
  };
  readonly reschedulePolicy: {
    readonly allowReschedule: boolean;
    readonly rescheduleDeadline: number; // en heures
    readonly maxReschedules: number;
  };
  readonly reminderSettings: {
    readonly sendReminders: boolean;
    readonly reminderTimes: number[]; // en heures avant le RDV
    readonly reminderMethods: ('EMAIL' | 'SMS' | 'PUSH')[];
  };
}

export interface ServiceType {
  readonly id: string;
  readonly businessId: string;
  readonly name: string;
  readonly description?: string;
  readonly category: ServiceTypeCategory;
  readonly status: ServiceTypeStatus;
  readonly color: string; // Hex color
  readonly icon?: string; // Icon name or URL
  readonly displayOrder: number;
  readonly isDefault: boolean;
  readonly settings: ServiceTypeSettings;
  readonly defaultDuration: number; // en minutes
  readonly defaultPrice?: {
    readonly amount: number;
    readonly currency: string;
  };
  readonly tags: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateServiceTypeRequest {
  readonly businessId: string;
  readonly name: string;
  readonly description?: string;
  readonly category: ServiceTypeCategory;
  readonly color?: string;
  readonly icon?: string;
  readonly defaultDuration: number;
  readonly defaultPrice?: {
    readonly amount: number;
    readonly currency: string;
  };
  readonly settings?: Partial<ServiceTypeSettings>;
  readonly tags?: string[];
  readonly displayOrder?: number;
}

export interface UpdateServiceTypeRequest {
  readonly name?: string;
  readonly description?: string;
  readonly category?: ServiceTypeCategory;
  readonly status?: ServiceTypeStatus;
  readonly color?: string;
  readonly icon?: string;
  readonly defaultDuration?: number;
  readonly defaultPrice?: {
    readonly amount: number;
    readonly currency: string;
  };
  readonly settings?: Partial<ServiceTypeSettings>;
  readonly tags?: string[];
  readonly displayOrder?: number;
}

export interface ListServiceTypesRequest {
  readonly businessId: string;
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
  readonly status?: ServiceTypeStatus;
  readonly category?: ServiceTypeCategory;
  readonly search?: string;
  readonly tags?: string[];
  readonly includeArchived?: boolean;
}

export class ServiceTypesService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister tous les types de services
   */
  async list(
    request: ListServiceTypesRequest,
  ): Promise<PaginatedResponse<ServiceType>> {
    const response = await this.client.post<PaginatedResponse<ServiceType>>(
      '/api/v1/service-types/list',
      request,
    );
    return response.data;
  }

  /**
   * 📄 Obtenir un type de service par ID
   */
  async getById(id: string): Promise<ServiceType> {
    const response = await this.client.get<ServiceType>(
      `/api/v1/service-types/${id}`,
    );
    return response.data;
  }

  /**
   * ➕ Créer un nouveau type de service
   */
  async create(request: CreateServiceTypeRequest): Promise<ServiceType> {
    const response = await this.client.post<ServiceType>(
      '/api/v1/service-types',
      request,
    );
    return response.data;
  }

  /**
   * ✏️ Mettre à jour un type de service
   */
  async update(
    id: string,
    updates: UpdateServiceTypeRequest,
  ): Promise<ServiceType> {
    const response = await this.client.put<ServiceType>(
      `/api/v1/service-types/${id}`,
      updates,
    );
    return response.data;
  }

  /**
   * 🗑️ Supprimer un type de service
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/service-types/${id}`);
  }

  /**
   * 🏢 Obtenir tous les types de services d'un business
   */
  async getByBusiness(businessId: string): Promise<ServiceType[]> {
    const response = await this.list({
      businessId,
      limit: 100,
    });
    return [...response.data];
  }

  /**
   * 📊 Obtenir les types de services par catégorie
   */
  async getByCategory(
    businessId: string,
    category: ServiceTypeCategory,
  ): Promise<ServiceType[]> {
    const response = await this.list({
      businessId,
      category,
      limit: 100,
    });
    return [...response.data];
  }

  /**
   * ⭐ Définir un type comme défaut
   */
  async setDefault(id: string): Promise<ServiceType> {
    const response = await this.client.post<ServiceType>(
      `/api/v1/service-types/${id}/set-default`,
    );
    return response.data;
  }

  /**
   * 🔄 Réorganiser les types de services
   */
  async reorder(
    businessId: string,
    orders: { id: string; displayOrder: number }[],
  ): Promise<ServiceType[]> {
    const response = await this.client.post<ServiceType[]>(
      '/api/v1/service-types/reorder',
      {
        businessId,
        orders,
      },
    );
    return response.data;
  }

  /**
   * 🏷️ Gérer les tags
   */
  async addTag(id: string, tag: string): Promise<ServiceType> {
    const response = await this.client.post<ServiceType>(
      `/api/v1/service-types/${id}/tags`,
      { tag },
    );
    return response.data;
  }

  async removeTag(id: string, tag: string): Promise<ServiceType> {
    const response = await this.client.delete<ServiceType>(
      `/api/v1/service-types/${id}/tags/${encodeURIComponent(tag)}`,
    );
    return response.data;
  }

  async getAllTags(businessId: string): Promise<string[]> {
    const response = await this.client.get<string[]>(
      `/api/v1/service-types/tags?businessId=${businessId}`,
    );
    return response.data;
  }

  /**
   * 📊 Obtenir les statistiques des types de services
   */
  async getStats(businessId: string): Promise<{
    totalTypes: number;
    activeTypes: number;
    inactiveTypes: number;
    archivedTypes: number;
    byCategory: Record<ServiceTypeCategory, number>;
    byStatus: Record<ServiceTypeStatus, number>;
    averageDuration: number;
    averagePrice: number;
    serviceUsage: Array<{
      typeId: string;
      typeName: string;
      serviceCount: number;
      appointmentCount: number;
      revenue: number;
    }>;
    popularTags: Array<{
      tag: string;
      count: number;
    }>;
  }> {
    const response = await this.client.get<{
      totalTypes: number;
      activeTypes: number;
      inactiveTypes: number;
      archivedTypes: number;
      byCategory: Record<ServiceTypeCategory, number>;
      byStatus: Record<ServiceTypeStatus, number>;
      averageDuration: number;
      averagePrice: number;
      serviceUsage: Array<{
        typeId: string;
        typeName: string;
        serviceCount: number;
        appointmentCount: number;
        revenue: number;
      }>;
      popularTags: Array<{
        tag: string;
        count: number;
      }>;
    }>(`/api/v1/service-types/stats?businessId=${businessId}`);
    return response.data;
  }

  /**
   * 🔄 Dupliquer un type de service
   */
  async duplicate(id: string, newName: string): Promise<ServiceType> {
    const response = await this.client.post<ServiceType>(
      `/api/v1/service-types/${id}/duplicate`,
      { name: newName },
    );
    return response.data;
  }

  /**
   * 📤 Exporter les types de services
   */
  async export(
    businessId: string,
    format: 'json' | 'csv' | 'xlsx' = 'json',
  ): Promise<Blob> {
    const response = await this.client.get<Blob>(
      `/api/v1/service-types/export?businessId=${businessId}&format=${format}`,
    );
    return response.data;
  }

  /**
   * 📥 Importer des types de services
   */
  async import(
    businessId: string,
    file: File,
    options?: {
      skipDuplicates?: boolean;
      updateExisting?: boolean;
    },
  ): Promise<{
    imported: number;
    updated: number;
    skipped: number;
    errors: Array<{
      row: number;
      error: string;
    }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('businessId', businessId);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.client.post<{
      imported: number;
      updated: number;
      skipped: number;
      errors: Array<{
        row: number;
        error: string;
      }>;
    }>('/api/v1/service-types/import', formData);
    return response.data;
  }

  /**
   * 🛡️ Méthodes utilitaires pour les types de services
   */
  static getStatusDisplayName(status: ServiceTypeStatus): string {
    const names: Record<ServiceTypeStatus, string> = {
      [ServiceTypeStatus.ACTIVE]: 'Actif',
      [ServiceTypeStatus.INACTIVE]: 'Inactif',
      [ServiceTypeStatus.ARCHIVED]: 'Archivé',
    };
    return names[status];
  }

  static getCategoryDisplayName(category: ServiceTypeCategory): string {
    const names: Record<ServiceTypeCategory, string> = {
      [ServiceTypeCategory.HEALTH]: 'Santé',
      [ServiceTypeCategory.BEAUTY]: 'Beauté',
      [ServiceTypeCategory.WELLNESS]: 'Bien-être',
      [ServiceTypeCategory.FITNESS]: 'Fitness',
      [ServiceTypeCategory.CONSULTATION]: 'Consultation',
      [ServiceTypeCategory.THERAPY]: 'Thérapie',
      [ServiceTypeCategory.MAINTENANCE]: 'Maintenance',
      [ServiceTypeCategory.EDUCATION]: 'Éducation',
      [ServiceTypeCategory.ENTERTAINMENT]: 'Divertissement',
      [ServiceTypeCategory.OTHER]: 'Autre',
    };
    return names[category];
  }

  static getCategoryIcon(category: ServiceTypeCategory): string {
    const icons: Record<ServiceTypeCategory, string> = {
      [ServiceTypeCategory.HEALTH]: '🏥',
      [ServiceTypeCategory.BEAUTY]: '💄',
      [ServiceTypeCategory.WELLNESS]: '🧘',
      [ServiceTypeCategory.FITNESS]: '💪',
      [ServiceTypeCategory.CONSULTATION]: '👨‍💼',
      [ServiceTypeCategory.THERAPY]: '🩺',
      [ServiceTypeCategory.MAINTENANCE]: '🔧',
      [ServiceTypeCategory.EDUCATION]: '📚',
      [ServiceTypeCategory.ENTERTAINMENT]: '🎭',
      [ServiceTypeCategory.OTHER]: '📋',
    };
    return icons[category];
  }

  static isActive(serviceType: ServiceType): boolean {
    return serviceType.status === ServiceTypeStatus.ACTIVE;
  }

  static allowsOnlineBooking(serviceType: ServiceType): boolean {
    return serviceType.settings.allowOnlineBooking;
  }

  static requiresDeposit(serviceType: ServiceType): boolean {
    return serviceType.settings.requiresDeposit;
  }

  static requiresQuestionnaire(serviceType: ServiceType): boolean {
    return serviceType.settings.requiresQuestionnaire;
  }

  static canBeCancelled(serviceType: ServiceType): boolean {
    return serviceType.settings.cancellationPolicy.allowCancellation;
  }

  static canBeRescheduled(serviceType: ServiceType): boolean {
    return serviceType.settings.reschedulePolicy.allowReschedule;
  }

  static formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  }

  static formatPrice(price: { amount: number; currency: string }): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: price.currency,
    }).format(price.amount);
  }

  static calculateDepositAmount(
    serviceType: ServiceType,
    servicePrice: number,
  ): number {
    if (!serviceType.settings.requiresDeposit) return 0;

    const { depositAmount, depositPercentage } = serviceType.settings;

    if (depositAmount !== undefined) {
      return depositAmount;
    }

    if (depositPercentage !== undefined) {
      return (servicePrice * depositPercentage) / 100;
    }

    return 0;
  }

  static calculateCancellationFee(
    serviceType: ServiceType,
    servicePrice: number,
  ): number {
    if (!serviceType.settings.cancellationPolicy.allowCancellation)
      return servicePrice;

    const { cancellationFee, cancellationFeePercentage } =
      serviceType.settings.cancellationPolicy;

    if (cancellationFee !== undefined) {
      return cancellationFee;
    }

    if (cancellationFeePercentage !== undefined) {
      return (servicePrice * cancellationFeePercentage) / 100;
    }

    return 0;
  }

  static canCancelWithoutFee(
    serviceType: ServiceType,
    appointmentDate: Date,
  ): boolean {
    if (!serviceType.settings.cancellationPolicy.allowCancellation)
      return false;

    const now = new Date();
    const deadlineHours =
      serviceType.settings.cancellationPolicy.cancellationDeadline;
    const deadline = new Date(
      appointmentDate.getTime() - deadlineHours * 60 * 60 * 1000,
    );

    return now <= deadline;
  }

  static canReschedule(
    serviceType: ServiceType,
    appointmentDate: Date,
    rescheduleCount: number,
  ): boolean {
    if (!serviceType.settings.reschedulePolicy.allowReschedule) return false;
    if (rescheduleCount >= serviceType.settings.reschedulePolicy.maxReschedules)
      return false;

    const now = new Date();
    const deadlineHours =
      serviceType.settings.reschedulePolicy.rescheduleDeadline;
    const deadline = new Date(
      appointmentDate.getTime() - deadlineHours * 60 * 60 * 1000,
    );

    return now <= deadline;
  }

  static sortByDisplayOrder(serviceTypes: ServiceType[]): ServiceType[] {
    return [...serviceTypes].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  static sortByName(serviceTypes: ServiceType[]): ServiceType[] {
    return [...serviceTypes].sort((a, b) => a.name.localeCompare(b.name));
  }

  static filterActive(serviceTypes: ServiceType[]): ServiceType[] {
    return serviceTypes.filter((type) => this.isActive(type));
  }

  static filterByCategory(
    serviceTypes: ServiceType[],
    category: ServiceTypeCategory,
  ): ServiceType[] {
    return serviceTypes.filter((type) => type.category === category);
  }

  static filterByTag(serviceTypes: ServiceType[], tag: string): ServiceType[] {
    return serviceTypes.filter((type) => type.tags.includes(tag));
  }

  static groupByCategory(
    serviceTypes: ServiceType[],
  ): Record<ServiceTypeCategory, ServiceType[]> {
    return serviceTypes.reduce(
      (groups, serviceType) => {
        const category = serviceType.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(serviceType);
        return groups;
      },
      {} as Record<ServiceTypeCategory, ServiceType[]>,
    );
  }

  static getDefaultType(serviceTypes: ServiceType[]): ServiceType | null {
    return serviceTypes.find((type) => type.isDefault) || null;
  }

  static getAllCategories(): ServiceTypeCategory[] {
    return Object.values(ServiceTypeCategory);
  }

  static generateNextOrder(existingTypes: ServiceType[]): number {
    if (existingTypes.length === 0) return 1;
    const maxOrder = Math.max(
      ...existingTypes.map((type) => type.displayOrder),
    );
    return maxOrder + 1;
  }

  static validateSettings(settings: Partial<ServiceTypeSettings>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (settings.depositAmount !== undefined && settings.depositAmount < 0) {
      errors.push("Le montant de l'acompte ne peut pas être négatif");
    }

    if (settings.depositPercentage !== undefined) {
      if (settings.depositPercentage < 0 || settings.depositPercentage > 100) {
        errors.push("Le pourcentage d'acompte doit être entre 0 et 100");
      }
    }

    if (settings.cancellationPolicy) {
      const {
        cancellationDeadline,
        cancellationFee,
        cancellationFeePercentage,
      } = settings.cancellationPolicy;

      if (cancellationDeadline !== undefined && cancellationDeadline < 0) {
        errors.push("Le délai d'annulation ne peut pas être négatif");
      }

      if (cancellationFee !== undefined && cancellationFee < 0) {
        errors.push("Les frais d'annulation ne peuvent pas être négatifs");
      }

      if (cancellationFeePercentage !== undefined) {
        if (cancellationFeePercentage < 0 || cancellationFeePercentage > 100) {
          errors.push(
            "Le pourcentage de frais d'annulation doit être entre 0 et 100",
          );
        }
      }
    }

    if (settings.reschedulePolicy) {
      const { rescheduleDeadline, maxReschedules } = settings.reschedulePolicy;

      if (rescheduleDeadline !== undefined && rescheduleDeadline < 0) {
        errors.push('Le délai de report ne peut pas être négatif');
      }

      if (maxReschedules !== undefined && maxReschedules < 0) {
        errors.push('Le nombre maximum de reports ne peut pas être négatif');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default ServiceTypesService;
