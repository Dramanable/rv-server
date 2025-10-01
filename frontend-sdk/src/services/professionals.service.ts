/**
 * 👨‍💼 Professionals Service - Gestion des Professionnels
 *
 * Service pour la gestion des professionnels
 * dans le système RV Project
 *
 * @version 1.0.0
 */

import { RVProjectClient } from '../client';

// Enums
export enum ProfessionalStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

export enum ContractType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  FREELANCE = 'FREELANCE',
  INTERN = 'INTERN',
}

// Interfaces
export interface Professional {
  readonly id: string;
  readonly userId: string;
  readonly businessId: string;
  readonly professionalRoleId: string;
  readonly status: ProfessionalStatus;
  readonly contractType: ContractType;
  readonly startDate: string;
  readonly endDate?: string;
  readonly hourlyRate?: number;
  readonly currency?: string;
  readonly maxHoursPerWeek?: number;
  readonly licenseNumber?: string;
  readonly certifications: readonly string[];
  readonly specializations: readonly string[];
  readonly languages: readonly string[];
  readonly bio?: string;
  readonly experience?: string;
  readonly education?: string;
  readonly isVisible: boolean;
  readonly allowOnlineBooking: boolean;
  readonly bufferTimeMinutes: number;
  readonly maxAdvanceBookingDays: number;
  readonly cancellationPolicyHours: number;
  readonly rating?: number;
  readonly reviewCount?: number;
  readonly totalAppointments?: number;
  readonly completedAppointments?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;

  // Données utilisateur associées
  readonly user?: {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly phone?: string;
    readonly avatar?: string;
  };

  // Données de rôle associées
  readonly role?: {
    readonly id: string;
    readonly name: string;
    readonly category: string;
    readonly level: string;
  };
}

export interface CreateProfessionalDto {
  readonly userId: string;
  readonly businessId: string;
  readonly professionalRoleId: string;
  readonly contractType: ContractType;
  readonly startDate: string;
  readonly endDate?: string;
  readonly hourlyRate?: number;
  readonly currency?: string;
  readonly maxHoursPerWeek?: number;
  readonly licenseNumber?: string;
  readonly certifications?: readonly string[];
  readonly specializations?: readonly string[];
  readonly languages?: readonly string[];
  readonly bio?: string;
  readonly experience?: string;
  readonly education?: string;
  readonly isVisible?: boolean;
  readonly allowOnlineBooking?: boolean;
  readonly bufferTimeMinutes?: number;
  readonly maxAdvanceBookingDays?: number;
  readonly cancellationPolicyHours?: number;
}

export interface UpdateProfessionalDto {
  readonly professionalRoleId?: string;
  readonly status?: ProfessionalStatus;
  readonly contractType?: ContractType;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly hourlyRate?: number;
  readonly currency?: string;
  readonly maxHoursPerWeek?: number;
  readonly licenseNumber?: string;
  readonly certifications?: readonly string[];
  readonly specializations?: readonly string[];
  readonly languages?: readonly string[];
  readonly bio?: string;
  readonly experience?: string;
  readonly education?: string;
  readonly isVisible?: boolean;
  readonly allowOnlineBooking?: boolean;
  readonly bufferTimeMinutes?: number;
  readonly maxAdvanceBookingDays?: number;
  readonly cancellationPolicyHours?: number;
}

export interface ListProfessionalsDto {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?:
    | 'createdAt'
    | 'firstName'
    | 'lastName'
    | 'rating'
    | 'totalAppointments';
  readonly sortOrder?: 'asc' | 'desc';
  readonly search?: string;
  readonly businessId?: string;
  readonly professionalRoleId?: string;
  readonly status?: ProfessionalStatus;
  readonly contractType?: ContractType;
  readonly isVisible?: boolean;
  readonly allowOnlineBooking?: boolean;
  readonly specializations?: readonly string[];
  readonly languages?: readonly string[];
  readonly minRating?: number;
}

