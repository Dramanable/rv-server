/**
 * 🎯 Skills Service - Gestion des Compétences
 *
 * Service pour la gestion des compétences professionnelles
 * dans le système RV Project
 *
 * @version 1.0.0
 */

import { RVProjectClient } from '../client';

// Enums
export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum SkillCategory {
  TECHNICAL = 'TECHNICAL',
  SOFT_SKILLS = 'SOFT_SKILLS',
  LANGUAGES = 'LANGUAGES',
  CERTIFICATIONS = 'CERTIFICATIONS',
  MEDICAL = 'MEDICAL',
  BEAUTY = 'BEAUTY',
  WELLNESS = 'WELLNESS',
  FITNESS = 'FITNESS',
  EDUCATION = 'EDUCATION',
  OTHER = 'OTHER'
}

// Interfaces
export interface Skill {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly category: SkillCategory;
  readonly level?: SkillLevel;
  readonly isCritical: boolean;
  readonly isActive: boolean;
  readonly businessId?: string;
  readonly tags?: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
}

export interface CreateSkillDto {
  readonly name: string;
  readonly description?: string;
  readonly category: SkillCategory;
  readonly level?: SkillLevel;
  readonly isCritical?: boolean;
  readonly businessId?: string;
  readonly tags?: readonly string[];
}

export interface UpdateSkillDto {
  readonly name?: string;
  readonly description?: string;
  readonly category?: SkillCategory;
  readonly level?: SkillLevel;
  readonly isCritical?: boolean;
  readonly isActive?: boolean;
  readonly tags?: readonly string[];
}

export interface ListSkillsDto {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: 'createdAt' | 'name' | 'category' | 'level';
  readonly sortOrder?: 'asc' | 'desc';
  readonly search?: string;
  readonly category?: SkillCategory;
  readonly level?: SkillLevel;
  readonly isCritical?: boolean;
  readonly isActive?: boolean;
  readonly businessId?: string;
  readonly tags?: readonly string[];
}

