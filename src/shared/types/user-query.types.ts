/**
 * 🔍 USER SPECIFIC - Filtres et recherche pour les utilisateurs
 *
 * Types spécifiques pour la recherche et filtrage des utilisateurs
 */

import { UserRole } from '../enums/user-role.enum';
import { DateFilter } from './pagination.types';

/**
 * Filtres spécifiques aux utilisateurs
 */
export interface UserFilters {
  role?: UserRole | UserRole[];
  isActive?: boolean;
  emailDomain?: string;
  createdAt?: DateFilter;
  lastLoginAt?: DateFilter;
}

/**
 * Paramètres de recherche utilisateur
 */
export interface UserSearchParams {
  query?: string; // Recherche dans name, email
  name?: string;
  email?: string;
  domain?: string; // Domaine email (@company.com)
}

/**
 * Paramètres complets pour la requête utilisateur
 */
export interface UserQueryParams {
  page: number;
  limit: number;
  sortBy?: UserSortField;
  sortOrder?: 'ASC' | 'DESC';
  search?: UserSearchParams;
  filters?: UserFilters;
}

/**
 * Options de tri spécifiques aux utilisateurs
 */
export type UserSortField =
  | 'name'
  | 'email'
  | 'role'
  | 'createdAt'
  | 'lastLoginAt';

/**
 * Builder spécialisé pour les requêtes utilisateur
 */
export class UserQueryBuilder {
  private params: UserQueryParams = {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    search: {},
    filters: {},
  };

  page(page: number): this {
    this.params.page = Math.max(1, page);
    return this;
  }

  limit(limit: number): this {
    this.params.limit = Math.min(100, Math.max(1, limit));
    return this;
  }

  sortBy(field: UserSortField, order: 'ASC' | 'DESC' = 'ASC'): this {
    this.params.sortBy = field;
    this.params.sortOrder = order;
    return this;
  }

  searchByName(name: string): this {
    if (!this.params.search) this.params.search = {};
    this.params.search.name = name;
    return this;
  }

  searchByEmail(email: string): this {
    if (!this.params.search) this.params.search = {};
    this.params.search.email = email;
    return this;
  }

  searchByDomain(domain: string): this {
    if (!this.params.search) this.params.search = {};
    this.params.search.domain = domain;
    return this;
  }

  searchGlobal(query: string): this {
    if (!this.params.search) this.params.search = {};
    this.params.search.query = query;
    return this;
  }

  filterByRole(role: UserRole | UserRole[]): this {
    if (!this.params.filters) this.params.filters = {};
    this.params.filters.role = role;
    return this;
  }

  filterByActive(isActive: boolean): this {
    if (!this.params.filters) this.params.filters = {};
    this.params.filters.isActive = isActive;
    return this;
  }

  filterByEmailDomain(domain: string): this {
    if (!this.params.filters) this.params.filters = {};
    this.params.filters.emailDomain = domain;
    return this;
  }

  filterByCreationDate(from?: Date, to?: Date): this {
    if (!this.params.filters) this.params.filters = {};
    this.params.filters.createdAt = { from, to };
    return this;
  }

  filterByLastLogin(from?: Date, to?: Date): this {
    if (!this.params.filters) this.params.filters = {};
    this.params.filters.lastLoginAt = { from, to };
    return this;
  }

  // Filtres prédéfinis utiles
  onlyAdmins(): this {
    return this.filterByRole([UserRole.PLATFORM_ADMIN]);
  }

  onlyManagers(): this {
    return this.filterByRole([UserRole.LOCATION_MANAGER]);
  }

  onlyUsers(): this {
    return this.filterByRole([UserRole.REGULAR_CLIENT]);
  }

  recentlyCreated(days: number = 7): this {
    const from = new Date();
    from.setDate(from.getDate() - days);
    return this.filterByCreationDate(from);
  }

  activeUsersOnly(): this {
    return this.filterByActive(true);
  }

  build(): UserQueryParams {
    return { ...this.params };
  }
}
