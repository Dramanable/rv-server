/**
 * 👔 Professional Roles Service - Gestion des Rôles Professionnels
 *
 * Service pour la gestion des rôles professionnels
 * dans le système RV Project
 *
 * @version 1.0.0
 */

import { RVProjectClient } from '../client';

// Enums
export enum ProfessionalLevel {
  INTERN = 'INTERN',
  JUNIOR = 'JUNIOR',
  SENIOR = 'SENIOR',
  EXPERT = 'EXPERT',
  LEAD = 'LEAD',
  MANAGER = 'MANAGER',
  DIRECTOR = 'DIRECTOR'
}

export enum ProfessionalCategory {
  MEDICAL = 'MEDICAL',
  PARAMEDICAL = 'PARAMEDICAL',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  TECHNICAL = 'TECHNICAL',
  MANAGEMENT = 'MANAGEMENT',
  BEAUTY = 'BEAUTY',
  WELLNESS = 'WELLNESS',
  FITNESS = 'FITNESS',
  EDUCATION = 'EDUCATION',
  SUPPORT = 'SUPPORT'
}

// Interfaces
export interface ProfessionalRole {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly category: ProfessionalCategory;
  readonly level: ProfessionalLevel;
  readonly isActive: boolean;
  readonly requiresCertification: boolean;
  readonly requiredSkills: readonly string[];
  readonly permissions: readonly string[];
  readonly baseHourlyRate?: number;
  readonly currency?: string;
  readonly canBookAppointments: boolean;
  readonly canManageSchedule: boolean;
  readonly canViewReports: boolean;
  readonly maxConcurrentAppointments: number;
  readonly businessId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
}

export interface CreateProfessionalRoleDto {
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly category: ProfessionalCategory;
  readonly level: ProfessionalLevel;
  readonly requiresCertification?: boolean;
  readonly requiredSkills?: readonly string[];
  readonly permissions?: readonly string[];
  readonly baseHourlyRate?: number;
  readonly currency?: string;
  readonly canBookAppointments?: boolean;
  readonly canManageSchedule?: boolean;
  readonly canViewReports?: boolean;
  readonly maxConcurrentAppointments?: number;
  readonly businessId?: string;
}

export interface UpdateProfessionalRoleDto {
  readonly name?: string;
  readonly code?: string;
  readonly description?: string;
  readonly category?: ProfessionalCategory;
  readonly level?: ProfessionalLevel;
  readonly isActive?: boolean;
  readonly requiresCertification?: boolean;
  readonly requiredSkills?: readonly string[];
  readonly permissions?: readonly string[];
  readonly baseHourlyRate?: number;
  readonly currency?: string;
  readonly canBookAppointments?: boolean;
  readonly canManageSchedule?: boolean;
  readonly canViewReports?: boolean;
  readonly maxConcurrentAppointments?: number;
}

export interface ListProfessionalRolesDto {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: 'createdAt' | 'name' | 'category' | 'level';
  readonly sortOrder?: 'asc' | 'desc';
  readonly search?: string;
  readonly category?: ProfessionalCategory;
  readonly level?: ProfessionalLevel;
  readonly isActive?: boolean;
  readonly requiresCertification?: boolean;
  readonly businessId?: string;
}

