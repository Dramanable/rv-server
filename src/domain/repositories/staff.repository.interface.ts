import { Staff } from '../entities/staff.entity';
import { UserId } from '../value-objects/user-id.value-object';
import { BusinessId } from '../value-objects/business-id.value-object';
import { Email } from '../value-objects/email.value-object';

export const STAFF_REPOSITORY = 'STAFF_REPOSITORY';

export interface StaffRepository {
  /**
   * Find staff by ID
   */
  findById(id: UserId): Promise<Staff | null>;

  /**
   * Find staff by email
   */
  findByEmail(email: Email): Promise<Staff | null>;

  /**
   * Find all staff members for a business
   */
  findByBusinessId(businessId: BusinessId): Promise<Staff[]>;

  /**
   * Find staff by role in a business
   */
  findByBusinessIdAndRole(
    businessId: BusinessId,
    role: string,
  ): Promise<Staff[]>;

  /**
   * Find available staff for a specific time slot
   */
  findAvailableStaff(
    businessId: BusinessId,
    dateTime: Date,
    duration: number,
  ): Promise<Staff[]>;

  /**
   * Save staff member (create or update)
   */
  save(staff: Staff): Promise<void>;

  /**
   * Delete staff member
   */
  delete(id: UserId): Promise<void>;

  /**
   * Check if email is already used by another staff member
   */
  existsByEmail(email: Email, excludeId?: UserId): Promise<boolean>;

  /**
   * Get staff statistics for a business
   */
  getBusinessStaffStatistics(businessId: BusinessId): Promise<{
    totalStaff: number;
    activeStaff: number;
    staffByRole: Record<string, number>;
    averageExperience: number;
  }>;

  /**
   * Search staff members
   */
  search(criteria: {
    businessId?: BusinessId;
    name?: string;
    role?: string;
    specialization?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{
    staff: Staff[];
    total: number;
  }>;
}
