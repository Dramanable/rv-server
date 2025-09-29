/**
 * 🏢 DOMAIN ENTITY - Business Context
 *
 * Entité métier pure représentant le contexte métier d'un utilisateur
 * avec ses locations et départements associés.
 *
 * PRINCIPES CLEAN ARCHITECTURE :
 * - Logique métier pure de gestion des contextes
 * - Hiérarchie Business > Location > Department
 * - Validation des accès selon les assignations de rôles
 */

import {
  ContextIdRequiredError,
  ContextNameRequiredError,
  LocationAlreadyExistsError,
  LocationNotFoundError,
  DepartmentAlreadyExistsError,
} from '../exceptions/rbac-business-context.exceptions';

export interface BusinessContextData {
  readonly businessId: string;
  readonly businessName: string;
  readonly locations: LocationContext[];
  readonly isActive: boolean;
}

export interface LocationContext {
  readonly locationId: string;
  readonly locationName: string;
  readonly departments: DepartmentContext[];
  readonly isActive: boolean;
}

export interface DepartmentContext {
  readonly departmentId: string;
  readonly departmentName: string;
  readonly isActive: boolean;
}

export class BusinessContext {
  private constructor(
    private readonly _businessId: string,
    private readonly _businessName: string,
    private readonly _locations: LocationContext[],
    private readonly _isActive: boolean,
  ) {}

  // Getters
  getBusinessId(): string {
    return this._businessId;
  }
  getBusinessName(): string {
    return this._businessName;
  }
  getLocations(): LocationContext[] {
    return [...this._locations];
  }
  isActiveContext(): boolean {
    return this._isActive;
  }

  /**
   * ✅ Factory Method - Créer un nouveau contexte métier
   */
  static create(
    businessId: string,
    businessName: string,
    locations: LocationContext[] = [],
  ): BusinessContext {
    this.validateBusinessData(businessId, businessName);

    return new BusinessContext(
      businessId,
      businessName.trim(),
      locations.filter((loc) => loc.isActive),
      true,
    );
  }

  /**
   * ✅ Factory Method - Restaurer depuis la persistence
   */
  static restore(data: BusinessContextData): BusinessContext {
    return new BusinessContext(
      data.businessId,
      data.businessName,
      data.locations,
      data.isActive,
    );
  }

  /**
   * 📍 Obtenir une location spécifique
   */
  getLocation(locationId: string): LocationContext | undefined {
    return this._locations.find(
      (loc) => loc.locationId === locationId && loc.isActive,
    );
  }

  /**
   * 🏢 Obtenir un département spécifique dans une location
   */
  getDepartment(
    locationId: string,
    departmentId: string,
  ): DepartmentContext | undefined {
    const location = this.getLocation(locationId);
    if (!location) {
      return undefined;
    }

    return location.departments.find(
      (dept) => dept.departmentId === departmentId && dept.isActive,
    );
  }

  /**
   * ✅ Vérifier si une location existe et est active
   */
  hasLocation(locationId: string): boolean {
    return this.getLocation(locationId) !== undefined;
  }

  /**
   * ✅ Vérifier si un département existe et est actif
   */
  hasDepartment(locationId: string, departmentId: string): boolean {
    return this.getDepartment(locationId, departmentId) !== undefined;
  }

  /**
   * 📋 Obtenir tous les départements d'une location
   */
  getLocationDepartments(locationId: string): DepartmentContext[] {
    const location = this.getLocation(locationId);
    return location ? location.departments.filter((dept) => dept.isActive) : [];
  }

  /**
   * 🔍 Obtenir tous les départements de toutes les locations
   */
  getAllDepartments(): Array<DepartmentContext & { locationId: string }> {
    return this._locations
      .filter((loc) => loc.isActive)
      .flatMap((loc) =>
        loc.departments
          .filter((dept) => dept.isActive)
          .map((dept) => ({
            ...dept,
            locationId: loc.locationId,
          })),
      );
  }

  /**
   * 📊 Obtenir les statistiques du contexte
   */
  getContextStats(): {
    totalLocations: number;
    activeLocations: number;
    totalDepartments: number;
    activeDepartments: number;
  } {
    const activeLocations = this._locations.filter((loc) => loc.isActive);

    // Calculer le total des départements dans toutes les locations (actives et inactives)
    const totalDepartments = this._locations.reduce(
      (total, loc) => total + loc.departments.length,
      0,
    );

    // Calculer les départements actifs uniquement dans les locations actives
    const activeDepartments = activeLocations.reduce(
      (total, loc) =>
        total + loc.departments.filter((dept) => dept.isActive).length,
      0,
    );

    return {
      totalLocations: this._locations.length,
      activeLocations: activeLocations.length,
      totalDepartments: totalDepartments,
      activeDepartments: activeDepartments,
    };
  }

