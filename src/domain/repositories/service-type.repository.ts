import { ServiceType } from '../entities/service-type.entity';
import { ServiceTypeId } from '../value-objects/service-type-id.value-object';
import { BusinessId } from '../value-objects/business-id.value-object';

export interface ServiceTypeSearchCriteria {
  readonly businessId: BusinessId;
  readonly isActive?: boolean;
  readonly search?: string;
  readonly codes?: string[];
  readonly sortBy?: 'name' | 'code' | 'createdAt' | 'sortOrder';
  readonly sortOrder?: 'asc' | 'desc';
  readonly page?: number;
  readonly limit?: number;
}

export interface ServiceTypeSearchResult {
  readonly serviceTypes: ServiceType[];
  readonly totalCount: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

export interface IServiceTypeRepository {
  /**
   * Save a service type (create or update)
   */
  save(serviceType: ServiceType): Promise<ServiceType>;

  /**
   * Find service type by ID
   */
  findById(id: ServiceTypeId): Promise<ServiceType | null>;

  /**
   * Find service type by business ID and code
   */
  findByBusinessIdAndCode(
    businessId: BusinessId,
    code: string,
  ): Promise<ServiceType | null>;

  /**
   * Find service type by business ID and name
   */
  findByBusinessIdAndName(
    businessId: BusinessId,
    name: string,
  ): Promise<ServiceType | null>;

  /**
   * Find all service types by business ID
   */
  findByBusinessId(businessId: BusinessId): Promise<ServiceType[]>;

  /**
   * Find active service types by business ID
   */
  findActiveByBusinessId(businessId: BusinessId): Promise<ServiceType[]>;

  /**
   * Search service types with criteria
   */
  search(criteria: ServiceTypeSearchCriteria): Promise<ServiceTypeSearchResult>;

  /**
   * Check if service type exists by business ID and code
   */
  existsByBusinessIdAndCode(
    businessId: BusinessId,
    code: string,
  ): Promise<boolean>;

  /**
   * Check if service type exists by business ID and name
   */
  existsByBusinessIdAndName(
    businessId: BusinessId,
    name: string,
  ): Promise<boolean>;

  /**
   * Count service types by business ID
   */
  countByBusinessId(businessId: BusinessId): Promise<number>;

  /**
   * Count active service types by business ID
   */
  countActiveByBusinessId(businessId: BusinessId): Promise<number>;

  /**
   * Delete service type (soft delete - set inactive)
   */
  delete(id: ServiceTypeId): Promise<void>;

  /**
   * Hard delete service type (use with caution)
   */
  hardDelete(id: ServiceTypeId): Promise<void>;

  /**
   * Check if service type is referenced by other entities
   */
  isReferencedByServices(id: ServiceTypeId): Promise<boolean>;

  /**
   * Get service types ordered by sort order
   */
  findByBusinessIdOrderedBySortOrder(
    businessId: BusinessId,
  ): Promise<ServiceType[]>;

  /**
   * Update sort orders for multiple service types
   */
  updateSortOrders(
    updates: { id: ServiceTypeId; sortOrder: number }[],
  ): Promise<void>;
}