export interface ListProfessionalsResponse {
  readonly data: readonly Professional[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export interface CreateProfessionalResponse {
  readonly success: boolean;
  readonly data: Professional;
  readonly message: string;
}

export interface UpdateProfessionalResponse {
  readonly success: boolean;
  readonly data: Professional;
  readonly message: string;
}

export interface DeleteProfessionalResponse {
  readonly success: boolean;
  readonly message: string;
}

export interface ProfessionalStats {
  readonly totalRevenue: number;
  readonly averageRating: number;
  readonly totalAppointments: number;
  readonly completedAppointments: number;
  readonly cancelledAppointments: number;
  readonly noShowAppointments: number;
  readonly completionRate: number;
  readonly averageSessionDuration: number;
  readonly topServices: readonly {
    readonly serviceId: string;
    readonly serviceName: string;
    readonly count: number;
  }[];
  readonly monthlyStats: readonly {
    readonly month: string;
    readonly appointments: number;
    readonly revenue: number;
  }[];
}

/**
 * 👨‍💼 Service principal pour la gestion des professionnels
 */
export default class ProfessionalsService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister les professionnels avec filtrage avancé
   */
  async list(
    params: ListProfessionalsDto = {},
  ): Promise<ListProfessionalsResponse> {
    const response = await this.client.post(
      '/api/v1/professionals/list',
      params,
    );
    return response.data;
  }

  /**
   * 📄 Obtenir un professionnel par ID
   */
  async getById(id: string): Promise<Professional> {
    const response = await this.client.get(`/api/v1/professionals/${id}`);
    return response.data.data;
  }

  /**
   * ➕ Créer un nouveau professionnel
   */
  async create(
    data: CreateProfessionalDto,
  ): Promise<CreateProfessionalResponse> {
    const response = await this.client.post('/api/v1/professionals', data);
    return response.data;
  }

  /**
   * ✏️ Mettre à jour un professionnel
   */
  async update(
    id: string,
    data: UpdateProfessionalDto,
  ): Promise<UpdateProfessionalResponse> {
    const response = await this.client.put(`/api/v1/professionals/${id}`, data);
    return response.data;
  }

  /**
   * 🗑️ Supprimer un professionnel
   */
  async delete(id: string): Promise<DeleteProfessionalResponse> {
    const response = await this.client.delete(`/api/v1/professionals/${id}`);
    return response.data;
  }

  /**
   * 🏢 Obtenir les professionnels par business
   */
  async getByBusiness(businessId: string): Promise<Professional[]> {
    const response = await this.list({ businessId, limit: 100 });
    return [...response.data];
  }

  /**
   * 👔 Obtenir les professionnels par rôle
   */
  async getByRole(professionalRoleId: string): Promise<Professional[]> {
    const response = await this.list({ professionalRoleId, limit: 100 });
    return [...response.data];
  }

  /**
   * ✅ Obtenir les professionnels actifs
   */
  async getActiveProfessionals(): Promise<Professional[]> {
    const response = await this.list({
      status: ProfessionalStatus.ACTIVE,
      limit: 100,
    });
    return [...response.data];
  }

  /**
   * 🌟 Obtenir les professionnels visibles pour réservation
   */
  async getVisibleProfessionals(): Promise<Professional[]> {
    const response = await this.list({
      isVisible: true,
      allowOnlineBooking: true,
      status: ProfessionalStatus.ACTIVE,
      limit: 100,
    });
    return [...response.data];
  }

  /**
   * 🎯 Obtenir les professionnels par spécialisation
   */
  async getBySpecialization(specialization: string): Promise<Professional[]> {
    const response = await this.list({
      specializations: [specialization],
      limit: 100,
    });
    return [...response.data];
  }

  /**
   * 🌍 Obtenir les professionnels par langue
   */
  async getByLanguage(language: string): Promise<Professional[]> {
    const response = await this.list({ languages: [language], limit: 100 });
    return [...response.data];
  }

  /**
   * ⭐ Obtenir les professionnels les mieux notés
   */
  async getTopRated(limit: number = 10): Promise<Professional[]> {
    const response = await this.list({
      sortBy: 'rating',
      sortOrder: 'desc',
      minRating: 4.0,
      limit,
    });
    return [...response.data];
  }

  /**
   * 📊 Obtenir les statistiques d'un professionnel
   */
  async getStats(
    professionalId: string,
    period?: 'week' | 'month' | 'quarter' | 'year',
  ): Promise<ProfessionalStats> {
    const queryParams = period ? `?period=${period}` : '';
    const response = await this.client.get(
      `/api/v1/professionals/${professionalId}/stats${queryParams}`,
    );
    return response.data.data;
  }

  /**
   * 🔄 Changer le statut d'un professionnel
   */
  async changeStatus(
    professionalId: string,
    status: ProfessionalStatus,
    reason?: string,
  ): Promise<UpdateProfessionalResponse> {
    const response = await this.client.patch(
      `/api/v1/professionals/${professionalId}/status`,
      {
        status,
        reason,
      },
    );
    return response.data;
  }

  /**
   * 👥 Obtenir l'équipe d'un business
   */
  async getBusinessTeam(businessId: string): Promise<Professional[]> {
    const response = await this.getByBusiness(businessId);
    return response.filter((prof) => prof.status === ProfessionalStatus.ACTIVE);
  }

  /**
   * 📅 Obtenir les professionnels disponibles pour un créneau
   */
  async getAvailableForSlot(
    businessId: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<Professional[]> {
    const response = await this.client.post(
      `/api/v1/professionals/available-for-slot`,
      {
        businessId,
        date,
        startTime,
        endTime,
      },
    );
    return response.data.data;
  }

  /**
   * 🔍 Rechercher des professionnels
   */
  async search(query: string, businessId?: string): Promise<Professional[]> {
    const params: ListProfessionalsDto = {
      search: query,
      limit: 50,
      ...(businessId && { businessId }),
    };
    const response = await this.list(params);
    return [...response.data];
  }

  /**
   * 📊 Obtenir toutes les spécialisations disponibles
   */
  async getSpecializations(): Promise<string[]> {
    const response = await this.client.get(
      '/api/v1/professionals/specializations',
    );
    return response.data.data;
  }

  /**
   * 🌍 Obtenir toutes les langues disponibles
   */
  async getLanguages(): Promise<string[]> {
    const response = await this.client.get('/api/v1/professionals/languages');
    return response.data.data;
  }

  /**
   * 🏷️ Obtenir tous les statuts disponibles
   */
  static getStatuses(): ProfessionalStatus[] {
    return Object.values(ProfessionalStatus);
  }

  /**
   * 📝 Obtenir tous les types de contrat disponibles
   */
  static getContractTypes(): ContractType[] {
    return Object.values(ContractType);
  }

  /**
   * 🎨 Obtenir la couleur pour un statut
   */
  static getStatusColor(status: ProfessionalStatus): string {
    const colors: Record<ProfessionalStatus, string> = {
      [ProfessionalStatus.ACTIVE]: '#22C55E', // Vert
      [ProfessionalStatus.INACTIVE]: '#6B7280', // Gris
      [ProfessionalStatus.ON_LEAVE]: '#F59E0B', // Orange
      [ProfessionalStatus.SUSPENDED]: '#EF4444', // Rouge
      [ProfessionalStatus.TERMINATED]: '#1F2937', // Noir
    };
    return colors[status] || '#6B7280';
  }

  /**
   * 🎨 Obtenir l'icône pour un statut
   */
  static getStatusIcon(status: ProfessionalStatus): string {
    const icons: Record<ProfessionalStatus, string> = {
      [ProfessionalStatus.ACTIVE]: '✅',
      [ProfessionalStatus.INACTIVE]: '⚫',
      [ProfessionalStatus.ON_LEAVE]: '🏖️',
      [ProfessionalStatus.SUSPENDED]: '⛔',
      [ProfessionalStatus.TERMINATED]: '❌',
    };
    return icons[status] || '❓';
  }

  /**
   * ✅ Valider les données d'un professionnel
   */
  static validateProfessionalData(
    data: CreateProfessionalDto | UpdateProfessionalDto,
  ): string[] {
    const errors: string[] = [];

    if ('hourlyRate' in data && data.hourlyRate !== undefined) {
      if (data.hourlyRate < 0) {
        errors.push('Le taux horaire ne peut pas être négatif');
      }
      if (data.hourlyRate > 1000) {
        errors.push('Le taux horaire semble trop élevé (max 1000)');
      }
    }

    if ('maxHoursPerWeek' in data && data.maxHoursPerWeek !== undefined) {
      if (data.maxHoursPerWeek < 1 || data.maxHoursPerWeek > 168) {
        errors.push("Le nombre d'heures par semaine doit être entre 1 et 168");
      }
    }

    if ('bufferTimeMinutes' in data && data.bufferTimeMinutes !== undefined) {
      if (data.bufferTimeMinutes < 0 || data.bufferTimeMinutes > 120) {
        errors.push('Le temps de battement doit être entre 0 et 120 minutes');
      }
    }

    if (
      'maxAdvanceBookingDays' in data &&
      data.maxAdvanceBookingDays !== undefined
    ) {
      if (data.maxAdvanceBookingDays < 1 || data.maxAdvanceBookingDays > 365) {
        errors.push(
          "Les jours de réservation à l'avance doivent être entre 1 et 365",
        );
      }
    }

    if (
      'cancellationPolicyHours' in data &&
      data.cancellationPolicyHours !== undefined
    ) {
      if (
        data.cancellationPolicyHours < 0 ||
        data.cancellationPolicyHours > 168
      ) {
        errors.push(
          "La politique d'annulation doit être entre 0 et 168 heures",
        );
      }
    }

    return errors;
  }

  /**
   * 🔧 Utilitaires pour les professionnels
   */
  static readonly utils = {
    /**
     * Calculer le taux de complétion des rendez-vous
     */
    calculateCompletionRate: (professional: Professional): number => {
      if (
        !professional.totalAppointments ||
        professional.totalAppointments === 0
      ) {
        return 0;
      }
      const completedCount = professional.completedAppointments || 0;
      return Math.round(
        (completedCount / professional.totalAppointments) * 100,
      );
    },

    /**
     * Formater le nom complet d'un professionnel
     */
    getFullName: (professional: Professional): string => {
      if (!professional.user) return 'Nom indisponible';
      return `${professional.user.firstName} ${professional.user.lastName}`;
    },

    /**
     * Obtenir l'initiales d'un professionnel
     */
    getInitials: (professional: Professional): string => {
      if (!professional.user) return 'N/A';
      const firstName = professional.user.firstName.charAt(0).toUpperCase();
      const lastName = professional.user.lastName.charAt(0).toUpperCase();
      return `${firstName}${lastName}`;
    },

    /**
     * Vérifier si un professionnel est disponible pour réservation
     */
    isBookable: (professional: Professional): boolean => {
      return (
        professional.status === ProfessionalStatus.ACTIVE &&
        professional.isVisible &&
        professional.allowOnlineBooking
      );
    },

    /**
     * Calculer l'expérience en années
     */
    calculateExperienceYears: (professional: Professional): number => {
      const startDate = new Date(professional.startDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
      return Math.floor(diffYears);
    },

    /**
     * Formater le taux horaire
     */
    formatHourlyRate: (professional: Professional): string => {
      if (!professional.hourlyRate) return 'Non spécifié';
      const currency = professional.currency || 'EUR';
      const symbol =
        currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency;
      return `${professional.hourlyRate}${symbol}/h`;
    },

    /**
     * Obtenir la note sous forme d'étoiles
     */
    getRatingStars: (rating?: number): string => {
      if (!rating) return '☆☆☆☆☆';
      const fullStars = Math.floor(rating);
      const halfStar = rating % 1 >= 0.5 ? '⭐' : '';
      const emptyStars = 5 - Math.ceil(rating);
      return '⭐'.repeat(fullStars) + halfStar + '☆'.repeat(emptyStars);
    },
  };
}