  /**
   * 🔍 Rechercher des locations par nom (case-insensitive)
   */
  searchLocationsByName(searchTerm: string): LocationContext[] {
    const term = searchTerm.toLowerCase().trim();

    // Si le terme de recherche est vide, retourner un tableau vide
    if (!term || term.length === 0) {
      return [];
    }

    return this._locations.filter(
      (loc) => loc.isActive && loc.locationName.toLowerCase().includes(term),
    );
  }

  /**
   * 🔍 Rechercher des départements par nom (case-insensitive)
   */
  searchDepartmentsByName(
    searchTerm: string,
  ): Array<DepartmentContext & { locationId: string }> {
    const term = searchTerm.toLowerCase().trim();
    return this.getAllDepartments().filter((dept) =>
      dept.departmentName.toLowerCase().includes(term),
    );
  }

  /**
   * ✅ Vérifier si un contexte spécifique est valide
   */
  isValidContext(context: {
    businessId: string;
    locationId?: string;
    departmentId?: string;
  }): boolean {
    // Vérifier business ID
    if (context.businessId !== this._businessId) {
      return false;
    }

    // Si seulement business level, c'est valide
    if (!context.locationId && !context.departmentId) {
      return this._isActive;
    }

    // Si location spécifiée, vérifier qu'elle existe
    if (context.locationId && !this.hasLocation(context.locationId)) {
      return false;
    }

    // Si département spécifié, vérifier qu'il existe dans la location
    if (context.departmentId && context.locationId) {
      return this.hasDepartment(context.locationId, context.departmentId);
    }

    // Département sans location = invalide
    if (context.departmentId && !context.locationId) {
      return false;
    }

    return true;
  }

  /**
   * 🏗️ Ajouter une nouvelle location
   */
  addLocation(location: LocationContext): BusinessContext {
    // Vérifier que la location n'existe pas déjà
    if (this.hasLocation(location.locationId)) {
      throw new LocationAlreadyExistsError(location.locationId);
    }

    const newLocations = [...this._locations, location];

    return new BusinessContext(
      this._businessId,
      this._businessName,
      newLocations,
      this._isActive,
    );
  }

  /**
   * ➕ Ajouter un département à une location
   */
  addDepartmentToLocation(
    locationId: string,
    department: DepartmentContext,
  ): BusinessContext {
    const locationIndex = this._locations.findIndex(
      (loc) => loc.locationId === locationId,
    );
    if (locationIndex === -1) {
      throw new LocationNotFoundError(locationId);
    }

    const location = this._locations[locationIndex];

    // Vérifier que le département n'existe pas déjà
    if (
      location.departments.some(
        (dept) => dept.departmentId === department.departmentId,
      )
    ) {
      throw new DepartmentAlreadyExistsError(
        department.departmentId,
        locationId,
      );
    }

    const newDepartments = [...location.departments, department];
    const updatedLocation: LocationContext = {
      ...location,
      departments: newDepartments,
    };

    const newLocations = [...this._locations];
    newLocations[locationIndex] = updatedLocation;

    return new BusinessContext(
      this._businessId,
      this._businessName,
      newLocations,
      this._isActive,
    );
  }

  /**
   * 🎯 Obtenir le chemin hiérarchique complet
   */
  getContextPath(context: {
    locationId?: string;
    departmentId?: string;
  }): string {
    let path = this._businessName;

    if (context.locationId) {
      const location = this.getLocation(context.locationId);
      if (location) {
        path += ` > ${location.locationName}`;

        if (context.departmentId) {
          const department = this.getDepartment(
            context.locationId,
            context.departmentId,
          );
          if (department) {
            path += ` > ${department.departmentName}`;
          }
        }
      }
    }

    return path;
  }

  /**
   * 📊 Obtenir la représentation JSON pour logging/audit
   */
  toAuditData(): {
    businessId: string;
    businessName: string;
    locationsCount: number;
    departmentsCount: number;
    isActive: boolean;
  } {
    const stats = this.getContextStats();
    return {
      businessId: this._businessId,
      businessName: this._businessName,
      locationsCount: stats.activeLocations,
      departmentsCount: stats.activeDepartments,
      isActive: this._isActive,
    };
  }

  // Validation privée
  private static validateBusinessData(
    businessId: string,
    businessName: string,
  ): void {
    if (!businessId || businessId.trim().length === 0) {
      throw new ContextIdRequiredError('Business ID is required');
    }

    if (!businessName || businessName.trim().length === 0) {
      throw new ContextNameRequiredError('Business name is required');
    }

    if (businessName.trim().length < 2) {
      throw new ContextNameRequiredError(
        'Business name must be at least 2 characters long',
      );
    }
  }
}
