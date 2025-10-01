/**
 * 🔍 SHARED TYPES - Pagination & Filtres
 *
 * Types réutilisables pour la pagination et filtrage
 */

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage?: number;
  previousPage?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Paramètres de recherche génériques
 */
export interface SearchParams {
  query?: string;
  fields?: string[]; // Champs dans lesquels rechercher
}

/**
 * Filtres de date
 */
export interface DateFilter {
  from?: Date;
  to?: Date;
}

/**
 * Filtres génériques avec opérateurs
 */
export interface Filter {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "like" | "ilike";
  value: string | number | boolean | string[] | number[];
}

/**
 * Paramètres complets de requête
 */
export interface QueryParams extends PaginationParams {
  search?: SearchParams;
  filters?: Filter[];
  dateFilters?: Record<string, DateFilter>;
}

/**
 * Builder pour construire des paramètres de requête
 */
export class QueryBuilder {
  private readonly params: QueryParams = {
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "DESC",
  };

  page(page: number): this {
    this.params.page = Math.max(1, page);
    return this;
  }

  limit(limit: number): this {
    this.params.limit = Math.min(100, Math.max(1, limit)); // Max 100 items
    return this;
  }

  sortBy(field: string, order: "ASC" | "DESC" = "ASC"): this {
    this.params.sortBy = field;
    this.params.sortOrder = order;
    return this;
  }

  search(query: string, fields?: string[]): this {
    this.params.search = { query, fields };
    return this;
  }

  filter(
    field: string,
    operator: Filter["operator"],
    value: string | number | boolean | string[] | number[],
  ): this {
    if (!this.params.filters) {
      this.params.filters = [];
    }
    this.params.filters.push({ field, operator, value });
    return this;
  }

  dateRange(field: string, from?: Date, to?: Date): this {
    if (!this.params.dateFilters) {
      this.params.dateFilters = {};
    }
    this.params.dateFilters[field] = { from, to };
    return this;
  }

  build(): QueryParams {
    return { ...this.params };
  }
}
