import { Business } from '../entities/business.entity';
import { BusinessId } from '../value-objects/business-id.value-object';
import { BusinessName } from '../value-objects/business-name.value-object';

export const BUSINESS_REPOSITORY = 'BUSINESS_REPOSITORY';

export interface BusinessRepository {
  /**
   * Find a business by its ID
   */
  findById(id: BusinessId): Promise<Business | null>;

  /**
   * Find a business by its name
   */
  findByName(name: BusinessName): Promise<Business | null>;

  /**
   * Find businesses by sector
   */
  findBySector(sector: string): Promise<Business[]>;

  /**
   * Search businesses by criteria
   */
  search(criteria: {
    name?: string;
    sector?: string;
    city?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{
    businesses: Business[];
    total: number;
  }>;

  /**
   * Save a business (create or update)
   */
  save(business: Business): Promise<void>;

  /**
   * Delete a business
   */
  delete(id: BusinessId): Promise<void>;

  /**
   * Check if a business name is already taken
   */
  existsByName(name: BusinessName): Promise<boolean>;

  /**
   * Find businesses near a location
   */
  findNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit?: number
  ): Promise<Business[]>;

  /**
   * Get business statistics
   */
  getStatistics(businessId: BusinessId): Promise<{
    totalAppointments: number;
    totalClients: number;
    totalStaff: number;
    totalServices: number;
    revenue: number;
  }>;
}
