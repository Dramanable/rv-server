/**
 * 🏥 DOMAIN REPOSITORY INTERFACE - ProfessionalRole
 * Clean Architecture - Domain Layer
 * Interface pour la persistance des rôles professionnels
 */

import {
  ProfessionalRole,
  ProfessionalCategory,
} from '@domain/entities/professional-role.entity';

export interface IProfessionalRoleRepository {
  /**
   * Save a professional role
   */
  save(professionalRole: ProfessionalRole): Promise<ProfessionalRole>;

  /**
   * Find professional role by ID
   */
  findById(id: string): Promise<ProfessionalRole | null>;

  /**
   * Find professional role by code
   */
  findByCode(code: string): Promise<ProfessionalRole | null>;

  /**
   * Find all professional roles
   */
  findAll(): Promise<ProfessionalRole[]>;

  /**
   * Find professional roles by category
   */
  findByCategory(category: ProfessionalCategory): Promise<ProfessionalRole[]>;

  /**
   * Find active professional roles
   */
  findActive(): Promise<ProfessionalRole[]>;

  /**
   * Find professional roles that can lead
   */
  findLeaderRoles(): Promise<ProfessionalRole[]>;

  /**
   * Check if professional role code exists
   */
  existsByCode(code: string): Promise<boolean>;

  /**
   * Delete professional role
   */
  delete(id: string): Promise<void>;

  /**
   * Search professional roles by name or display name
   */
  search(query: string): Promise<ProfessionalRole[]>;
}
