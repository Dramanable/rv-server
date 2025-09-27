/**
 * 🔌 BUSINESS OWNER REPOSITORY INTERFACE
 * ✅ Clean Architecture - Domain Layer
 */

import { BusinessOwner } from "@domain/entities/business-owner.entity";
import { BusinessId } from "@domain/value-objects/business-id.value-object";
import { BusinessOwnerId } from "@domain/value-objects/business-owner-id.value-object";
import { UserId } from "@domain/value-objects/user-id.value-object";

export const BUSINESS_OWNER_REPOSITORY = "BUSINESS_OWNER_REPOSITORY";

export interface BusinessOwnerRepository {
  /**
   * Save business owner (create or update)
   */
  save(businessOwner: BusinessOwner): Promise<BusinessOwner>;

  /**
   * Find business owner by ID
   */
  findById(id: BusinessOwnerId): Promise<BusinessOwner | null>;

  /**
   * Find business owner by user ID
   */
  findByUserId(userId: UserId): Promise<BusinessOwner | null>;

  /**
   * Find business owner by business ID
   */
  findByBusinessId(businessId: BusinessId): Promise<BusinessOwner | null>;

  /**
   * Check if a business owner exists
   */
  exists(id: BusinessOwnerId): Promise<boolean>;

  /**
   * Check if a user is already a business owner
   */
  existsByUserId(userId: UserId): Promise<boolean>;

  /**
   * Get all business owners (with pagination)
   */
  findAll(criteria?: {
    isActive?: boolean;
    subscriptionLevel?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    businessOwners: BusinessOwner[];
    total: number;
  }>;

  /**
   * Get business owners by multiple criteria
   */
  findByCriteria(criteria: {
    businessIds?: BusinessId[];
    isActive?: boolean;
    subscriptionLevels?: string[];
    createdAfter?: Date;
    createdBefore?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    businessOwners: BusinessOwner[];
    total: number;
  }>;

  /**
   * Get business owner statistics
   */
  getStatistics(): Promise<{
    totalOwners: number;
    activeOwners: number;
    ownersBySubscriptionLevel: Record<string, number>;
    averageSubscriptionDuration: number;
  }>;

  /**
   * Delete business owner (soft delete)
   */
  delete(id: BusinessOwnerId): Promise<void>;
}
