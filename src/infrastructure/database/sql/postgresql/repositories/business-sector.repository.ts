/**
 * 🏢 BusinessSector Repository Implementation - TypeORM + Clean Architecture
 *
 * Implémentation concrète du repository BusinessSector avec TypeORM
 */

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type {
  BusinessSectorFilters,
  BusinessSectorListResult,
  BusinessSectorQueryOptions,
  IBusinessSectorRepository,
} from '../../../../../application/ports/business-sector.repository.interface';
import type { Logger } from '../../../../../application/ports/logger.port';
import { BusinessSector } from '../../../../../domain/entities/business-sector.entity';
import { TOKENS } from '../../../../../shared/constants/injection-tokens';
import { BusinessSectorOrmEntity } from '../entities/business-sector-orm.entity';

@Injectable()
export class TypeOrmBusinessSectorRepository
  implements IBusinessSectorRepository
{
  constructor(
    @InjectRepository(BusinessSectorOrmEntity)
    private readonly repository: Repository<BusinessSectorOrmEntity>,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
  ) {}

  /**
   * ✅ Sauvegarder un secteur d'activité
   */
  async save(businessSector: BusinessSector): Promise<BusinessSector> {
    try {
      const ormEntity =
        BusinessSectorOrmEntity.fromDomainEntity(businessSector);
      const savedEntity = await this.repository.save(ormEntity);

      this.logger.info('Business sector saved successfully', {
        id: savedEntity.id,
        code: savedEntity.code,
        operation: 'save',
      });

      return this.toDomainEntity(savedEntity);
    } catch (error) {
      this.logger.error(
        'Failed to save business sector',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          businessSectorId: businessSector.id,
          operation: 'save',
        },
      );
      throw error;
    }
  }

  /**
   * ✅ Trouver un secteur par ID
   */
  async findById(id: string): Promise<BusinessSector | null> {
    try {
      const ormEntity = await this.repository.findOne({
        where: { id },
      });

      if (!ormEntity) {
        this.logger.debug('Business sector not found by ID', { id });
        return null;
      }

      return this.toDomainEntity(ormEntity);
    } catch (error) {
      this.logger.error(
        'Failed to find business sector by ID',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          id,
          operation: 'findById',
        },
      );
      throw error;
    }
  }

  /**
   * ✅ Trouver un secteur par code
   */
  async findByCode(code: string): Promise<BusinessSector | null> {
    try {
      const ormEntity = await this.repository.findOne({
        where: { code: code.toUpperCase() },
      });

      if (!ormEntity) {
        this.logger.debug('Business sector not found by code', { code });
        return null;
      }

      return this.toDomainEntity(ormEntity);
    } catch (error) {
      this.logger.error(
        'Failed to find business sector by code',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          code,
          operation: 'findByCode',
        },
      );
      throw error;
    }
  }

  /**
   * ✅ Lister les secteurs avec pagination et filtres
   */
  async findAll(
    options?: BusinessSectorQueryOptions,
  ): Promise<BusinessSectorListResult> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('bs');

      // Filtres
      if (options?.filters?.isActive !== undefined) {
        queryBuilder.andWhere('bs.isActive = :isActive', {
          isActive: options.filters.isActive,
        });
      }

      if (options?.filters?.search) {
        queryBuilder.andWhere(
          '(LOWER(bs.name) LIKE LOWER(:search) OR LOWER(bs.code) LIKE LOWER(:search) OR LOWER(bs.description) LIKE LOWER(:search))',
          {
            search: `%${options.filters.search}%`,
          },
        );
      }

      if (options?.filters?.codes?.length) {
        queryBuilder.andWhere('bs.code IN (:...codes)', {
          codes: options.filters.codes,
        });
      }

      // Tri
      const sortField = options?.sort?.field || 'createdAt';
      const sortDirection = options?.sort?.direction || 'DESC';

      queryBuilder.orderBy(`bs.${sortField}`, sortDirection);

      // Pagination
      const page = Math.max(1, options?.pagination?.page || 1);
      const limit = Math.min(
        100,
        Math.max(1, options?.pagination?.limit || 10),
      );
      const skip = (page - 1) * limit;

      queryBuilder.skip(skip).take(limit);

      // Exécution
      const [ormEntities, total] = await queryBuilder.getManyAndCount();

      const data = ormEntities.map((entity) => this.toDomainEntity(entity));
      const totalPages = Math.ceil(total / limit);

      this.logger.info('Business sectors listed successfully', {
        total,
        page,
        limit,
        totalPages,
        filtersApplied: Object.keys(options?.filters || {}).length,
        operation: 'findAll',
      });

      return {
        data,
        meta: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      this.logger.error(
        'Failed to list business sectors',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          options,
          operation: 'findAll',
        },
      );
      throw error;
    }
  }

  /**
   * ✅ Supprimer un secteur (soft delete - désactivation)
   */
  async delete(id: string): Promise<void> {
    try {
      const result = await this.repository.update(id, { isActive: false });

      if (result.affected === 0) {
        this.logger.warn('No business sector found to delete', { id });
        return;
      }

      this.logger.info('Business sector deleted (soft delete) successfully', {
        id,
        operation: 'delete',
      });
    } catch (error) {
      this.logger.error(
        'Failed to delete business sector',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          id,
          operation: 'delete',
        },
      );
      throw error;
    }
  }

  /**
   * ✅ Vérifier l'existence d'un secteur par ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.repository.count({ where: { id } });
      return count > 0;
    } catch (error) {
      this.logger.error(
        'Failed to check business sector existence',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          id,
          operation: 'exists',
        },
      );
      throw error;
    }
  }

  /**
   * ✅ Vérifier l'unicité d'un code de secteur
   */
  async isCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('bs');
      queryBuilder.where('bs.code = :code', { code: code.toUpperCase() });

      if (excludeId) {
        queryBuilder.andWhere('bs.id != :excludeId', { excludeId });
      }

      const count = await queryBuilder.getCount();
      return count === 0;
    } catch (error) {
      this.logger.error(
        'Failed to check code uniqueness',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          code,
          excludeId,
          operation: 'isCodeUnique',
        },
      );
      throw error;
    }
  }

  /**
   * ✅ Compter le nombre total de secteurs
   */
  async count(filters?: BusinessSectorFilters): Promise<number> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('bs');

      if (filters?.isActive !== undefined) {
        queryBuilder.andWhere('bs.isActive = :isActive', {
          isActive: filters.isActive,
        });
      }

      if (filters?.search) {
        queryBuilder.andWhere(
          '(LOWER(bs.name) LIKE LOWER(:search) OR LOWER(bs.code) LIKE LOWER(:search))',
          {
            search: `%${filters.search}%`,
          },
        );
      }

      return await queryBuilder.getCount();
    } catch (error) {
      this.logger.error(
        'Failed to count business sectors',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          filters,
          operation: 'count',
        },
      );
      throw error;
    }
  }

  /**
   * ✅ Recherche textuelle avancée dans les secteurs
   */
  async searchByText(
    searchTerm: string,
    options?: BusinessSectorQueryOptions,
  ): Promise<BusinessSectorListResult> {
    const searchOptions: BusinessSectorQueryOptions = {
      ...options,
      filters: {
        ...options?.filters,
        search: searchTerm,
      },
    };

    return this.findAll(searchOptions);
  }

  /**
   * ✅ Trouver les secteurs actifs uniquement
   */
  async findActiveOnly(
    options?: BusinessSectorQueryOptions,
  ): Promise<BusinessSectorListResult> {
    const activeOptions: BusinessSectorQueryOptions = {
      ...options,
      filters: {
        ...options?.filters,
        isActive: true,
      },
    };

    return this.findAll(activeOptions);
  }

  /**
   * ✅ Activer/désactiver un secteur
   */
  async updateStatus(id: string, isActive: boolean): Promise<BusinessSector> {
    try {
      await this.repository.update(id, { isActive });

      const updatedEntity = await this.repository.findOne({ where: { id } });

      if (!updatedEntity) {
        throw new Error(`Business sector with id ${id} not found after update`);
      }

      this.logger.info('Business sector status updated', {
        id,
        isActive,
        operation: 'updateStatus',
      });

      return this.toDomainEntity(updatedEntity);
    } catch (error) {
      this.logger.error(
        'Failed to update business sector status',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          id,
          isActive,
          operation: 'updateStatus',
        },
      );
      throw error;
    }
  }

  /**
   * ✅ Obtenir les secteurs les plus utilisés
   */
  async findMostUsed(limit?: number): Promise<BusinessSector[]> {
    try {
      // TODO: Implémenter quand la table businesses existera
      // Pour l'instant, retourner les secteurs actifs triés par date de création

      const ormEntities = await this.repository.find({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
        take: limit || 10,
      });

      return ormEntities.map((entity) => this.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        'Failed to find most used business sectors',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          limit,
          operation: 'findMostUsed',
        },
      );
      throw error;
    }
  }

  /**
   * ✅ Compter l'usage d'un secteur dans les entreprises
   */
  async countUsageInBusinesses(sectorId: string): Promise<number> {
    try {
      // TODO: Implémenter quand la table businesses existera avec la colonne business_sector_id
      // Pour l'instant, retourner 0 par défaut

      this.logger.debug('Business sector usage count requested', {
        sectorId,
        count: 0, // Valeur par défaut
        operation: 'countUsageInBusinesses',
      });

      return 0;
    } catch (error) {
      this.logger.error(
        'Failed to count business sector usage',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          sectorId,
          operation: 'countUsageInBusinesses',
        },
      );
      throw error;
    }
  }

  /**
   * 🔄 Conversion ORM Entity → Domain Entity
   */
  private toDomainEntity(ormEntity: BusinessSectorOrmEntity): BusinessSector {
    return BusinessSector.restore(
      ormEntity.id,
      ormEntity.name,
      ormEntity.description || '',
      ormEntity.code,
      ormEntity.isActive,
      ormEntity.createdAt,
      ormEntity.createdBy,
      ormEntity.updatedAt,
      ormEntity.updatedBy,
    );
  }
}
