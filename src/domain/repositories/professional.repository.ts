/**
 * @fileoverview Professional Repository Interface
 * @module domain/repositories/professional.repository
 * @description Interface de repository pour l'entité Professional
 */

import { Professional } from '@domain/entities/professional.entity';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { ProfessionalId } from '@domain/value-objects/professional-id.value-object';

/**
 * Interface de repository pour Professional
 * Définit les opérations de persistence pour les professionnels
 */
export interface IProfessionalRepository {
  /**
   * Sauvegarde un professionnel
   */
  save(professional: Professional): Promise<Professional>;

  /**
   * Recherche un professionnel par ID
   */
  findById(id: ProfessionalId): Promise<Professional | null>;

  /**
   * Recherche un professionnel par email
   */
  findByEmail(email: Email): Promise<Professional | null>;

  /**
   * Recherche un professionnel par numéro de licence
   */
  findByLicenseNumber(licenseNumber: string): Promise<Professional | null>;

  /**
   * Recherche tous les professionnels d'une entreprise
   */
  findAll(businessId: BusinessId): Promise<Professional[]>;

  /**
   * Recherche des professionnels avec filtres et pagination
   */
  findByBusinessId(
    businessId: string,
    options: {
      search?: string;
      filters: {
        isActive?: boolean;
        specialization?: string;
      };
      pagination: {
        page: number;
        limit: number;
      };
      sorting: {
        sortBy: string;
        sortOrder: 'asc' | 'desc';
      };
    },
  ): Promise<{ professionals: Professional[]; total: number }>;

  /**
   * Supprime un professionnel par ID
   */
  deleteById(id: ProfessionalId): Promise<void>;

  /**
   * Vérifie si un professionnel existe par ID
   */
  existsById(id: ProfessionalId): Promise<boolean>;

  /**
   * Vérifie si un professionnel existe par email
   */
  existsByEmail(email: Email): Promise<boolean>;

  /**
   * Vérifie si un professionnel existe par numéro de licence
   */
  existsByLicenseNumber(licenseNumber: string): Promise<boolean>;
}
