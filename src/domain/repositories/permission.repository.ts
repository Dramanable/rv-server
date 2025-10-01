import { Permission } from "@domain/entities/permission.entity";

/**
 * Permission Repository Interface
 * Clean Architecture - Domain Layer - Repository Port
 */
export interface IPermissionRepository {
  /**
   * Saves a permission (create or update)
   */
  save(permission: Permission): Promise<Permission>;

  /**
   * Finds a permission by ID
   */
  findById(id: string): Promise<Permission | null>;

  /**
   * Finds a permission by name
   */
  findByName(name: string): Promise<Permission | null>;

  /**
   * Finds all permissions with optional filters, pagination, and sorting
   */
  findAll(
    filters?: {
      search?: string;
      category?: string;
      isActive?: boolean;
      isSystemPermission?: boolean;
    },
    options?: {
      offset?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ): Promise<Permission[]>;

  /**
   * Finds permissions by category
   */
  findByCategory(category: string): Promise<Permission[]>;

  /**
   * Checks if a permission exists by name
   */
  existsByName(name: string): Promise<boolean>;

  /**
   * Deletes a permission by ID (only if not system permission)
   */
  delete(id: string): Promise<void>;

  /**
   * Counts total permissions with optional filters
   */
  count(filters?: {
    search?: string;
    category?: string;
    isActive?: boolean;
    isSystemPermission?: boolean;
  }): Promise<number>;
}
