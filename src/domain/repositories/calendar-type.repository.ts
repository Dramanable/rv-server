import { CalendarType } from '@domain/entities/calendar-type.entity';
import { CalendarTypeId } from '@domain/value-objects/calendar-type-id.value-object';

export interface CalendarTypeSearchCriteria {
  readonly businessId?: string;
  readonly name?: string;
  readonly code?: string;
  readonly isActive?: boolean;
  readonly color?: string;
  readonly minDuration?: number;
  readonly maxDuration?: number;
  readonly search?: string;
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

export interface CalendarTypeSearchResult {
  readonly data: CalendarType[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

export interface ICalendarTypeRepository {
  /**
   * Save a calendar type (create or update)
   */
  save(calendarType: CalendarType): Promise<CalendarType>;

  /**
   * Find calendar type by ID
   */
  findById(id: CalendarTypeId): Promise<CalendarType | null>;

  /**
   * Find all calendar types with optional criteria
   */
  findAll(criteria?: CalendarTypeSearchCriteria): Promise<CalendarType[]>;

  /**
   * Find all calendar types by business ID
   */
  findByBusinessId(businessId: string): Promise<CalendarType[]>;

  /**
   * Find calendar type by business ID and name
   */
  findByBusinessIdAndName(
    businessId: string,
    name: string,
  ): Promise<CalendarType | null>;

  /**
   * Find calendar type by business ID and code
   */
  findByBusinessIdAndCode(
    businessId: string,
    code: string,
  ): Promise<CalendarType | null>;

  /**
   * Check if calendar type exists by business ID and name
   */
  existsByBusinessIdAndName(businessId: string, name: string): Promise<boolean>;

  /**
   * Check if calendar type exists by business ID and code
   */
  existsByBusinessIdAndCode(businessId: string, code: string): Promise<boolean>;

  /**
   * Soft delete calendar type
   */
  delete(id: CalendarTypeId): Promise<void>;

  /**
   * Hard delete calendar type (permanent)
   */
  hardDelete(id: CalendarTypeId): Promise<void>;

  /**
   * Count calendar types by business ID
   */
  countByBusinessId(businessId: string): Promise<number>;

  /**
   * Count active calendar types by business ID
   */
  countActiveByBusinessId(businessId: string): Promise<number>;

  /**
   * Update sort orders for calendar types
   */
  updateSortOrders(
    updates: Array<{ id: string; sortOrder: number }>,
  ): Promise<void>;

  /**
   * Find calendar types by business ID ordered by sort order
   */
  findByBusinessIdOrderedBySortOrder(
    businessId: string,
  ): Promise<CalendarType[]>;

  /**
   * Check if calendar type is referenced by services
   */
  isReferencedByServices(id: CalendarTypeId): Promise<boolean>;

  /**
   * Search calendar types with advanced criteria
   */
  search(
    criteria: CalendarTypeSearchCriteria,
  ): Promise<CalendarTypeSearchResult>;
}
