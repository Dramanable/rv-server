/**
 * 🏢 DOMAIN REPOSITORY INTERFACE - Business Context
 *
 * Interface de repository pour la gestion des contextes métier.
 * Définit les contrats pour la persistence des contextes business avec leurs locations et départements.
 *
 * PRINCIPES CLEAN ARCHITECTURE :
 * - Interface dans la couche Domain (port)
 * - Implémentation dans la couche Infrastructure (adapter)
 * - Pas de dépendances techniques dans cette interface
 */

import { BusinessContext } from '@domain/entities/business-context.entity';

export interface BusinessContextCriteria {
  readonly businessId?: string;
  readonly businessName?: string;
  readonly isActive?: boolean;
  readonly hasLocations?: boolean;
  readonly locationId?: string;
  readonly departmentId?: string;
}

export interface BusinessContextFilters {
  readonly search?: string;
  readonly businessIds?: string[];
  readonly isActive?: boolean;
  readonly minLocations?: number;
  readonly maxLocations?: number;
  readonly minDepartments?: number;
  readonly maxDepartments?: number;
}

export interface IBusinessContextRepository {
  /**
   * 💾 Sauvegarder un contexte métier
   */
  save(businessContext: BusinessContext): Promise<BusinessContext>;

  /**
   * 🔍 Trouver par ID business
   */
  findByBusinessId(businessId: string): Promise<BusinessContext | null>;

  /**
   * 🔍 Trouver par ID (alias pour findByBusinessId)
   */
  findById(businessId: string): Promise<BusinessContext | null>;

  /**
   * 📋 Trouver tous les contextes actifs
   */
  findAllActive(): Promise<BusinessContext[]>;

  /**
   * 🔍 Trouver selon des critères
   */
  findByCriteria(criteria: BusinessContextCriteria): Promise<BusinessContext[]>;

  /**
   * 📋 Lister avec filtres et pagination
   */
  findWithFilters(
    filters: BusinessContextFilters,
    pagination?: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
  ): Promise<{
    data: BusinessContext[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * ✅ Vérifier si un contexte existe et est actif
   */
  exists(businessId: string): Promise<boolean>;

  /**
   * 🏢 Vérifier si une location existe dans un business
   */
  locationExists(businessId: string, locationId: string): Promise<boolean>;

  /**
   * 🏢 Vérifier si un département existe dans une location
   */
  departmentExists(
    businessId: string,
    locationId: string,
    departmentId: string,
  ): Promise<boolean>;

  /**
   * 📊 Compter les contextes selon des critères
   */
  countByCriteria(criteria: BusinessContextCriteria): Promise<number>;

  /**
   * 🗑️ Supprimer un contexte (soft delete)
   */
  delete(businessId: string): Promise<boolean>;

  /**
   * 📈 Obtenir des statistiques de contextes
   */
  getContextStats(): Promise<{
    totalBusinesses: number;
    activeBusinesses: number;
    totalLocations: number;
    totalDepartments: number;
    averageLocationsPerBusiness: number;
    averageDepartmentsPerLocation: number;
  }>;

  /**
   * 🔍 Recherche de contextes par nom (case-insensitive)
   */
  searchByName(searchTerm: string): Promise<BusinessContext[]>;

  /**
   * 📍 Obtenir tous les contextes contenant une location spécifique
   */
  findByLocationId(locationId: string): Promise<BusinessContext[]>;

  /**
   * 🏢 Obtenir tous les contextes contenant un département spécifique
   */
  findByDepartmentId(departmentId: string): Promise<BusinessContext[]>;

  /**
   * 🎯 Valider qu'un contexte complet est valide
   */
  validateContext(context: {
    businessId: string;
    locationId?: string;
    departmentId?: string;
  }): Promise<boolean>;

  /**
   * 📊 Obtenir la hiérarchie complète d'un business
   */
  getBusinessHierarchy(businessId: string): Promise<{
    businessId: string;
    businessName: string;
    locations: Array<{
      locationId: string;
      locationName: string;
      departments: Array<{
        departmentId: string;
        departmentName: string;
      }>;
    }>;
  } | null>;

  /**
   * 🔄 Synchroniser un contexte avec les données externes
   */
  synchronizeWithBusiness(businessId: string): Promise<BusinessContext>;

  /**
   * 📋 Obtenir les chemins hiérarchiques complets
   */
  getContextPaths(businessId: string): Promise<
    Array<{
      businessId: string;
      locationId?: string;
      departmentId?: string;
      fullPath: string;
      level: 'BUSINESS' | 'LOCATION' | 'DEPARTMENT';
    }>
  >;

  /**
   * 🛠️ Mettre à jour le nom d'un business
   */
  updateBusinessName(
    businessId: string,
    newName: string,
  ): Promise<BusinessContext | null>;

  /**
   * 🏗️ Ajouter une location à un business existant
   */
  addLocation(
    businessId: string,
    locationId: string,
    locationName: string,
  ): Promise<BusinessContext | null>;

  /**
   * 🏢 Ajouter un département à une location existante
   */
  addDepartment(
    businessId: string,
    locationId: string,
    departmentId: string,
    departmentName: string,
  ): Promise<BusinessContext | null>;

  /**
   * ❌ Désactiver une location (et tous ses départements)
   */
  deactivateLocation(businessId: string, locationId: string): Promise<boolean>;

  /**
   * ❌ Désactiver un département
   */
  deactivateDepartment(
    businessId: string,
    locationId: string,
    departmentId: string,
  ): Promise<boolean>;

  /**
   * ✅ Réactiver une location
   */
  reactivateLocation(businessId: string, locationId: string): Promise<boolean>;

  /**
   * ✅ Réactiver un département
   */
  reactivateDepartment(
    businessId: string,
    locationId: string,
    departmentId: string,
  ): Promise<boolean>;
}
