import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  IServiceTypeRepository,
  ServiceTypeSearchCriteria,
  ServiceTypeSearchResult,
} from '@domain/repositories/service-type.repository';
import { ServiceType } from '@domain/entities/service-type.entity';
import { ServiceTypeId } from '@domain/value-objects/service-type-id.value-object';
import { BusinessId } from '@domain/value-objects/business-id.value-object';

import { ServiceTypeOrmEntity } from '@infrastructure/database/sql/postgresql/entities/service-type-orm.entity';
import { ServiceTypeOrmMapper } from '@infrastructure/mappers/service-type-orm.mapper';

/**
 * ⚠️ CRITICAL - ServiceType TypeORM Repository Implementation
 *
 * OBLIGATORY RULES:
 * - ALWAYS use ServiceTypeOrmMapper for conversions
 * - NO business logic in repository
 * - OPTIMIZED queries with database indexes
 * - PROPER error handling with logging context
 * - AUDIT trail preservation
 */
@Injectable()
export class TypeOrmServiceTypeRepository implements IServiceTypeRepository {
  constructor(
    @InjectRepository(ServiceTypeOrmEntity)
    private readonly repository: Repository<ServiceTypeOrmEntity>,
  ) {}

  async save(serviceType: ServiceType): Promise<ServiceType> {
    // 1. Conversion Domain → ORM via Mapper
    const ormEntity = ServiceTypeOrmMapper.toOrmEntity(serviceType);

    // 2. Persistence en base avec gestion audit
    const savedOrmEntity = await this.repository.save(ormEntity);

    // 3. Conversion ORM → Domain via Mapper
    return ServiceTypeOrmMapper.toDomainEntity(savedOrmEntity);
  }

  async findById(id: ServiceTypeId): Promise<ServiceType | null> {
    // 1. Requête ORM avec primary key optimisée
    const ormEntity = await this.repository.findOne({
      where: { id: id.getValue() },
    });

    if (!ormEntity) return null;

    // 2. Conversion ORM → Domain via Mapper
    return ServiceTypeOrmMapper.toDomainEntity(ormEntity);
  }

  async findByBusinessId(businessId: BusinessId): Promise<ServiceType[]> {
    // 1. Requête ORM avec index optimisé
    const ormEntities = await this.repository.find({
      where: { businessId: businessId.getValue() },
      order: { name: 'ASC' },
    });

    // 2. Conversion batch via Mapper
    return ServiceTypeOrmMapper.toDomainEntities(ormEntities);
  }

  async findByBusinessIdAndName(
    businessId: BusinessId,
    name: string,
  ): Promise<ServiceType | null> {
    // 1. Requête avec index composé business_id + name
    const ormEntity = await this.repository.findOne({
      where: {
        businessId: businessId.getValue(),
        name: name.trim(),
      },
    });

    if (!ormEntity) return null;

    // 2. Conversion ORM → Domain
    return ServiceTypeOrmMapper.toDomainEntity(ormEntity);
  }

  async findByBusinessIdAndCode(
    businessId: BusinessId,
    code: string,
  ): Promise<ServiceType | null> {
    // 1. Requête avec index composé business_id + code
    const ormEntity = await this.repository.findOne({
      where: {
        businessId: businessId.getValue(),
        code: code.trim().toUpperCase(),
      },
    });

    if (!ormEntity) return null;

    // 2. Conversion ORM → Domain
    return ServiceTypeOrmMapper.toDomainEntity(ormEntity);
  }

  async findActiveByBusinessId(businessId: BusinessId): Promise<ServiceType[]> {
    // 1. Requête avec index composé business_id + is_active
    const ormEntities = await this.repository.find({
      where: {
        businessId: businessId.getValue(),
        isActive: true,
      },
      order: { name: 'ASC' },
    });

    // 2. Conversion batch via Mapper
    return ServiceTypeOrmMapper.toDomainEntities(ormEntities);
  }

  async search(
    criteria: ServiceTypeSearchCriteria,
  ): Promise<ServiceTypeSearchResult> {
    const page = criteria.page || 1;
    const limit = criteria.limit || 10;
    const sortBy = criteria.sortBy || 'name';
    const sortOrder = criteria.sortOrder || 'asc';

    const query = this.repository
      .createQueryBuilder('service_type')
      .where('service_type.businessId = :businessId', {
        businessId: criteria.businessId.getValue(),
      });

    // Filtre actif/inactif
    if (criteria.isActive !== undefined) {
      query.andWhere('service_type.isActive = :isActive', {
        isActive: criteria.isActive,
      });
    }

    // Recherche textuelle
    if (criteria.search?.trim()) {
      query.andWhere(
        '(service_type.name ILIKE :search OR service_type.description ILIKE :search)',
        { search: `%${criteria.search.trim()}%` },
      );
    }

    // Filtres par codes
    if (criteria.codes && criteria.codes.length > 0) {
      query.andWhere('service_type.code IN (:...codes)', {
        codes: criteria.codes,
      });
    }

    // Pagination
    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    // Tri
    const orderDirection = sortOrder.toUpperCase() as 'ASC' | 'DESC';
    query.orderBy(`service_type.${sortBy}`, orderDirection);

    // Exécution avec count pour pagination
    const [ormEntities, totalCount] = await query.getManyAndCount();

    const serviceTypes = ServiceTypeOrmMapper.toDomainEntities(ormEntities);

    return {
      serviceTypes,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async delete(id: ServiceTypeId): Promise<void> {
    // Soft delete - set inactive instead of removing record
    await this.repository.update(
      { id: id.getValue() },
      { isActive: false, updatedAt: new Date() },
    );
  }

  async existsByBusinessIdAndCode(
    businessId: BusinessId,
    code: string,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        businessId: businessId.getValue(),
        code: code.trim().toUpperCase(),
      },
    });
    return count > 0;
  }

  async existsByBusinessIdAndName(
    businessId: BusinessId,
    name: string,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        businessId: businessId.getValue(),
        name: name.trim(),
      },
    });
    return count > 0;
  }

  async countActiveByBusinessId(businessId: BusinessId): Promise<number> {
    return this.repository.count({
      where: {
        businessId: businessId.getValue(),
        isActive: true,
      },
    });
  }

  async hardDelete(id: ServiceTypeId): Promise<void> {
    await this.repository.delete({ id: id.getValue() });
  }

  async isReferencedByServices(id: ServiceTypeId): Promise<boolean> {
    // Note: Cela nécessiterait une requête vers la table services
    // Pour l'instant, nous retournons false, mais cela devrait être implémenté
    // quand la table services sera disponible
    return false;
  }

  async findByBusinessIdOrderedBySortOrder(
    businessId: BusinessId,
  ): Promise<ServiceType[]> {
    const ormEntities = await this.repository.find({
      where: { businessId: businessId.getValue() },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return ServiceTypeOrmMapper.toDomainEntities(ormEntities);
  }

  async updateSortOrders(
    updates: { id: ServiceTypeId; sortOrder: number }[],
  ): Promise<void> {
    for (const update of updates) {
      await this.repository.update(
        { id: update.id.getValue() },
        { sortOrder: update.sortOrder },
      );
    }
  }

  async countByBusinessId(businessId: BusinessId): Promise<number> {
    return this.repository.count({
      where: { businessId: businessId.getValue() },
    });
  }

  async findAll(): Promise<ServiceType[]> {
    const ormEntities = await this.repository.find();
    return ServiceTypeOrmMapper.toDomainEntities(ormEntities);
  }
}
