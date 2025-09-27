import { Service } from "../entities/service.entity";
import { BusinessId } from "../value-objects/business-id.value-object";
import { ServiceId } from "../value-objects/service-id.value-object";
import { UserId } from "../value-objects/user-id.value-object";

export const SERVICE_REPOSITORY = "SERVICE_REPOSITORY";

export interface ServiceRepository {
  /**
   * Find service by ID
   */
  findById(id: ServiceId): Promise<Service | null>;

  /**
   * Find all services for a business
   */
  findByBusinessId(businessId: BusinessId): Promise<Service[]>;

  /**
   * Find active services for a business
   */
  findActiveByBusinessId(businessId: BusinessId): Promise<Service[]>;

  /**
   * Find services by category
   */
  findByCategory(businessId: BusinessId, category: string): Promise<Service[]>;

  /**
   * Find services assigned to a staff member
   */
  findByStaffId(staffId: UserId): Promise<Service[]>;

  /**
   * Search services with filters
   */
  search(criteria: {
    businessId?: BusinessId;
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    duration?: number;
    isActive?: boolean;
    allowOnlineBooking?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{
    services: Service[];
    total: number;
  }>;

  /**
   * Save service (create or update)
   */
  save(service: Service): Promise<void>;

  /**
   * Delete service
   */
  delete(id: ServiceId): Promise<void>;

  /**
   * Find service by name in a business
   */
  findByName(businessId: BusinessId, name: string): Promise<Service | null>;

  /**
   * Check if service name exists for business
   */
  existsByName(
    businessId: BusinessId,
    name: string,
    excludeId?: ServiceId,
  ): Promise<boolean>;

  /**
   * Get popular services for a business
   */
  findPopularServices(
    businessId: BusinessId,
    limit?: number,
  ): Promise<Service[]>;

  /**
   * Get service statistics
   */
  getServiceStatistics(serviceId: ServiceId): Promise<{
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    averageRating: number;
    totalRevenue: number;
  }>;

  /**
   * Get business service statistics
   */
  getBusinessServiceStatistics(businessId: BusinessId): Promise<{
    totalServices: number;
    activeServices: number;
    averagePrice: number;
    averageDuration: number;
  }>;
}
