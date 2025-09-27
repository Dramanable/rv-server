import { BusinessId } from '../value-objects/business-id.value-object';
import { Skill } from '../entities/skill.entity';

/**
 * 🎯 Skill Repository Interface
 *
 * Interface pour la gestion des compétences par business.
 * Permet CRUD complet + recherche et filtrage.
 */
export interface ISkillRepository {
  // ➕ CRUD Operations

  /**
   * Sauvegarder une compétence (create/update)
   */
  save(skill: Skill): Promise<Skill>;

  /**
   * Récupérer une compétence par ID
   */
  findById(skillId: string): Promise<Skill | null>;

  /**
   * Récupérer toutes les compétences d'un business
   */
  findByBusinessId(businessId: BusinessId): Promise<Skill[]>;

  /**
   * Récupérer les compétences actives d'un business
   */
  findActiveByBusinessId(businessId: BusinessId): Promise<Skill[]>;

  /**
   * Récupérer les compétences critiques d'un business
   */
  findCriticalByBusinessId(businessId: BusinessId): Promise<Skill[]>;

  /**
   * Supprimer une compétence
   */
  delete(skillId: string): Promise<void>;

  // 🔍 Search & Filter Operations

  /**
   * Rechercher des compétences par nom ou description
   */
  searchByText(
    businessId: BusinessId,
    searchText: string,
    options?: {
      includeInactive?: boolean;
      limit?: number;
      offset?: number;
    },
  ): Promise<Skill[]>;

  /**
   * Récupérer les compétences par catégorie
   */
  findByCategory(
    businessId: BusinessId,
    category: string,
    options?: {
      includeInactive?: boolean;
    },
  ): Promise<Skill[]>;

  /**
   * Récupérer toutes les catégories distinctes d'un business
   */
  findDistinctCategories(businessId: BusinessId): Promise<string[]>;

  /**
   * Liste paginée avec filtres avancés
   */
  findWithFilters(request: {
    businessId: BusinessId;
    search?: string;
    category?: string;
    isCritical?: boolean;
    isActive?: boolean;
    page: number;
    limit: number;
    sortBy?: 'name' | 'category' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    skills: Skill[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>;

  // 🔄 Business Logic Support

  /**
   * Vérifier si une compétence est utilisée par des staff members
   */
  isSkillInUse(skillId: string): Promise<boolean>;

  /**
   * Vérifier si le nom existe déjà dans le business
   */
  isNameTaken(
    businessId: BusinessId,
    name: string,
    excludeSkillId?: string,
  ): Promise<boolean>;

  /**
   * Compter les compétences par business
   */
  countByBusinessId(
    businessId: BusinessId,
    filters?: {
      isActive?: boolean;
      isCritical?: boolean;
      category?: string;
    },
  ): Promise<number>;

  /**
   * Récupérer les compétences les plus utilisées d'un business
   */
  findMostUsedSkills(
    businessId: BusinessId,
    limit?: number,
  ): Promise<
    {
      skill: Skill;
      usageCount: number;
    }[]
  >;
}
