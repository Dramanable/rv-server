/**
 * 🏢 TYPEORM REPOSITORY - Business Context (RBAC Compatible)
 *
 * Repository TypeORM pour la gestion des contextes métier RBAC.
 * Implémente IBusinessContextRepository complet avec logger et i18n.
 * Utilise l'entité BusinessContext pour la compatibilité avec les Use Cases RBAC.
 *
 * INFRASTRUCTURE LAYER - Clean Architecture
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InfrastructureException } from '@shared/exceptions/shared.exceptions';
import { Repository } from 'typeorm';

import type { I18nService } from '@application/ports/i18n.port';
import type { Logger } from '@application/ports/logger.port';
import { BusinessContext } from '@domain/entities/business-context.entity';
import {
  BusinessContextCriteria,
  BusinessContextFilters,
  IBusinessContextRepository,
} from '@domain/repositories/business-context.repository.interface';

import { BusinessContextOrmEntity } from '../entities/business-context-orm.entity';

@Injectable()
export class TypeOrmRbacBusinessContextRepository
  implements IBusinessContextRepository
{
  constructor(
    @InjectRepository(BusinessContextOrmEntity)
    private readonly repository: Repository<BusinessContextOrmEntity>,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async save(businessContext: BusinessContext): Promise<BusinessContext> {
    this.logger.info('Saving business context', {
      businessId: businessContext.getBusinessId(),
    });

    try {
      // Pour le moment, on implémente un mapping simple
      // En production, il faudra un vrai mapper BusinessContext <-> BusinessContextOrmEntity
      const ormEntity = new BusinessContextOrmEntity();
      ormEntity.businessId = businessContext.getBusinessId();
      ormEntity.name = businessContext.getBusinessName();
      ormEntity.type = 'BUSINESS'; // Par défaut
      ormEntity.isActive = businessContext.isActiveContext();

      const savedOrm = await this.repository.save(ormEntity);

      this.logger.info('Business context saved successfully', {
        businessId: savedOrm.businessId,
      });

      // Retourner le contexte avec les données originales + ID persisté
      return BusinessContext.create(
        savedOrm.businessId,
        businessContext.getBusinessName(),
        businessContext.getLocations(),
      );
    } catch (error) {
      this.logger.error('Failed to save business context', error as Error, {
        businessId: businessContext.getBusinessId(),
      });
      throw new InfrastructureException(
        this.i18n.translate('rbac.businessContext.saveError'),
        'RBAC_SAVE_ERROR',
      );
    }
  }

  async findByBusinessId(businessId: string): Promise<BusinessContext | null> {
    this.logger.debug('Finding business context by business ID', {
      businessId,
    });

    try {
      const ormEntity = await this.repository.findOne({
        where: { businessId },
      });

      if (!ormEntity) {
        this.logger.debug('Business context not found', { businessId });
        return null;
      }

      // Mapping simple pour le moment
      return BusinessContext.create(
        ormEntity.businessId,
        ormEntity.name || `Business ${ormEntity.businessId}`,
        [], // Pour l'instant pas de locations/departments dans l'ORM entity RBAC
      );
    } catch (error) {
      this.logger.error(
        'Failed to find business context by ID',
        error as Error,
        {
          businessId,
        },
      );
      throw new InfrastructureException(
        this.i18n.translate('rbac.businessContext.findError'),
        'RBAC_FIND_ERROR',
      );
    }
  }

  async findById(businessId: string): Promise<BusinessContext | null> {
    return this.findByBusinessId(businessId);
  }

  async findAllActive(): Promise<BusinessContext[]> {
    this.logger.debug('Finding all active business contexts');

    try {
      const ormEntities = await this.repository.find({
        where: { isActive: true },
      });

      return ormEntities.map((orm) =>
        BusinessContext.create(
          orm.businessId,
          orm.name || `Business ${orm.businessId}`,
          [],
        ),
      );
    } catch (error) {
      this.logger.error(
        'Failed to find active business contexts',
        error as Error,
      );
      throw new InfrastructureException(
        this.i18n.translate('rbac.businessContext.findAllError'),
        'RBAC_FIND_ALL_ERROR',
      );
    }
  }

  // 🚧 Méthodes pas encore implémentées - YAGNI pour le moment
  async findByCriteria(
    criteria: BusinessContextCriteria,
  ): Promise<BusinessContext[]> {
    this.logger.debug('Finding by criteria - not implemented yet', {
      criteria,
    });
    return []; // TODO: implémenter si nécessaire
  }

  async findWithFilters(
    filters: BusinessContextFilters,
    pagination?: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
  ): Promise<{
    data: BusinessContext[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.debug('Finding with filters - not implemented yet', {
      filters,
      pagination,
    });
    return {
      data: [],
      total: 0,
      page: pagination?.page || 1,
      limit: pagination?.limit || 10,
    }; // TODO: implémenter si nécessaire
  }

  async exists(businessId: string): Promise<boolean> {
    this.logger.debug('Checking if business context exists', {
      businessId,
    });

    try {
      const count = await this.repository.count({
        where: { businessId },
      });

      return count > 0;
    } catch (error) {
      this.logger.error(
        'Failed to check business context existence',
        error as Error,
        {
          businessId,
        },
      );
      throw new InfrastructureException(
        this.i18n.translate('rbac.businessContext.existsError'),
        'RBAC_EXISTS_ERROR',
      );
    }
  }

  async locationExists(
    businessId: string,
    locationId: string,
  ): Promise<boolean> {
    // Dans le contexte RBAC simple, pas de gestion des locations
    this.logger.debug('Location check - not implemented for RBAC', {
      businessId,
      locationId,
    });
    return false; // TODO: implémenter si nécessaire
  }

  async departmentExists(
    businessId: string,
    locationId: string,
    departmentId: string,
  ): Promise<boolean> {
    // Dans le contexte RBAC simple, pas de gestion des departments
    this.logger.debug('Department check - not implemented for RBAC', {
      businessId,
      locationId,
      departmentId,
    });
    return false; // TODO: implémenter si nécessaire
  }

  async countByCriteria(criteria: BusinessContextCriteria): Promise<number> {
    this.logger.debug('Count by criteria - not implemented yet', { criteria });
    return 0; // TODO: implémenter si nécessaire
  }

  async delete(businessId: string): Promise<boolean> {
    this.logger.info('Deleting business context', { businessId });

    try {
      const result = await this.repository.delete({ businessId });

      const deleted = (result.affected ?? 0) > 0;

      this.logger.info('Business context deletion completed', {
        businessId,
        deleted,
      });

      return deleted;
    } catch (error) {
      this.logger.error('Failed to delete business context', error as Error, {
        businessId,
      });
      throw new InfrastructureException(
        this.i18n.translate('rbac.businessContext.deleteError'),
        'RBAC_DELETE_ERROR',
      );
    }
  }

  async getContextStats(): Promise<{
    totalBusinesses: number;
    activeBusinesses: number;
    totalLocations: number;
    totalDepartments: number;
    averageLocationsPerBusiness: number;
    averageDepartmentsPerLocation: number;
  }> {
    this.logger.debug('Getting context stats');

    try {
      const totalBusinesses = await this.repository.count();
      const activeBusinesses = await this.repository.count({
        where: { isActive: true },
      });

      return {
        totalBusinesses,
        activeBusinesses,
        totalLocations: 0, // Pas de locations dans RBAC simple
        totalDepartments: 0, // Pas de departments dans RBAC simple
        averageLocationsPerBusiness: 0,
        averageDepartmentsPerLocation: 0,
      };
    } catch (error) {
      this.logger.error('Failed to get context stats', error as Error);
      throw new InfrastructureException(
        this.i18n.translate('rbac.businessContext.statsError'),
        'RBAC_STATS_ERROR',
      );
    }
  }

  // 🚧 Méthodes complexes pas encore implémentées (YAGNI)
  async searchByName(searchTerm: string): Promise<BusinessContext[]> {
    this.logger.debug('Search by name - not implemented yet', { searchTerm });
    return [];
  }

  async findByLocationId(locationId: string): Promise<BusinessContext[]> {
    this.logger.debug('Find by location - not implemented for RBAC', {
      locationId,
    });
    return [];
  }

  async findByDepartmentId(departmentId: string): Promise<BusinessContext[]> {
    this.logger.debug('Find by department - not implemented for RBAC', {
      departmentId,
    });
    return [];
  }

  async validateContext(context: {
    businessId: string;
    locationId?: string;
    departmentId?: string;
  }): Promise<boolean> {
    // Validation simple pour RBAC : seul businessId compte
    return this.exists(context.businessId);
  }

  async getBusinessHierarchy(businessId: string): Promise<{
    businessId: string;
    businessName: string;
    locations: Array<{
      locationId: string;
      locationName: string;
      departments: Array<{
        departmentId: string;
        departmentName: string;
      }>;
    }>;
  } | null> {
    const businessContext = await this.findByBusinessId(businessId);
    if (!businessContext) return null;

    return {
      businessId,
      businessName: businessContext.getBusinessName(),
      locations: [], // Pas de hiérarchie dans RBAC simple
    };
  }

  async synchronizeWithBusiness(businessId: string): Promise<BusinessContext> {
    this.logger.debug('Sync with business - not implemented yet', {
      businessId,
    });
    const context = await this.findByBusinessId(businessId);
    if (!context) {
      throw new InfrastructureException(
        `Business context ${businessId} not found for synchronization`,
        'BUSINESS_CONTEXT_NOT_FOUND',
      );
    }
    return context;
  }

  async getContextPaths(businessId: string): Promise<
    Array<{
      businessId: string;
      locationId?: string;
      departmentId?: string;
      fullPath: string;
      level: 'BUSINESS' | 'LOCATION' | 'DEPARTMENT';
    }>
  > {
    const context = await this.findByBusinessId(businessId);
    if (!context) return [];

    return [
      {
        businessId,
        fullPath: context.getBusinessName(),
        level: 'BUSINESS',
      },
    ];
  }

  async updateBusinessName(
    businessId: string,
    newName: string,
  ): Promise<BusinessContext | null> {
    try {
      await this.repository.update({ businessId }, { name: newName });
      return this.findByBusinessId(businessId);
    } catch (error) {
      this.logger.error('Failed to update business name', error as Error, {
        businessId,
        newName,
      });
      return null;
    }
  }

  // Méthodes de hiérarchie pas implémentées pour RBAC simple
  async addLocation(): Promise<BusinessContext | null> {
    this.logger.debug('Add location - not supported in RBAC');
    return null;
  }

  async addDepartment(): Promise<BusinessContext | null> {
    this.logger.debug('Add department - not supported in RBAC');
    return null;
  }

  async deactivateLocation(): Promise<boolean> {
    this.logger.debug('Deactivate location - not supported in RBAC');
    return false;
  }

  async deactivateDepartment(): Promise<boolean> {
    this.logger.debug('Deactivate department - not supported in RBAC');
    return false;
  }

  async reactivateLocation(): Promise<boolean> {
    this.logger.debug('Reactivate location - not supported in RBAC');
    return false;
  }

  async reactivateDepartment(): Promise<boolean> {
    this.logger.debug('Reactivate department - not supported in RBAC');
    return false;
  }
}
