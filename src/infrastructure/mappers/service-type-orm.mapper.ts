import { ServiceType } from '@domain/entities/service-type.entity';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { ServiceTypeId } from '@domain/value-objects/service-type-id.value-object';
import { ServiceTypeOrmEntity } from '@infrastructure/database/sql/postgresql/entities/service-type-orm.entity';

/**
 * ⚠️ CRITICAL - ServiceType ORM Mapper
 *
 * OBLIGATORY RULES:
 * - NO business logic in mappers
 * - ONLY conversion between Domain ↔ ORM
 * - ALWAYS use Value Objects factory methods
 * - HANDLE nullable fields properly
 * - PRESERVE audit trail information
 */
export class ServiceTypeOrmMapper {
  /**
   * Convertit une entité Domain vers ORM pour persistence
   */
  static toOrmEntity(domain: ServiceType): ServiceTypeOrmEntity {
    const ormEntity = new ServiceTypeOrmEntity();

    ormEntity.id = domain.getId().getValue();
    ormEntity.businessId = domain.getBusinessId().getValue();
    ormEntity.name = domain.getName();
    ormEntity.code = domain.getCode();
    ormEntity.description = domain.getDescription() ?? null;
    ormEntity.isActive = domain.isActive();
    ormEntity.sortOrder = domain.getSortOrder();

    // ✅ Audit trail
    ormEntity.createdBy = domain.getCreatedBy() ?? null;
    ormEntity.updatedBy = domain.getUpdatedBy() ?? null;
    ormEntity.createdAt = domain.getCreatedAt();
    ormEntity.updatedAt = domain.getUpdatedAt();

    return ormEntity;
  }

  /**
   * Convertit une entité ORM vers Domain depuis persistence
   */
  static toDomainEntity(orm: ServiceTypeOrmEntity): ServiceType {
    const id = ServiceTypeId.fromString(orm.id);
    const businessId = BusinessId.fromString(orm.businessId);

    return ServiceType.reconstruct({
      id,
      businessId,
      name: orm.name,
      code: orm.code,
      description: orm.description || undefined,
      isActive: orm.isActive,
      sortOrder: orm.sortOrder,
      createdBy: orm.createdBy || undefined,
      updatedBy: orm.updatedBy || undefined,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  /**
   * Convertit liste ORM vers Domain
   */
  static toDomainEntities(ormEntities: ServiceTypeOrmEntity[]): ServiceType[] {
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  /**
   * Convertit liste Domain vers ORM
   */
  static toOrmEntities(domainEntities: ServiceType[]): ServiceTypeOrmEntity[] {
    return domainEntities.map((domain) => this.toOrmEntity(domain));
  }
}
