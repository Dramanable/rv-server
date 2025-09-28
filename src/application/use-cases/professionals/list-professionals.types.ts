/**
 * @fileoverview ListProfessionalsUseCase - Types & Interfaces
 * @module application/use-cases/professionals/list-professionals.types
 * @description Type definitions for listing professionals with advanced search and pagination
 */

import { Professional } from '@domain/entities/professional.entity';

// ✅ Pagination interface
export interface PaginationOptions {
  readonly page: number;
  readonly limit: number;
}

// ✅ Sorting options
export interface SortingOptions {
  readonly sortBy: string;
  readonly sortOrder: 'asc' | 'desc';
}

// ✅ Search and filter options
export interface ProfessionalFilters {
  readonly search?: string;
  readonly isActive?: boolean;
  readonly specialization?: string;
}

// ✅ Request interface
export interface ListProfessionalsRequest {
  readonly businessId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
  readonly pagination: PaginationOptions;
  readonly filters?: ProfessionalFilters;
  readonly sorting?: SortingOptions;
}

// ✅ Pagination metadata
export interface PaginationMeta {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly itemsPerPage: number;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
}

// ✅ Response interface
export interface ListProfessionalsResponse {
  readonly data: Professional[];
  readonly meta: PaginationMeta;
}
