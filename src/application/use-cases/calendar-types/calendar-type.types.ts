import type { CalendarType } from "@domain/entities/calendar-type.entity";

/**
 * 🎯 Types centralisés pour CalendarType Use Cases
 * Évite la duplication et assure la cohérence
 */

// Request types
export interface CreateCalendarTypeRequest {
  readonly businessId: string;
  readonly name: string;
  readonly code: string;
  readonly description: string;
  readonly icon?: string;
  readonly color?: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly requestingUserId: string;
  readonly correlationId?: string;
  readonly timestamp: Date;
}

export interface GetCalendarTypeByIdRequest {
  readonly calendarTypeId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
}

export interface ListCalendarTypesRequest {
  readonly businessId?: string; // Optional - peut filtrer par business ou récupérer tous
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: "asc" | "desc";
  readonly search?: string;
  readonly isActive?: boolean;
  readonly requestingUserId: string;
  readonly correlationId?: string;
}

export interface UpdateCalendarTypeRequest {
  readonly calendarTypeId: string;
  readonly businessId: string;
  readonly name?: string;
  readonly code?: string;
  readonly description?: string;
  readonly icon?: string;
  readonly color?: string;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
  readonly requestingUserId: string;
  readonly correlationId?: string;
}

export interface DeleteCalendarTypeRequest {
  readonly calendarTypeId: string;
  readonly businessId: string;
  readonly requestingUserId: string;
  readonly correlationId?: string;
}

// Response types
export interface CreateCalendarTypeResponse {
  readonly calendarType: CalendarType;
  readonly success: true;
  readonly message: string;
}

export interface GetCalendarTypeByIdResponse {
  readonly calendarType: CalendarType;
}

export interface ListCalendarTypesResponse {
  readonly data: CalendarType[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export interface UpdateCalendarTypeResponse {
  readonly calendarType: CalendarType;
  readonly success: true;
  readonly message: string;
}

export interface DeleteCalendarTypeResponse {
  readonly success: true;
  readonly message: string;
}
