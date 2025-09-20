/**
 * 🏢 Business Sector Repository Interface - Clean Architecture Port
 *
 * Interface pour la persistance des secteurs d'activité métier.
 * Définit le contrat pour les adaptateurs d'infrastructure.
 */

import { BusinessSector } from '@domain/entities/business-sector.entity';

/**
 * 📋 Filtres de recherche pour les secteurs d'activité
 */
export interface BusinessSectorFilters {
  readonly search?: string; // Recherche textuelle dans name/description
  readonly isActive?: boolean; // Filtre par statut actif/inactif
  readonly codes?: string[]; // Filtrage par codes spécifiques
  readonly parentSectorId?: string; // Filtre par secteur parent (si hiérarchie)
}

/**
 * 📊 Options de tri pour les secteurs d'activité
 */
export interface BusinessSectorSortOptions {
  readonly field: 'name' | 'code' | 'createdAt' | 'updatedAt';
  readonly direction: 'ASC' | 'DESC';
}

/**
 * 📄 Options de pagination
 */
export interface BusinessSectorPaginationOptions {
  readonly page: number;
  readonly limit: number;
}

/**
 * 📋 Résultat paginé des secteurs d'activité
 */
export interface BusinessSectorListResult {
  readonly data: BusinessSector[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

/**
 * 🔍 Options complètes de requête pour la liste des secteurs
 */
export interface BusinessSectorQueryOptions {
  readonly pagination?: BusinessSectorPaginationOptions;
  readonly sort?: BusinessSectorSortOptions;
  readonly filters?: BusinessSectorFilters;
}

/**
 * 🏢 Interface Repository pour les Secteurs d'Activité
 *
 * Contrat pour la persistance des secteurs d'activité avec opérations CRUD complètes
 * et recherche avancée pour la gestion par les super-administrateurs.
 */
export interface IBusinessSectorRepository {
  /**
   * 💾 Sauvegarder un secteur d'activité (create/update)
   */
  save(businessSector: BusinessSector): Promise<BusinessSector>;

  /**
   * 🔍 Trouver un secteur par son ID unique
   */
  findById(id: string): Promise<BusinessSector | null>;

  /**
   * 🔍 Trouver un secteur par son code unique
   */
  findByCode(code: string): Promise<BusinessSector | null>;

  /**
   * 📋 Lister tous les secteurs avec pagination et filtres
   */
  findAll(
    options?: BusinessSectorQueryOptions,
  ): Promise<BusinessSectorListResult>;

  /**
   * 🗑️ Supprimer un secteur (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * ✅ Vérifier l'existence d'un secteur par ID
   */
  exists(id: string): Promise<boolean>;

  /**
   * 🔍 Vérifier l'unicité d'un code de secteur
   * @param code Code à vérifier
   * @param excludeId ID à exclure de la vérification (pour les updates)
   */
  isCodeUnique(code: string, excludeId?: string): Promise<boolean>;

  /**
   * 📊 Compter le nombre total de secteurs
   */
  count(filters?: BusinessSectorFilters): Promise<number>;

  /**
   * 🔍 Recherche textuelle avancée dans les secteurs
   */
  searchByText(
    searchTerm: string,
    options?: BusinessSectorQueryOptions,
  ): Promise<BusinessSectorListResult>;

  /**
   * 📋 Trouver les secteurs actifs uniquement
   */
  findActiveOnly(
    options?: BusinessSectorQueryOptions,
  ): Promise<BusinessSectorListResult>;

  /**
   * 🔄 Activer/désactiver un secteur
   */
  updateStatus(id: string, isActive: boolean): Promise<BusinessSector>;

  /**
   * 📋 Obtenir les secteurs les plus utilisés (par nombre d'utilisateurs associés)
   * Utile pour les statistiques et l'administration
   */
  findMostUsed(limit?: number): Promise<BusinessSector[]>;

  /**
   * 📊 Compter l'utilisation d'un secteur dans les entreprises
   * Retourne le nombre d'entreprises qui utilisent ce secteur
   * Utile pour valider la suppression (ne pas supprimer si en cours d'utilisation)
   */
  countUsageInBusinesses(sectorId: string): Promise<number>;
}