export interface ListSkillsResponse {
  readonly data: readonly Skill[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export interface CreateSkillResponse {
  readonly success: boolean;
  readonly data: Skill;
  readonly message: string;
}

export interface UpdateSkillResponse {
  readonly success: boolean;
  readonly data: Skill;
  readonly message: string;
}

export interface DeleteSkillResponse {
  readonly success: boolean;
  readonly message: string;
}

export interface SkillAssignment {
  readonly id: string;
  readonly skillId: string;
  readonly staffId: string;
  readonly level: SkillLevel;
  readonly experienceYears?: number;
  readonly certificationDate?: string;
  readonly notes?: string;
  readonly isVerified: boolean;
  readonly verifiedBy?: string;
  readonly verifiedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AssignSkillDto {
  readonly skillId: string;
  readonly staffId: string;
  readonly level: SkillLevel;
  readonly experienceYears?: number;
  readonly certificationDate?: string;
  readonly notes?: string;
}

/**
 * 🎯 Service principal pour la gestion des compétences
 */
export default class SkillsService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister les compétences avec filtrage avancé
   */
  async list(params: ListSkillsDto = {}): Promise<ListSkillsResponse> {
    const response = await this.client.post('/api/v1/skills/list', params);
    return response.data;
  }

  /**
   * 📄 Obtenir une compétence par ID
   */
  async getById(id: string): Promise<Skill> {
    const response = await this.client.get(`/api/v1/skills/${id}`);
    return response.data.data;
  }

  /**
   * ➕ Créer une nouvelle compétence
   */
  async create(data: CreateSkillDto): Promise<CreateSkillResponse> {
    const response = await this.client.post('/api/v1/skills', data);
    return response.data;
  }

  /**
   * ✏️ Mettre à jour une compétence
   */
  async update(id: string, data: UpdateSkillDto): Promise<UpdateSkillResponse> {
    const response = await this.client.put(`/api/v1/skills/${id}`, data);
    return response.data;
  }

  /**
   * 🗑️ Supprimer une compétence
   */
  async delete(id: string): Promise<DeleteSkillResponse> {
    const response = await this.client.delete(`/api/v1/skills/${id}`);
    return response.data;
  }

  /**
   * 🏢 Obtenir les compétences par business
   */
  async getByBusiness(businessId: string): Promise<Skill[]> {
    const response = await this.list({ businessId, limit: 100 });
    return [...response.data];
  }

  /**
   * 🏷️ Obtenir les compétences par catégorie
   */
  async getByCategory(category: SkillCategory): Promise<Skill[]> {
    const response = await this.list({ category, limit: 100 });
    return [...response.data];
  }

  /**
   * 🎯 Obtenir les compétences critiques
   */
  async getCriticalSkills(): Promise<Skill[]> {
    const response = await this.list({ isCritical: true, limit: 100 });
    return [...response.data];
  }

  /**
   * 👨‍💼 Assigner une compétence à un membre du personnel
   */
  async assignToStaff(data: AssignSkillDto): Promise<SkillAssignment> {
    const response = await this.client.post('/api/v1/skills/assign', data);
    return response.data.data;
  }

  /**
   * ❌ Retirer une compétence d'un membre du personnel
   */
  async unassignFromStaff(skillId: string, staffId: string): Promise<void> {
    await this.client.delete(`/api/v1/skills/${skillId}/staff/${staffId}`);
  }

  /**
   * 📊 Obtenir les compétences d'un membre du personnel
   */
  async getStaffSkills(staffId: string): Promise<SkillAssignment[]> {
    const response = await this.client.get(`/api/v1/staff/${staffId}/skills`);
    return response.data.data;
  }

  /**
   * 👥 Obtenir le personnel ayant une compétence
   */
  async getStaffBySkill(skillId: string): Promise<SkillAssignment[]> {
    const response = await this.client.get(`/api/v1/skills/${skillId}/staff`);
    return response.data.data;
  }

  /**
   * 🔍 Rechercher des compétences par nom
   */
  async searchByName(query: string): Promise<Skill[]> {
    const response = await this.list({ search: query, limit: 50 });
    return [...response.data];
  }

  /**
   * 🏷️ Obtenir toutes les catégories disponibles
   */
  static getCategories(): SkillCategory[] {
    return Object.values(SkillCategory);
  }

  /**
   * 📊 Obtenir tous les niveaux disponibles
   */
  static getLevels(): SkillLevel[] {
    return Object.values(SkillLevel);
  }

  /**
   * 🎨 Obtenir l'icône pour une catégorie
   */
  static getCategoryIcon(category: SkillCategory): string {
    const icons: Record<SkillCategory, string> = {
      [SkillCategory.TECHNICAL]: '⚙️',
      [SkillCategory.SOFT_SKILLS]: '🤝',
      [SkillCategory.LANGUAGES]: '🌍',
      [SkillCategory.CERTIFICATIONS]: '🏆',
      [SkillCategory.MEDICAL]: '⚕️',
      [SkillCategory.BEAUTY]: '💄',
      [SkillCategory.WELLNESS]: '🧘',
      [SkillCategory.FITNESS]: '💪',
      [SkillCategory.EDUCATION]: '🎓',
      [SkillCategory.OTHER]: '📚'
    };
    return icons[category] || '📚';
  }

  /**
   * 🎨 Obtenir la couleur pour un niveau
   */
  static getLevelColor(level: SkillLevel): string {
    const colors: Record<SkillLevel, string> = {
      [SkillLevel.BEGINNER]: '#22C55E',     // Vert
      [SkillLevel.INTERMEDIATE]: '#3B82F6', // Bleu
      [SkillLevel.ADVANCED]: '#F59E0B',     // Orange
      [SkillLevel.EXPERT]: '#EF4444'        // Rouge
    };
    return colors[level] || '#6B7280';
  }

  /**
   * 📈 Obtenir le pourcentage de progression pour un niveau
   */
  static getLevelProgress(level: SkillLevel): number {
    const progress: Record<SkillLevel, number> = {
      [SkillLevel.BEGINNER]: 25,
      [SkillLevel.INTERMEDIATE]: 50,
      [SkillLevel.ADVANCED]: 75,
      [SkillLevel.EXPERT]: 100
    };
    return progress[level] || 0;
  }

  /**
   * ✅ Valider les données d'une compétence
   */
  static validateSkillData(data: CreateSkillDto | UpdateSkillDto): string[] {
    const errors: string[] = [];

    if ('name' in data && data.name !== undefined) {
      if (!data.name || data.name.trim().length < 2) {
        errors.push('Le nom de la compétence doit contenir au moins 2 caractères');
      }
      if (data.name.length > 100) {
        errors.push('Le nom de la compétence ne peut pas dépasser 100 caractères');
      }
    }

    if ('description' in data && data.description !== undefined) {
      if (data.description && data.description.length > 500) {
        errors.push('La description ne peut pas dépasser 500 caractères');
      }
    }

    if ('category' in data && data.category !== undefined) {
      if (!Object.values(SkillCategory).includes(data.category)) {
        errors.push('Catégorie de compétence invalide');
      }
    }

    if ('level' in data && data.level !== undefined) {
      if (!Object.values(SkillLevel).includes(data.level)) {
        errors.push('Niveau de compétence invalide');
      }
    }

    if ('tags' in data && data.tags !== undefined) {
      if (data.tags && data.tags.length > 10) {
        errors.push('Maximum 10 tags autorisés');
      }
      if (data.tags && data.tags.some(tag => tag.length > 50)) {
        errors.push('Chaque tag ne peut pas dépasser 50 caractères');
      }
    }

    return errors;
  }

  /**
   * 🔧 Utilitaires pour les compétences
   */
  static readonly utils = {
    /**
     * Formater le nom d'une compétence
     */
    formatName: (name: string): string => {
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },

    /**
     * Générer des tags à partir d'une description
     */
    generateTags: (description: string): string[] => {
      if (!description) return [];

      const words = description
        .toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 3)
        .slice(0, 5);

      return [...new Set(words)];
    },

    /**
     * Calculer le score de correspondance pour une recherche
     */
    calculateMatchScore: (skill: Skill, query: string): number => {
      const lowerQuery = query.toLowerCase();
      let score = 0;

      // Correspondance exacte du nom
      if (skill.name.toLowerCase() === lowerQuery) score += 100;
      // Nom commence par la requête
      else if (skill.name.toLowerCase().startsWith(lowerQuery)) score += 50;
      // Nom contient la requête
      else if (skill.name.toLowerCase().includes(lowerQuery)) score += 25;

      // Correspondance dans la description
      if (skill.description?.toLowerCase().includes(lowerQuery)) score += 10;

      // Correspondance dans les tags
      if (skill.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) score += 15;

      return score;
    },

    /**
     * Grouper les compétences par catégorie
     */
    groupByCategory: (skills: Skill[]): Record<SkillCategory, Skill[]> => {
      const grouped = {} as Record<SkillCategory, Skill[]>;

      Object.values(SkillCategory).forEach(category => {
        grouped[category] = [];
      });

      skills.forEach(skill => {
        grouped[skill.category].push(skill);
      });

      return grouped;
    },

    /**
     * Obtenir les compétences recommandées
     */
    getRecommendedSkills: (currentSkills: Skill[], allSkills: Skill[]): Skill[] => {
      const currentCategories = new Set(currentSkills.map(s => s.category));
      const currentTags = new Set(currentSkills.flatMap(s => s.tags || []));

      return allSkills
        .filter(skill =>
          !currentSkills.some(cs => cs.id === skill.id) &&
          (currentCategories.has(skill.category) ||
           skill.tags?.some(tag => currentTags.has(tag)))
        )
        .slice(0, 10);
    }
  };
}