export interface ListProfessionalRolesResponse {
  readonly data: readonly ProfessionalRole[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export interface CreateProfessionalRoleResponse {
  readonly success: boolean;
  readonly data: ProfessionalRole;
  readonly message: string;
}

export interface UpdateProfessionalRoleResponse {
  readonly success: boolean;
  readonly data: ProfessionalRole;
  readonly message: string;
}

export interface DeleteProfessionalRoleResponse {
  readonly success: boolean;
  readonly message: string;
}

/**
 * 👔 Service principal pour la gestion des rôles professionnels
 */
export default class ProfessionalRolesService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister les rôles professionnels avec filtrage avancé
   */
  async list(params: ListProfessionalRolesDto = {}): Promise<ListProfessionalRolesResponse> {
    const response = await this.client.post('/api/v1/professional-roles/list', params);
    return response.data;
  }

  /**
   * 📄 Obtenir un rôle professionnel par ID
   */
  async getById(id: string): Promise<ProfessionalRole> {
    const response = await this.client.get(`/api/v1/professional-roles/${id}`);
    return response.data.data;
  }

  /**
   * ➕ Créer un nouveau rôle professionnel
   */
  async create(data: CreateProfessionalRoleDto): Promise<CreateProfessionalRoleResponse> {
    const response = await this.client.post('/api/v1/professional-roles', data);
    return response.data;
  }

  /**
   * ✏️ Mettre à jour un rôle professionnel
   */
  async update(id: string, data: UpdateProfessionalRoleDto): Promise<UpdateProfessionalRoleResponse> {
    const response = await this.client.put(`/api/v1/professional-roles/${id}`, data);
    return response.data;
  }

  /**
   * 🗑️ Supprimer un rôle professionnel
   */
  async delete(id: string): Promise<DeleteProfessionalRoleResponse> {
    const response = await this.client.delete(`/api/v1/professional-roles/${id}`);
    return response.data;
  }

  /**
   * 🏢 Obtenir les rôles par business
   */
  async getByBusiness(businessId: string): Promise<ProfessionalRole[]> {
    const response = await this.list({ businessId, limit: 100 });
    return [...response.data];
  }

  /**
   * 🏷️ Obtenir les rôles par catégorie
   */
  async getByCategory(category: ProfessionalCategory): Promise<ProfessionalRole[]> {
    const response = await this.list({ category, limit: 100 });
    return [...response.data];
  }

  /**
   * 📊 Obtenir les rôles par niveau
   */
  async getByLevel(level: ProfessionalLevel): Promise<ProfessionalRole[]> {
    const response = await this.list({ level, limit: 100 });
    return [...response.data];
  }

  /**
   * 🎓 Obtenir les rôles nécessitant une certification
   */
  async getCertificationRequiredRoles(): Promise<ProfessionalRole[]> {
    const response = await this.list({ requiresCertification: true, limit: 100 });
    return [...response.data];
  }

  /**
   * 📅 Obtenir les rôles pouvant gérer les rendez-vous
   */
  async getAppointmentManagerRoles(): Promise<ProfessionalRole[]> {
    const response = await this.list({ limit: 100 });
    return response.data.filter(role => role.canBookAppointments);
  }

  /**
   * 🔍 Rechercher des rôles par nom ou code
   */
  async search(query: string): Promise<ProfessionalRole[]> {
    const response = await this.list({ search: query, limit: 50 });
    return [...response.data];
  }

  /**
   * 📊 Obtenir les statistiques des rôles
   */
  async getStats(): Promise<{
    totalRoles: number;
    activeRoles: number;
    rolesByCategory: Record<ProfessionalCategory, number>;
    rolesByLevel: Record<ProfessionalLevel, number>;
    certificationRequiredCount: number;
  }> {
    const response = await this.client.get('/api/v1/professional-roles/stats');
    return response.data.data;
  }

  /**
   * 🏷️ Obtenir toutes les catégories disponibles
   */
  static getCategories(): ProfessionalCategory[] {
    return Object.values(ProfessionalCategory);
  }

  /**
   * 📊 Obtenir tous les niveaux disponibles
   */
  static getLevels(): ProfessionalLevel[] {
    return Object.values(ProfessionalLevel);
  }

  /**
   * 🎨 Obtenir l'icône pour une catégorie
   */
  static getCategoryIcon(category: ProfessionalCategory): string {
    const icons: Record<ProfessionalCategory, string> = {
      [ProfessionalCategory.MEDICAL]: '⚕️',
      [ProfessionalCategory.PARAMEDICAL]: '🩺',
      [ProfessionalCategory.ADMINISTRATIVE]: '📋',
      [ProfessionalCategory.TECHNICAL]: '⚙️',
      [ProfessionalCategory.MANAGEMENT]: '👔',
      [ProfessionalCategory.BEAUTY]: '💄',
      [ProfessionalCategory.WELLNESS]: '🧘',
      [ProfessionalCategory.FITNESS]: '💪',
      [ProfessionalCategory.EDUCATION]: '🎓',
      [ProfessionalCategory.SUPPORT]: '🛠️'
    };
    return icons[category] || '👔';
  }

  /**
   * 🎨 Obtenir la couleur pour un niveau
   */
  static getLevelColor(level: ProfessionalLevel): string {
    const colors: Record<ProfessionalLevel, string> = {
      [ProfessionalLevel.INTERN]: '#94A3B8',      // Gris
      [ProfessionalLevel.JUNIOR]: '#22C55E',      // Vert
      [ProfessionalLevel.SENIOR]: '#3B82F6',      // Bleu
      [ProfessionalLevel.EXPERT]: '#8B5CF6',      // Violet
      [ProfessionalLevel.LEAD]: '#F59E0B',        // Orange
      [ProfessionalLevel.MANAGER]: '#EF4444',     // Rouge
      [ProfessionalLevel.DIRECTOR]: '#1F2937'     // Noir
    };
    return colors[level] || '#6B7280';
  }

  /**
   * 📈 Obtenir l'ordre de priorité d'un niveau
   */
  static getLevelPriority(level: ProfessionalLevel): number {
    const priorities: Record<ProfessionalLevel, number> = {
      [ProfessionalLevel.INTERN]: 1,
      [ProfessionalLevel.JUNIOR]: 2,
      [ProfessionalLevel.SENIOR]: 3,
      [ProfessionalLevel.EXPERT]: 4,
      [ProfessionalLevel.LEAD]: 5,
      [ProfessionalLevel.MANAGER]: 6,
      [ProfessionalLevel.DIRECTOR]: 7
    };
    return priorities[level] || 0;
  }

  /**
   * ✅ Valider les données d'un rôle professionnel
   */
  static validateRoleData(data: CreateProfessionalRoleDto | UpdateProfessionalRoleDto): string[] {
    const errors: string[] = [];

    if ('name' in data && data.name !== undefined) {
      if (!data.name || data.name.trim().length < 2) {
        errors.push('Le nom du rôle doit contenir au moins 2 caractères');
      }
      if (data.name.length > 100) {
        errors.push('Le nom du rôle ne peut pas dépasser 100 caractères');
      }
    }

    if ('code' in data && data.code !== undefined) {
      if (!data.code || data.code.trim().length < 2) {
        errors.push('Le code du rôle doit contenir au moins 2 caractères');
      }
      if (!/^[A-Z0-9_]{2,20}$/.test(data.code)) {
        errors.push('Le code doit contenir uniquement des lettres majuscules, chiffres et underscores');
      }
    }

    if ('baseHourlyRate' in data && data.baseHourlyRate !== undefined) {
      if (data.baseHourlyRate < 0) {
        errors.push('Le taux horaire de base ne peut pas être négatif');
      }
      if (data.baseHourlyRate > 1000) {
        errors.push('Le taux horaire de base semble trop élevé (max 1000)');
      }
    }

    if ('maxConcurrentAppointments' in data && data.maxConcurrentAppointments !== undefined) {
      if (data.maxConcurrentAppointments < 1) {
        errors.push('Le nombre maximum de rendez-vous simultanés doit être au moins 1');
      }
      if (data.maxConcurrentAppointments > 50) {
        errors.push('Le nombre maximum de rendez-vous simultanés ne peut pas dépasser 50');
      }
    }

    return errors;
  }

  /**
   * 🔧 Utilitaires pour les rôles professionnels
   */
  static readonly utils = {
    /**
     * Générer un code à partir du nom
     */
    generateCode: (name: string): string => {
      return name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 20);
    },

    /**
     * Formater le nom d'un rôle
     */
    formatName: (name: string): string => {
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },

    /**
     * Vérifier si un rôle peut effectuer une action
     */
    canPerformAction: (role: ProfessionalRole, action: string): boolean => {
      return role.permissions.includes(action);
    },

    /**
     * Comparer deux niveaux professionnels
     */
    compareLevels: (level1: ProfessionalLevel, level2: ProfessionalLevel): number => {
      const priority1 = ProfessionalRolesService.getLevelPriority(level1);
      const priority2 = ProfessionalRolesService.getLevelPriority(level2);
      return priority1 - priority2;
    },

    /**
     * Obtenir les permissions par défaut selon le niveau
     */
    getDefaultPermissions: (level: ProfessionalLevel): string[] => {
      const basePermissions = ['VIEW_PROFILE', 'UPDATE_PROFILE'];

      const levelPermissions: Record<ProfessionalLevel, string[]> = {
        [ProfessionalLevel.INTERN]: [...basePermissions],
        [ProfessionalLevel.JUNIOR]: [...basePermissions, 'VIEW_APPOINTMENTS'],
        [ProfessionalLevel.SENIOR]: [...basePermissions, 'VIEW_APPOINTMENTS', 'MANAGE_APPOINTMENTS'],
        [ProfessionalLevel.EXPERT]: [...basePermissions, 'VIEW_APPOINTMENTS', 'MANAGE_APPOINTMENTS', 'VIEW_REPORTS'],
        [ProfessionalLevel.LEAD]: [...basePermissions, 'VIEW_APPOINTMENTS', 'MANAGE_APPOINTMENTS', 'VIEW_REPORTS', 'MANAGE_TEAM'],
        [ProfessionalLevel.MANAGER]: [...basePermissions, 'VIEW_APPOINTMENTS', 'MANAGE_APPOINTMENTS', 'VIEW_REPORTS', 'MANAGE_TEAM', 'MANAGE_BUSINESS'],
        [ProfessionalLevel.DIRECTOR]: [...basePermissions, 'VIEW_APPOINTMENTS', 'MANAGE_APPOINTMENTS', 'VIEW_REPORTS', 'MANAGE_TEAM', 'MANAGE_BUSINESS', 'FULL_ACCESS']
      };

      return levelPermissions[level] || basePermissions;
    }
  };
}
